// Ueberweist Test-SOL von der Admin-Test-Wallet (token/wallets/main.json
// bzw. main.json.archiviert) an eine Ziel-Adresse (Standard: recipient).
//
// NUR localnet/devnet. Im Mainnet wird ABBRUCH gelaesst — dort kommen
// SOL niemals ueber ein Skript mit lokal abgelegten Keys.
//
// Aufruf:
//   // Standard: 0.03 SOL an recipient (devnet):
//   SIN_NETWORK=devnet deno run --allow-all token/scripts/fund-holder.ts
//
//   // Menge + Ziel waehlen:
//   SIN_NETWORK=devnet deno run --allow-all token/scripts/fund-holder.ts \
//     --to <PUBKEY> --lamports 30000000
//
// Das Skript prueft vorher den Ziel-Saldo und bricht ab, wenn er bereits
// groeser ist als die Ueberweisung (kein doppelter Funding-Lauf).
import {
  SystemProgram, Transaction,
} from "npm:@solana/web3.js@1.98.4";
import {
  loadConfig, conn, getWallet, sendTx, journal, networkLabel,
} from "./lib/common.ts";

function parseArgs(argv: string[]) {
  const a = { to: undefined as string | undefined, lamports: "30000000" };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--to") a.to = argv[++i];
    else if (k === "--lamports") a.lamports = argv[++i];
  }
  return a;
}

const args = parseArgs(Deno.args);
const cfg = loadConfig();
const c = conn();
const label = networkLabel();

// MAINNET-HARTE-SPERRE: kein SOL-Transfer ueber ein Key-datei-Skript.
if (label === "MAINNET-LAUNCH") {
  console.error("ABBRUCH: fund-holder laeuft NUR auf localnet/devnet. Mainnet: SOL per Hand (Hardware-Wallet).");
  Deno.exit(1);
}

// 1) Admin-Test-Wallet: main.json, falls das fehlt main.json.archiviert,
//    erst als letzte Option (und nur localnet/devnet) frisch erzeugen.
let admin;
const { Keypair } = await import("npm:@solana/web3.js@1.98.4");
const mainF = new URL("../wallets/main.json", import.meta.url);
const archF = new URL("../wallets/main.json.archiviert", import.meta.url);
let hasMain = false, hasArch = false;
try { Deno.statSync(mainF); hasMain = true; } catch { /* fehlt */ }
try { Deno.statSync(archF); hasArch = true; } catch { /* fehlt */ }
if (hasMain) {
  admin = await getWallet("main");
} else if (hasArch) {
  admin = Keypair.fromSecretKey(new Uint8Array(JSON.parse(Deno.readTextFileSync(archF))));
  console.log("(Admin aus main.json.archiviert geladen: " + admin.publicKey.toBase58() + ")");
} else {
  admin = await getWallet("main");
}

// 2) Ziel: --to oder recipient-Pubkey.
const target = args.to ?? (await getWallet("recipient")).publicKey.toBase58();
const lamports = BigInt(args.lamports);

// 3) Vorpruefung: Saldo admin (quelle) + ziel (bestandsmenge).
const [srcBal, dstBal] = await Promise.all([
  c.getBalance(admin.publicKey),
  c.getBalance(new (await import("npm:@solana/web3.js@1.98.4")).PublicKey(target)),
]);
console.log("=== Fund-Holder [" + label + "] ===");
console.log("Quelle (admin):", admin.publicKey.toBase58(), "=", (srcBal / 1e9).toFixed(6), "SOL");
console.log("Ziel        :", target, "=", (dstBal / 1e9).toFixed(6), "SOL");
if (dstBal > lamports) {
  console.log("ABBRUCH: Ziel hat bereits mehr SOL als die Ueberweisung (" + (lamports / 1e9).toFixed(6) + "). --lamports erhohen oder abbrechen.");
  Deno.exit(1);
}
if (srcBal < lamports) {
  console.log("ABBRUCH: admin-Saldo reicht nicht (" + (srcBal / 1e9).toFixed(6) + " < " + (lamports / 1e9).toFixed(6) + ").");
  Deno.exit(1);
}

// 4) Ueberweisung (1 Tx, System-Program).
const { PublicKey } = await import("npm:@solana/web3.js@1.98.4");
const tx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: admin.publicKey,
    toPubkey: new PublicKey(target),
    lamports,
  }),
);
const sig = await sendTx(c, tx, [admin]);
journal("fund-holder", {
  signature: sig,
  details: { from: admin.publicKey.toBase58(), to: target, lamports: lamports.toString() },
});
console.log("Ueberweisung-Signatur:", sig);
console.log("OK — " + Number(lamports) / 1e9 + " SOL an " + target + " ueberwiesen. [" + label + "]");
