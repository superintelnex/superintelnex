// Vierstufige Emission: emittiert die Gesamtmenge exakt nach
// config.token.distribution (81/10/5/4) auf vier separate ATAs.
// Reines SPL-Standard-Verfahren: pro Anteil wird die ATA der
// Emissions-Adresse angelegt (Payer: Admin-Wallet) und per MintTo
// gefuellt. Keine eigenen Programme, keine Emissions-Programme.
//
// Emissions-Adressen (ATA-Owner):
//   - community / founder / marketing: Wallet-Pubkeys aus
//     config.token.distributionTargets oder per
//     SIN_DISTRIBUTION_TARGETS='{"community":"<base58>",...}' (Mainnet-
//     Hardware-Tresore; siehe MAINNET-CHECKLISTE.md)
//   - liquidity: die eigene Holder-Adresse des Betreibers — zur Laufzeit
//     automatisch aus token/wallets/recipient.json (gitignoriert).
//     (Config-Key "recipient" gilt als Alias fuer den Anteil "liquidity".)
//   - Der ATA-Owner muss NICHT signieren: MintTo benoetigt nur
//     Mint-Vollmacht + ATA-Payer.
//
// Vesting (founder 5 % / marketing 4 %) ist KEIN Teil dieses Skripts —
// ein Planpunkt nach der Emission (MAINNET-CHECKLISTE.md).
//
// Aufruf: deno run --allow-all token/scripts/distribute.ts
// Netz: SIN_NETWORK (Standard: localnet) / SIN_RPC optional.
// Erwartet token/result/MINT-ADDRESS.txt (erzeugt von create-mint.ts).
// Reihenfolge: create-mint → distribute → verify → revoke-authorities.
import {
  PublicKey, Transaction, LAMPORTS_PER_SOL,
} from "npm:@solana/web3.js@1.98.4";
import * as token from "npm:@solana/spl-token@0.4.15";
import {
  loadConfig, conn, getWallet, sendTx, journal, networkLabel, requireMainnetOk,
} from "./lib/common.ts";
import { buildPlan, distributeInstructions } from "./lib/distribution.ts";

const cfg = loadConfig();
const c = conn();
const label = networkLabel();
requireMainnetOk("distribute");

// 1) Mint-Adresse aus dem Ergebnis-Protokoll (create-mint.ts).
const resDir = new URL("../result/", import.meta.url);
const out = JSON.parse(Deno.readTextFileSync(new URL("MINT-ADDRESS.txt", resDir)));
if ((out.netz ?? "") !== label) {
  console.log("WARNUNG: MINT-ADDRESS.txt gehoert zu Netz '" + (out.netz ?? "?") + "', Lauf erfolgt auf " + label + ".");
}
const mintPub = new PublicKey(out.mint);

// 2) Guards (vor jeder Transaktion, read-only).
const m = await token.getMint(c, mintPub);
if (!m) {
  console.log("ABBRUCH: Mint " + out.mint + " existiert nicht auf " + label + " (MINT-ADDRESS.txt passt nicht zu diesem Netz?).");
  Deno.exit(1);
}
if (m.supply > 0n && Deno.env.get("SIN_FORCE_DISTRIBUTE") !== "1") {
  console.log("ABBRUCH: Mint hat bereits Supply = " + m.supply + " (kleinste Einheiten).");
  console.log("FIXED-NO-FURTHER-ISSUANCE — fuer einen Wiederlauf SIN_FORCE_DISTRIBUTE=1 setzen und das Protokoll pruefen.");
  Deno.exit(1);
}
if (m.mintAuthority === null) {
  console.log("ABBRUCH: Mint-Vollmacht ist entzogen — Emission nicht mehr moeglich.");
  console.log("Reihenfolge: create-mint → distribute → revoke-authorities.");
  Deno.exit(1);
}

// 3) Emissions-Adressen (ATA-Owner) auflösen:
//    config distributionTargets → SIN_DISTRIBUTION_TARGETS → recipient.json.
const targets = (cfg as { token?: { distributionTargets?: Record<string, string | null> } })
  .token?.distributionTargets ?? {};
let envTargets: Record<string, string> = {};
const envJson = Deno.env.get("SIN_DISTRIBUTION_TARGETS");
if (envJson) {
  try { envTargets = JSON.parse(envJson); }
  catch { console.log("ABBRUCH: SIN_DISTRIBUTION_TARGETS ist ungültiges JSON."); Deno.exit(1); }
}
// Anteil-Name → Config-Schluessel ("liquidity" = die eigene Holder-Adresse).
const shareNames = Object.keys(cfg.token.distribution).filter(
  (k) => typeof cfg.token.distribution[k] === "number");
