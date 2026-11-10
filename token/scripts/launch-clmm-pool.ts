// Raydium-CLMM-Pool-Launch (SIN/WSOL) — zwei-Transaktions-Flow ueber die
// offizielle Raydium-SDK v2 (ClmmInstrument: createPool +
// openPositionFromLiquidity, V2-Path mit Metaplex-Metadaten).
//
// PROVIDER: token/wallets/recipient.json — haelt die 10-%-Liquiditaets-
//           Allokation: 0,55 SOL + 10M SIN (raw 1e18), siehe
//           result/DISTRIBUTION.txt.
//
// TX 1 (Pool):     genaug 1 ClmmCreatePool-Instruction. Das Programm
//                  erzeugt Pool/Observation/ExBitmap/Vaults intern; der
//                  Payer (Provider) zahlt die Rent.
//
// TX 2 (Position): [WSOL-ATA anlegen, wenn fehlt] +
//                  SystemProgram.wrapSol(0,5 SOL) +
//                  openPositionFromLiquidity (V2: Position-NFT-Mint + ATA +
//                  Metaplex-Metadaten + PersonalPosition + 2x TickArray +
//                  Liquiditaets-Depot). Signer: Provider +
//                  Position-NFT-Mint-Key (ephemer, frisch generiert).
//
// PDA-MINT-ORDNUNG (Programm-Zwang): token_mint_0 < token_mint_1 (Byte-
// Vergleich). WSOL (0x06..) < SIN (0x86..) => A=WSOL, B=SIN; CLMM-Preis =
// B/A. Die fruehere SIN/WSOL-Ordnung fiel an genau dieser Constraint.
//
// SICHERHEITSGATES:
//   - Default = DRY-RUN: Plan-Mengen + read-only-Checks + PDA-Cross-Checks +
//     TX1-RPC-Simulation (lokal signiert, NICHTS wird gesendet) + exakter
//     Funding-Gap. Exit 0.
//   - Senden: NUR mit SIN_NETWORK=mainnet + SIN_DEX_SEND=1 +
//     SIN_MAINNET_OK=1 + ausreichendem Provider-Saldo. Bei ungenuegendem
//     Funding: ABBRUCH — der Top-up ist ein eigner On-Chain-Vorgang durch
//     den Betreiber (Phantom), bewusst NICHT Teil dieses Skripts.
//   - Mainnet ist One-Shot: die Pool-Id-PDA ist deterministisch; existiert
//     sie bereits, ist ein zweiter create nicht mehr moeglich => ABBRUCH.
//
// Aufrufe:
//   // Dry-Run (Default):
//   SIN_NETWORK=mainnet deno run --allow-read --allow-net --allow-env \
//     token/scripts/launch-clmm-pool.ts
//   // Echter Launch (nach Betreiber-Bestaetigung + Funding):
//   SIN_NETWORK=mainnet SIN_DEX_SEND=1 SIN_MAINNET_OK=1 deno run \
//     --allow-read --allow-net --allow-env --allow-write \
//     token/scripts/launch-clmm-pool.ts
//
// Optional: SIN_POOL_RANGE (Halbreichweite in Ticks, Default 40000),
//           SIN_POOL_SLIPPAGE (Prozent, Default 1),
//           SIN_PRIORITY_FEE_MICROS (Mikrolamports/CU, Default 0).
//
// Bei Erfolg: result/POOL-ADDRESS.txt + Journal-Eintraege in
// EXECUTED-TRANSACTIONS.jsonl.
import {
  Keypair, PublicKey, Transaction, SystemProgram, ComputeBudgetProgram,
} from "npm:@solana/web3.js@1.98.4";
import BN from "npm:bn.js@5.2.1";
import Decimal from "npm:decimal.js@10.4.3";
import * as spl from "npm:@solana/spl-token@0.4.15";
import { ClmmInstrument } from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/instrument.js";
import {
  getPdaAmmConfigId,
  getPdaPoolId,
  getPdaPoolVaultId,
  getPdaExBitmapAccount,
  getPdaObservationAccount,
  getPdaTickArrayAddress,
} from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/libraries/pda.js";
import { TickUtil, TickArrayUtil, LiquidityMathUtil } from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/libraries/index.js";
import { ClmmConfigLayout } from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/layout.js";
import {
  loadConfig, conn, networkLabel, requireMainnetOk, sendTx, journal,
  metadataPda,
} from "./lib/common.ts";
import {
  clmmProgramForNetwork, computeClmmPoolAddresses, CLMM_ACCOUNT_LEN,
} from "./lib/raydium-clmm.ts";

const LAMPORTS_PER_SOL = 1_000_000_000;

function fail(msg: string): never {
  console.error("\nABBRUCH: " + msg);
  Deno.exit(3);
}

// ---------- Modus + Netz ----------

const label = networkLabel();
const sendMode = Deno.env.get("SIN_DEX_SEND") === "1";
const dryRun = !sendMode;
const netKey = Deno.env.get("SIN_NETWORK") ?? loadConfig().networks.default;

if (sendMode) {
  requireMainnetOk("launch-clmm-pool (SEND)");
  if (Deno.env.get("SIN_MAINNET_OK") !== "1")
    fail("SIN_DEX_SEND=1 erfordert SIN_MAINNET_OK=1 (bewusste Bestaetigung).");
  if (netKey !== "mainnet")
    fail("SIN_DEX_SEND=1 ist nur mit SIN_NETWORK=mainnet erlaubt (aktuell: " + netKey + ").");
}

