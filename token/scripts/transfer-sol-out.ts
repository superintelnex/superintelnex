// SOL-TRANSFER-ZURUECK: Provider (DNEBNj…) → Ziel-Adresse (Operator).
//
// Zweck: Rest-SOL aus dem Trading-Budget zurueck an den Operator.
// Stand 14:08 UTC: SIN-Position wurde vollstaendig verausschiedet
// (Sell-Sig 5sJxepBc…, SIN-ATA FD1WzT… = 0) — es gibt KEINEN
// SIN-Rest mehr; der Transfer bewegt nur freie SOL-Lamports.
//
// Mechanik (bewaehrtes Transfer-Pattern aus distribute.ts TX4, siehe
// Journal "distribute-*"): 1x SystemProgram.transfer + CUL-Instruction.
// Simpler als ein CLMM-Tx: 2 Instruktionen, 1 Signer.
//
// SICHERHEITSGATES (konsistent mit swap-sol-to-sin.ts):
//   - Default = DRY-RUN: alle Read-only-Checks + RPC-Simulation.
//     Exit 0, nichts wird gesendet.
//   - Senden: NUR mit SIN_NETWORK=mainnet + SIN_DRAIN_SEND=1 +
//     SIN_MAINNET_OK=1.
//   - Ziel-Validierung: Base58-Parity (Double-Check via PublicKey),
//     Ziel darf KEIN Projekt-/Team-Key sein (Repo-Keys + bekannte
//     Projekt-Adressen) — Schutz gegen Loops und Fat-Fingers.
//   - Reserve-Guard: Provider muss nach Transfer + Tx-Fee einen
//     Puffer von >= 45.000 Lamports behalten (0.000045 SOL).
//
// Aufrufe:
//   // Dry-Run (Default, Sweep-Vorschau + Simulation):
//   SIN_NETWORK=mainnet SIN_TRANSFER_TO=<Base58> deno run --allow-read \
//     --allow-net --allow-env token/scripts/transfer-sol-out.ts
//   // Echter Transfer (nach Operator-Abnicken):
//   SIN_NETWORK=mainnet SIN_TRANSFER_TO=<Base58> SIN_DRAIN_SEND=1 \
//     SIN_MAINNET_OK=1 deno run --allow-read --allow-net --allow-env \
//     --allow-write token/scripts/transfer-sol-out.ts
//
// Parameter (env):
//   SIN_TRANSFER_TO     Ziel-Adresse (Base58). Pflicht.
//   SIN_TRANSFER_SOL    Betrag in SOL (Dezimal). Default = Sweep:
//                       Provider-Saldo minus Reserve (45.000 Lamports)
//                       minus Tx-Fee (5.000).
//
// Bei Sendung: Journal-Eintrag "clmm.solTransferOut" +
// result/TRANSFER-DETAILS-<ts>.txt.
import {
  Keypair, PublicKey, Transaction, ComputeBudgetProgram, SystemProgram,
} from "npm:@solana/web3.js@1.98.4";
import * as spl from "npm:@solana/spl-token@0.4.15";
import { conn, networkLabel, requireMainnetOk, sendTx, journal } from "./lib/common.ts";

const LAMPORTS_PER_SOL = 1_000_000_000;
const PROVIDER = new PublicKey("DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo");
const SIN_MINT = new PublicKey("A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z");

// Projekt-/Team-Adressen: Ziel darf KEINE davon sein (Rueckkanal-Loops,
// Fat-Finger-Schutz). Adressen sind Oeffentlich (Repo/On-chain), keine Secrets.
const FORBIDDEN_TARGETS = [
  "DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo", // Provider selbst
  "9kT5EwF71njCXYdkexqBCKRG88oxatoHx12FaPvYXws7", // Haupt-Key (Topup-Quelle)
  "FXw41HCwrYKGYXx4x76N5oGDkcs5Jp9KBuZfgaCi32mL", // Distributions-Owner (Team)
  "A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z", // SIN-Mint
  "4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM", // Pool
];

function fail(msg: string): never {
  console.error("ABBRUCH: " + msg);
  Deno.exit(1);
}

function loadProviderKp(): Keypair | null {
  try {
    const raw = Deno.readTextFileSync(new URL("../wallets/recipient.json", import.meta.url).pathname);
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(raw)));
  } catch { return null; }
}

