// Raydium-CLMM-Pool-Planer (DRY-RUN / PLANNER — sendet NICHTS).
//
// VERALTET (10.11.2026): Nur noch Referenz. Der echte CLMM-Launch
// laeuft ueber `token/scripts/launch-clmm-pool.ts` (offizielle
// Raydium-SDK v2). ACHTUNG: Die PDAs in diesem alten Skript nutzen
// die SIN/WSOL-Reihenfolge; das CLMM-Programm erzwingt
// mintA=WSOL < mintB=SIN (Byte-Order) — der effektive Pool-PDA ist
// 4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM (siehe
// launch-clmm-pool.ts + MAINNET-LAUNCH-RUNBOOK.md).
//
// Dieses Skript
//   - prueft, ob der SIN-Mint auf dem gewaehlten Netz existiert (Mainnet:
//     typischerweise NOCH NICHT — siehe MINT-ADDRESS.txt / Status-Bericht),
//   - berechnet alle PDA-Adressen, die Raydium fuer SIN/WSOL ableiten wuerde,
//   - zeigt den exakten Account-Plan (welche Accounts ein Pool-Launch
//     anlegt) + eine kostenbasierte Schaetzung (parameterisiert ueber
//     config.dex.initialLiquiditySol oder SIN_INITIAL_LIQ),
//   - und dokumentiert, dass der eigentliche Launch (createPool +
//     openPositionFromLiquidity + initial liquidity) ein mehrteiliger
//     Instrukions-Flow ist, der ueber Raydiums verifizierten Weg
//     (raydium.io-UI oder getestetes SDK) ausgefuehrt werden sollte —
//     NICHT per hand-kompilierter Multi-Instruction-Sequenz auf Mainnet.
//
// Aufruf:
//   // Devnet-Plan (SIN_NETWORK aus config):
//   deno run --allow-read --allow-net --allow-env \
//     token/scripts/create-raydium-pool.ts
//
//   // Mainnet-Plan (Mint-Existenz + Adressen, ohne Senden):
//   SIN_NETWORK=mainnet deno run --allow-read --allow-net --allow-env \
//     token/scripts/create-raydium-pool.ts
//
//   // Geringere Initial-Liquiditaet ueberschreiben (z. B. Budget-Plan):
//   SIN_INITIAL_LIQ=0.5 deno run --allow-read --allow-net --allow-env \
//     token/scripts/create-raydium-pool.ts
//
// Sicherheitsstellung: Keine Transaktion wird gebaut, kein Blockhash,
// kein Secret-Key wird geladen. Nur Lese-RPC + deterministische PDA-
// Rechnung. Fuer den echten Launch: SIN_DEX_SEND=1 + SIN_MAINNET_OK=1 —
// ist bewusst NOCH nicht implementiert (kein verifizierter Flow in
// dieser Repo; siehe config.dex._status).
import { PublicKey } from "npm:@solana/web3.js@1.98.4";
import {
  loadConfig, conn, networkLabel, rpcUrl,
} from "./lib/common.ts";
import {
  computeClmmPoolAddresses, buildClmmCostPlan, clmmProgramForNetwork,
} from "./lib/raydium-clmm.ts";

const cfg = loadConfig();
const c = conn();
const label = networkLabel();

// SIN-Mint aus dem Ergebnis-Protokoll (create-mint.ts).
const out = JSON.parse(Deno.readTextFileSync(new URL("../result/MINT-ADDRESS.txt", import.meta.url)));
const mint = out.mint;

// Netz waehlen (mainnet/devnet/…), dann Programm-ID + WSOL aus der Konfig.
const netKey = Deno.env.get("SIN_NETWORK") ?? cfg.networks.default;
const { programId, wsol, ammConfigIndex, initialLiquiditySol: cfgLiq } = clmmProgramForNetwork(netKey);
const envLiq = Deno.env.get("SIN_INITIAL_LIQ");
const liqSol = envLiq !== undefined ? Number(envLiq) : cfgLiq;

console.log("=== Raydium-CLMM-Pool-Planer [" + label + "] (DRY-RUN, sendet nichts) ===");
console.log("Netz              :", netKey, "  RPC:", rpcUrl());
console.log("Raydium-Programm  :", programId, " (on-chain verifiziert: existiert + executable)");
console.log("SIN-Mint          :", mint, " (aus MINT-ADDRESS.txt, Netz '" + (out.netz ?? "?") + "')");
console.log("Quote-Mint (WSOL) :", wsol, "  AmmConfig-Index:", ammConfigIndex);

// Warnung: MINT-ADDRESS.txt koennte ein MINT aus EINEM ANDEREN NETZ
// enthalten (devnet-Mint ist lokal vorhanden, mainnet-Mint existiert
// typischerweise noch nicht). In dem Fall zeigt der PDA-Plan die
// Adressen, die sich fuer DIESEN (fremdnetzigen) Mint ableiten wuerden.
if (out.netz && netKey !== "localnet" && out.netz !== netKey) {
  console.log("");
  console.log("HINWEIS: MINT-ADDRESS.txt verweist auf das Netz '" + out.netz +
    "' — der PDA-Plan zeigt Adressen fuer diesen Mint, NICHT fuer '" + netKey + "'.");
}