const { programId, wsol, ammConfigIndex, initialLiquiditySol } = clmmProgramForNetwork(netKey);
const CLMM_PROGRAM = new PublicKey(programId);
const WSOL_MINT = new PublicKey(wsol);

// ---------- Eingaben (authoritative Quellen) ----------

const mintOut = JSON.parse(Deno.readTextFileSync(new URL("../result/MINT-ADDRESS.txt", import.meta.url)));
const SIN_MINT = new PublicKey(mintOut.mint);
if (sendMode && mintOut.netz !== "MAINNET-LAUNCH")
  fail("MINT-ADDRESS.txt zeigt nicht auf MAINNET-LAUNCH (" + (mintOut.netz ?? "?") + ") — kein Mainnet-Pool moeglich.");

// Liquiditaets-Menge SIN: authoritative Quelle ist DISTRIBUTION.txt (raw),
// NICHT die Config-totalSupply (die ist die UI-Supply).
const distro = JSON.parse(Deno.readTextFileSync(new URL("../result/DISTRIBUTION.txt", import.meta.url)));
const liqShare = (distro.shares ?? []).find((s: { name: string }) => s.name === "liquidity");
if (!liqShare) fail("liquidity-Eintrag fehlt in result/DISTRIBUTION.txt");
if (liqShare.mint !== SIN_MINT.toBase58() && "mint" in liqShare)
  console.log("  Hinweis: DISTRIBUTION mint-Feld != MINT-ADDRESS mint — MINT-ADDRESS ist massgeblich.");
const LIQ_SIN_RAW = BigInt(liqShare.rawAmount);

const liqSol = initialLiquiditySol;
if (!(liqSol > 0)) fail("config.dex.initialLiquiditySol muss > 0 sein (aktuell: " + liqSol + ").");
const liqLamports = Math.round(liqSol * LAMPORTS_PER_SOL);
const tickRange = Number(Deno.env.get("SIN_POOL_RANGE") ?? 40000);
const slippagePct = Number(Deno.env.get("SIN_POOL_SLIPPAGE") ?? 1);
const priorityFeeMicros = Number(Deno.env.get("SIN_PRIORITY_FEE_MICROS") ?? 0);
const TX1_CU = 700_000;
const TX2_CU = 1_000_000;

// Provider: im SEND-Modus zwingend recipient.json; im DRY-RUN wird die
// Key-Datei nur gelesen, um die TX1-Simulation lokal zu signieren
// (RPC-Simulation sendet nichts). Fehlt sie, laeuft der Dry-Run mit der
// DISTRIBUTION-Eigner-Adresse ohne Simulation.
function loadProviderKp(): Keypair | null {
  try {
    const raw = Deno.readTextFileSync(new URL("../wallets/recipient.json", import.meta.url).pathname);
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(raw)));
  } catch {
    return null;
  }
}
const providerKp = loadProviderKp();
if (providerKp && providerKp.publicKey.toBase58() !== liqShare.owner)
  fail("recipient.json Pubkey (" + providerKp.publicKey.toBase58() + ") != liquidity-Eigner in DISTRIBUTION.txt (" + liqShare.owner + ") — moeglicher Funding-Missmatch, bitte manuell pruefen.");
const PROVIDER = providerKp ? providerKp.publicKey : new PublicKey(liqShare.owner);

console.log("=== Raydium-CLMM-Pool-Launch [" + label + "] — " + (dryRun ? "DRY-RUN (sendet NICHTS)" : "SEND-MODE (SIN_DEX_SEND=1 + SIN_MAINNET_OK=1)") + " ===");
console.log("Netz                 :", netKey);
console.log("CLMM-Programm        :", CLMM_PROGRAM.toBase58());
console.log("SIN-Mint             :", SIN_MINT.toBase58(), "(5 dec)");
console.log("WSOL-Mint            :", WSOL_MINT.toBase58());
console.log("AmmConfig-Index      :", ammConfigIndex);
console.log("Provider             :", PROVIDER.toBase58());
console.log("Liquiditaet          :", liqSol, "SOL gegen", LIQ_SIN_RAW, "SIN-smallest (= " + Number(LIQ_SIN_RAW) / 1e5 + " SIN)");
console.log("Tick-Halbreichweite  :", tickRange, "Ticks; Slippage:", slippagePct + "%", "; Priority-Fee:", priorityFeeMicros, "µL/CU");

// ---------- Read-only: CLMM-Config on-chain ----------

const c = conn();
const ammConfigPda = new PublicKey(getPdaAmmConfigId(CLMM_PROGRAM, ammConfigIndex).publicKey);
const cfgAcct = await c.getAccountInfo(ammConfigPda);
if (!cfgAcct) fail("CLMM-AmmConfig nicht gefunden (" + ammConfigPda.toBase58() + ") — Programm-Id oder Index falsch?");
const cfgRaw = ClmmConfigLayout.decode(cfgAcct.data);
const tickSpacing = Number(cfgRaw.tickSpacing);
console.log("\nCLMM-Config (on-chain, Index " + ammConfigIndex + "):");
console.log("  PDA               :", ammConfigPda.toBase58());
console.log("  tradeFeeRate      :", Number(cfgRaw.tradeFeeRate), "(= " + Number(cfgRaw.tradeFeeRate) / 100 + " bps)");
console.log("  protocolFeeRate   :", Number(cfgRaw.protocolFeeRate));
console.log("  fundFeeRate       :", Number(cfgRaw.fundFeeRate));
console.log("  tickSpacing       :", tickSpacing);

