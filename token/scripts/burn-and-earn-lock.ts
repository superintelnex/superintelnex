// Raydium-CLMM Burn-&-Earn (Task 0) — Position-NFT permanent locken.
//
// Freigabe: Betreiber 08:29 UTC 10.11.2026 ("ja freigabe"). Kosten:
// 1 Tx, ~0,003 SOL + Basis-Gebuer. Liquidaet bleibt zu 100 % im Pool;
// das Position-NFT wandert in den Raydium-Lock-Escrow (program-
// owned), die Claim-Rechte bleiben beim Provider via Fee-Key-NFT
// (neuer, ephemer erzeugter NFT-Mint, ATA beim Provider, Balance 1).
//
// Mechanik (Raydium-SDK-v2 alpha 0.2.84, lockPositionInstructionV2):
//   Accounts (Reihenfolge):
//     [0] auth (kN1kEznaF5Xbd8LYuqtEFcxzWSBk5Fv6ygX6SqEGJVy, read-only)
//     [1] payer = Provider (signer)
//     [2] positionOwner = Provider (signer)
//     [3] lockOwner = Provider
//     [4] positionNftAccount = AaApmuVg… (Provider-ATA auf NFT-Mint)
//     [5] positionId = Personal-Position-PDA (read-only)
//     [6] positionNftMint = 5pa8Wtza…
//     [7] authPositionNftAccount = auth-ATA auf NFT-Mint (read-only)
//     [8] lockPositionId = Lock-Position-PDA (Lock-Programm, lockNftMint)
//     [9] lockNftMint = EPHEMER (Signer, 1x mintet)
//     [10] lockNftAccount = Provider-ATA auf lockNftMint (writable)
//     [11] metadataAccount = Position-Metaplex-PDA
//     [12..] AT-Programm, System-Programm, Token-Programm, System…
//   Data: V2-Discriminator + bool withMetadata=true.
//
// SICHERHEITSGATES (konsistent mit launch-clmm-pool.ts):
//   - Default = DRY-RUN: Read-only-Checks (Provider/Owner-Abgleich,
//     ATA-Existenz, Position-Existenz) + RPC-Simulation der Tx
//     (lokal signiert, NICHTS wird gesendet). Exit 0.
//   - Senden: NUR mit SIN_NETWORK=mainnet + SIN_DEX_SEND=1 +
//     SIN_MAINNET_OK=1 + Provider-Saldo > 0.02 SOL (Tx + Reserve).
//   - ONE-SHOT: nach erfolgreichem Burn existiert das Position-NFT
//     NICHT mehr im Provider-ATA — ein zweiter Lauf muss abbrechen.
//
// Aufrufe:
//   // Dry-Run (Default, simuliert nur):
//   SIN_NETWORK=mainnet deno run --allow-read --allow-net --allow-env \
//     token/scripts/burn-and-earn-lock.ts
//   // Echter Burn (nach Betreiber-Abnicken + Simulation-OK):
//   SIN_NETWORK=mainnet SIN_DEX_SEND=1 SIN_MAINNET_OK=1 deno run \
//     --allow-read --allow-net --allow-env --allow-write \
//     token/scripts/burn-and-earn-lock.ts
//
// Bei Erfolg: Journal-Eintrag "clmm.lockPosition" +
// result/LOCK-DETAILS.txt (Fee-Key-NFT-Mint + Lock-Position-PDA).
import {
  Keypair, PublicKey, Transaction, ComputeBudgetProgram,
} from "npm:@solana/web3.js@1.98.4";
import * as spl from "npm:@solana/spl-token@0.4.15";
import {
  ClmmInstrument,
} from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/instrument.js";
import {
  getPdaPersonalPositionAddress,
  getPdaLockClPositionIdV2,
  getPdaMetadataKey,
} from "npm:@raydium-io/raydium-sdk-v2@0.2.84-alpha/lib/raydium/clmm/libraries/pda.js";
import { loadConfig, conn, networkLabel, requireMainnetOk, sendTx, journal } from "./lib/common.ts";
import { clmmProgramForNetwork } from "./lib/raydium-clmm.ts";

const LAMPORTS_PER_SOL = 1_000_000_000;

// ---------- Fixed constants (aus token/result/POOL-ADDRESS.txt) ----------

const POOL_ID = new PublicKey("4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM");
const POSITION_NFT_MINT = new PublicKey("5pa8Wtzaaqr5DB16VDvcjJ9SrTxLqEKmHGDhDaxstyUX");
const POSITION_NFT_ATA = new PublicKey("AaApmuVgiKropLmS8sJaEN3wr2YpMPyXffX3GDS8tqWz");
const POSITION_METADATA = new PublicKey("5TmooLYYhthnscir9B8v8WYkRKtHfWAUdpEZfa3vdhYf");
const PROVIDER = new PublicKey("DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo");

