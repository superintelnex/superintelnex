// Einmal-Top-up des Providers (recipient.json) aus dem main-Admin-Buffer,
// damit der CLMM-Pool-Launch (0,3-SOL-Plan) voll aus kontrollierten Mitteln
// finanziert werden kann. Autonome Entscheidung 10.11.2026 (Betreiber-
 // Vollmacht, 50-EUR-Rahmen): 0,0158 SOL von 9kT5Ew… (main.json.archiviert)
 // an DNEBNjtW… (Provider). fund-holder.ts ist mainnet-frei zwingend
 // devnet-geblockt, daher dieser eigenstaendige, hart abgewickelte Pfad.
//
 // Default: DRY-RUN (nichts wird gesendet). Abarbeiten:
//   SIN_NETWORK=mainnet SIN_TOPUP_SEND=1 SIN_MAINNET_OK=1 \
//   deno run --allow-read --allow-net --allow-env --allow-write \
//     token/scripts/provider-topup.ts
//
 // Optional: --lamports <n> (Default 15800000 = 0,0158 SOL).
// Eintrag im Journal: "clmm.providerTopup" (EXECUTED-TRANSACTIONS.jsonl).
import {
  Keypair, SystemProgram, Transaction,
} from "npm:@solana/web3.js@1.98.4";
import {
  conn, getWallet, journal, loadConfig, networkLabel, sendTx,
} from "./lib/common.ts";

function fail(msg: string): never {
  console.error("\nABBRUCH: " + msg);
  Deno.exit(3);
}

function parseArgs(argv: string[]) {
  const a = { lamports: "15800000" };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--lamports") a.lamports = argv[++i];
  }
  return a;
}

const args = parseArgs(Deno.args);
const cfg = loadConfig();
const c = conn();
const label = networkLabel();
const netKey = Deno.env.get("SIN_NETWORK") ?? cfg.networks.default;
const sendMode = Deno.env.get("SIN_TOPUP_SEND") === "1";

if (sendMode && netKey === "mainnet" && Deno.env.get("SIN_MAINNET_OK") !== "1")
  fail("SIN_TOPUP_SEND=1 auf mainnet erfordert SIN_MAINNET_OK=1 (bewusste Bestaetigung).");
if (sendMode && netKey !== "mainnet" && netKey !== "devnet" && netKey !== "localnet")
  fail("Unbekanntes Netz '" + netKey + "'.");

// 1) Quelle: main.json.archiviert (main.json existiert nach Revoke nicht
//    mehr und darf auch NICHT neu erzeugt werden).
const archF = new URL("../wallets/main.json.archiviert", import.meta.url);
let admin: Keypair;
try {
  admin = Keypair.fromSecretKey(new Uint8Array(JSON.parse(Deno.readTextFileSync(archF))));
} catch {
  fail("main.json.archiviert nicht lesbar — kein Transfer ohne lokal verwalteten Admin-Key.");
}

// 2) Ziel: recipient.json (Provider, haelt die 10%-Liquiditaets-Allokation).
const provider = (await getWallet("recipient")).publicKey;

const lamports = BigInt(args.lamports);
const [srcBal, dstBal] = await Promise.all([
  c.getBalance(admin.publicKey),
  c.getBalance(provider),
]);

console.log("=== Provider-Topup [" + label + "] " + (sendMode ? "SENDEN" : "DRY-RUN") + " ===");
console.log("Quelle (main-Buffer) :", admin.publicKey.toBase58(), "=", (srcBal / 1e9).toFixed(6), "SOL");
console.log("Ziel (Provider)      :", provider.toBase58(), "=", (dstBal / 1e9).toFixed(6), "SOL");
console.log("Ueberweisung         :", (Number(lamports) / 1e9).toFixed(6), "SOL (+ 1 Basisfee)");

if (srcBal < lamports + 10_000n)
  fail("Admin-Buffer reicht nicht: " + srcBal + " lamports < " + (Number(lamports) + 10_000) + " (Transfer + Fee-Puffer).");
if (dstBal + Number(lamports) < 0.5658 * 1e9)
  console.log("  HINWEIS: Ziel-Saldo nach Transfer (" + ((dstBal + Number(lamports)) / 1e9).toFixed(6) +
    " SOL) ist UNTER 0,5658 — der 0,3-SOL-Pool-Bedarf (0,565772) wuerde nicht gedeckt sein!");

if (!sendMode) {
  console.log("\nDRY-RUN — nichts gesendet. Abarbeiten mit:");
  console.log("  SIN_NETWORK=" + netKey + " SIN_TOPUP_SEND=1" + (netKey === "mainnet" ? " SIN_MAINNET_OK=1" : "") +
    " deno run --allow-read --allow-net --allow-env --allow-write token/scripts/provider-topup.ts");
  Deno.exit(0);
}

// 3) Ueberweisung (1 Tx, System-Program, nur der Admin signiert).
const tx = new Transaction().add(
  SystemProgram.transfer({ fromPubkey: admin.publicKey, toPubkey: provider, lamports }),
);
const sig = await sendTx(c, tx, [admin]);
journal("clmm.providerTopup", {
  signature: sig,
  network: label,
  details: { from: admin.publicKey.toBase58(), to: provider.toBase58(), lamports: lamports.toString() },
});

// 4) Read-only-Nachpruefung: Ziel-Saldo exakt +Transfer.
await new Promise((r) => setTimeout(r, 3000));
const dstAfter = await c.getBalance(provider);
if (dstAfter !== dstBal + Number(lamports))
  fail("Ziel-Saldo weicht ab: " + (dstAfter / 1e9).toFixed(6) + " (erwartet " + ((dstBal + Number(lamports)) / 1e9).toFixed(6) +
    ") — manuell pruefen, KEIN Pool-Launch davor starten.");

console.log("OK — " + (Number(lamports) / 1e9).toFixed(6) + " SOL an " + provider.toBase58() +
  " ueberwiesen. Signature: " + sig);
console.log("  (https://explorer.solana.com/tx/" + sig + ")");
console.log("Provider-Saldo nachher: " + (dstAfter / 1e9).toFixed(6) + " SOL.");