// ---------- Read-only: Pool-Existenz (deterministisch — One-Shot!) ----------

// WICHTIG: Das CLMM-Programm erzwingt die Raw-Constraint
// `token_mint_0 < token_mint_1` (Byte-Vergleich der Pubkeys).
// WSOL (0x06..) < SIN (0x86..) => ZWINGEND mintA=WSOL, mintB=SIN.
// Der Simulationslauf mit SIN/WSOL fiel an genau dieser Constraint
// (AnchorError ConstraintRaw, 2003).
// PDA-Zwang: PDA(mintA, mintB) wird in exakt dieser Reihenfolge berechnet.
const poolIdPda = new PublicKey(getPdaPoolId(CLMM_PROGRAM, ammConfigPda, WSOL_MINT, SIN_MINT).publicKey);
// Runtime-Assert, dass die PDA-Inputs byte-ascendig sind (WSOL < SIN):
{
  const bytesDesc = WSOL_MINT.toBuffer().compare(SIN_MINT.toBuffer()) > 0;
  if (bytesDesc)
    fail("PDA-Input-Reihenfolge waere byte-descendig (WSOL > SIN) — Program-Constraint token_mint_0 < token_mint_1 wuerde verletzt; mint-Auswahl pruefen.");
}
const poolExists = !!(await c.getAccountInfo(poolIdPda));
console.log("\nPool-Existenz:");
console.log("  PoolId-PDA       :", poolIdPda.toBase58());
console.log("  existiert        :", poolExists ? "JA" : "NEIN");
if (poolExists && sendMode) fail("Pool-PDA existiert bereits on-chain — One-Shot verbrannt, kein zweiter create moeglich (manuell pruefen).");

// ---------- Read-only: Provider-Bestaende ----------

const providerLamports = await c.getBalance(PROVIDER);
const sinAta = spl.getAssociatedTokenAddressSync(SIN_MINT, PROVIDER);
const wsolAta = spl.getAssociatedTokenAddressSync(WSOL_MINT, PROVIDER);
const sinAtctExists = !!(await c.getAccountInfo(sinAta));
const wsolAtctExists = !!(await c.getAccountInfo(wsolAta));
const sinBal = sinAtctExists ? await c.getTokenAccountBalance(sinAta) : null;
const liveSinRaw = sinBal ? BigInt(sinBal.value.amount) : 0n;
console.log("\nProvider-Bestaende (read-only):");
console.log("  SOL-Bestand      :", (providerLamports / LAMPORTS_PER_SOL).toFixed(6), "SOL");
console.log("  SIN-ATA          :", sinAta.toBase58(), sinAtctExists ? "(raw " + liveSinRaw + ", UI " + (Number(liveSinRaw) / 1e5) + ")" : "(FEHLT)");
console.log("  WSOL-ATA         :", wsolAta.toBase58(), wsolAtctExists ? "(existiert)" : "(muss in TX2 angelegt werden)");
if (liveSinRaw !== LIQ_SIN_RAW)
  console.log("  ACHTUNG: Live-SIN-Raw (" + liveSinRaw + ") != DISTRIBUTION-Raw (" + LIQ_SIN_RAW + ") — im SEND-Modus Abbruch.");
if (sendMode) {
  if (!providerKp) fail("recipient.json fehlt — SEND-Modus nicht moeglich.");
  if (!sinAtctExists) fail("SIN-ATA fehlt, aber Provider soll SIN halten — Konsistenzproblem, manuell pruefen.");
  if (liveSinRaw !== LIQ_SIN_RAW) fail("SIN-Bestand weicht von DISTRIBUTION.txt ab (" + liveSinRaw + " vs " + LIQ_SIN_RAW + ") — manuell pruefen.");
}

// ---------- Ticks + Liquiditaet (deterministisch, offline) ----------

// Paarungspreis in CLMM-Konvention: Preis = B/A in UI-Units pro UI-Unit.
// A = WSOL (9 dec), B = SIN (5 dec):
//   P_raw = LIQ_SIN_RAW / liqLamports = 1e18 / 5e8 = 2e9 (raw-Units B/A).
// priceToSqrtPriceX64(price, 9, 5) multipliziert intern mit 10^(9-5)=1e4
// => uebergeben wird P_raw / 1e4 = 2e5 (SIN pro SOL in UI-Units).
// Ticks fallen dadurch POSITIV aus (Symmetrie zur frueheren falschen Ordnung).
const pRaw = new Decimal(LIQ_SIN_RAW.toString()).div(liqLamports); // 2e9
// SDK-Konvention (empirisch im frueheren Verifikationslauf abgestuetzt):
// priceToSqrtPriceX64/priceToTick(price, 9, 5) dividiert intern durch
// 10^(9-5)=1e4 => uebergeben wird P_raw * 1e4 = 2e13.
const priceArg = pRaw.times(10 ** (9 - 5));
const tick0 = TickUtil.priceToTick(priceArg, 9, 5);
const startTick = Math.round(tick0 / tickSpacing) * tickSpacing;
const tickLower = startTick - tickRange;
const tickUpper = startTick + tickRange;

