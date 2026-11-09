// Entziehung der Vollmachten am Mint — EINWEG, NICHT rueckgaengig.
// Aufruf: deno run --allow-all token/scripts/revoke-authorities.ts
// Netz: SIN_NETWORK (Standard: localnet) / SIN_RPC optional.
//
// VORGANG: Pro Vollmacht eine SetAuthority-Transaktion (MintTokens,
// FreezeAccount). Wurden beide entzogen, wird die Admin-Test-Wallet selbst
// gesperrt (token/wallets/main.json wird verschoben), damit ausversehentliche
// Folgetransaktionen nicht mehr signiert werden koennen.
//
// VORAUSSETZUNG: config/token.json authorities.revokeMintAuthority /
// revokeFreezeAuthority = true. Ist eine Einstellung false, springt das
// Skript ueber die betreffende Vollmacht (und sperrt die Wallet NICHT).
import { PublicKey, Transaction, Keypair } from "npm:@solana/web3.js@1.98.4";
import * as token from "npm:@solana/spl-token@0.4.15";
import { loadConfig, conn, getWallet, sendTx, journal, networkLabel, requireMainnetOk } from "./lib/common.ts";

const cfg = loadConfig();
const c = conn();
const label = networkLabel();

// Hauptnetzlautschutz: die Vollmacht-Entziehung ist EINWEG — auf
// Mainnet erfordert das eine bewusste Bestaetigung.
requireMainnetOk("revoke-authorities (einwegige Vollmacht-Entziehung)");

const out = JSON.parse(Deno.readTextFileSync(new URL("../result/MINT-ADDRESS.txt", import.meta.url)));
if ((out.netz ?? "") !== label) {
  console.log("WARNUNG: MINT-ADDRESS.txt gehoert zu Netz '" + (out.netz ?? "?") + "', Lauf erfolgt auf " + label + ".");
}
const mint = new PublicKey(out.mint);
// Hauptnetzlautschutz (Wallet-Sperre unten): im Mainnet sperrt das Skript
// NUR die EIGENE Mainnet-Wallet — nur wenn deren Pubkey exakt der
// hinterlegte mintAuthority ist (sonst wuerde ein verfuegbares File
// versehentlich archiviert). Im Testlauf bleibt das alte Verhalten.
const expectMintAuthority = out.mintAuthority;
let admin: Keypair;
if (label === "MAINNET-LAUNCH") {
  admin = await getWallet("main");
  if (expectMintAuthority && admin.publicKey.toBase58() !== expectMintAuthority) {
    console.log("ABBRUCH: token/wallets/main.json (" + admin.publicKey.toBase58() + ") ist NICHT der hinterlegte mintAuthority (" + expectMintAuthority + ").");
    Deno.exit(1);
  }
} else {
  admin = await getWallet("main");
}
const auths = cfg.authorities as { revokeMintAuthority?: boolean; revokeFreezeAuthority?: boolean };

const before = await token.getMint(c, mint);
console.log("Vorher:  mintAuthority   = " + (before.mintAuthority?.toBase58() ?? "(keine)"));
console.log("         freezeAuthority = " + (before.freezeAuthority?.toBase58() ?? "(keine)"));

if (auths.revokeMintAuthority) {
  const t = new Transaction().add(
    token.createSetAuthorityInstruction(mint, admin.publicKey, token.AuthorityType.MintTokens, null, []),
  );
  const sig = await sendTx(c, t, [admin]);
  console.log("Mint-Vollmacht entzogen, sig:", sig);
  journal("revoke-mint-authority", { signature: sig, details: { mint: out.mint } });
} else {
  console.log("SKIP: authorities.revokeMintAuthority ist false (Mint-Vollmacht bleibt)");
}

if (auths.revokeFreezeAuthority) {
  const t = new Transaction().add(
    token.createSetAuthorityInstruction(mint, admin.publicKey, token.AuthorityType.FreezeAccount, null, []),
  );
  const sig = await sendTx(c, t, [admin]);
  console.log("Freeze-Vollmacht entzogen, sig:", sig);
  journal("revoke-freeze-authority", { signature: sig, details: { mint: out.mint } });
} else {
  console.log("SKIP: authorities.revokeFreezeAuthority ist false (Freeze-Vollmacht bleibt)");
}

const after = await token.getMint(c, mint);
console.log("Nachher: mintAuthority   = " + (after.mintAuthority?.toBase58() ?? "(keine)"));
console.log("         freezeAuthority = " + (after.freezeAuthority?.toBase58() ?? "(keine)"));

if (auths.revokeMintAuthority && after.mintAuthority !== null) throw new Error("Mint-Vollmacht wurde nicht entzogen!");
if (auths.revokeFreezeAuthority && after.freezeAuthority !== null) throw new Error("Freeze-Vollmacht wurde nicht entzogen!");

// Wenn beide Vollmachten weg sind: Admin-Test-Wallet sperren (Verschieben,
// nicht Loeschen — der Betreiber kann das Backup manuell zuruecksetzen,
// wenn er die Entscheidung revidieren will; die On-Chain-Vollmachten
// sind aber dauerhaft entzogen).
if (auths.revokeMintAuthority && auths.revokeFreezeAuthority) {
  const wf = new URL("../wallets/main.json", import.meta.url);
  try {
    Deno.statSync(wf);
    Deno.renameSync(wf, new URL("main.json.archiviert", wf));
    console.log("Admin-Test-Wallet gesperrt (wallets/main.json archiviert) — kein Minten/Freezen mehr moeglich.");
  } catch {
    // Datei fehlt evtl. bereits
  }
}
console.log("OK — Vollmachten wie konfiguriert. [" + label + "]");
