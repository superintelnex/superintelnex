// NIGHT-SHIFT-POOL-SNAPSHOT (read-only, keylos, sendet NIENTS).
// Zweck: Nacht-Recherche (Operator-Order 13.11: "die ganze nacht an diesen coin
// forschen"). Nur Read-Only-RPC + lokales Journal-Cross-Match (Team vs. organisch).
//
// Aufruf (von Repo-Root):
//   /Users/haqmal/.deno/bin/deno run --allow-read --allow-net --allow-env agents/research/_pool-snapshot.ts
// Output: genau eine JSON-Zeile auf stdout — der Nacht-Logger (…/_night-logger.sh)
// rodet sie nach agents/research/POOL-SNAPSHOTS.jsonl.
//
// Pool-Felder per SDK-Layout `PoolInfoLayout` (raydium-sdk-v2 clmm/layout.js)
// decodet — autoritativ, keine manuellen Offsets mehr (fruehere Version hatte
// falsche Offsets @235/@253/@269/@389 — korrigiert per Live-Decode-Abgleich:
// tickSpacing=10, tickCurrent≈211830, status/feeOn=0, liquidity u128).
//   status  = RewardState: 0=Uninitialized 1=Initialized 2=Opening 3=Ended
//   feeOn   = PoolStatusBitFlag: 0=Enable, 1=Disable
//
// ATA-Cross-Check: ATAs per spl.getAssociatedTokenAddressSync abgeleitet (EXAKT
// wie in token/scripts/swap-*.ts, mainnet-bewaehrt) und gegen die on-chain
// bewiesenen Adressen aus agents/shared/verify-pool.ts geprueft
// (SIN_ATA FD1WzT52…, WSOL_ATA 4eA5jcJV…). Abweichung => harter Fehler, damit
// faulsche Konstanten NICHT still in die Nacht-Datenbasis wandern koennen.

import { Connection, PublicKey } from "npm:@solana/web3.js@1.98.4";
import * as spl from "npm:@solana/spl-token@0.4.15";
import { PoolInfoLayout } from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/layout.js";

const POOL_ID = new PublicKey("4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM");
const SIN_MINT = new PublicKey("A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z");
const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const PROVIDER = new PublicKey("DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo");
// Bewiesene ATAs (verify-pool.ts, on-chain verifiziert) — ATA-Ableitung erfolgt
// EXAKT wie in den operativen Buy/Sell-Skripten (spl.getAssociatedTokenAddressSync),
// die Cross-Check faellt hart, damit faulsche Konstanten nicht in die Nacht-Daten
// wandern koennen:
const SIN_ATA_EXPECTED = "FD1WzT526vwyBbuq7p6RN6PizStW8sEoZaGrm5u7xqSW";
const WSOL_ATA_EXPECTED = "4eA5jcJVqH1Q1mQ2GVmCtEgFZZHYBLga2gGMEUKUy8k7";
const REF_RAW = 261_267_944_701_081_374n; // Ticket-#6-Referenz-Position (raw, 5 Dez.)

// RPC-rotation (schont die 429-Historie): pro Snapshot 1 Provider.
const RPCS = [
  "https://solana-rpc.publicnode.com",
  "https://api.mainnet-beta.solana.com",
];

// Journal-Cross-Match: alle unsere (Team-)Signatures aus dem on-chain-Journal.
function journalSigs(): Set<string> {
  const s = new Set<string>();
  try {
    const txt = Deno.readTextFileSync("token/result/EXECUTED-TRANSACTIONS.jsonl");
    for (const line of txt.split("\n")) {
      if (!line.trim()) continue;
      try {
        const d = JSON.parse(line);
        if (typeof d.signature === "string") s.add(d.signature);
      } catch {
        // Zeile ignorieren
      }
    }
  } catch {
    // Journal fehlt/unsichtbar -> Match-Statistik bleibt 0/leer (kein Crash).
  }
  return s;
}

function fail(msg: string): never {
  console.log(JSON.stringify({ ts: new Date().toISOString(), error: msg }));
  Deno.exit(2);
}

async function pickConnection(): Promise<Connection> {
  for (const url of RPCS) {
    try {
      const c = new Connection(url, "confirmed");
      await c.getSlot();
      return c;
    } catch {
      // naechster RPC
    }
  }
  fail("no-rpc: kein Public-RPC erreichbar (429/Offline)");
}

const c = await pickConnection();
const ts = new Date().toISOString();

// --- ATA-Ableitung + Cross-Check gegen on-chain bewiesene Adressen ---
const sinAta = spl.getAssociatedTokenAddressSync(SIN_MINT, PROVIDER);
const wsolAta = spl.getAssociatedTokenAddressSync(WSOL_MINT, PROVIDER);
if (sinAta.toBase58() !== SIN_ATA_EXPECTED || wsolAta.toBase58() !== WSOL_ATA_EXPECTED)
  fail(
    "ata-mismatch: abgeleitete ATA weicht von verify-pool-Beweis ab (" +
      sinAta.toBase58() + " / " + wsolAta.toBase58() + ") — Konstanten pruefen",
  );

