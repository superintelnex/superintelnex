// Raydium-CLMM-TRADING: SOL → SIN Kauf (Base-In-Swap, WSOL-Basis).
//
// Zweck: Der Provider tauscht freie SOL gegen SIN im eigenen CLMM-Pool
// (4erqAhdH…, SIN/WSOL). Eingabe = WSOL (MintA), Ausgabe = SIN (MintB).
//
// Mechanik (Raydium-SDK-v2 alpha 0.2.84, statischer Pfad — wie der
// Burn-Script, OHNE das scope-befaellige Clmm-Klassen-Interface):
//   1) Read-only: Pool-State (PoolInfoLayout) + ExBitmap (TickArray-
//      Bitmap) von der Kette lesen, inititalisierte TickArrays ableiten
//      (aktuell 2: Start-Index 178800 + 259200 = DL6SJ2bM… + 3XRgbqiV…).
//   2) Lokal-Quote: SDK-eigener Simulator (swapInternal) berechnet
//      erwartete Ausgabe + Fees + End-Tick OHNE RPC-Sendevorgang.
//   3) Tx-Bau (Legacy-Tx, nur ~15 Keys — KEIN ALT noetig, obwohl der
//      Pool ein ALT hat):
//        [setComputeUnitLimit]
//        [createAssociatedTokenAccount (WSOL-ATA), NUR falls fehlt]
//        [SystemProgram.transfer: Provider → WSOL-ATA (SOL wrapen)]
//        [spl.createSyncNativeInstruction(WSOL-ATA)]
//        [ClmmInstrument.makeSwapBaseInInstructions → swapV2Instruction]
//      Die syncNative-Sequenz ist derselbe bewaehrte Wrap-Pattern wie
//      im Launch-Skript (launch-clmm-pool.ts TX2): ohne Sync zeigt der
//      Native-ATA amount=0 und der Pool-Transfer faellt mit
//      "InsufficientFunds" (Custom 1).
//   4) RPC-Simulation (lokal signiert, sendet NICHTS) → CU + Logs.
//
// SICHERHEITSGATES (konsistent mit burn-and-earn-lock.ts):
//   - Default = DRY-RUN: alle Read-only-Checks + Lokal-Quote +
//     RPC-Simulation. Exit 0, nichts wird gesendet.
//   - Senden: NUR mit SIN_NETWORK=mainnet + SIN_DEX_SEND=1 +
//     SIN_MAINNET_OK=1. Kein Journal-One-Shot: Swaps sind wiederholbar
//      (im Gegensatz zum Burn). Jeder Lauf wird per getrenntem
//      Journal-Eintrag + SWAP-DETAILS-Datei dokumentiert.
//   - Slippage-Guard: otherAmountThreshold aus lokal berechneter
//     Erwartungsquote * (1 - SIN_SLIPPAGE_BPS/10000). Schutz gegen
//     Preissturz zwischen Quote und Sendung.
//
// Aufrufe:
//   // Dry-Run (Default, max-Sweep-Quote, simuliert nur):
//   SIN_NETWORK=mainnet deno run --allow-read --allow-net --allow-env \
//     token/scripts/swap-sol-to-sin.ts
//   // Dry-Run mit fixem Einkaufsbetrag + Slippage:
//   SIN_NETWORK=mainnet SIN_BUY_SOL=0.05 SIN_SLIPPAGE_BPS=100 deno run \
//     --allow-read --allow-net --allow-env token/scripts/swap-sol-to-sin.ts
//   // Echter Kauf (nach Betreiber-Abnicken + Simulation-OK):
//   SIN_NETWORK=mainnet SIN_BUY_SOL=0.05 SIN_DEX_SEND=1 SIN_MAINNET_OK=1 \
//     deno run --allow-read --allow-net --allow-env --allow-write \
//     token/scripts/swap-sol-to-sin.ts
//
// Parameter (env):
//   SIN_BUY_SOL      SOL-Betrag des Einkaufs (Dezimal). Default = max:
//                    freier Provider-SOL minus Reserve (0.005 SOL fuer
//                    spaetere Tx-Gebuehren).
//   SIN_SLIPPAGE_BPS Slippage-Guard in Basis-Punkten (100 = 1 %).
//                    Default 100. 0 = kein Guard (nicht empfohlen).
//
// Bei Sendung: Journal-Eintrag "clmm.swapWSOLToSIN" +
// result/SWAP-DETAILS-<ts>.txt (kein One-Shot — wiederholbar).
import {
  Keypair, PublicKey, Transaction, ComputeBudgetProgram, SystemProgram,
} from "npm:@solana/web3.js@1.98.4";
import * as spl from "npm:@solana/spl-token@0.4.15";
import BN from "npm:bn.js@5.2.1";
import {
  ClmmInstrument,
} from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/instrument.js";
import {
  getPdaExBitmapAccount,
  getPdaTickArrayAddress,
} from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/libraries/pda.js";
import {
  TickArrayBitmapUtil,
} from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/libraries/tickArrayUtil.js";
import {
  swapInternal,
} from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/libraries/swapSimulator.js";
import {
  ClmmConfigLayout,
  PoolInfoLayout,
  TickArrayBitmapExtensionLayout,
  TickArrayLayout,
} from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/layout.js";
import { loadConfig, conn, networkLabel, requireMainnetOk, sendTx, journal } from "./lib/common.ts";
import { clmmProgramForNetwork } from "./lib/raydium-clmm.ts";