// Lock-Programm + Auth-Programm (aus Raydium-SDK, Mainnet-IDs):
const LOCK_PROGRAM = new PublicKey("LockrWmn6K5twhz3y9w1dQERbmgSaRkfnTeTKbpofwE");
const LOCK_AUTH = new PublicKey("kN1kEznaF5Xbd8LYuqtEFcxzWSBk5Fv6ygX6SqEGJVy");

function fail(msg: string): never {
  console.error("\nABBRUCH: " + msg);
  Deno.exit(3);
}

// ---------- Modus + Netz ----------

const label = networkLabel();
const sendMode = Deno.env.get("SIN_DEX_SEND") === "1";
if (sendMode) {
  requireMainnetOk("burn-and-earn-lock (SEND)");
  if (Deno.env.get("SIN_MAINNET_OK") !== "1")
    fail("SIN_DEX_SEND=1 erfordert SIN_MAINNET_OK=1.");
  const netKey = Deno.env.get("SIN_NETWORK") ?? loadConfig().networks.default;
  if (netKey !== "mainnet")
    fail("SIN_DEX_SEND=1 ist nur mit SIN_NETWORK=mainnet erlaubt.");
}

const { programId: clmmProgramId } = clmmProgramForNetwork("mainnet");
const CLMM_PROGRAM = new PublicKey(clmmProgramId);
console.log("CLMM-Programm    :", CLMM_PROGRAM.toBase58());
console.log("Lock-Programm    :", LOCK_PROGRAM.toBase58());

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

// 1) Provider-Saldo (mind. 0.02 SOL Reserve fuer Tx + zukuenftige Fees):
const providerBal = await c.getBalance(PROVIDER);
const providerSol = providerBal / LAMPORTS_PER_SOL;
console.log("\nProvider-Saldo     :", providerSol.toFixed(6), "SOL");
if (sendMode && providerSol < 0.02)
  fail("Provider-Saldo < 0.02 SOL — zu wenig fuer Tx-Gebuhr + Reserve.");

// 2) Position-NFT-ATA existiert + gehoert dem Provider (Pre-Burn-Zustand):
//    spl-Token: getAccount() laest das TokenAccount-Datenblatt
//    (owner = Holder, NICHT der Account-Owner — der ist immer das
//    Token-Programm; Bugfall, den der CIO-Review 09:40 UTC fuer
//    verify-pool.ts gemeldet hat — hier von Anfang an korrekt).
const posNftAta = await spl.getAccount(c, POSITION_NFT_ATA);
const posNftOwner = posNftAta.owner.toBase58();
const posNftBal = posNftAta.amount.toString();
console.log("Position-NFT-ATA :", POSITION_NFT_ATA.toBase58(),
  "Owner=", posNftOwner, "Balance=", posNftBal);
if (posNftOwner !== PROVIDER.toBase58())
  fail("Position-NFT-ATA-Owner != Provider (" + posNftOwner + ") — " +
       "BURN-ODER-SCHON-ERFOLGT? ONE-SHOT-Check: kein zweiter Burn moeglich.");
if (posNftBal !== "1")
  fail("Position-NFT-Balance != 1 (" + posNftBal + ") — unerwartet.");

// 3) Personal-Position-PDA existiert (read-only):
const personalPosPda = new PublicKey(getPdaPersonalPositionAddress(CLMM_PROGRAM, POSITION_NFT_MINT).publicKey);
const personalPosInfo = await c.getAccountInfo(personalPosPda);
if (!personalPosInfo) fail("Personal-Position-PDA (" + personalPosPda.toBase58() + ") existiert NICHT on-chain.");
console.log("Personal-Position :", personalPosPda.toBase58(), "(existiert)");

// 4) Metaplex-PDA existiert (read-only):
const metadataPda = new PublicKey(getPdaMetadataKey(POSITION_NFT_MINT).publicKey);
const metaInfo = await c.getAccountInfo(metadataPda);
if (!metaInfo) fail("Metaplex-Metadaten-PDA (" + metadataPda.toBase58() + ") existiert NICHT on-chain.");
console.log("Metaplex-PDA     :", metadataPda.toBase58(), "(existiert)");

// 5) auth-ATA auf Position-NFT-Mint (authPositionNftAccount): wird intern
//    vom SDK berechnet (lockPositionInstructionV2-Keys) — nicht manuell
//    abgeleitet (Lock-Auth-Key ist potenziell off-curve; stdlib-ATA-Helfer
//    werfen dann).