// Negativa Ticks sind gultig — Spanne via getMinTick/getMaxTick.
const minTick = TickArrayUtil.getMinTick(tickSpacing);
const maxTick = TickArrayUtil.getMaxTick(tickSpacing);
for (const t of [tickLower, startTick, tickUpper]) {
  if (!TickUtil.isValidTick(t))
    fail("Tick " + t + " liegt ausserhalb der CLMM-Spanne ([" + minTick + ", " + maxTick + "], tickSpacing " + tickSpacing + ").");
}
if (tickLower >= tickUpper) fail("Tick-Range ungultig: lower >= upper.");
if (tickLower % tickSpacing !== 0 || tickUpper % tickSpacing !== 0)
  fail("Ticks muessen auf tickSpacing=" + tickSpacing + " liegen (lower=" + tickLower + ", upper=" + tickUpper + ").");

const sqrtPriceX64 = TickUtil.priceToSqrtPriceX64(priceArg, 9, 5); // Pool-Startpreis
const sqrtCur = TickUtil.getSqrtPriceAtTick(startTick);
const sqrtLower = TickUtil.getSqrtPriceAtTick(tickLower);
const sqrtUpper = TickUtil.getSqrtPriceAtTick(tickUpper);

// A = WSOL, B = SIN (PDA-Ordnung des Programms):
const amountA = new BN(liqLamports);            // A: WSOL-kleinste Einheiten (lamports)
const amountB = new BN(LIQ_SIN_RAW.toString()); // B: SIN-kleinste Einheiten
const liquidity = LiquidityMathUtil.getLiquidityFromAmounts(sqrtCur, sqrtLower, sqrtUpper, amountA, amountB);
if (liquidity.lte(0)) fail("Berechnete Liquiditaet = 0 — Menge/Tick-Range pruefen.");
const { amountSlippageA, amountSlippageB } = LiquidityMathUtil.getAmountsFromLiquidityWithSlippage(
  sqrtCur, sqrtLower, sqrtUpper, liquidity, true, true, slippagePct / 100,
);
// Exakte erwartete Depots (ohne Slippage), fuer die Post-Send-Verifikation:
const expectedDeposits = LiquidityMathUtil.getAmountsForLiquidity(sqrtCur, sqrtLower, sqrtUpper, liquidity, false);

const tickArrayLowerIdx = TickArrayUtil.getTickArrayStartIndex(tickLower, tickSpacing);
const tickArrayUpperIdx = TickArrayUtil.getTickArrayStartIndex(tickUpper, tickSpacing);
if (tickArrayLowerIdx === tickArrayUpperIdx) fail("Tick-Range zu schmal: beide Enden in derselben TickArray.");
const sdkTickArrayLower = new PublicKey(getPdaTickArrayAddress(CLMM_PROGRAM, poolIdPda, tickArrayLowerIdx).publicKey);
const sdkTickArrayUpper = new PublicKey(getPdaTickArrayAddress(CLMM_PROGRAM, poolIdPda, tickArrayUpperIdx).publicKey);

console.log("\nTick-/Liquiditaets-Plan:");
console.log("  P_raw (SIN/SOL)   :", pRaw.toFixed(20));
console.log("  tick0 (ungern.)   :", tick0, "→ startTick:", startTick, "(tickSpacing " + tickSpacing + ")");
console.log("  tickLower / Upper :", tickLower, "/", tickUpper);
console.log("  Gultige Spanne    :", minTick, "…", maxTick);
console.log("  initialPriceX64   :", sqrtPriceX64.toString());
console.log("  sqrtCur/Lo/Hi     :", sqrtCur.toString(), "/", sqrtLower.toString(), "/", sqrtUpper.toString());
console.log("  TickArray-Starts  :", tickArrayLowerIdx, "/", tickArrayUpperIdx);
console.log("  TickArray PDA lo  :", sdkTickArrayLower.toBase58());
console.log("  TickArray PDA hi  :", sdkTickArrayUpper.toBase58());
console.log("  liquidity (L)     :", liquidity.toString());
console.log("  amountMaxA        :", amountSlippageA.toString(), "(raw; + " + slippagePct + "%)");
console.log("  amountMaxB        :", amountSlippageB.toString(), "(raw; + " + slippagePct + "%)");

// ---------- PDA-Cross-Check: offizielle SDK vs lib/raydium-clmm.ts ----------
// 8 Paare. (Das lib-Feld protocolPosition ist bewusst NICHT dabei: dort
// veraltete Seed 'protocol_position' + i32BE — im V2-Flow ueberfluessig.)