const LAMPORTS_PER_SOL = 1_000_000_000;

// ---------- Fixed constants (aus token/result/POOL-ADDRESS.txt, on-chain verifiziert) ----------
// Pool-Semantik (Kette): mintA = WSOL (9 Dez), mintB = SIN (5 Dez).
// SOL-Kauf = Base-In: Eingabe WSOL (A), Ausgabe SIN (B), zeroForOne = true.

const POOL_ID = new PublicKey("4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM");
const AMM_CONFIG = new PublicKey("4BLNHtVe942GSs4teSZqGX24xwKNkqU7bGgNn3iUiUpw");
const VAULT_A_W_SOL = new PublicKey("C6iR5D39j8Tn8Q51zfDfP93qvJgb5Rj42rxeL52DwDRR");
const VAULT_B_SIN = new PublicKey("4vzkSWFXXC7wbdPcAVtiJPiAtgQuwmDibZSSw4EkN4os");
const OBSERVATION = new PublicKey("9GLYSD4xTEHbQHKBKJAquCTuahGKW3twg9BkuwiUgDMy");
const EX_BITMAP = new PublicKey("6DADXNR6MAwWsNq4He4juWmV1CXRT56yCPXqrza92Mcp");
const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const SIN_MINT = new PublicKey("A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z");
const PROVIDER = new PublicKey("DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo");

// Parameter (env):
const RESERVE_LAMPORTS = 5_000_000;   // 0.005 SOL: Reserve fuer spaetere Tx-Gebuehren.
const SIN_BUY_SOL = Deno.env.get("SIN_BUY_SOL");       // null = max-Sweep (free - Reserve)
const SLIPPAGE_BPS = parseInt(Deno.env.get("SIN_SLIPPAGE_BPS") ?? "100", 10);
const CU_LIMIT = 500_000;             // CU-Puffer fuer swapV2 + Wrap-Sequenz.

function fail(msg: string): never {
  console.error("\nABBRUCH: " + msg);
  Deno.exit(3);
}

// ---------- Modus + Netz ----------

const label = networkLabel();
const sendMode = Deno.env.get("SIN_DEX_SEND") === "1";
if (sendMode) {
  requireMainnetOk("swap-sol-to-sin (SEND)");
  if (Deno.env.get("SIN_MAINNET_OK") !== "1")
    fail("SIN_DEX_SEND=1 erfordert SIN_MAINNET_OK=1.");
  const netKey = Deno.env.get("SIN_NETWORK") ?? loadConfig().networks.default;
  if (netKey !== "mainnet")
    fail("SIN_DEX_SEND=1 ist nur mit SIN_NETWORK=mainnet erlaubt.");
  if (label !== "MAINNET-LAUNCH")
    fail("Einkauf-Skript ist nur gegen MAINNET-Pool definiert (SIN_NETWORK=mainnet).");
}
if (label === "MAINNET-LAUNCH" && !sendMode) {
  // Dry-Run auf Mainnet: OK (read-only), aber sinness-Info.
  console.log("NOTIZ: MAINNET-Dry-Run (read-only + Simulation, nichts wird gesendet).");
}

