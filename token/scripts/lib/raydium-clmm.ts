// Raydium-CLMM-PDA- und Kostenberechnung (reine Logik, OHNE RPC — offline
// testbar, sendet nichts, laedt keine Keys).
//
// QUELLEN der Seeds + Account-Groessen (alle 1:1 aus der offiziellen
// Raydium-Program-Quelle raydium-io/raydium-clmm, branch master):
//   - PDA-Seeds: tests/utils/pda.ts (AmmConfig/Pool/Vault/ExBitmap/
//     Observation/Operation/TickArray/ProtocolPosition) + das Programm
//     selbst (TickArray: programs/amm/src/states/tick_array.rs
//     verwendet to_be_bytes() fuer den Start-Tick; Position:
//     personal_position.rs seeds = ["position", nft_mint, bump]).
//   - Account-Laengen (LEN): programs/amm/src/states/{pool,config,oracle,
//     tick_array,tickarray_bitmap_extension,personal_position,reward,
//     pool_fee}.rs
//   - Account-Plan des Launch: programs/amm/src/instructions/{create_pool,
//     open_position}.rs (createPool + openPositionFromLiquidity).
//
// Programm-Ids (config.token.json, on-chain ueberpruefbar):
//   CLMM   Mainnet CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
//          Devnet  devi51mZmdwUJGU9hjN27vEz64Gps7uUefqxg27EAtH
//   AmmV4  Mainnet 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8
//          Devnet  HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8
//
// Wichtig: Dies berechnet NUR Adressen + Groessen. Es sendet keine
// Transaktion, laedt keinen Secret-Key, ruft keinen RPC auf. Der echte
// Pool-Launch laeuft ueber Raydiums verifizierten Flow (raydium.io UI
// oder SDK) — ein hand-kompilierter CLMM-Launch ist bewusst NICHT
// implementiert (wuerde bei unvollstaendiger Account-Liste SOL
// verbrennen). Ziel hier: dem Betreiber den exakten Account-Plan +
// PDA-Adressen + grobe Kosten-Schaetzung vor dem Launch zeigen.
import { PublicKey } from "npm:@solana/web3.js@1.98.4";
import { loadConfig } from "./common.ts";

// ---------- PDA-Seed-Bausteine ----------

// u16 -> 2 Bytes BIG-endian (entspricht tests/utils/pda.ts: index_bytes,
// hi-byte zuerst; fuer Raydiums Config-Indexe 0/1/2).
function u16BE(n: number): Buffer {
  const b = Buffer.alloc(2);
  b.writeUInt16BE(n & 0xffff, 0);
  return b;
}

// i32 -> 4 Bytes BIG-endian (tick-Indizes; das Programm selbst leitet
// die TickArray-Key mit to_be_bytes() ab: tick_array.rs).
function i32BE(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeInt32BE(n, 0);
  return b;
}

// ---------- Account-Laengen (bytes, exakt aus der Program-Quelle) ----------
// Diese Laengen + Rent-Formel liefern die grobe Kosten-Schaetzung.
export const CLMM_ACCOUNT_LEN = {
  // PoolState: 8+1+32*7+1+1+2+16+16+4+2+2+16*4+8
  //            +RewardInfo(169)*3 +8*16 +8*8 +DynamicFeeInfo(80) +8*14 +8*32
  pool: 1544,
  // ObservationState: 8+1+8+2+32 + Observation(44)*100 + 8*4 = 4483
  observation: 8 + 1 + 8 + 2 + 32 + 44 * 100 + 8 * 4, // 4483
  // TickArrayState: 8+32+4 + TickState(168)*60 + 1 + 115 = 10240
  tickArray: 8 + 32 + 4 + 168 * 60 + 1 + 115, // 10240
  // TickArrayBitmapExtension: 8+32 + 64*14*2 = 1832
  exBitmap: 8 + 32 + 64 * 14 * 2, // 1832
  // AmmConfig: 8+1+2+32+4+4+2+4+4+32+8*3 = 117 (EXISTIERT BEI RAYDIUM,
  // wird im normalen Flow NICHT neu angelegt — nur bei eigener Config).
  ammConfig: 8 + 1 + 2 + 32 + 4 + 4 + 2 + 4 + 4 + 32 + 8 * 3, // 117
  // ProtocolPosition: 57 Bytes (aus der Program-Test-Init-Referenz;
  // Account ist deprecated, bei neuem openPosition-Flow moeglicherweise
  // nicht mehr noetig — hier konservativ mitgezaehlt).
  protocolPosition: 57,
  // PersonalPosition: 8+1+32+32+4+4+16*3+8+8 + PositionRewardInfo(24)*3 + 64
  personalPosition: 8 + 1 + 32 + 32 + 4 + 4 + 16 * 3 + 8 + 8 + 24 * 3 + 64, // 281
};

// SPL-Token-ATA (Pool-Vaults + NFT-ATA): 166 Bytes Daten.
const ATA_LEN = 166;
// SPL-Mint (Position-NFT-Mint): 82 Bytes Daten.
const MINT_LEN = 82;
// Metaplex-Metadaten (Position-NFT): ~343-451 Bytes je nae Content-Laenge;
// hier konservativ 451.
const METADATA_LEN = 451;

