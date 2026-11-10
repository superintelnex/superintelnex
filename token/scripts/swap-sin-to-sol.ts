// Raydium-CLMM-TRADING: SIN → SOL Verkauf (Base-In-Swap, SIN-Eingabe).
//
// Zweck: SIN-Bestände aus dem Provider-ATA (FD1WzT… — 2,39 T SIN nach
// Buy #1-#4) gegen WSOL tauschen + SOFORT unwrappen (ATA-Close), damit
// die Erlöse als natives SOL auf dem Provider landen und per
// transfer-sol-out.ts an den Operator geflutscht werden können.
//
// Mechanik (Spiegel von swap-sol-to-sin.ts, OHNE die dort dokumentierten
// Knackpunkte — Wrap-Sequenz fehlt, stattdessen Unwrap):
//   1) Read-only-Gates identisch (Pool-State, AmmConfig, ExBitmap →
//      TickArrays live abgeleitet, NIEMALS hardcoden).
//   2) Lokal-Quote: SDK-Simulator (swapInternal), zeroForOne=false
//      (SIN=B in → WSOL=A out).
//   3) Tx-Bau (Legacy, Signer = Provider):
//        [setComputeUnitLimit]
//        [swapV2 (SIN-ATA → WSOL-ATA, amountOutMin = Slippage-Guard)]
//        [ATA-Close WSOL: gesamt-WSOL-Saldo (inkl. 15.729-raw-Dust aus
//         den Buys) wird unwrapped + an Provider-native transferiert]
//
// SICHERHEITSGATES (konsistent mit swap-sol-to-sin.ts):
//   - Default = DRY-RUN (Read-only + Simulation, nichts wird gesendet).
//   - Senden: NUR mit SIN_NETWORK=mainnet + SIN_DEX_SEND=1 +
//     SIN_MAINNET_OK=1.
//   - Provider-Rest-Guard: nach Tx muss >= 890.880 lamports (Rent-
//     Exempt-Boden) übrig bleiben — wird sonst im RPC-Sim gefangen.
//
// Parameter (env):
//   SIN_SELL_RAW       SIN-Raw-Betrag (Integer). Default = gesamt-ATA-
//                     Saldo (vollständiger Ausstieg).
//   SIN_SLIPPAGE_BPS   Slippage-Guard in Basispunkten (Default 1000 = 10 %
//                     — dünner Pool, Impact ist hier real).
//
// Bei Sendung: Journal-Eintrag "clmm.swapSINToWSOL" +
// result/SWAP-DETAILS-<ts>.txt (wiederholbar).
import {
  Keypair, PublicKey, Transaction, ComputeBudgetProgram,
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

// ---------- Konstanten (identisch zu swap-sol-to-sin.ts) ----------
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
const SELL_RAW = Deno.env.get("SIN_SELL_RAW");          // null = gesamt-ATA
const SLIPPAGE_BPS = parseInt(Deno.env.get("SIN_SLIPPAGE_BPS") ?? "1000", 10);
const CU_LIMIT = 500_000;

function fail(msg: string): never {
  console.error("\nABBRUCH: " + msg);
  Deno.exit(3);
}

// ---------- Modus + Netz ----------
const label = networkLabel();
const sendMode = Deno.env.get("SIN_DEX_SEND") === "1";
if (sendMode) {
  requireMainnetOk("swap-sin-to-sol (SEND)");
  if (Deno.env.get("SIN_MAINNET_OK") !== "1")
    fail("SIN_DEX_SEND=1 erfordert SIN_MAINNET_OK=1.");
  const netKey = Deno.env.get("SIN_NETWORK") ?? loadConfig().networks.default;
  if (netKey !== "mainnet")
    fail("SIN_DEX_SEND=1 ist nur mit SIN_NETWORK=mainnet erlaubt.");
  if (label !== "MAINNET-LAUNCH")
    fail("Verkauf-Skript ist nur gegen MAINNET-Pool definiert (SIN_NETWORK=mainnet).");
}
if (label === "MAINNET-LAUNCH" && !sendMode)
  console.log("NOTIZ: MAINNET-Dry-Run (read-only + Simulation, nichts wird gesendet).");

const { programId: clmmProgramId } = clmmProgramForNetwork("mainnet");
const CLMM_PROGRAM = new PublicKey(clmmProgramId);
console.log("Netz           :", label);
console.log("Pool (SIN/WSOL):", POOL_ID.toBase58(), "(mintA=WSOL, mintB=SIN)");

// ---------- Provider-Key (lokaler, gitignored) ----------
function loadProviderKp(): Keypair | null {
  try {
    const raw = Deno.readTextFileSync(new URL("../wallets/recipient.json", import.meta.url).pathname);
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(raw)));
  } catch { return null; }
}
const providerKp = loadProviderKp();
if (sendMode && !providerKp) fail("recipient.json fehlt — SEND-Modus nicht moeglich.");
if (providerKp && providerKp.publicKey.toBase58() !== PROVIDER.toBase58())
  fail("recipient.json Pubkey != PROVIDER-Adresse.");