const { programId: clmmProgramId } = clmmProgramForNetwork("mainnet");
const CLMM_PROGRAM = new PublicKey(clmmProgramId);
console.log("Netz           :", label);
console.log("CLMM-Programm  :", CLMM_PROGRAM.toBase58());
console.log("Pool (SIN/WSOL):", POOL_ID.toBase58(), "(mintA=WSOL, mintB=SIN)");
console.log("AmmConfig      :", AMM_CONFIG.toBase58());
console.log("ExBitmap       :", EX_BITMAP.toBase58(),
  "(PDA-Check: " + new PublicKey(getPdaExBitmapAccount(CLMM_PROGRAM, POOL_ID).publicKey).toBase58() + ")");

// ---------- Provider-Key (lokaler, gitignored) ----------

function loadProviderKp(): Keypair | null {
  try {
    const raw = Deno.readTextFileSync(new URL("../wallets/recipient.json", import.meta.url).pathname);
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(raw)));
  } catch {
    return null;
  }
}
const providerKp = loadProviderKp();
if (sendMode && !providerKp) fail("recipient.json fehlt — SEND-Modus nicht moeglich.");
if (providerKp && providerKp.publicKey.toBase58() !== PROVIDER.toBase58())
  fail("recipient.json Pubkey (" + providerKp.publicKey.toBase58() + ") != PROVIDER-Adresse (" + PROVIDER.toBase58() + ").");
console.log("Provider (Signer):", PROVIDER.toBase58());

// ---------- Read-only-Gates ----------

const c = conn();

// 1) Pool-State (liquidity, tickCurrent, tickSpacing, status):
const poolAcc = await c.getAccountInfo(POOL_ID);
if (!poolAcc) fail("Pool-Account (" + POOL_ID.toBase58() + ") existiert NICHT on-chain.");
const poolInfo = PoolInfoLayout.decode(poolAcc.data);
console.log("\nPool-State:");
console.log("  liquidity      :", (poolInfo.liquidity as BN).toString());
console.log("  tickCurrent    :", poolInfo.tickCurrent);
console.log("  tickSpacing    :", poolInfo.tickSpacing, "(erwartet 10)");
if (poolInfo.tickSpacing !== 10)
  fail("tickSpacing != 10 — Konstanten/POOL-ADDRESS-Abgleich noetig.");
if ((poolInfo.liquidity as BN).isZero())
  fail("Pool-Liquiditaet = 0 — Pool leergefaehrt, kein Kauf moeglich.");
console.log("  sqrtPriceX64   :", (poolInfo.sqrtPriceX64 as BN).toString());

// 2) AmmConfig (tradeFeeRate, tickSpacing):
const cfgAcc = await c.getAccountInfo(AMM_CONFIG);
if (!cfgAcc) fail("AmmConfig-Account (" + AMM_CONFIG.toBase58() + ") fehlt.");
const cfgInfo = ClmmConfigLayout.decode(cfgAcc.data);
// tradeFeeRate-Bezugszahl = 1e6 (SDK: feeRate muss < 1e6, Fee = input*rate/1e6).
// 100 / 1e6 = 0,0001 = 0,01 % (uebereinstimmt mit der beobachteten Sim-Fee).
console.log("  AmmConfig      : index " + cfgInfo.index + ", tradeFeeRate " +
  cfgInfo.tradeFeeRate + " (= " + (cfgInfo.tradeFeeRate / 1_000_000 * 100).toFixed(4) + " %)");
if (cfgInfo.tickSpacing !== poolInfo.tickSpacing)
  fail("Config-TickSpacing (" + cfgInfo.tickSpacing + ") != Pool-TickSpacing (" + poolInfo.tickSpacing + ").");

