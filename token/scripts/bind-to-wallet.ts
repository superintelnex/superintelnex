// SIN an eine beliebige Wallet-Bindungs-Adresse (ATA-Owner) uebertragen,
// damit der Token in einer Wallet (Phantom / Solflare) sichtbar ist.
//
// Netz: SIN_NETWORK (localnet | devnet | mainnet, Standard aus config).
// Quelle: die empfaenger-/Tresor-Wallet (token/wallets/recipient.json), deren
//   ATA den SIN haelt. Ziel: die ATA einer FREI WAHLENEN Owner-Adresse.
//
// Aufruf:
//   // Nur Lese-Abfrage: was WUERDE gebunden, was liegt wo? (Standard, sendet nichts)
//   SIN_NETWORK=devnet deno run --allow-read --allow-net \
//     token/scripts/bind-to-wallet.ts --owner <DEINE_WALLET_PUBKEY>
//
//   // Tatsaechliche Bindung (ATA anlegen + Transfer von recipient->owner):
//   SIN_NETWORK=devnet deno run --allow-all \
//     token/scripts/bind-to-wallet.ts --owner <DEINE_WALLET_PUBKEY> --send
//
//   // Menge (Standard: 1000000 SIN):
//   ... --amount 2500000
//
// Hauptnetzlautschutz: EIN MAINNET-BINDING ERFORDERT ZWEIMALIGE
// BETAETIGUNG SIN_MAINNET_OK=1 + --send. DEVNET/LOCALNET senden mit --send.
//
// SICHERHEIT: Nur der OEFFENTLICHE Pubkey der Ziel-Wallet wird hier gebraucht
// (ein ATA laeuft in jedem SPL-Token pro Owner). Kein Secret-Key der Ziel-
// Wallet wird gefragt, geladen oder gesendet — das ist die bewusste Trennung
// zu einer Signier- Wallet: die Ziel-Wallet muss fuer den Empfang NICHT
// signieren (nur die Quelle/recipient signiert).
import { PublicKey, Transaction, AccountInfo } from "npm:@solana/web3.js@1.98.4";
import * as token from "npm:@solana/spl-token@0.4.15";
import {
  loadConfig, conn, getWallet, sendTx, journal, networkLabel, requireMainnetOk,
} from "./lib/common.ts";

function parseArgs(argv: string[]) {
  const a = { owner: undefined as string | undefined, send: false, amount: "1000000" };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--owner") a.owner = argv[++i];
    else if (k === "--send") a.send = true;
    else if (k === "--amount") a.amount = argv[++i];
  }
  return a;
}

const args = parseArgs(Deno.args);
const cfg = loadConfig();
const c = conn();
const label = networkLabel();
requireMainnetOk("bind-to-wallet" + (args.send ? " (SEND)" : ""));

// 1) Ziel-Owner (oeffentliche Wallet-Adresse, z. B. Phantom-Devnet-Pubkey).
if (!args.owner) {
  console.error("FEHLT: --owner <WALLET_PUBKEY>. Nur der OFFENTLICHE Pubkey, kein Secret-Key.");
  Deno.exit(2);
}
let owner: PublicKey;
try {
  owner = new PublicKey(args.owner);
} catch {
  console.error("UNGUELTIGER Pubkey: " + args.owner);
  Deno.exit(2);
}

// 2) SIN-Mint aus dem Ergebnis-Protokoll (create-mint.ts).
const out = JSON.parse(Deno.readTextFileSync(new URL("../result/MINT-ADDRESS.txt", import.meta.url)));
if ((out.netz ?? "") !== label) {
  console.log("WARNUNG: MINT-ADDRESS.txt gehoert zu Netz '" + (out.netz ?? "?") + "', Lauf auf " + label + ".");
}
const mint = new PublicKey(out.mint);

// 3) Quelle: recipient-/Tresor-Wallet (haelt den SIN) + deren ATA.
const source = await getWallet("recipient");
const srcAta = await token.getAssociatedTokenAddress(mint, source.publicKey);
const dstAta = await token.getAssociatedTokenAddress(mint, owner);

// 4) Read-only Zustand (immer, auch ohne --send).
const [srcAcc, dstAcc] = await c.getMultipleAccountsInfo([srcAta, dstAta]);
// SPL-Token-ATA-Layout: mint(32) owner(32) state(1) amount(u64 @ Offset 64)
// ... der Saldo wird per DataView (Little-Endian) gelesen.
const balanceOf = (acc: AccountInfo<Buffer> | null): bigint =>
  acc ? new DataView(acc.data.buffer, acc.data.byteOffset, acc.data.byteLength).getBigUint64(64, true) : 0n;
const srcBal = balanceOf(srcAcc);
const dstBal = balanceOf(dstAcc);
const amt = BigInt(args.amount) * 10n ** BigInt(cfg.token.decimals);
const dec = 10 ** cfg.token.decimals;

console.log("=== Bind-to-Wallet [" + label + "] ===");
console.log("SIN-Mint      :", out.mint);
console.log("Quelle-ATA    :", srcAta.toBase58(), "Saldo: " + (Number(srcBal) / dec).toString() + " " + cfg.token.symbol);
console.log("Ziel-Owner    :", owner.toBase58());
console.log("Ziel-ATA      :", dstAta.toBase58(), (dstAcc ? "existiert, Saldo " + (Number(dstBal) / dec).toString() : "(noch nicht angelegt)"));
console.log("Bindung-Menge :", (Number(amt) / dec).toString() + " " + cfg.token.symbol);

if (Number(amt) > Number(srcBal)) {
  console.error("ABBRUCH: Ziel-Menge uebersteigt den Quellen-Saldo.");
  Deno.exit(1);
}

if (!args.send) {
  console.log("");
  console.log("(Dry-Run. Fuer die tatsaechliche Bindung --send dazu, und im Mainnet SIN_MAINNET_OK=1 setzen.)");
  console.log("Phantom/Solflare: Netz auf '" + (label === "MAINNET-LAUNCH" ? "Mainnet" : "Devnet") + "' stellen, dann erscheint der Token in " + owner.toBase58() + ".");
  Deno.exit(0);
}

// 5) Tatsaechliche Bindung: ATA idempotent anlegen + Checked-Transfer.
const tx = new Transaction().add(
  token.createAssociatedTokenAccountIdempotentInstruction(
    source.publicKey, dstAta, owner, mint,
  ),
  token.createTransferCheckedInstruction(
    srcAta, mint, dstAta, source.publicKey, amt, cfg.token.decimals, [],
  ),
);
const sig = await sendTx(c, tx, [source]);
journal("bind-to-wallet", {
  signature: sig,
  details: { mint: out.mint, source: source.publicKey.toBase58(), owner: owner.toBase58(), dstAta: dstAta.toBase58(), amount: amt.toString() },
});
const after = await c.getAccountInfo(dstAta);
const afterBal = balanceOf(after);
console.log("Signatur:", sig);
console.log("Ziel-Saldo nachher:", (Number(afterBal) / dec).toString() + " " + cfg.token.symbol);
console.log("OK — SIN an " + owner.toBase58() + " gebunden. [" + label + "]");