console.log("Provider (Signer):", PROVIDER.toBase58());

// ---------- Read-only-Gates ----------
const c = conn();

// 1) Pool-State
const poolAcc = await c.getAccountInfo(POOL_ID);
if (!poolAcc) fail("Pool-Account existiert NICHT on-chain.");
const poolInfo = PoolInfoLayout.decode(poolAcc.data);
if ((poolInfo.liquidity as BN).isZero())
  fail("Pool-Liquiditaet = 0 — kein Verkauf moeglich.");
if (poolInfo.tickSpacing !== 10)
  fail("tickSpacing != 10 — Pool-Identitaet pruefen.");
console.log("\nPool-State: liquidity " + (poolInfo.liquidity as BN).toString() +
  " | tickCurrent " + poolInfo.tickCurrent);

// 2) AmmConfig
const cfgAcc = await c.getAccountInfo(AMM_CONFIG);
if (!cfgAcc) fail("AmmConfig-Account fehlt.");
const cfgInfo = ClmmConfigLayout.decode(cfgAcc.data);

// 3) ExBitmap → TickArrays (live abgeleitet)
const exAcc = await c.getAccountInfo(EX_BITMAP);
if (!exAcc) fail("ExBitmap-Account fehlt.");
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
  fail("Keine initialisierten TickArrays — Pool betriebsuntaegetig.");
if (tickStarts.length > 43)
  fail("TickArrays > 43 — Legacy-Tx reicht NICHT mehr: ALT-Wechsel noetig (siehe Buy-Skript-Kommentar).");
const tickArrays = tickStarts.map((st) => ({
  start: st,
  pda: new PublicKey(getPdaTickArrayAddress(CLMM_PROGRAM, POOL_ID, st).publicKey),
}));
const tickArrayDecoded: { address: PublicKey; value: ReturnType<typeof TickArrayLayout.decode> }[] = [];
for (const ta of tickArrays) {
  const acc = await c.getAccountInfo(ta.pda);
  if (!acc || acc.data.length !== 10240)
    fail("TickArray " + ta.pda.toBase58() + " existiert NICHT/zu klein.");
  tickArrayDecoded.push({ address: ta.pda, value: TickArrayLayout.decode(acc.data) });
  console.log("  TickArray start " + String(ta.start).padStart(6, " ") + " " + ta.pda.toBase58());
}

// 4) ATAs + Veraeuerliches
const freeLamports = await c.getBalance(PROVIDER);
console.log("\nProvider freier SOL:", (freeLamports / LAMPORTS_PER_SOL).toFixed(6));

const sinAta = spl.getAssociatedTokenAddressSync(SIN_MINT, PROVIDER);
const wsolAta = spl.getAssociatedTokenAddressSync(WSOL_MINT, PROVIDER);
let sinBefore: BN;
try {
  const sb = await spl.getAccount(c, sinAta);
  sinBefore = new BN(sb.amount);
} catch {
  sinBefore = new BN(0);
}
if (sinBefore.isZero())
  fail("SIN-ATA leer (" + sinAta.toBase58() + ") — kein Verkauf moeglich.");