// 3) ExBitmap → initialisierte TickArrays (bitmaskenbasierte Herleitung,
//    AUF KEINEN FALL aus POOL-ADDRESS.txt gehardcodet — die Kette entscheidet):
const exAcc = await c.getAccountInfo(EX_BITMAP);
if (!exAcc) fail("ExBitmap-Account (" + EX_BITMAP.toBase58() + ") fehlt.");
const exBitmap = TickArrayBitmapExtensionLayout.decode(exAcc.data);
const tickStarts: number[] = TickArrayBitmapUtil.findTickArrayStartIndex({
  tickSpacing: poolInfo.tickSpacing,
  poolBitmap: poolInfo.tickArrayBitmap as unknown as Uint8Array,
  tickArrayBitmap: {
    negativeTickArrayBitmap: exBitmap.negativeTickArrayBitmap as unknown as Uint8Array,
    positiveTickArrayBitmap: exBitmap.positiveTickArrayBitmap as unknown as Uint8Array,
  },
  findInfo: { type: "all" } as never,
});
if (tickStarts.length === 0)
  fail("Keine initialisierten TickArrays gefunden — Pool betriebsuntaegetig.");
const tickArrays = tickStarts.map((st) => {
  const pda = new PublicKey(getPdaTickArrayAddress(CLMM_PROGRAM, POOL_ID, st).publicKey);
  return { start: st, pda };
});
console.log("  TickArrays     :", tickArrays.length, "initialisiert:");
const tickArrayDecoded: { address: PublicKey; value: ReturnType<typeof TickArrayLayout.decode> }[] = [];
for (const ta of tickArrays) {
  const acc = await c.getAccountInfo(ta.pda);
  if (!acc || acc.data.length !== 10240)
    fail("TickArray " + ta.pda.toBase58() + " (start " + ta.start + ") exists NICHT/zu klein (" + (acc ? acc.data.length : "null") + ").");
  tickArrayDecoded.push({ address: ta.pda, value: TickArrayLayout.decode(acc.data) });
  console.log("    - start " + String(ta.start).padStart(6, " ") + "  " + ta.pda.toBase58());
}

// 4) Provider-Soelden + ATA:
const freeLamports = await c.getBalance(PROVIDER);
console.log("\nProvider (DNEB…):");
console.log("  freier SOL     :", (freeLamports / LAMPORTS_PER_SOL).toFixed(6));

const wsolAta = spl.getAssociatedTokenAddressSync(WSOL_MINT, PROVIDER);
const sinAta = spl.getAssociatedTokenAddressSync(SIN_MINT, PROVIDER);
let wsolAtaExists = !!(await c.getAccountInfo(wsolAta));
let sinAtaExists = !!(await c.getAccountInfo(sinAta));
console.log("  WSOL-ATA       :", wsolAta.toBase58(), wsolAtaExists ? "(existiert)" : "(muss in Tx angelegt werden)");
console.log("  SIN-ATA        :", sinAta.toBase58(), sinAtaExists ? "(existiert)" : "(fehlt — wird in Tx angelegt, Rent 0,0203 SOL)");
// NOTE (CIO 14:47 UTC, Vollausstieg-P5): Nach dem Vollausstieg (14:07–14:08 UTC,
// 5sJxepBc…/4rD1bogX…) sind beide ATAs geschlossen. Das SIN-ATA-Defizit ist
// KEIN Fehler mehr: die Tx legt es automatisch an (Rent vom Provider-Saldo).
// Der Auto-Loop reserviert bei fehlendem ATA 0,0263 SOL (Rent + Fee + Puffer).