// --- 1) Pool-Account (SDK-Layout-Decode, autoritativ) ---
const poolAcc = await c.getAccountInfo(POOL_ID);
if (!poolAcc || poolAcc.data.byteLength < PoolInfoLayout.span)
  fail("pool-missing: Pool-Account nicht lesbar (RPC-Cache oder 429)");
const p = PoolInfoLayout.decode(poolAcc.data);
const tickCurrent = p.tickCurrent;
const tickSpacing = p.tickSpacing;
const status = p.status; // RewardState: 0=Uninitialized 1=Initialized 2=Opening 3=Ended
const feeOn = p.feeOn; // PoolStatusBitFlag: 0=Enable, 1=Disable
const liquidity = p.liquidity.toString();
const sqrtPX64 = p.sqrtPriceX64;

// Preis: CLMM sqrtPriceX64 (B/A, B=SIN, A=WSOL) => price_raw = sqrtP²/2^128
// in RAW-Units (rawSIN pro rawSOL). Display-Skalierung: SIN 5 Dez., SOL 9 Dez.
// => displaySIN/displaySOL = price_raw * 10^(9-5) = *1e4. Per Float (keine
// BigInt-Truncation, sqrtP²≈5.4e47 liegt sicher in double-Präzision).
const SQRT_P_F = Number(sqrtPX64);
const priceRaw = (SQRT_P_F * SQRT_P_F) / Number(1n << 128n);
const sinPerSol = priceRaw * 1e4; // display SIN pro 1 display SOL
const solPerSin = sinPerSol > 0 ? 1 / sinPerSol : null; // display SOL pro 1 display SIN

// --- 2) Provider-SOL + ATAs ---
const provBal = await c.getBalance(PROVIDER);
const sinAtaAcc = await c.getAccountInfo(sinAta);
const wsolAtaAcc = await c.getAccountInfo(wsolAta);
// SPL-Token-Account-Layout: amount u64 @64 LE
const sinRaw = sinAtaAcc ? sinAtaAcc.data.readBigUInt64LE(64) : 0n;
const wsolRaw = wsolAtaAcc ? wsolAtaAcc.data.readBigUInt64LE(64) : 0n;
const benchmarkPct =
  REF_RAW > 0n ? Number((sinRaw * 10000n) / REF_RAW) / 100 : null;
// Trd-Konvention des Teams (research-snapshot.md: "2,613 Trd" = Ticket-#6-
// Referenz): 1 Trd = 10^12 display-SIN = 10^17 raw (SIN 5 Dez.). 4 Dezimal-
// stellen per BigInt (raw ~2.55e17 ueberschreitet Double-Präzision):
// Wert*10000 in Trd-Einheiten = raw / 1e13n, dann /10000.
const trd = Number(sinRaw / 10_000_000_000_000n) / 10000;

// --- 3) Pool-Aktivitaet: letzte 50 Signatures + Team-vs-organisch-Proxy ---
// Unsere eigenen Tx-Signatures stehen im EXECUTED-TRANSACTIONS-Journal =>
// exaktes Cross-Match ohne weitere RPC-Abfragen (429-schonend).
const sigs = await c.getSignaturesForAddress(POOL_ID, { limit: 50 });
const ok = sigs.filter((s) => s && !s.err);
const ourSigs = journalSigs();
const teamTx = ok.filter((s) => ourSigs.has(s.signature)).length;
const nowSec = Math.floor(Date.now() / 1000);
const spanH =
  ok.length > 1 && ok[0].blockTime && ok[ok.length - 1].blockTime
    ? Math.max(1, nowSec - (ok[ok.length - 1].blockTime as number)) / 3600
    : 1;

// --- 4) Ausgabe: genau 1 JSON-Zeile ---
console.log(
  JSON.stringify({
    ts,
    rpc: c.rpc,
    slot: await c.getSlot(),
    pool: {
      tickCurrent,
      tickSpacing,
      liquidity,
      sqrtPriceX64: sqrtPX64.toString(),
      status, // RewardState: 0=Uninitialized 1=Initialized 2=Opening 3=Ended
      feeOn, // PoolStatusBitFlag: 0=Enable 1=Disable
      sinPerSol: Number(sinPerSol.toExponential(8)),
      solPerSin: solPerSin === null ? null : Number(solPerSin.toExponential(8)),
    },
    provider: {
      solLamports: provBal,
      sol: (provBal / 1e9).toFixed(6),
    },
    sinAta: {
      address: sinAta.toBase58(),
      exists: !!sinAtaAcc,
      raw: sinRaw.toString(),
      trillion: trd.toFixed(3),
      benchmarkPct: benchmarkPct === null ? null : benchmarkPct.toFixed(2),
    },
    wsolAta: { address: wsolAta.toBase58(), exists: !!wsolAtaAcc, raw: wsolRaw.toString() },
    activity: {
      last50: ok.length,
      teamTx, // Signatures, die im EXECUTED-TRANSACTIONS-Journal stehen (Team)
      orgTx: ok.length - teamTx, // Rest = organisch (inkl. LP/Claim-Tx)
      perHourApprox: Number((ok.length / spanH).toFixed(1)),
      firstSeen: ok[ok.length - 1]?.blockTime ?? null,
      lastSeen: ok[0]?.blockTime ?? null,
    },
    journal: { knownSigs: ourSigs.size },
  }),
);
