// Read-only CLMM-Pool-Preis-/Liquiditaets-Snapshot (keylos, sendet NIENTS).
// Nacht-Research-Harness (Designer, Operator-Order 19:40Z): un-abhaengiger
// On-Chain-Kurskanal (RPC-Rotation gegen 429 + Latenz), weil GeckoTerminal
// (429) und Jupiter-Quote-API (DNS) nicht erreichbar sind. Ergaenzt den
// Fable-Research-Loop (90888, DexScreener/Jupiter) als zweite, un-abhaengige
// Datenquelle (Kreuzverifikation, read-only).
//
// Aufruf: deno run --allow-read --allow-net --allow-env agents/shared/pool-price-snapshot.ts
// Optional: POOL_SNAP_OUT=<pfad/xx.jsonl> (Default: agents/berichte/pool-snapshots/night.jsonl)
//
// Kurs-Herkunft (Beobachtung, kein Prognose — Team-Kanon):
//   price_raw_B_per_A = sqrtPriceX64^2 / 2^128  (SDK-Formel: sqrtPriceX64ToPrice/2^128,
//   A=WSOL(dec 9), B=SIN(dec 5); raw B pro raw A = raw SIN pro Lamport).
//   Preis-am-Tick (Unicorn-V3-Formel): 1.0001^tick (Decimal, 50er-Praezision).
//   Marginal-Preis-Anker: letzte SWAP-DETAILS (expectedOut/amountIn) = beobachteter
//   Grenzpreis (CLMM: Brutto-Deposit-Verhältnis ist KEIN Preis-Anker — Report-Feststellung).
//
// Exit 0 = Snapshot ok (auch Teil-Ausfall → status=partial), 1 = hartes Fehlschlagen.

import { Connection, PublicKey } from "npm:@solana/web3.js@1.98.4";
import { PoolInfoLayout } from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/layout.js";
import Decimal from "npm:decimal.js@10.4.3";

Decimal.set({ precision: 50 });

const POOL_PDA = "4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM";
const VAULT_WSOL = "C6iR5D39j8Tn8Q51zfDfP93qvJgb5Rj42rxeL52DwDRR";
const VAULT_SIN = "4vzkSWFXXC7wbdPcAVtiJPiAtgQuwmDibZSSw4EkN4os";
const SIN_MINT = "A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z";
const DEC_WSOL = 9, DEC_SIN = 5;

// RPC-Rotation (wie Fable-Loop Zeile 38) + per-Read-Timeout (Public-RPC hangt oft):
const RPCS = ["https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"];
const conns = RPCS.map((r) => new Connection(r, { commitment: "confirmed", disableRetry: true }));
let ci = 0;
let lastUrl = RPCS[0];
function nextConn(): Connection {
  ci = (ci + 1) % conns.length;
  lastUrl = RPCS[ci]; // Provenanz: welche RPC-URL die naechsten Reads liefert
  return conns[ci];
}

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T | null> {
  try {
    return await Promise.race([
      p,
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error(`${label}-timeout ${ms}ms`)), ms)
      ),
    ]);
  } catch {
    return null;
  }
}

// Read mit RPC-Rotation (je 15 s):
async function readRotated<T>(fn: (c: Connection) => Promise<T | null>): Promise<{ v: T | null; rpc: string }> {
  for (let i = 0; i < RPCS.length; i++) {
    const c = nextConn(); // setzt lastUrl auf die gebr. RPC-URL
    const v = await withTimeout(fn(c), 15000, "read");
    if (v !== null) return { v, rpc: lastUrl };
  }
  return { v: null, rpc: "all-failed" };
}

async function readPool(): Promise<{ v: any | null; rpc: string }> {
  return readRotated(async (c) => {
    const info = await c.getAccountInfo(new PublicKey(POOL_PDA));
    if (!info || info.data.length < 200) return null;
    try {
      return PoolInfoLayout.decode(info.data);
    } catch {
      return null;
    }
  });
}

async function readVaultAmount(c: Connection, vault: string): Promise<bigint | null> {
  return withTimeout(
    c.getParsedAccountInfo(new PublicKey(vault), "confirmed", { encoding: "jsonParsed" }).then(
      (r) => {
        // web3.js jsonParsed: token-account `amount` ist ein STRING (raw), nicht number.
        const amt = (r.value?.data as { parsed?: { info?: { amount?: string | number } } })
          ?.parsed?.info?.amount;
        if (amt === undefined || amt === null) return null;
        try {
          return BigInt(amt);
        } catch {
          return null;
        }
      }
    ),
    15000,
    "vault"
  );
}

async function readSupply(c: Connection): Promise<bigint | null> {
  return withTimeout(
    c.getParsedAccountInfo(new PublicKey(SIN_MINT), "confirmed", { encoding: "jsonParsed" }).then(
      (r) => {
        const s = (r.value?.data as { parsed?: { info?: { supply: string } } })?.parsed?.info?.supply;
        return s !== undefined ? BigInt(s) : null;
      }
    ),
    15000,
    "supply"
  );
}