// A = WSOL, B = SIN (PDA-Ordnung):
const sdkVaultA = new PublicKey(getPdaPoolVaultId(CLMM_PROGRAM, poolIdPda, WSOL_MINT).publicKey);
const sdkVaultB = new PublicKey(getPdaPoolVaultId(CLMM_PROGRAM, poolIdPda, SIN_MINT).publicKey);
const sdkExBitmap = new PublicKey(getPdaExBitmapAccount(CLMM_PROGRAM, poolIdPda).publicKey);
const sdkObservation = new PublicKey(getPdaObservationAccount(CLMM_PROGRAM, poolIdPda).publicKey);
// ACHTUNG 1: Die lib erwartet die TICKARRAY-START-INDIZES (wie die SDK
// intern via getTickArrayStartIndex rechnet), nicht die rohen Range-Ticks.
// ACHTUNG 2: Mint-Reihenfolge = PDA-Ordnung = WSOL,SIN (Program-Zwang).
const libPool = computeClmmPoolAddresses(programId, WSOL_MINT.toBase58(), SIN_MINT.toBase58(), ammConfigIndex, tickArrayLowerIdx, tickArrayUpperIdx);
const pdaPairs: [string, string, string][] = [
  ["AmmConfig", ammConfigPda.toBase58(), libPool.ammConfig],
  ["PoolId", poolIdPda.toBase58(), libPool.poolId],
  ["PoolVault(WSOL)", sdkVaultA.toBase58(), libPool.poolVaultA],
  ["PoolVault(SIN)", sdkVaultB.toBase58(), libPool.poolVaultB],
  ["ExBitmap", sdkExBitmap.toBase58(), libPool.exBitmap],
  ["Observation", sdkObservation.toBase58(), libPool.observation],
  ["TickArray(lower)", sdkTickArrayLower.toBase58(), libPool.tickArrayLower],
  ["TickArray(upper)", sdkTickArrayUpper.toBase58(), libPool.tickArrayUpper],
];
let pdaOk = true;
console.log("\nPDA-Cross-Check (offizielle SDK vs lib/raydium-clmm.ts):");
for (const [name, s, l] of pdaPairs) {
  const ok = s === l;
  if (!ok) pdaOk = false;
  console.log("  " + name.padEnd(18) + " :", ok ? "OK" : "MISMATCH!! SDK=" + s + " LIB=" + l);
}
if (!pdaOk) fail("PDA-Cross-Check fehlgeschlagen — kein Senden.");
console.log("  => Alle 8 PDAs byte-identisch.");

// ---------- Instruktionen (SDK) ----------

// Position-NFT-Mint-Key: ephemerer Signer (genau 1), wird in TX2 mit signiert.
const nftMintKp = Keypair.generate();
const nftMint = nftMintKp.publicKey;

// PDA-Ordnung des Programms: A = WSOL (kleiner in bytes), B = SIN.
const mintASpec = {
  chainId: 101, address: WSOL_MINT.toBase58(), programId: spl.TOKEN_PROGRAM_ID.toBase58(),
  logoURI: "", symbol: "SOL", name: "Solana (Wrapped)", decimals: 9,
  tags: [] as string[], extensions: {} as Record<string, unknown>,
};
const mintBSpec = {
  chainId: 101, address: SIN_MINT.toBase58(), programId: spl.TOKEN_PROGRAM_ID.toBase58(),
  logoURI: "", symbol: "SIN", name: "SuperIntelNex", decimals: 5,
  tags: [] as string[], extensions: {} as Record<string, unknown>,
};

// TX1: createPool (SYNC, liefert genaug 1 Instruktion — die Create-Accounts
// laufen intern im Programm).
const createRes = ClmmInstrument.createPoolInstructions({
  connection: c,
  programId: CLMM_PROGRAM,
  owner: PROVIDER,
  mintA: mintASpec,
  mintB: mintBSpec,
  ammConfigId: ammConfigPda,
  initialPriceX64: sqrtPriceX64,
} as unknown as Parameters<typeof ClmmInstrument.createPoolInstructions>[0]);
if (createRes.instructions.length !== 1)
  fail("Erwartet genaug 1 createPool-Instruction, SDK liefert " + createRes.instructions.length + ".");
if (!createRes.address.poolId.equals(poolIdPda))
  fail("SDK-PoolId (" + createRes.address.poolId.toBase58() + ") != vorher berechnete PDA (" + poolIdPda.toBase58() + ") — nicht senden.");

// TX2: openPositionFromLiquidity (ASYNC; V2-Path da nft2022 nicht gesetzt,
// ephemerer Signer = Position-NFT-Mint).
const posRes = await ClmmInstrument.openPositionFromLiquidityInstructions({
  poolInfo: {
    id: poolIdPda.toBase58(),
    programId: CLMM_PROGRAM.toBase58(),
    mintA: { address: WSOL_MINT.toBase58(), programId: spl.TOKEN_PROGRAM_ID.toBase58(), decimals: 9 },
    mintB: { address: SIN_MINT.toBase58(), programId: spl.TOKEN_PROGRAM_ID.toBase58(), decimals: 5 },
    config: { id: ammConfigPda.toBase58(), tickSpacing },
  },
  poolKeys: {
    programId: CLMM_PROGRAM.toBase58(),
    id: poolIdPda.toBase58(),
    mintA: mintASpec,
    mintB: mintBSpec,
    openTime: "0",
    vault: { A: sdkVaultA.toBase58(), B: sdkVaultB.toBase58() },
    config: {
      id: ammConfigPda.toBase58(),
      index: ammConfigIndex,
      protocolFeeRate: Number(cfgRaw.protocolFeeRate),
      tradeFeeRate: Number(cfgRaw.tradeFeeRate),
      tickSpacing,
      fundFeeRate: Number(cfgRaw.fundFeeRate),
      description: "",
      defaultRange: 0,
      defaultRangePoint: [] as number[],
    },
    rewardInfos: [] as Array<{ mint: unknown; vault: string }>,
    observationId: sdkObservation.toBase58(),
    exBitmapAccount: sdkExBitmap.toBase58(),
  },
  ownerInfo: { wallet: PROVIDER, tokenAccountA: wsolAta, tokenAccountB: sinAta }, // A=WSOL, B=SIN
  tickLower,
  tickUpper,
  liquidity,
  amountMaxA: amountSlippageA,
  amountMaxB: amountSlippageB,
  base: null,
  withMetadata: "create",
  getEphemeralSigners: async (k: number) => {
    if (k !== 1) throw new Error("SDK erwartet " + k + " ephemere Signer, geplant sind 1 (Position-NFT-Mint).");
    return [nftMint];
  },
} as unknown as Parameters<typeof ClmmInstrument.openPositionFromLiquidityInstructions>[0]);
if (posRes.instructions.length !== 1)
  fail("Erwartet genaug 1 openPosition-Instruction, SDK liefert " + posRes.instructions.length + ".");

