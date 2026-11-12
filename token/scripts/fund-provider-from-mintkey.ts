// FUND-PROVIDER-FROM-MINTKEY: Provider (recipient.json) aus der idle
// mint-key-SOL (mint.json) finanzieren — Lokal-Quellen-Pfad, ODER-Branch
// zum Operator-Deposit (CIO-18-06Z-Kapital-Korrektur).
//
// BASIS (11-12, ueberholt): Operator-Order "fange zu traden" — Deposit
// ausstehend, deshalb maximale Lokal-Finanzierung: source - 890880
// (Rent-Exempt-Threshold) - 10000 (Buffer) = transferierbar.
//
// EMPISCH VERWURFEN (11-12 11:30 UTC): Die mint.json-Pubkey A4WSPb… ist
// EXAKT der SIN-Token-Mint (owner = SPL-Token-Programm, space 82) — kein
// System-Wallet. Kein nativer SOL-Transfer kann ihn als Fee-Payer verwenden:
// getAccountInfo-Owner-Check (unten) blockt, on-chain-Sim liefert
// InvalidAccountForFee. Die 1.066.800 lamports sind die Fest-Rent des
// Mint-Accounts. Die Fruheren "null"-Signaturen (5 Sends) wurden durch
// skipPreflight=true verschluckt; on-chain zeigt es: keine lieferte.
// => KEIN Lokal-Funding. Finanzierung NUR ueber Operator-Deposit
// (CIO-23-10Z). Skript bleibt als dokumentiertes Fehlpfad-Zeugnis
// (Default DRY-RUN; SEND blockiert durch den Owner-Gate).
//
// Default: DRY-RUN (keine Tx). Abarbeiten:
//   SIN_NETWORK=mainnet SIN_FUND_SEND=1 SIN_MAINNET_OK=1 \
//   deno run --allow-read --allow-net --allow-env --allow-write \
//     token/scripts/fund-provider-from-mintkey.ts
//
// Journal-Eintrag: "mintkey.fundProvider" (EXECUTED-TRANSACTIONS.jsonl).
import {
  Connection, Keypair, SystemProgram, Transaction, ComputeBudgetProgram,
} from "npm:@solana/web3.js@1.98.4";
import {
  conn, getWallet, journal, loadConfig, networkLabel,
} from "./lib/common.ts";

function fail(msg: string): never {
  console.error("\nABBRUCH: " + msg);
  Deno.exit(3);
}

const RENT_EXEMPT = 890_880n;   // lamports, Fee-PDA-Threshold (empirisch: Transfer nur bei Rest >= 890880)
const BUFFER = 10_000n;        // lamports Sicherheits-Puffer ueber dem Threshold

const cfg = loadConfig();
const c = conn();
const label = networkLabel();
const netKey = Deno.env.get("SIN_NETWORK") ?? cfg.networks.default;
const sendMode = Deno.env.get("SIN_FUND_SEND") === "1";

if (sendMode && netKey === "mainnet" && Deno.env.get("SIN_MAINNET_OK") !== "1")
  fail("SIN_FUND_SEND=1 auf mainnet erfordert SIN_MAINNET_OK=1 (bewusste Bestaetigung).");
if (sendMode && netKey !== "mainnet" && netKey !== "devnet" && netKey !== "localnet")
  fail("Unbekanntes Netz '" + netKey + "'.");

// 1) Quelle: mint.json (idle Mint-Key; Authorities revociert, KEIN Trading-Key —
//    reine SOL-Transferechtheit, bewaehrtes Source-Muster aus provider-topup.ts).
const srcF = new URL("../wallets/mint.json", import.meta.url);
let admin: Keypair;
try {
  admin = Keypair.fromSecretKey(new Uint8Array(JSON.parse(Deno.readTextFileSync(srcF))));
} catch {
  fail("mint.json nicht lesbar — kein Transfer ohne lokal verwalteten Mint-Key.");
}