const ownerFor = async (name: string): Promise<PublicKey> => {
  if (name === "liquidity") {
    // Die eigene Holder-Adresse des Betreibers: zur Laufzeit aus der
    // lokalen recipient-Wallet (gitignoriert, einweg im Testlauf).
    const holder = await getWallet("recipient");
    console.log("  liquidity-Owner = recipient.json: " + holder.publicKey.toBase58());
    return holder.publicKey;
  }
  const configured = targets[name] ?? envTargets[name];
  if (!configured) {
    throw new Error(
      "Keine Emissions-Adresse fuer den Anteil '" + name + "'. Ansetzen via "
      + "config.token.distributionTargets oder SIN_DISTRIBUTION_TARGETS "
      + "(base58-Adresse).");
  }
  const p = new PublicKey(configured); // wirft bei invalidem base58
  if (PublicKey.isOnCurve(p)) {
    console.log("WARNUNG: Emissions-Adresse '" + name + "' liegt auf der Kurve — "
      + "vermutlich EIN Private Key, nicht eine Adresse! (Pruefen, bevor der Lauf gesendet wird.)");
  }
  return p;
};
const owners = await Promise.all(shareNames.map(ownerFor));

// 4) Planung: exakte Anteil-Berechnung (ohne Gleitkomma-Reste).
const plans = buildPlan({
  totalSupply: cfg.token.totalSupply,
  decimals: cfg.token.decimals,
  distribution: cfg.token.distribution,
  owners,
  mint: mintPub,
});

// 5) Finanzierung der Admin-Wallet (Payer: ATA-Rent x4 + Fees + Metadaten-Rent).
const admin = await getWallet("main");
const perTx = 2 * LAMPORTS_PER_SOL; // ATA-Rent ~0.002 + Fees
const need = label === "LOCALNET-TEST"
  ? plans.length * perTx + LAMPORTS_PER_SOL
  : Math.max(0.15 * LAMPORTS_PER_SOL, plans.length * perTx);
const bal = await c.getBalance(admin.publicKey);
if (bal < need) {
  if (label === "LOCALNET-TEST") {
    const sig = await c.requestAirdrop(admin.publicKey, need);
    console.log("Localnet-Airdrop:", sig);
  } else {
    console.log("Zu wenig Test-SOL (" + (bal / LAMPORTS_PER_SOL).toFixed(6) +
      " SOL, erforderlich ~" + (need / LAMPORTS_PER_SOL).toFixed(2) + "). Wallet ueber Faucet finanzieren (DEVNET-RUNBOOK.md, Wege A/B/C):");
    console.log("  " + admin.publicKey.toBase58());
    Deno.exit(1);
  }
}

// 6) Emission: eine Transaktion pro Anteil (ATA idempotent + MintTo).
console.log("=== Vierstufige Emission [" + label + "]  Mint " + out.mint + " ===");
const sigs: Record<string, string> = {};
for (const p of plans) {
  const amt = p.rawAmount.toString();
  const tx = new Transaction().add(...distributeInstructions(p, mintPub, admin.publicKey));
  console.log("Minten von " + amt + " smallest units (" + p.name + ", "
    + (p.percent * 100) + " %), Owner " + p.owner.toBase58() + ", ATA " + p.ata.toBase58() + " …");
  const sig = await sendTx(c, tx, [admin]);
  sigs[p.name] = sig;
  journal("distribute-" + p.name, {
    signature: sig,
    details: {
      mint: out.mint,
      share: p.name,
      percent: p.percent,
      rawAmount: amt,
      owner: p.owner.toBase58(),
      ata: p.ata.toBase58(),
    },
  });
  console.log("  Signatur:", sig);
}

// 7) Ergebnis-Protokoll.
const distOut = {
  netz: label,
  mint: out.mint,
  shares: plans.map((p) => ({
    name: p.name,
    percent: p.percent,
    rawAmount: p.rawAmount.toString(),
    owner: p.owner.toBase58(),
    ata: p.ata.toBase58(),
    signature: sigs[p.name],
  })),
  explorerMint: "https://explorer.solana.com/address/" + out.mint +
    (label === "DEVNET-TESTTOKEN" ? "?cluster=devnet" : ""),
};
Deno.writeTextFileSync(new URL("DISTRIBUTION.txt", resDir), JSON.stringify(distOut, null, 2) + "\n");
journal("distribute", { details: { mint: out.mint, signatures: sigs } });

console.log("Vierstufige Emission abgeschlossen: " + shareNames.join(" / "));
console.log("Protokoll: token/result/DISTRIBUTION.txt");
console.log("Danach: token/scripts/verify.ts (Supply) und — erst JETZT — token/scripts/revoke-authorities.ts");