// Position-PDAs: SDK-Ergebnis gegen eigenstaendige Rechnung pruefen
// (web3-PDA + spl-ATA + Metaplex-PDA, unabhaengig von der SDK-pda.js).
function pdaOf(seeds: Buffer[], program: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(seeds, program)[0];
}
const i32LE = (n: number): Buffer => {
  const b = Buffer.alloc(4);
  b.writeInt32LE(n, 0);
  return b;
};
const indepNftAta = spl.getAssociatedTokenAddressSync(nftMint, PROVIDER);
const indepMeta = metadataPda(nftMint);
const indepPersonal = pdaOf([Buffer.from("position"), nftMint.toBuffer()], CLMM_PROGRAM);
const indepProtocol = pdaOf(
  [Buffer.from("position"), poolIdPda.toBuffer(), i32LE(tickLower), i32LE(tickUpper)],
  CLMM_PROGRAM,
);
const posPairs: [string, PublicKey, PublicKey][] = [
  ["nftMint", posRes.address.nftMint, nftMint],
  ["positionNftAccount", posRes.address.positionNftAccount, indepNftAta],
  ["metadataAccount", posRes.address.metadataAccount, indepMeta],
  ["personalPosition", posRes.address.personalPosition, indepPersonal],
  ["protocolPosition", posRes.address.protocolPosition, indepProtocol],
  ["tickArrayLower", posRes.address.tickArrayLower, sdkTickArrayLower],
  ["tickArrayUpper", posRes.address.tickArrayUpper, sdkTickArrayUpper],
];
let posPdaOk = true;
console.log("\nPosition-PDA-Cross-Check (SDK-Instruction vs eigenstaendige Rechnung):");
for (const [name, s, l] of posPairs) {
  const ok = s.toBase58() === l.toBase58();
  if (!ok) posPdaOk = false;
  console.log("  " + name.padEnd(18) + " :", ok ? "OK  (" + l.toBase58() + ")" : "MISMATCH!! SDK=" + s.toBase58() + " RECHNUNG=" + l.toBase58());
}
if (!posPdaOk) fail("Position-PDA-Cross-Check fehlgeschlagen — kein Senden.");
console.log("  => Alle 7 Position-PDAs identisch.");

// ---------- Funding-Plan (Rent via on-chain getMinimumBalanceForDataSize) ----------
// Worst-Case-Inventory: TX1 creates Pool/Observation/ExBitmap/Vaults
// (max. 2 Default-TickArrays obendrauf); TX2 creates 2 Range-TickArrays +
// Position-NFT-Quartett + WSOL-ATA. Ueberzahlte Accounts bleiben einfach
// im Rest-Saldo — nichts wird verbrannt.
const RENT_TABLE: [string, number, number][] = [
  ["Pool (TX1)", CLMM_ACCOUNT_LEN.pool, 1],
  ["Observation (TX1)", CLMM_ACCOUNT_LEN.observation, 1],
  ["ExBitmap (TX1)", CLMM_ACCOUNT_LEN.exBitmap, 1],
  ["PoolVault-ATAs (TX1)", 166, 2],
  ["TickArrays (worst: default+position)", CLMM_ACCOUNT_LEN.tickArray, 4],
  ["Position-NFT-Mint (TX2)", 82, 1],
  ["Position-NFT-ATA (TX2)", 166, 1],
  ["Metaplex-Metadaten (TX2)", 451, 1],
  ["PersonalPosition (TX2)", CLMM_ACCOUNT_LEN.personalPosition, 1],
  ["ProtocolPosition (TX2, konservativ)", CLMM_ACCOUNT_LEN.protocolPosition, 1],
  ["WSOL-ATA Provider (TX2, falls neu)", 166, 1],
];
let rentLamports = 0;
console.log("\nRent-Plan (on-chain getMinimumBalanceForDataSize):");
for (const [name, bytes, count] of RENT_TABLE) {
  const minBal = await c.getMinimumBalanceForRentExemption(bytes);
  rentLamports += minBal * count;
  console.log("  " + name.padEnd(36) + ":", minBal, "lamports x" + count, "= " + (minBal * count / LAMPORTS_PER_SOL).toFixed(6), "SOL");
}
const prioLamports = priorityFeeMicros > 0
  ? Math.ceil((priorityFeeMicros * (TX1_CU + TX2_CU)) / 1_000_000)
  : 0;
const feesLamports = 2 * 5_000;
const bufferLamports = 100_000;
const requiredLamports = liqLamports + rentLamports + prioLamports + feesLamports + bufferLamports;
const gapLamports = requiredLamports - providerLamports;
console.log("  Liquiditaet (wrap)     :", (liqLamports / LAMPORTS_PER_SOL).toFixed(6), "SOL");
console.log("  Priority-Fees          :", (prioLamports / LAMPORTS_PER_SOL).toFixed(6), "SOL");
console.log("  Basis-Gebuehren + Puffer:", ((feesLamports + bufferLamports) / LAMPORTS_PER_SOL).toFixed(6), "SOL");
console.log("  NOETIG gesamt          :", (requiredLamports / LAMPORTS_PER_SOL).toFixed(6), "SOL");
console.log("  VORHANDEN              :", (providerLamports / LAMPORTS_PER_SOL).toFixed(6), "SOL");
if (gapLamports > 0)
  console.log("  FEHLT (Top-up-Bezug)   :", (gapLamports / LAMPORTS_PER_SOL).toFixed(6), "SOL");