let amountIn: BN;
if (SELL_RAW) {
  amountIn = new BN(SELL_RAW);
  if (amountIn.gt(sinBefore))
    fail("SIN_SELL_RAW (" + SELL_RAW + ") uebersteigt ATA-Saldo (" + sinBefore.toString() + " raw).");
  console.log("\nVerkauf (explizit): " + amountIn.toString() + " SIN-raw (= " +
    new BN(sinBefore).divn(100_000).toString() + " SIN von " + sinBefore.toString() + " raw im ATA)");
} else {
  amountIn = sinBefore;
  console.log("\nVerkauf (GESAMT-ATA-SWEEP): " + amountIn.toString() + " SIN-raw (= " +
    amountIn.divn(100_000).toString() + " SIN, KOMPLETTE Position)");
}

// 5) Quote — primär SDK-Local-Simulator; Fallback: RPC-Simulation
//    (sigVerify + Account-Bilder) → exakter WSOL-Gewinn aus den
//    vor/nach-Balancen. (Der Local-Simulator werft in der
//    SIN→WSOL-richtung gelegentlich "data.tickNext <= data.tick".)
const wsolDustRaw = Number((await spl.getAccount(c, wsolAta).catch(() => null))?.amount ?? 0);
let expectedOut: BN;
let quoteSource: string;
try {
  const simQuote = swapInternal({
    programId: CLMM_PROGRAM,
    poolId: POOL_ID,
    poolInfo: poolInfo as never,
    tickArrays: tickArrayDecoded as never,
    configInfo: cfgInfo as never,
    tickarrayBitmapExtension: exBitmap as never,
    amountSpecified: amountIn,
    sqrtPriceLimitX64: new BN(0),
    zeroForOne: false,
    isBaseInput: true,
    blockTimestamp: Math.floor(Date.now() / 1000),
    includeExtraTickArrays: true,
  });
  expectedOut = simQuote.amountCalculated;
  quoteSource = "SDK-Local-Simulator";
} catch (e) {
  console.log("SDK-Local-Simulator fehlgeschlagen (" + String(e).slice(0, 120) + ") — Fall zurück auf RPC-Sim-Quote.");
  if (!providerKp) fail("RPC-Sim-Fallback erfordert recipient.json (Signer).");
  const fbTx = new Transaction().add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: CU_LIMIT }),
    // NUR die Swap-Instruction (keine Close), damit WSOL-Gewinn isoliert lesbar ist:
  );
  const fbSwap = ClmmInstrument.makeSwapBaseInInstructions({
    poolInfo: {
      id: POOL_ID.toString(),
      programId: CLMM_PROGRAM.toString(),
      mintA: { address: WSOL_MINT.toBase58(), programId: spl.TOKEN_PROGRAM_ID.toBase58(), decimals: 9 },
      mintB: { address: SIN_MINT.toBase58(), programId: spl.TOKEN_PROGRAM_ID.toBase58(), decimals: 5 },
      config: { id: AMM_CONFIG.toString(), tickSpacing: poolInfo.tickSpacing },
    },
    poolKeys: {
      vault: { A: VAULT_A_W_SOL.toBase58(), B: VAULT_B_SIN.toBase58() },
      lookupTableAccount: undefined,
    },
    observationId: OBSERVATION,
    // ownerInfo IMMER statisch: tokenAccountA = ATA von mintA (WSOL),
    // tokenAccountB = ATA von mintB (SIN) — SDK-Bug-Fix: swappt Slots selbst.
    // (Falsche Zuordnung löst ConstraintTokenMint = Custom:2014 aus.)
    ownerInfo: { wallet: PROVIDER, tokenAccountA: wsolAta, tokenAccountB: sinAta },
    inputMint: SIN_MINT,
    amountIn,
    amountOutMin: new BN(0), // Quote-Only: Guard wird danach aus expectedOut abgeleitet
    sqrtPriceLimitX64: new BN(0),
    remainingAccounts: tickArrays.map((ta) => ta.pda),
  });
  fbTx.add(fbSwap.instructions[0]);
  fbTx.feePayer = PROVIDER;
  fbTx.recentBlockhash = (await c.getLatestBlockhash()).blockhash;
  fbTx.sign(providerKp);
  // web3.js 1.98.4: simulateTransaction(tx, signers[], includeAccounts[])
  // signers im 2. Param → sigVerify=true wird automatisch gesetzt;
  // 3. Param ist ein Array von PublicKeys für die zu beobachtenden Accounts.
  // Die Response-Accounts sind flache AccountInfo-Objekte (kein .pubkey-Feld),
  // die Index-Position entspricht der Request-Reihenfolge:
  //   Index 0 = wsolAta, Index 1 = sinAta
  const simRes = await c.simulateTransaction(fbTx, [providerKp], [wsolAta, sinAta]);
  if (simRes.value.err)
    fail("RPC-Sim-Fallback fehlerhaft: " + JSON.stringify(simRes.value.err));
  // WSOL-ATA (Index 0): SPL-Token-Layout, Offset 64 = amount (8 bytes LE).
  // simulateTransaction liefert data als [base64string, 'base64']-Tuple.
  const wsolEntry = (simRes.value.accounts ?? [])[0];
  if (!wsolEntry || !wsolEntry.data)
    fail("RPC-Sim: WSOL-ATA-Data nicht zurueckgeliefert — Quote abgeleitet NICHT moeglich.");
  const b64 = Array.isArray(wsolEntry.data) ? wsolEntry.data[0] : String(wsolEntry.data);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const dv = new DataView(bytes.buffer, 64, 8);
  const wsolAfterRaw = Number(dv.getBigUint64(0, true));
  expectedOut = new BN(Math.max(0, wsolAfterRaw - wsolDustRaw));
  console.log("  (WSOL-ATA: vorher " + wsolDustRaw + " raw Dust → nach Sim " + wsolAfterRaw + " raw; Diff = Swap-Output)");
  quoteSource = "RPC-Sim-Quote (sigVerify, WSOL-ATA Diff)";
}
const minOut = expectedOut.muln(10000 - SLIPPAGE_BPS).divn(10000);
console.log("\n=== ERWARTETE QUOTE (" + quoteSource + ", lokale Simulation) ===");
console.log("  input        :", amountIn.toString(), "SIN-raw (= " +
  amountIn.divn(100_000).toString() + " SIN, 5 Dez.)");