// ---------- PDA-Berechnung ----------

export interface ClmmPoolAddresses {
  programId: string;
  ammConfig: string;
  poolId: string;
  poolVaultA: string;
  poolVaultB: string;
  exBitmap: string;
  observation: string;
  tickArrayLower: string;
  tickArrayUpper: string;
  protocolPosition: string;
  personalPosition: string;
}

/**
 * Leitet alle PDA-Adressen eines CLMM-Pools (base + quote) ab.
 *
 * @param programId       Raydium-CLMM-Programm (Mainnet oder Devnet).
 * @param baseMint        Basis-Mint (der neue Token, z. B. SIN).
 * @param quoteMint       Quote-Mint (WSOL).
 * @param ammConfigIndex  AmmConfig-Index (0/1/2). Default 0.
 * @param tickLower       Untere Tick-Index (i32) des gewaehlten Ranges.
 * @param tickUpper       Obere Tick-Index (i32).
 *
 * Hinweis: Die TickArray-PDAs hängen vom gewaehlten Range ab (Default
 * 0/0 = Platzhalter; bei echtem Launch sind das die Range-Enden, z. B.
 * tickLower=-2400, tickUpper=2400 bei ~±200 % um den Kurs). Die
 * Personal-Position-PDA wird im echten Flow an den erzeugten
 * Position-NFT-Mint gekoppelt — hier wird der Platzhalter
 * ["position", pool_id] angezeigt.
 */
export function computeClmmPoolAddresses(
  programId: string,
  baseMint: string,
  quoteMint: string,
  ammConfigIndex = 0,
  tickLower = 0,
  tickUpper = 0,
): ClmmPoolAddresses {
  const prog = new PublicKey(programId);
  const a = new PublicKey(baseMint);
  const b = new PublicKey(quoteMint);
  const pda = (seeds: Buffer[]): PublicKey =>
    PublicKey.findProgramAddressSync(seeds, prog)[0];

  const ammConfig = pda([Buffer.from("amm_config"), u16BE(ammConfigIndex)]);
  const poolId = pda([
    Buffer.from("pool"), ammConfig.toBuffer(), a.toBuffer(), b.toBuffer(),
  ]);
  const poolVaultA = pda([
    Buffer.from("pool_vault"), poolId.toBuffer(), a.toBuffer(),
  ]);
  const poolVaultB = pda([
    Buffer.from("pool_vault"), poolId.toBuffer(), b.toBuffer(),
  ]);
  const exBitmap = pda([
    Buffer.from("pool_tick_array_bitmap_extension"), poolId.toBuffer(),
  ]);
  const observation = pda([Buffer.from("observation"), poolId.toBuffer()]);
  const tickArrayLower = pda([
    Buffer.from("tick_array"), poolId.toBuffer(), i32BE(tickLower),
  ]);
  const tickArrayUpper = pda([
    Buffer.from("tick_array"), poolId.toBuffer(), i32BE(tickUpper),
  ]);
  const protocolPosition = pda([
    Buffer.from("protocol_position"), poolId.toBuffer(),
    i32BE(tickLower), i32BE(tickUpper),
  ]);
  // Personal-Position: PRAEFE-Placeholder ["position", pool_id]; die
  // echte Position im newen Flow ist an den NFT-Mint gekoppelt.
  const personalPosition = pda([Buffer.from("position"), poolId.toBuffer()]);

  return {
    programId,
    ammConfig: ammConfig.toBase58(),
    poolId: poolId.toBase58(),
    poolVaultA: poolVaultA.toBase58(),
    poolVaultB: poolVaultB.toBase58(),
    exBitmap: exBitmap.toBase58(),
    observation: observation.toBase58(),
    tickArrayLower: tickArrayLower.toBase58(),
    tickArrayUpper: tickArrayUpper.toBase58(),
    protocolPosition: protocolPosition.toBase58(),
    personalPosition: personalPosition.toBase58(),
  };
}

// ---------- Kosten-Schaetzung (Rent + Fees + Liquiditaet) ----------

const LAMPORTS_PER_SOL = 1_000_000_000;

// Rent-Formel (Solana, exakt):
//   lamports = (dataLen + 128) * rentLamportsPerByte
// rentLamportsPerByte ~ 1.027 auf Mainnet (0.00111 SOL leerer Account).
// Token-Datenaccounts haelt im System-Konto den ATA-Zeiger — fuer die
// grobe Untergrenze reicht die Standardformel.
const RENT_LAMPORTS_PER_BYTE = 1.027;

function rentLamportsFor(dataLen: number): number {
  return Math.ceil((dataLen + 128) * RENT_LAMPORTS_PER_BYTE);
}

/**
 * Baut die grobe Account-/Kosten-Liste fuer einen CLMM-Pool-Launch.
 * Die exakte Zahl liefert Raydiums UI bei Send-Vorgang; dies ist nur
 * eine Untergrenze, damit der Account-Payer weiss, wie viel SOL er
 * braucht (Rent + Fees + gewaehlter Initial-Liquiditaets-SOL-Betrag).
 */