const TARGET = (Deno.env.get("SIN_TRANSFER_TO") ?? "").trim();
const SEND = Deno.env.get("SIN_DRAIN_SEND") === "1";
if (!TARGET) fail("SIN_TRANSFER_TO fehlt (Ziel-Adresse Base58).");
if (FORBIDDEN_TARGETS.includes(TARGET)) fail(
  "Ziel ist eine bekannte Projekt-/Team-Adresse (" + TARGET + ") — Transfer dorthin ist gesperrt.");

// 1) Ziel-Validierung: Base58-Parity (PublicKey-Wert == Eingabe-Zeichenfolge)
let targetPk: PublicKey;
try {
  targetPk = new PublicKey(TARGET);
  if (targetPk.toBase58() !== TARGET) fail(
    "Ziel-Adresse liefert nach PublicKey-Check Aendere Zeichenfolge — Parity-Fehler.");
} catch (e) { fail("Ziel-Adresse ist kein gueltiger Base58-PublicKey: " + String(e)); }

const c = conn();
const net = networkLabel();
if (SEND) {
  if (net !== "MAINNET-LAUNCH") fail("Ziel auf Mainnet, aber Netz-Label ist " + net + ".");
  requireMainnetOk("SOL-Transfer-Sendung");
}

// 2) Provider + Saldo
const providerKp = loadProviderKp();
if (providerKp && providerKp.publicKey.toBase58() !== PROVIDER.toBase58())
  fail("recipient.json Pubkey != PROVIDER-Adresse.");
const before = await c.getBalance(PROVIDER);
// Live-Read: SIN-Saldo im Provider-ATA (nach Vollausstieg 14:07 UTC = 0;
// kein harter Wert mehr — historischer Stand war 2.285M SIN-raw).
const sinAta = spl.getAssociatedTokenAddressSync(SIN_MINT, PROVIDER);
const sinAtaInfo = await c.getAccountInfo(sinAta);
const sinRaw = sinAtaInfo ? Buffer.from(sinAtaInfo.data).readBigUInt64LE(64).toString() : "0";
const feeLamports = 5_000;
const reserve = 890_880; // Rent-Exempt-Minimum einer nativen SOL-Adresse
                        // (0.000890880 SOL). Darunter wuerde der Provider
                        // mit "InsufficientFundsForRent" ablehnen — die
                        // Adresse muss am Leben bleiben, damit das Team
                        // spaeter wieder top-up/trade fahren kann.
const targetBal = await c.getBalance(targetPk);

// 3) Betrag: Sweep-Default oder explizit
let lamports: number;
const explicit = Deno.env.get("SIN_TRANSFER_SOL");
if (explicit !== undefined) {
  lamports = Math.round(parseFloat(explicit) * LAMPORTS_PER_SOL);
  if (!Number.isFinite(lamports) || lamports <= 0) fail("SIN_TRANSFER_SOL ungultig: " + explicit);
} else {
  lamports = before - feeLamports - reserve; // Sweep mit Puffer
}
if (before - lamports - feeLamports < reserve)
  fail("Reserve-Guard: nach Transfer (" + lamports + ") + Fee (" + feeLamports +
    ") blieben " + (before - lamports - feeLamports) + " Lamports (< Reserve " + reserve + ").");
if (lamports > before - feeLamports)
  fail("Transfer (" + lamports + ") + Fee (" + feeLamports + ") uebersteigt Provider-Saldo (" + before + ").");

console.log("=== SOL-TRANSFER-" + (SEND ? "SENDUNG" : "DRY-RUN") + " (" + net + ") ===");
console.log("Von    : " + PROVIDER.toBase58() + " (Saldo " + (before / LAMPORTS_PER_SOL) + " SOL)");
console.log("Nach   : " + targetPk.toBase58() + " (Saldo " + (targetBal / LAMPORTS_PER_SOL) + " SOL)");
console.log("Betrag : " + (lamports / LAMPORTS_PER_SOL).toFixed(6) + " SOL (" + lamports + " Lamports)");
console.log("Fee    : " + feeLamports + " Lamports | Provider-Reserve danach: " +
  (before - lamports - feeLamports) + " Lamports");
console.log("SIN-ATA  : " + sinRaw + " raw im Provider-ATA " + sinAta.toBase58().slice(0, 6) +
  "… (live-Read; seit Vollausstieg 14:07 UTC = 0)");