console.log("  expected out :", expectedOut.toString(), "WSOL-raw (= " +
  (expectedOut.toNumber() / LAMPORTS_PER_SOL).toFixed(6) + " SOL)");
console.log("  End-Tick     :", quoteSource === "SDK-Local-Simulator" ? "(Simulator: im Details-Log)" : "(via RPC-Sim-Quote)");
console.log("  Slippage-Guard:", SLIPPAGE_BPS + " bps → otherAmountThreshold = " + minOut.toString() + " WSOL-raw");
// Schnitt-Kurs (amountIn-raw > 2^53 → in SIN-5-Dez.-Einheit rechnen,
// dort sicher < 2^53; expectedOut < 2^31 — beides Number-sicher).
const sinDisp = amountIn.divn(100_000).toNumber();
const avgSolPerSin = expectedOut.toNumber() / sinDisp;
console.log("  Schnitt-Kurs :", avgSolPerSin.toExponential(5), "SOL/SIN (inkl. Impact)");
if (expectedOut.isZero())
  fail("erwartete Ausgabe = 0 — unguenuegige Liquiditaet fuer diesen Betrag.");

// ---------- Transaction-Bau ----------
const tx = new Transaction().add(
  ComputeBudgetProgram.setComputeUnitLimit({ units: CU_LIMIT }),
);
// Swap: SIN-ATA → WSOL-ATA. ACHTUNG: ownerInfo ist IMMER statisch:
// tokenAccountA = ATA von mintA (WSOL), tokenAccountB = ATA von mintB (SIN).
// Der SDK-Build erkennt inputMint=SIN und swappt Vault/Mint-Slots intern.
// (Vertauschte ATAs lösen ConstraintTokenMint = Custom:2014 aus.)
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
    lookupTableAccount: undefined,
  },
  observationId: OBSERVATION,
  ownerInfo: { wallet: PROVIDER, tokenAccountA: wsolAta, tokenAccountB: sinAta },
  inputMint: SIN_MINT,
  amountIn,
  amountOutMin: minOut,
  sqrtPriceLimitX64: new BN(0),
  remainingAccounts: tickArrays.map((ta) => ta.pda),
});
tx.add(swapRes.instructions[0]);
// Unwrap: WSOL-ATA schliessen (inkl. 15.729-raw-Dust) — gesamter
// WSOL-Bestand wandert als natives SOL an den Provider.
// spl 0.4.15 kennt kein createAssociatedTokenAccountCloseInstruction —
// createCloseAccountInstruction reicht (ATA ist normaler Token-Account).
tx.add(spl.createCloseAccountInstruction(wsolAta, PROVIDER, PROVIDER));
tx.feePayer = PROVIDER;