else
  console.log("  Funding genuegt — kein Top-up noetig.");

// ---------- Transaktionen bauen ----------

function buildTx1(): Transaction {
  const tx = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: TX1_CU }));
  if (priorityFeeMicros > 0)
    tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFeeMicros }));
  tx.add(createRes.instructions[0]);
  tx.feePayer = PROVIDER;
  return tx;
}

function buildTx2(): Transaction {
  const tx = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: TX2_CU }));
  if (priorityFeeMicros > 0)
    tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFeeMicros }));
  if (!wsolAtctExists)
    tx.add(spl.createAssociatedTokenAccountInstruction(PROVIDER, wsolAta, PROVIDER, WSOL_MINT));
  tx.add(SystemProgram.wrapSol({ fromPubkey: PROVIDER, toPubkey: wsolAta, lamports: liqLamports }));
  tx.add(posRes.instructions[0]);
  tx.feePayer = PROVIDER;
  return tx;
}

console.log("\nGebaut:");
console.log("  TX1 (createPool)      : 1 ClmmCreatePool + ComputeBudget | Signer: Provider (Payer) | CU-Limit " + TX1_CU);
console.log("  TX2 (openPosition)    : [" + (wsolAtctExists ? "" : "ATA-Create + ") + "wrapSol(0," + liqSol + ") + 1 openPositionV2] | Signer: Provider + NFT-Mint | CU-Limit " + TX2_CU);

// ---------- DRY-RUN: TX1-Simulation (lokal signiert, wird NICHT gesendet) ----------

async function simulateSigned(tx: Transaction, signers: Keypair[]) {
  if (!tx.recentBlockhash) tx.recentBlockhash = (await c.getLatestBlockhash()).blockhash;
  tx.sign(...signers);
  return c.simulateTransaction(tx);
}

if (dryRun) {
  if (providerKp) {
    console.log("\nTX1-Simulation (RPC, nichts wird gesendet):");
    const sim = await simulateSigned(buildTx1(), [providerKp]);
    if (sim.value.err) {
      // Programme-Logs ausgeben — der letzte Log (…/error) enthaelt die Custom-Error-Meldung.
      if (sim.value.logs && sim.value.logs.length)
        console.log("  Program-Logs:\n    " + sim.value.logs.join("\n    "));
      fail("TX1-Simulation fehlgeschlagen: " + JSON.stringify(sim.value.err));
    }
    console.log("  OK — CU verbraucht:", String(sim.value.unitsConsumed ?? "?"), "(Limit " + TX1_CU + ")");
  } else {
    console.log("\nTX1-Simulation uebersprungen (recipient.json nicht lesbar im Dry-Run).");
  }
  console.log("\n=== DRY-RUN ZUSAMMENFASSUNG ===");
  console.log("  Pool-Id            :", poolIdPda.toBase58());
  console.log("  Ticks              :", tickLower, "…", tickUpper, "(start", startTick + ")");
  console.log("  Depot (erwartet)   :", expectedDeposits.amountA.toString(), "WSOL-raw (A) +", expectedDeposits.amountB.toString(), "SIN-raw (B)");
  console.log("  Funding            :", gapLamports > 0
    ? "FEHLT " + (gapLamports / LAMPORTS_PER_SOL).toFixed(6) + " SOL (Top-up noetig: " + PROVIDER.toBase58() + ")"
    : "genuegt — Senden wuerde jetzt durchlaufen koennen.");
  if (gapLamports > 0) {
    console.log("\nNAECHSTER SCHRITT (Betreiber-Entscheidung):");
    console.log("  1) Top-up von " + (gapLamports / LAMPORTS_PER_SOL).toFixed(4) + " SOL an den Provider senden:");
    console.log("       " + PROVIDER.toBase58());
    console.log("  2) Danach den echten Launch starten:");
    console.log("     SIN_NETWORK=mainnet SIN_DEX_SEND=1 SIN_MAINNET_OK=1 deno run --allow-read --allow-net --allow-env --allow-write token/scripts/launch-clmm-pool.ts");
  }
  console.log("\nDONE — DRY-RUN abgeschlossen, nichts wurde gesendet.");
  Deno.exit(0);
}

// ---------- SEND-PATH (Mainnet, One-Shot) ----------

if (gapLamports > 0)
  fail(
    "Funding unzureichend: noetig " + (requiredLamports / LAMPORTS_PER_SOL).toFixed(6) + " SOL, vorhanden " +
    (providerLamports / LAMPORTS_PER_SOL).toFixed(6) + " SOL → fehlt " + (gapLamports / LAMPORTS_PER_SOL).toFixed(6) +
    " SOL. Erst Top-up an " + PROVIDER.toBase58() + ", dann neu aufrufen " +
    "(SIN_NETWORK=mainnet SIN_DEX_SEND=1 SIN_MAINNET_OK=1).",
  );

console.log("\nSIMULATION TX1:");
const sim1 = await simulateSigned(buildTx1(), [providerKp as Keypair]);
if (sim1.value.err) fail("TX1-Simulation fehlgeschlagen: " + JSON.stringify(sim1.value.err));
console.log("  OK — CU:", String(sim1.value.unitsConsumed ?? "?"));