// 5) Einkaufsbetrag bestimmen:
//    Default = Max-Sweep: freier SOL minus 0.005 Reserve. Explizit: SIN_BUY_SOL.
//    Achtung: Deno.env.get liefert undefined (nicht null) bei fehlender Variable.
let amountInLamports: number;
if (SIN_BUY_SOL) {
  amountInLamports = Math.floor(parseFloat(SIN_BUY_SOL) * LAMPORTS_PER_SOL);
  if (!Number.isFinite(amountInLamports) || amountInLamports <= 0)
    fail("SIN_BUY_SOL ungültig: '" + SIN_BUY_SOL + "' (positives Dezimal in SOL erwarten).");
  if (amountInLamports + 2_000 + RESERVE_LAMPORTS > freeLamports)
    fail("SIN_BUY_SOL (" + SIN_BUY_SOL + " SOL) + Tx-Reserve (" + (RESERVE_LAMPORTS / LAMPORTS_PER_SOL) +
      " SOL) uebersteigt freien Provider-Saldo (" + (freeLamports / LAMPORTS_PER_SOL).toFixed(6) + " SOL).");
  console.log("\nEinkauf (explizit) :", (amountInLamports / LAMPORTS_PER_SOL).toFixed(6), "SOL");
} else {
  amountInLamports = Math.floor(freeLamports - RESERVE_LAMPORTS);
  if (amountInLamports < 1_000_000)
    fail("Max-Sweep ergibt < 0.001 SOL (freier Saldo " +
      (freeLamports / LAMPORTS_PER_SOL).toFixed(6) + " SOL) — unpraktikabel. Betrag per SIN_BUY_SOL setzen.");
  console.log("\nEinkauf (MAX-Sweep):", (amountInLamports / LAMPORTS_PER_SOL).toFixed(6),
    "SOL (free - " + (RESERVE_LAMPORTS / LAMPORTS_PER_SOL) + " SOL-Reserve)");
}
const amountIn = new BN(amountInLamports);

// 6) Lokal-Quote per SDK-Simulator (swapInternal) — pure Mathematik,
//    kein RPC-Sendevorgang, funktioniert auch ohne recipient.json:
const simQuote = swapInternal({
  programId: CLMM_PROGRAM,
  poolId: POOL_ID,
  poolInfo: poolInfo as never,
  tickArrays: tickArrayDecoded as never,
  configInfo: cfgInfo as never,
  tickarrayBitmapExtension: exBitmap as never,
  amountSpecified: amountIn,
  sqrtPriceLimitX64: new BN(0),   // 0 = kein Preislimit (wie im SDK-Default)
  zeroForOne: true,               // WSOL (A) in → SIN (B) out
  isBaseInput: true,
  blockTimestamp: Math.floor(Date.now() / 1000),
  includeExtraTickArrays: true,
});
const expectedOut = simQuote.amountCalculated;
const minOut = expectedOut.muln(10000 - SLIPPAGE_BPS).divn(10000);
console.log("\n=== ERWARTETE QUOTE (swapInternal, lokale Simulation) ===");
console.log("  input        :", (amountInLamports / LAMPORTS_PER_SOL).toFixed(6), "SOL (WSOL-raw " + amountIn.toString() + ")");
console.log("  expected out :", expectedOut.toString(), "SIN-raw  (= " +
  (expectedOut.divn(100_000).toString()) + " SIN, 5 Dez.)");
console.log("  trade fee    :", simQuote.feeAmount.toString(), "WSOL-raw (" +
  (simQuote.feeAmount.toNumber() / LAMPORTS_PER_SOL).toFixed(9) + " SOL)");
console.log("  End-Tick     :", simQuote.tickCurrent, "(vorher " + poolInfo.tickCurrent + ")");
console.log("  Slippage-Guard:", SLIPPAGE_BPS + " bps → otherAmountThreshold = " + minOut.toString(), "SIN-raw");
// Durchschnittlicher Vollzugskurs inkl. Impact (menschliche Einheiten):
//   SIN  = expectedOut / 10^5  (5 Dez.)   |   SOL = amountInLamports / 10^9
const avgSinPerSol = expectedOut.divn(100_000).toNumber() / (amountInLamports / LAMPORTS_PER_SOL);
console.log("  Schnitt-Kurs :", avgSinPerSol.toExponential(5), "SIN/SOL  (" +
  (1 / avgSinPerSol).toExponential(5) + " SOL/SIN, inkl. Impact)");
if (expectedOut.isZero())
  fail("erwartete Ausgabe = 0 — Pool-Liquiditaet fuer diesen Betrag unguenuegend (oder Abfragefehler).");