// Fee-Payer-Owner-Gate (empirisch 11-12 11:30 UTC): Die mint.json-Pubkey ist
// EXAKT der SIN-Mint (A4WSPb…, owner = SPL-Token-Programm, space 82) — kein
// System-Programm-Wallet. Als Fee-Payer ist sie ungueltig: jede natviver
// SOL-Transfer-Transaktion scheitert mit InvalidAccountForFee (on-chain
// simuliert; vorher unsichtbar, weil sendTx skipPreflight=true nutzte und
// die (nichts-wertigen) Signaturen dauerhaft null blieben).
// => Lokal-Finanzierung aus dem Mint-Key ist NICHT MOGLICH. Die
// 890.880-lamports-Rent des Mint-Accounts ist fest. Finanzierung laeuft
// NUR ueber das offizielle Operator-Deposit (CIO-23:10Z-Korrektur).
const SRC_SYS_OWNER = "11111111111111111111111111111111111111112";
const srcAcc = await c.getAccountInfo(admin.publicKey);
if (!srcAcc || srcAcc.owner.toBase58() !== SRC_SYS_OWNER)
  fail("mint-Key ist KEIN System-Wallet (owner " +
    (srcAcc ? srcAcc.owner.toBase58() : "Account fehlt") +
    ") — kein nativer SOL-Transfer moeglich (InvalidAccountForFee). " +
    "Finanzierung NUR per Operator-Deposit (CIO-23:10Z).");

// 2) Ziel: recipient.json (Provider, haelt die Trading-Allokation).
const provKp: Keypair = await getWallet("recipient");
const providerPub = provKp.publicKey;

const [srcBal, dstBal] = await Promise.all([
  c.getBalance(admin.publicKey),
  c.getBalance(providerPub),
]);

const transferable = BigInt(srcBal) > RENT_EXEMPT + BUFFER + 10_000n
  ? BigInt(srcBal) - RENT_EXEMPT - BUFFER
  : 0n;
if (transferable <= 0n)
  fail("Mint-Key-Saldo (" + srcBal + " lamports) unter 890880+10000 — nichts transferierbar.");

console.log("=== Fund-Provider-From-MintKey [" + label + "] " + (sendMode ? "SENDEN" : "DRY-RUN") + " ===");
console.log("Quelle (mint-Key) :", admin.publicKey.toBase58(), "=", (Number(srcBal) / 1e9).toFixed(6), "SOL");
console.log("Ziel (Provider)   :", providerPub.toBase58(), "=", (Number(dstBal) / 1e9).toFixed(6), "SOL");
console.log("Ueberweisung      :", (Number(transferable) / 1e9).toFixed(6), "SOL (Rest = " + RENT_EXEMPT + " + " + BUFFER + ")");

if (!sendMode) {
  console.log("\nDRY-RUN — nichts gesendet. Abarbeiten mit:");
  console.log("  SIN_NETWORK=" + netKey + " SIN_FUND_SEND=1" + (netKey === "mainnet" ? " SIN_MAINNET_OK=1" : "") +
    " deno run --allow-read --allow-net --allow-env --allow-write token/scripts/fund-provider-from-mintkey.ts");
  Deno.exit(0);
}

// ---------- Robuster Send-Block ----------
// Empirisch (2026-11-12, 429-RPC-Limits): frueher Blockhash + skipPreflight
// => Tx wird still verworfen (Signatur null, Saldo unveraendert). Deshalb:
//   - frischer Blockhash direkt vor dem Build (Retry-Loop),
//   - Preflight-Simulation (simulatable=true) statt skipPreflight,
//   - Priority-Fee 5000 micro-SOL,
//   - 90 s-Confirmation per Polling ueber zwei RPC-Endpunkte.
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
const CONFIRM_RPC_FALLBACK = "https://solana-rpc.publicnode.com";

// Idempotenz-Check: evtl. eine vorher abgebrochene Ueberweisung hat
// inzwischen gelaufen (z. B. Send akzeptiert, Confirmation timeout).
const [dstPre] = [await c.getBalance(providerPub)];
if (dstPre >= dstBal + Number(transferable))
  fail("Ziel-Saldo zaehlt bereits die Ueberweisung (" + dstPre + " lamports) — NICHT erneut senden.");