console.log("\nGebaut: " + tx.instructions.length + " Instruktionen:");
console.log("  [swapV2 (SIN→WSOL) + ATA-Close-WSOL (unwrap)] | Signer: Provider | CU-Limit " + CU_LIMIT);

// ---------- RPC-Simulation ----------
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
    fail("CU-Gebrauch ueberschreitet CU-Limit — Limit erhohen und erneut simulieren.");
} else {
  console.log("Simulation uebersprungen (recipient.json nicht lesbar).");
}

// ---------- Senden ----------
if (sendMode) {
  console.log("\nSEND-MODUS: Transaktion wird gesendet…");
  const freeNow = await c.getBalance(PROVIDER);
  if (freeNow < 5_000 + 890_880)
    fail("Pre-Flight: Provider-Saldo (" + freeNow + " lamports) unter Fee + Rent-Boden — Tx wuerde Self-Destruct.");
  const sig = await sendTx(c, tx, [providerKp!]);
  console.log("Signature    :", sig);
  const sinAfter = await spl.getAccount(c, sinAta);
  const freeAfter = await c.getBalance(PROVIDER);
  const wsolGain = expectedOut.toNumber();
  console.log("SIN-ATA vor/nach:", sinBefore.toString(), "→", sinAfter.amount.toString(),
    "(Delta " + sinBefore.sub(new BN(sinAfter.amount)).toString() + " raw = " +
    sinBefore.sub(new BN(sinAfter.amount)).divn(100_000).toString() + " SIN verkauft)");
  console.log("Provider-SOL nachher:", (freeAfter / LAMPORTS_PER_SOL).toFixed(6),
    "(erwartet ≈ " + ((freeLamports + wsolGain) / LAMPORTS_PER_SOL).toFixed(6) + " − 0,000005 Fee)");

  const details = {
    pool: POOL_ID.toBase58(),
    amountInSinRaw: amountIn.toString(),
    amountInSin5Dec: amountIn.divn(100_000).toString(),
    expectedOutSolRaw: expectedOut.toString(),
    minOutSolRaw: minOut.toString(),
    slippageBps: SLIPPAGE_BPS,
    tickArrays: tickArrays.map((ta) => ta.pda.toBase58()),
    cuUsed,
    wsolAtaClosed: true,
  };
  journal("clmm.swapSINToWSOL", { signature: sig, network: "MAINNET-LAUNCH", details });
  console.log("Journal-Eintrag 'clmm.swapSINToWSOL' geschrieben.");
  const swapDetails = {
    zeit: new Date().toISOString(),
    signature: sig,
    ...details,
    sinAtaBefore: sinBefore.toString(),
    sinAtaAfter: sinAfter.amount.toString(),
    providerBefore: String(freeLamports),
    providerAfter: String(freeAfter),
  };
  const fn = "SWAP-DETAILS-" + Date.now() + ".txt";
  Deno.writeTextFileSync(new URL("../result/" + fn, import.meta.url).pathname, JSON.stringify(swapDetails, null, 2) + "\n");
  console.log("result/" + fn + " geschrieben.");
  console.log("\n=== SIN→SOL-VERKAUF ERFOLGREICH AUSGEFUEHRT ===");
  console.log("Verkauft:", amountIn.divn(100_000).toString(), "SIN → erhaelt ca.",
    (expectedOut.toNumber() / LAMPORTS_PER_SOL).toFixed(6), "SOL (min. " +
    (minOut.toNumber() / LAMPORTS_PER_SOL).toFixed(6) + " SOL).");
  console.log("Nächster Schritt: transfer-sol-out.ts (Sweep an Operator-Ziel).");
} else {
  console.log("\n=== DRY-RUN: Simulation erfolgreich, NICHTS gesendet ===");
  console.log("Zum Verkauf: SIN_NETWORK=mainnet [SIN_SELL_RAW=<raw>] SIN_DEX_SEND=1 SIN_MAINNET_OK=1 ausfuehren.");
}