// 4) Tx-Bau
const tx = new Transaction().add(
  ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
  SystemProgram.transfer({ fromPubkey: PROVIDER, toPubkey: targetPk, lamports }),
);
if (providerKp) {
  // Simulation kompiliert die Tx — recentBlockhash ist Pflicht, sonst
  // "Transaction recentBlockhash required" (sendTx wuerde erst beim
  // Senden setzen, zu spaet fuer die Pre-Simulation).
  tx.recentBlockhash = (await c.getLatestBlockhash()).blockhash;
  tx.sign(providerKp);
}

if (SEND && !providerKp) fail("recipient.json fehlt — SEND-Modus nicht moeglich.");

// 5) RPC-Simulation (immer, auch vor Sendung)
try {
  const sim = await c.simulateTransaction(tx);
  if (sim.value.err !== null) fail("RPC-Simulation fehlerhaft: " + JSON.stringify(sim.value.err));
  console.log("Simulation: OK, CU-Gebrauch = " + sim.value.unitsConsumed + " (Limit 100000)");
} catch (e) { fail("RPC-Simulation schlug fehl: " + String(e)); }

if (!SEND) {
  console.log("\nDRY-RUN fertig — nichts wurde gesendet. Senden: SIN_DRAIN_SEND=1 SIN_MAINNET_OK=1");
  Deno.exit(0);
}

// 6) Sendung + Bestaetigung
// sendTx() (lib/common.ts) macht bestaetigen + Conf-Signature-Check
// intern (commitment: confirmed) — hier nicht doppeln.
const sig = await sendTx(c, tx, providerKp ? [providerKp] : []);
console.log("Signature  : " + sig + " (confirmed)");

// 7) Nachkontrolle + Doku
const after = await c.getBalance(PROVIDER);
const targetAfter = await c.getBalance(targetPk);
console.log("Provider nachher: " + (after / LAMPORTS_PER_SOL) + " SOL (Diff " +
  ((before - after) / LAMPORTS_PER_SOL).toFixed(6) + " = " +
  (before - after === lamports + feeLamports ? "Transfer + Fee, exakt" : "PRUEFEN: " + (before - after)) + ")");
console.log("Ziel nachher    : " + (targetAfter / LAMPORTS_PER_SOL) + " SOL (Diff " +
  ((targetAfter - targetBal) / LAMPORTS_PER_SOL).toFixed(6) + ")");

journal("clmm.solTransferOut", {
  signature: sig,
  details: {
    from: PROVIDER.toBase58(),
    to: targetPk.toBase58(),
    lamports: String(lamports),
    feeLamports: feeLamports,
    providerBefore: String(before),
    providerAfter: String(after),
    targetBefore: String(targetBal),
    targetAfter: String(targetAfter),
    sinKeptInPool: sinRaw + " SIN-raw im Provider-ATA (live-Read; Stand: " +
      (sinRaw === "0" ? "vollstaendig verausschiedet, ATA leer" : "vorhanden — PRUEFEN") + ")",
  },
});
// TRANSFER-DETAILS-<ts>.txt (konsistent mit SWAP-DETAILS-Namen)
const ts = Date.now();
try {
  const dir = new URL("../result/", import.meta.url);
  const f = new URL("TRANSFER-DETAILS-" + ts + ".txt", dir);
  Deno.writeTextFileSync(f, JSON.stringify({
    zeit: new Date(ts).toISOString(),
    signature: sig,
    from: PROVIDER.toBase58(),
    to: targetPk.toBase58(),
    lamports: String(lamports),
    feeLamports: feeLamports,
    providerBefore: String(before),
    providerAfter: String(after),
    targetBefore: String(targetBal),
    targetAfter: String(targetAfter),
  }, null, 2) + "\n");
  console.log("result/TRANSFER-DETAILS-" + ts + ".txt geschrieben.");
} catch (e) { console.error("WARNUNG: Details-Datei nicht geschrieben: " + String(e)); }

console.log("\n=== SOL-ZURUECKGABE ERFOLGREICH ===");
console.log((lamports / LAMPORTS_PER_SOL) + " SOL an " + targetPk.toBase58() +
  " (Sig " + sig.slice(0, 16) + "…). SIN-ATA danach: " + sinRaw +
  " raw (live-Read, unveraendert vom Transfer — bewegt nur native SOL).");