// Preis-Formeln (CLMM, A=WSOL(dec 9), B=SIN(dec 5)):
// P_raw = sqrtPriceX64^2 / 2^128 = rawB/rawA = 1.0001^tick  (Unabhaengig
// gegeneinander — beide stimmen auf 6 signifikante Stellen ueberein).
function priceRawFromSqrt(sqrtPriceX64: bigint): bigint {
  return (sqrtPriceX64 * sqrtPriceX64) / 2n ** 128n;
}
function priceAtTick(tick: number): string {
  return Decimal(1.0001).pow(tick).toFixed(20);
}
// Human-Konversion:
//   P_raw = rawSIN pro Lamport.
//   1 SOL (10^9 lamport) = P_raw * 10^9 rawSIN -> /10^decSIN -> Human-SIN pro SOL.
//   SIN/SOL  = P_raw * 10^9 / 10^DEC_SIN
//   SOL/SIN  = 1 / (SIN/SOL)
function humanPrices(P_raw: bigint): { sinPerSol: string; solPerSin: string } {
  const sinPerSol = Decimal(P_raw.toString()).times("1000000000").div(10 ** DEC_SIN);
  return {
    sinPerSol: sinPerSol.toFixed(4),
    solPerSin: Decimal(1).div(sinPerSol).toString(),
  };
}

// --- Main ---
// Default = absoluter Pfad in mein Commit-Territorium (repo-Root), CWD-unabhaengig.
const REPO_ROOT = Deno.env.get("SIN_REPO_ROOT") ?? "/Users/haqmal/Desktop/Projekte/SuperIntelNex";
const outPath =
  Deno.env.get("POOL_SNAP_OUT") ?? `${REPO_ROOT}/agents/berichte/pool-snapshots/night.jsonl`;

const snap: Record<string, unknown> = { ts: new Date().toISOString() };

// 1) Pool-Zustand (Kurs + Liquidity + Tick)
const poolR = await readPool();
const pool = poolR.v;
snap.rpc_pool = poolR.rpc;
  if (pool) {
  const sqrtPriceX64: bigint = BigInt(pool.sqrtPriceX64);
  const tick: number = Number(pool.tickCurrent);
  const priceRaw = priceRawFromSqrt(sqrtPriceX64);
  const hp = priceRaw > 0n ? humanPrices(priceRaw) : { sinPerSol: "null", solPerSin: "null" };
  snap.pool = {
    liquidity: pool.liquidity.toString(),
    tickCurrent: tick,
    tickBounds: [179280, 259280],
    sqrtPriceX64: sqrtPriceX64.toString(),
    // price_raw = raw SIN pro Lamport = 1.0001^tick (CLMM-Primaesquation)
    priceRawSinPerLamport: priceRaw.toString(),
    priceAtTickOnePoint0001PowTick: priceAtTick(tick),
    priceSinPerSolHuman: hp.sinPerSol,
    priceSolPerSinHuman: hp.solPerSin,
    feeGrowthGlobalX64A: pool.feeGrowthGlobalX64A.toString(),
    feeGrowthGlobalX64B: pool.feeGrowthGlobalX64B.toString(),
    protocolFeesWsOL: pool.protocolFeesTokenA.toString(),
    protocolFeesSin: pool.protocolFeesTokenB.toString(),
    status: pool.status,
    feeOn: pool.feeOn,
  };
}

// 2) Vault-Balances + Supply (parallel über Rotation)
const c2 = nextConn();
const c3 = nextConn();
const [wsolVault, sinVault, supply] = await Promise.all([
  readVaultAmount(c2, VAULT_WSOL),
  readVaultAmount(c3, VAULT_SIN),
  readSupply(c2),
]);
snap.vaults = {
  wsolLamports: wsolVault?.toString() ?? null,
  wsolHuman: wsolVault !== null ? Decimal(wsolVault.toString()).div(1e9).toFixed(9) : null,
  sinRaw: sinVault?.toString() ?? null,
  sinHuman: sinVault !== null ? Decimal(sinVault.toString()).div(1e5).toFixed(4) : null,
  supplyRaw: supply?.toString() ?? null,
};

// 3) Status
snap.status = snap.pool && snap.vaults.wsolLamports && snap.vaults.sinRaw
  ? "ok"
  : snap.pool
    ? "partial"
    : "pool-read-failed";

// --- Ausgabe: JSON stdout + JSONL-Append (Zeitreihe) ---
console.log(JSON.stringify(snap, null, 1));
const fh = await Deno.open(outPath, { create: true, append: true, write: true });
await fh.write(new TextEncoder().encode(JSON.stringify(snap) + "\n"));
await fh.close();
console.error(`SNAPSHOT-APPEND -> ${outPath} (status=${snap.status})`);
if (snap.status === "pool-read-failed") Deno.exit(1);