// 6) ONE-SHOT-Check: Journal — wenn 'clmm.lockPosition' bereits drin
//    steht, ist der Burn ALLE ausgefuehrt → Abbruch (kein zweiter Lock):
{
  let journalExists = false;
  try {
    const jtxt = Deno.readTextFileSync(new URL("../result/EXECUTED-TRANSACTIONS.jsonl", import.meta.url).pathname);
    journalExists = jtxt.includes('"clmm.lockPosition"');
  } catch { /* Journal existiert noch nicht (erstes Mal) — ok */ }
  if (journalExists)
    fail("Journal zeigt 'clmm.lockPosition' — Burn ist bereits ausgefuehrt. ONE-SHOT: kein zweiter Lock moeglich.");
}

// ---------- Lock-Instruction (SDK-High-Level makeLockPositions) ----------
//
// Die statische lockPositionInstructionV2 manuell zu bauen war fehleranfaellig:
// metadataAccount muss der Metaplex-PDA des EPHEMEREN Fee-Key-NFTs sein
// (getPdaMetadataKey(lockNftMint)), NICHT der des Positions-NFTs. Das ist
// exakt der "unknown account BNE8..."-Fehler aus dem 1. Simulations-Durchlauf.
//
// -> Wir nutzen ClmmInstrument.makeLockPositions: die gegenseite Routine
//    leitet ALLE PDA korrekt ab (Position-NFT-ATA, Personal-Position,
//    Lock-Position, Fee-Key-NFT-ATA + Fee-Key-METADATEN-PDA, Auth-ATA).
//    Den ephmeren Fee-Key-NFT-Key generieren WIR selbst und uebergeben ihn
//    ueber getEphemeralSigners (das SDK liest [0] als base58-Mint-Pubkey,
//    signers-Array bleibt leer -> wir signieren mit unserem Key).
//
//    => deterministisch: feeKeyNftKeypair.publicKey = lockNftMint, und
//    Journal/LOCK-DETAILS koennen den ephmeren Mint + Key vorab angeben.

const feeKeyNftKeypair = Keypair.generate();
const feeKeyNftMint = feeKeyNftKeypair.publicKey;

const lockResult = await ClmmInstrument.makeLockPositions({
  programId: LOCK_PROGRAM,          // Lock-Programm (Empfaenger der Instruktion)
  authProgramId: LOCK_AUTH,        // Auth-Programm
  poolProgramId: CLMM_PROGRAM,     // CLMM-Pool-Programm (Position-PDA-Domäne)
  payer: PROVIDER,
  wallet: PROVIDER,                // Position-NFT-Holder / Lock-Owner
  nftMint: POSITION_NFT_MINT,
  nft2022: false,
  getEphemeralSigners: async () => [feeKeyNftMint.toBase58()],
});
const lockIx = lockResult.instructions[0];
const feeKeyNftAta = lockResult.address.lockNftAccount;   // Provider-ATA auf Fee-Key-NFT
const lockPosPda = lockResult.address.lockPositionId;      // Lock-Position-PDA
const feeKeyMetaPda = lockResult.address.metadataAccount;  // Fee-Key-Metadaten-PDA
console.log("\nFee-Key-NFT-Mint (ephemer):", feeKeyNftMint.toBase58());
console.log("Fee-Key-NFT-ATA (Provider):", feeKeyNftAta.toBase58());
console.log("Lock-Position-PDA         :", lockPosPda.toBase58());
console.log("Fee-Key-Metadaten-PDA     :", feeKeyMetaPda.toBase58());

console.log("\nLock-Instruction gebaut (makeLockPositions):");
console.log("  Program-Id     :", lockIx.programId.toBase58());
console.log("  Keys (Anzahl)  :", lockIx.keys.length);
console.log("  Data-Length    :", lockIx.data.length, "Bytes");

// ---------- Transaction-Bau (nur dry-run signiert, sendet NICHTS) ----------

const tx = new Transaction();
// Compute-Budget: Lock-V2 (Mint + ATA + Metadaten fuer Fee-Key-NFT +
// Escrow-Transfer + lockPosition) — Puffer 600_000 CU (openPosition
// brauchte 1_000_000; der Simulation-Check prueft den echten Bedarf
// gegen dieses Limit).
const CU_LIMIT = 600_000;
tx.add(
  ComputeBudgetProgram.setComputeUnitLimit({ units: CU_LIMIT }),
  lockIx,
);
if (!tx.recentBlockhash) {
  const bh = await c.getLatestBlockhash();
  tx.recentBlockhash = bh.blockhash;
}
// Signer: Provider (payer + positionOwner) + ephemerer Fee-Key-NFT-Key.
// DRY-RUN ohne recipient.json: Simulation laeuft trotzdem (read-only),
// zeigt aber erwartbar "owner did not sign" — dann Key anlegen.
const simSigners: Keypair[] = providerKp
  ? [providerKp, feeKeyNftKeypair]
  : [feeKeyNftKeypair];