// ---------- Transaction-Bau (dry-run signiert lokal, sendet NICHTS) ----------

const tx = new Transaction()
  .add(ComputeBudgetProgram.setComputeUnitLimit({ units: CU_LIMIT }));
if (!wsolAtaExists)
  tx.add(spl.createAssociatedTokenAccountInstruction(PROVIDER, wsolAta, PROVIDER, WSOL_MINT));
// Wrap-Sequenz (gleicher bewaehrter Pattern wie im Launch TX2):
// SOL in die WSOL-ATA transfern + SyncNative, damit der Token-Balance
// (amount-Feld) den Lamports-Bestand abbildet. OHNE SyncNative: "InsufficientFunds".
tx.add(SystemProgram.transfer({ fromPubkey: PROVIDER, toPubkey: wsolAta, lamports: amountInLamports }));
tx.add(spl.createSyncNativeInstruction(wsolAta));
// SIN-ATA auto-Anlage (nur falls fehlt, z. B. nach Vollausstieg):
if (!sinAtaExists)
  tx.add(spl.createAssociatedTokenAccountInstruction(PROVIDER, sinAta, PROVIDER, SIN_MINT));

// Swap-Instruction via SDK-High-Level (baut Keys + Data + ExBitmap korrekt):
const swapRes = ClmmInstrument.makeSwapBaseInInstructions({
  poolInfo: {
    id: POOL_ID.toString(),
    programId: CLMM_PROGRAM.toString(),
    mintA: { address: WSOL_MINT.toBase58(), programId: spl.TOKEN_PROGRAM_ID.toBase58(), decimals: 9 },
    mintB: { address: SIN_MINT.toBase58(), programId: spl.TOKEN_PROGRAM_ID.toBase58(), decimals: 5 },
    config: { id: AMM_CONFIG.toString(), tickSpacing: poolInfo.tickSpacing },
  },
  poolKeys: {
    vault: { A: VAULT_A_W_SOL.toBase58(), B: VAULT_B_SIN.toBase58() },
    // lookupTableAccount: NICHT gesetzt → TickArrays laufen inline ueber
    // remainingAccounts — Legacy-Tx reicht, solange init. TickArrays ≤ 43.
  },
  observationId: OBSERVATION,
  ownerInfo: { wallet: PROVIDER, tokenAccountA: wsolAta, tokenAccountB: sinAta },
  inputMint: WSOL_MINT,
  amountIn: amountIn,
  amountOutMin: minOut,
  sqrtPriceLimitX64: new BN(0),
  remainingAccounts: tickArrays.map((ta) => ta.pda),
});
tx.add(swapRes.instructions[0]);
tx.feePayer = PROVIDER;

console.log("\nGebaut: " + tx.instructions.length + " Instruktionen:");
console.log("  [" + (wsolAtaExists ? "" : "ATA-Create (WSOL) + ") + "wrap(" +
  (amountInLamports / LAMPORTS_PER_SOL).toFixed(6) + " SOL) + syncNative + swapV2] | Signer: Provider | CU-Limit " + CU_LIMIT);

// ---------- RPC-Simulation (read-only, sendet NICHTS) ----------

console.log("\nRPC-Simulation (lokal signiert, NICHTS wird gesendet):");
let cuUsed = 0;
if (providerKp) {
  if (!tx.recentBlockhash)
    tx.recentBlockhash = (await c.getLatestBlockhash()).blockhash;
  tx.sign(providerKp);
  const simResult = await c.simulateTransaction(tx, [providerKp]);
  if (simResult.value.err) {
    const logs = simResult.value.logs ?? [];
    console.error("Simulation-ERROR:", JSON.stringify(simResult.value.err));
    console.error("Details:", logs.slice(-20).join("\n") || "(keine Logs)");
    fail("RPC-Simulation fehlgeschlagen — kein Senden.");
  }
  cuUsed = simResult.value.unitsConsumed ?? 0;
  console.log("Simulation: OK, CU-Gebrauch =", cuUsed, "(Limit " + CU_LIMIT + ")");
  if (cuUsed > CU_LIMIT)
    fail("CU-Gebrauch (" + cuUsed + ") ueberschreitet CU-Limit (" + CU_LIMIT + ") — Limit erhohen und erneut simulieren.");
} else {
  console.log("Simulation uebersprungen (recipient.json nicht lesbar) — Lokal-Quote oben gilt.");
}