console.log("\nSENDEN TX1 (createPool) …");
const sig1 = await sendTx(c, buildTx1(), [providerKp as Keypair]);
console.log("  TX1 Signature :", sig1.slice(0, 16) + "…  (https://explorer.solana.com/tx/" + sig1 + ")");
journal("clmm.createPool", {
  signature: sig1,
  network: label,
  details: { poolId: poolIdPda.toBase58(), tickLower, tickUpper, startTick, tickSpacing },
});

// Read-only-Verifikation vor TX2 (Pool + Vaults muessen jetzt existieren).
const poolAfter = await c.getAccountInfo(poolIdPda);
if (!poolAfter) fail("TX1 bestaetigt, aber Pool-PDA fehlt on-chain — manuell pruefen, KEIN auto-further (TX2 wuerde ebenfalls scheitern).");
console.log("  Pool on-chain  :", poolIdPda.toBase58(), "(data " + poolAfter.data.length + " bytes)");

console.log("SIMULATION TX2:");
const sim2 = await simulateSigned(buildTx2(), [providerKp as Keypair, nftMintKp]);
if (sim2.value.err)
  fail("TX2-Simulation fehlgeschlagen (Pool ist jetzt live, nur die Position fehlt — rebarbeitbar via Raydium-UI/SDK, Pool-PDA bleibt erhalten): " + JSON.stringify(sim2.value.err));
console.log("  OK — CU:", String(sim2.value.unitsConsumed ?? "?"));

console.log("\nSENDEN TX2 (openPosition + wrapSol + ATA) …");
const sig2 = await sendTx(c, buildTx2(), [providerKp as Keypair, nftMintKp]);
console.log("  TX2 Signature :", sig2.slice(0, 16) + "…  (https://explorer.solana.com/tx/" + sig2 + ")");
journal("clmm.openPosition", {
  signature: sig2,
  network: label,
  details: {
    poolId: poolIdPda.toBase58(),
    nftMint: nftMint.toBase58(),
    tickLower, tickUpper,
    liquidity: liquidity.toString(),
  },
});

// Read-only-Verifikation: Vaults sind bestueckt.
const vA2 = await c.getTokenAccountBalance(new PublicKey(sdkVaultA.toBase58()));
const vB2 = await c.getTokenAccountBalance(new PublicKey(sdkVaultB.toBase58()));
// A = WSOL, B = SIN (PDA-Ordnung des Programms):
console.log("  Vault-WSOL (A)   :", vA2.value.uiAmountString, "SOL (erwartet raw " + expectedDeposits.amountA.toString() + ")");
console.log("  Vault-SIN (B)    :", vB2.value.uiAmountString, "SIN (erwartet raw " + expectedDeposits.amountB.toString() + ")");
if (vA2.value.amount === "0" || vB2.value.amount === "0")
  fail("Vault-Bestaende unvollstaendig — manuell pruefen (Explorer), nichts weiter auto.");
if (vA2.value.amount !== expectedDeposits.amountA.toString() || vB2.value.amount !== expectedDeposits.amountB.toString())
  console.log("  Hinweis: Vault-raw weicht vom Erwartungswert ab (Slippage/Pricing) — praetikal gultig, pruefen.");

// ---------- Protokoll ----------

const out = {
  netz: "MAINNET-LAUNCH",
  step: "Raydium-CLMM-Pool (SIN/WSOL)",
  created: new Date().toISOString(),
  pool: {
    poolId: poolIdPda.toBase58(),
    ammConfig: ammConfigPda.toBase58(),
    vaultWSOL: sdkVaultA.toBase58(), // A
    vaultSIN: sdkVaultB.toBase58(), // B
    exBitmap: sdkExBitmap.toBase58(),
    observation: sdkObservation.toBase58(),
    tickArrayLower: sdkTickArrayLower.toBase58(),
    tickArrayUpper: sdkTickArrayUpper.toBase58(),
    tickLower,
    tickUpper,
    startTick,
    tickSpacing,
    initialPriceX64: sqrtPriceX64.toString(),
    liquidity: liquidity.toString(),
    depositWSOLraw: expectedDeposits.amountA.toString(), // A
    depositSINraw: expectedDeposits.amountB.toString(), // B
  },
  position: {
    nftMint: nftMint.toBase58(),
    positionNftAccount: posRes.address.positionNftAccount.toBase58(),
    metadataAccount: posRes.address.metadataAccount.toBase58(),
    personalPosition: posRes.address.personalPosition.toBase58(),
    protocolPosition: posRes.address.protocolPosition.toBase58(),
  },
  provider: PROVIDER.toBase58(),
  tx1CreatePool: sig1,
  tx2OpenPosition: sig2,
  links: {
    explorerPool: "https://explorer.solana.com/address/" + poolIdPda.toBase58(),
    raydiumPool: "https://app.raydium.io/pools/" + poolIdPda.toBase58(),
    explorerTx1: "https://explorer.solana.com/tx/" + sig1,
    explorerTx2: "https://explorer.solana.com/tx/" + sig2,
  },
};
Deno.writeTextFileSync(new URL("../result/POOL-ADDRESS.txt", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log("\nPOOL LIVE — Protokoll nach result/POOL-ADDRESS.txt geschrieben.");
console.log("  Raydium-Pool-Seite:  https://app.raydium.io/pools/" + poolIdPda.toBase58());
console.log("  Naechster Schritt (nach Bestaetigung): revoke-authorities.ts (EINWEG).");