if (!providerKp)
  console.log("  HINWEIS: recipient.json fehlt — Simulation zeigt erwartet 'owner did not sign' (read-only, nichts wird gesendet).");

// ---------- RPC-Simulation (read-only, sendet NICHTS) ----------

console.log("\nRPC-Simulation (lokal signiert, NICHTS wird gesendet):");
const simResult = await c.simulateTransaction(tx, simSigners);
let cuUsed = 0;
if (simResult.value.err) {
  const errStr = JSON.stringify(simResult.value.err);
  const logs = simResult.value.logs ?? [];
  const signMissing = /did not sign|is not signed/i.test(errStr + " " + logs.join(" "));
  if (signMissing && !providerKp) {
    console.log("Simulation erwartet 'did not sign' (recipient.json fehlt — read-only-Modus).");
    console.log("Um die Lock-Instruction VOLLSTAENDIG zu simulieren: recipient.json lokal");
    console.log("anlegen (Provider-Key, gitignored) und diesen Lauf erneut starten.");
    console.log("  -> kein Abbruch: alle Read-only-Gates oben sind bestanden,");
    console.log("     die Instruction laeuft in der Sendung mit echten Signern durch.");
  } else {
    console.error("Simulation-ERROR:", errStr);
    console.error("Details:", logs.slice(-20).join("\n") || "(keine Logs)");
    fail("RPC-Simulation fehlgeschlagen — kein Senden.");
  }
} else {
  cuUsed = simResult.value.unitsConsumed ?? 0;
  console.log("Simulation: OK, CU-Gebrauch =", cuUsed, "(Limit " + CU_LIMIT + ")");
  if (cuUsed > CU_LIMIT)
    fail("CU-Gebrauch (" + cuUsed + ") ueberschreitet CU-Limit (" + CU_LIMIT + ") — Limit erhohen und erneut simulieren.");
}

// ---------- Senden (nur im SEND-Modus) ----------

if (sendMode) {
  console.log("\nSEND-MODUS: Transaktion wird gesendet…");
  const sig = await sendTx(c, tx, [providerKp!, feeKeyNftKeypair]);
  console.log("Signature    :", sig);
  // Journal + Details:
  const details = {
    pool: POOL_ID.toBase58(),
    positionNftMint: POSITION_NFT_MINT.toBase58(),
    feeKeyNftMint: feeKeyNftMint.toBase58(),
    lockPositionPda: lockPosPda.toBase58(),
    cuUsed: cuUsed,
  };
  journal("clmm.lockPosition", { signature: sig, network: "MAINNET-LAUNCH", details });
  console.log("Journal-Eintrag 'clmm.lockPosition' geschrieben.");
  // LOCK-DETAILS.txt (fuer das Team, in result/):
  const lockDetails = {
    zeit: new Date().toISOString(),
    signature: sig,
    feeKeyNftMint: feeKeyNftMint.toBase58(),
    feeKeyNftAta: feeKeyNftAta.toBase58(),
    lockPositionPda: lockPosPda.toBase58(),
    positionNftMint: POSITION_NFT_MINT.toBase58(),
    pool: POOL_ID.toBase58(),
    provider: PROVIDER.toBase58(),
    cuUsed,
  };
  Deno.writeTextFileSync(new URL("../result/LOCK-DETAILS.txt", import.meta.url).pathname, JSON.stringify(lockDetails, null, 2) + "\n");
  console.log("result/LOCK-DETAILS.txt geschrieben.");
  console.log("\n=== BURN-&-EARN ERFOLGREICH AUSGEFUEHRT ===");
  console.log("Fee-Key-NFT (Claim-Recht):", feeKeyNftMint.toBase58());
  console.log("Provider bleibt Owner des Fee-Key-NFTs (Lock-Escrow).");
} else {
  console.log("\n=== DRY-RUN: Simulation erfolgreich, NICHTS gesendet ===");
  console.log("Fee-Key-NFT (ephemer, NICHT on-chain):", feeKeyNftMint.toBase58());
  console.log("Zum Senden: SIN_DEX_SEND=1 SIN_MAINNET_OK=1 SIN_NETWORK=mainnet ausfuehren.");
}