let sig: string | null = null;
for (let attempt = 1; attempt <= 4 && sig === null; attempt++) {
  const bh = (await c.getLatestBlockhash("confirmed")).blockhash;
  // Schlichter Proven-Transfer (gates wie provider-topup.ts). KEINE
  // Priority-Fee/CU-Limit: der Fee-Payer (mint-Key) haelt nur 1.066.800 lp,
  // und die CU-Limit-Reservierung fuer Priority-Fees wuerde den
  // InvalidAccountForFee-Check sprengen (empirisch 11-12). Basis-Transfer
  // + 5000 Base-Fee = 895.880 Rest >= 890.880 Rent-Schwelle.
  const t = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: admin.publicKey, toPubkey: providerPub, lamports: Number(transferable) }),
  );
  t.recentBlockhash = bh;
  t.feePayer = admin.publicKey;
  t.sign(admin);
  const sim = await c.simulateTransaction(t, [admin]);
  if (sim.value.err) {
    console.error("  Versuch " + attempt + " Simulation-ERROR: " + JSON.stringify(sim.value.err)
      + " | CU: " + sim.value.unitsConsumed
      + " | Logs: " + (sim.value.logs ?? []).slice(-15).join(" | "));
    await sleep(15_000);
    continue;
  }
  const s = await c.sendRawTransaction(t.serialize(), { skipPreflight: false, preflightCommitment: "confirmed" });
  console.log("  Versuch " + attempt + ": gesendet, Signatur " + s.slice(0, 16) + "… (Preflight OK)");
  const start = Date.now();
  while (Date.now() - start < 90_000) {
    for (const rpc of [c, new Connection(CONFIRM_RPC_FALLBACK, "confirmed")]) {
      try {
        const st = (await Promise.race([
          rpc.getSignatureStatuses([s]),
          new Promise((r) => setTimeout(() => r(null), 4000)),
        ])) as unknown;
        if (!st) continue;
        const v = (st as { value: Array<{ confirmationStatus?: string; err?: unknown; slot?: number }> }).value[0];
        if (v) {
          if (v.err)
            fail("On-Chain-Fehler in " + s + ": " + JSON.stringify(v.err)
              + " (Slot " + (v.slot ?? "?") + ") — Ueberweisung NICHT gelaufen.");
          if (v.confirmationStatus === "confirmed" || v.confirmationStatus === "finalized") {
            sig = s;
            break;
          }
        }
      } catch { /* 429/Timeout: naechster RPC */ }
    }
    if (sig) break;
    await sleep(3000);
  }
  if (!sig)
    console.error("  Versuch " + attempt + ": keine Bestaetigung nach 90 s (Signatur " + s + ") — Blockhash neu, erneut.");
}
if (sig === null)
  fail("4 Versuche: Transaktion nicht bestaetigt (429-RPC-Limits?). Mit curl getSignatureStatuses pruefen, ob eine der Signaturen doch gelaufen ist, bevor erneut gesendet wird.");

journal("mintkey.fundProvider", {
  signature: sig,
  network: label,
  details: { from: admin.publicKey.toBase58(), to: providerPub.toBase58(), lamports: transferable.toString() },
});

const dstAfter = await c.getBalance(providerPub);
if (dstAfter !== dstBal + Number(transferable))
  fail("Ziel-Saldo weicht ab: " + (dstAfter / 1e9).toFixed(6) + " SOL (erwartet " + ((dstBal + Number(transferable)) / 1e9).toFixed(6) + ") — manuell pruefen.");

console.log("OK — " + (Number(transferable) / 1e9).toFixed(6) + " SOL an " + providerPub.toBase58() + " ueberwiesen. Signature: " + sig);
console.log("  (https://explorer.solana.com/tx/" + sig + ")");
console.log("Provider-Saldo nachher: " + (dstAfter / 1e9).toFixed(6) + " SOL.");