// ---------- Senden (nur im SEND-Modus) ----------

if (sendMode) {
  console.log("\nSEND-MODUS: Transaktion wird gesendet…");
  // Pre-Flight erneut: Saldo + ATA-Zustand (kurz vor der Sendung, Race-Minimierung):
  const freeNow = await c.getBalance(PROVIDER);
  if (freeNow < amountInLamports + 2_000)
    fail("Pre-Flight: Provider-Saldo (" + (freeNow / LAMPORTS_PER_SOL).toFixed(6) +
      " SOL) reicht NICHT mehr fuer " + (amountInLamports / LAMPORTS_PER_SOL).toFixed(6) + " SOL + Fee.");
  const sinAtaBefore = sinAtaExists ? await spl.getAccount(c, sinAta) : null;
  const sig = await sendTx(c, tx, [providerKp!]);
  console.log("Signature    :", sig);
  // Ergebnis-Verifikation (SIN-ATA nach Bestaetigung):
  const sinAtaAfter = await spl.getAccount(c, sinAta);
  // spl-Token: account.amount ist ein STRING (uiTokenAccount-Convention),
  // kein BN — Delta per String->BN umrechnen.
  const delta = new BN(sinAtaAfter.amount).sub(sinAtaBefore ? new BN(sinAtaBefore.amount) : new BN(0));
  console.log("SIN-ATA vor/nach:", (sinAtaBefore ? sinAtaBefore.amount : "0"),
    "→", sinAtaAfter.amount, "(Delta " + delta.toString() + " raw = " +
    delta.divn(100_000).toString() + " SIN)");
  // Journal + Details (wiederholbar: kein One-Shot-Guard wie beim Burn):
  const details = {
    pool: POOL_ID.toBase58(),
    inputSol: amountInLamports / LAMPORTS_PER_SOL,
    amountInLamports: amountIn.toString(),
    expectedOutSinRaw: expectedOut.toString(),
    minOutSinRaw: minOut.toString(),
    slippageBps: SLIPPAGE_BPS,
    tickArrays: tickArrays.map((ta) => ta.pda.toBase58()),
    cuUsed: cuUsed,
  };
  journal("clmm.swapWSOLToSIN", { signature: sig, network: "MAINNET-LAUNCH", details });
  console.log("Journal-Eintrag 'clmm.swapWSOLToSIN' geschrieben.");
  const swapDetails = {
    zeit: new Date().toISOString(),
    signature: sig,
    ...details,
    sinAtaBefore: sinAtaBefore ? sinAtaBefore.amount.toString() : "0",
    sinAtaAfter: sinAtaAfter.amount.toString(),
    provider: PROVIDER.toBase58(),
  };
  const fn = "SWAP-DETAILS-" + Date.now() + ".txt";
  Deno.writeTextFileSync(new URL("../result/" + fn, import.meta.url).pathname, JSON.stringify(swapDetails, null, 2) + "\n");
  console.log("result/" + fn + " geschrieben.");
  console.log("\n=== SOL→SIN-KAUF ERFOLGREICH AUSGEFUEHRT ===");
  console.log("Einkauf:", (amountInLamports / LAMPORTS_PER_SOL).toFixed(6), "SOL → erhaelt ca.",
    expectedOut.divn(100_000).toString(), "SIN (min. " + minOut.divn(100_000).toString() + " SIN).");
  console.log("SIN bleibt in der Provider-ATA (" + sinAta.toBase58() + ").");
} else {
  console.log("\n=== DRY-RUN: Simulation erfolgreich, NICHTS gesendet ===");
  console.log("Zum Kauf: SIN_NETWORK=mainnet SIN_BUY_SOL=<sol> SIN_DEX_SEND=1 SIN_MAINNET_OK=1 ausfuehren.");
}