// 1) Existenz-Pruefung (read-only): existieren Mint + Programm + WSOL
//    auf DIESEM Netz? Das ist der eigentliche Gate-Indikator: ein Pool
//    laeuft nur auf einem Netz, auf dem der Mint + seine Metadaten
//    bereits existieren.
const [mintAcct, programAcct, wsolAcct] = await c.getMultipleAccountsInfo([
  new PublicKey(mint), new PublicKey(programId), new PublicKey(wsol),
]);
const sinOnNet = !!mintAcct;
const progOnNet = !!programAcct;
const wsolOnNet = !!wsolAcct;
console.log("");
console.log("Existenz-Check (read-only):");
console.log("  SIN-Mint auf diesem Netz     :", sinOnNet ? "JA" : "NEIN — erst create-mint.ts + Emission auf diesem Netz noetig");
console.log("  Raydium-Programm auf Netz    :", progOnNet ? "JA (executable)" : "NEIN — Unerwartet");
console.log("  WSOL-Mint auf diesem Netz    :", wsolOnNet ? "JA" : "NEIN — Unerwartet");
if (!sinOnNet) {
  console.log("");
  console.log("WARNUNG: Der SIN-Mint existiert noch nicht auf '" + netKey + "'.");
  console.log("Ein DEX-Pool setzt eine existierende Supply voraus. Vorher: create-mint.ts + distribute.ts");
  console.log("auf diesem Netz laufen (siehe token/docs/MAINNET-LAUNCH-RUNBOOK.md). Hier wird nur der Plan angezeigt.");
}

// 2) PDA-Rechnung (deterministisch, offline).
const addr = computeClmmPoolAddresses(programId, mint, wsol, ammConfigIndex);
console.log("");
console.log("Pool-PDA (deterministisch aus Mint + WSOL + Programm-ID abgeleitet):");
console.log("  AmmConfig         :", addr.ammConfig);
console.log("  PoolId            :", addr.poolId);
console.log("  ExBitmap          :", addr.exBitmap);
console.log("  Observation       :", addr.observation);
console.log("  PoolVault (SIN)   :", addr.poolVaultA);
console.log("  PoolVault (WSOL)  :", addr.poolVaultB);
console.log("  TickArray (Lower) :", addr.tickArrayLower, " (0 — Platzhalter)");
console.log("  TickArray (Upper) :", addr.tickArrayUpper, " (0 — Platzhalter)");
console.log("  ProtocolPosition  :", addr.protocolPosition, " (0 — Platzhalter)");
console.log("  PersonalPosition  :", addr.personalPosition, " (0 — Platzhalter)");
console.log("");
console.log("  HINWEIS: Die Tick/Position-PDAs sind PLATZHALTER — sie hängen vom");
console.log("  gewaehlten Range ab (tickLower/tickUpper) und vom NFT-Mint des");
console.log("  Providers. Die PoolId, Vault, AmmConfig + ExBitmap/Observation-");
console.log("  PDA sind deterministisch und muessen bei Raydium's UI identisch sein.");
console.log("");
console.log("  Abgleich-Tipp: Diese Adressen muss Raydiums UI identisch ableiten.");
console.log("  Der Pool-Link, falls existierend:", "https://app.raydium.io/pools/" + addr.poolId +
  (netKey === "devnet" ? "?cluster=devnet" : ""));

// 3) Account-Plan + Kosten-Schaetzung (parameterisiert über die Lib).
const plan = buildClmmCostPlan(liqSol);
console.log("");
console.log("Account-Plan (neu angelegt von createPool + openPosition):");
for (const a of plan.accounts) {
  const rentSol = a.rentLamports / 1e9;
  console.log("  " + a.name.padEnd(36) + String(a.bytes).padStart(6) + " B  Rent ~" + rentSol.toFixed(6) + " SOL");
}
console.log("");
console.log("Kostenschaetzung (grobe Untergrenze; exakte Zahl liefert Raydiums UI):");
console.log("  Summe Account-Bytes     :", plan.totalBytes);
console.log("  Rent + Fees             :", plan.totalRentSol.toFixed(4), "SOL");
console.log("  + Initial-Liquiditaet   :", liqSol, "SOL (config.dex.initialLiquiditySol =" + cfgLiq +
  (envLiq !== undefined ? " → ueberschrieben per SIN_INITIAL_LIQ" : "") + ")");
console.log("  => Payer-Untergrenze   :", plan.estimatedMinSol.toFixed(4), "SOL");
console.log("  => Payer-Obergrenze    :", plan.estimatedMaxSol.toFixed(4), "SOL (inkl. +20 % Puffer)");
for (const n of plan.notes) {
  console.log("  - " + n);
}

// 4) Was NICHT passiert + naechster Schritt.
console.log("");
console.log("Nächste Schritte (kein Auto-Launch):");
console.log("  - Der eigentliche Pool-Launch laeuft ueber raydium.io 'Launch Pool' (CLMM),");
console.log("    oder ueber einen getesteten SDK-Flow (createPool → openPositionFromLiquidity → addLiquidity).");
console.log("  - Es gibt BEREITS EINEN --send-Modus in der Konfig: SIN_DEX_SEND=1 + SIN_MAINNET_OK=1.");
console.log("    Dieser ist NOCH NICHT implementiert (bewusst) — ein hand-kompilierter");
console.log("    CLMM-Launch ist fehleranfällig und verbrennt SOL, falls eine");
console.log("    Account-Liste unaufgeräumt ist (siehe config.dex._status).");
console.log("  - DEX 'Listing' ist also: Pool mit Liquidität live + (optional) CEX-Antrag");
console.log("    (siehe EXCHANGE-HOSTING.md).");
console.log("");
console.log("DRY-RUN abgeschlossen — keine Transaktion gesendet, keine Keys geladen.");