export function buildClmmCostPlan(initialLiquiditySol: number): ClmmCostPlan {
  const notes: string[] = [];
  const accounts: ClmmCostPlan["accounts"] = [];

  const add = (name: string, bytes: number, count = 1) => {
    for (let i = 0; i < count; i++) {
      const suffix = count > 1 ? " [" + i + "]" : "";
      accounts.push({
        name: name + suffix,
        bytes,
        rentLamports: rentLamportsFor(bytes),
      });
    }
  };

  // Exakt die Accounts, die createPool + openPosition (per Raydium-UI/
  // SDK-Flow) neu anlegen (siehe create_pool.rs / open_position.rs):
  add("PoolState (CLMM-Pool)", CLMM_ACCOUNT_LEN.pool);
  add("ObservationState (Oracle)", CLMM_ACCOUNT_LEN.observation);
  add("ExBitmap (TickArray-Bitmap)", CLMM_ACCOUNT_LEN.exBitmap);
  add("ProtocolPosition (deprecated)", CLMM_ACCOUNT_LEN.protocolPosition);
  add("TickArray (lower + upper)", CLMM_ACCOUNT_LEN.tickArray, 2);
  add("PoolVault (SIN, ATA)", ATA_LEN);
  add("PoolVault (WSOL, ATA)", ATA_LEN);
  add("PersonalPosition", CLMM_ACCOUNT_LEN.personalPosition);
  add("Position-NFT-Mint", MINT_LEN);
  add("Position-NFT-ATA", ATA_LEN);
  add("Position-NFT-Metaplex-Metadaten", METADATA_LEN);

  // Aussenstehend vorhanden (KEINE neuen Accounts bei normalem Launch):
  // AmmConfig (Raydium-Index 0/1/2 existieren), System-Programme,
  // Token-2022-Program, Metadaten-Programm.

  const totalBytes = accounts.reduce((s, a) => s + a.bytes, 0);
  let totalRent = accounts.reduce((s, a) => s + a.rentLamports, 0);

  // Transaktionsgebuehren (Priority-Fee optional; konservativ):
  const txCount = 6; // createPool, obs, bitmap, protocol, 2x tickArray,
  //                   openPosition + NFT-Flow (vereinfacht)
  const feeLamports = txCount * 5000 + 50000; // Base + Puffer
  totalRent += feeLamports;

  const totalRentSol = totalRent / LAMPORTS_PER_SOL;
  const estimatedMinSol = totalRentSol + initialLiquiditySol;
  // Oberer Rand: +20 % Puffer fuer Ueberraschungen / hoehere Priority-Fees.
  const estimatedMaxSol = Math.ceil((totalRentSol * 1.2 + initialLiquiditySol) * 100) / 100;

  notes.push(
    "Grobe Untergrenze: Rent (neue Accounts) + Transaktionsgebuehren + " +
      "waehlbarer Initial-Liquiditaets-SOL-Betrag. Exakte Zahl liefert " +
      "Raydiums UI beim Send-Vorgang.",
  );
  notes.push(
    "WSOL-Quote: der Provider muss den quote-seitigen SOL-Betrag per " +
      "System-Program Wrap anlegen (zusaetzlicher ATA ~166 B + Wrap-Fee); " +
      "das ist in der Initial-Liquiditaet enthalten.",
  );

  return {
    accounts,
    totalBytes,
    totalRentLamports: totalRent,
    totalRentSol,
    estimatedMinSol,
    estimatedMaxSol,
    notes,
  };
}

export interface ClmmCostPlan {
  // Pro Account: Groesse (bytes) + Rent (lamports, Schaetzung).
  accounts: Array<{ name: string; bytes: number; rentLamports: number }>;
  totalBytes: number;
  totalRentLamports: number;
  totalRentSol: number;
  estimatedMinSol: number;
  estimatedMaxSol: number;
  notes: string[];
}

/**
 * Liest die Raydium-CLMM-Programm-Adresse aus config/token.json
 * (dex.raydiumClmmProgram) und waehlt je nach Netz die korrekte
 * Adresse (mainnet/devnet). Liefert WSOL-Quote-Mint + optionalen
 * AmmConfig-Index + Initial-Liquiditaet aus der Konfiguration.
 * Rein lokaler Konfig-Lesezugriff.
 */
export function clmmProgramForNetwork(
  net: string,
): { programId: string; wsol: string; ammConfigIndex: number; initialLiquiditySol: number } {
  const cfg = loadConfig();
  const dex = cfg.dex as {
    raydiumClmmProgram: { mainnet: string; devnet: string };
    solWrapMint: string;
    ammConfigIndex?: number;
    initialLiquiditySol?: number;
  };
  const programId =
    net === "mainnet" ? dex.raydiumClmmProgram.mainnet : dex.raydiumClmmProgram.devnet;
  return {
    programId,
    wsol: dex.solWrapMint,
    ammConfigIndex: dex.ammConfigIndex ?? 0,
    initialLiquiditySol: dex.initialLiquiditySol ?? 0,
  };
}
