// Tests fuer das vierstufige Emissions-Skript (distribute.ts /
// lib/distribution.ts). Die Plan-Tests laufen offline (kein RPC), der
// Localnet-Lauf ist optin und wird bei fehlendem Test-Validator
// uebersprungen (Muster: integration.test.ts).
//
// Aufruf:
//   deno test --allow-read --allow-env token/tests/distribute.test.ts   # offline
//   deno test --allow-all         token/tests/distribute.test.ts        # + Localnet
import {
  Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL,
} from "npm:@solana/web3.js@1.98.4";
import * as token from "npm:@solana/spl-token@0.4.15";
import {
  conn, loadConfig, getWallet, sendTx, confirmSignature, rpcUrl,
} from "../scripts/lib/common.ts";
import { buildPlan } from "../scripts/lib/distribution.ts";

// Deterministischer Dummy-Mint (kein echtes Konto, nur ATA-Berechnung).
const DUMMY_MINT = new Keypair().publicKey;

function input(totalSupply: number, decimals: number,
  distribution: Record<string, number>) {
  const names = Object.keys(distribution).filter((k) => typeof distribution[k] === "number");
  return {
    totalSupply, decimals, distribution,
    owners: names.map(() => Keypair.generate().publicKey),
    mint: DUMMY_MINT,
  };
}

Deno.test("Plan: 81/10/5/4 auf 10^14 SIN @ 5 Dez. — exakte, ohne-Rest-Anteile", () => {
  const plans = buildPlan(input(100000000000000, 5, {
    community: 0.81, liquidity: 0.10, founder: 0.05, marketing: 0.04,
  }));
  const expect = [8100000000000000000n, 1000000000000000000n, 500000000000000000n, 400000000000000000n];
  if (plans.length !== 4) throw new Error("4 Anteile erwartet, " + plans.length + " erhalten");
  const names = ["community", "liquidity", "founder", "marketing"];
  let sum = 0n;
  for (let i = 0; i < 4; i++) {
    if (plans[i].name !== names[i]) throw new Error("Reihenfolge stimmt nicht: " + plans[i].name);
    if (plans[i].rawAmount !== expect[i]) throw new Error("Raw-Menge falsch (" + plans[i].name + "): " + plans[i].rawAmount + " != " + expect[i]);
    // ATA muss mit der SPL-Referenz-Berechnung uebereinstimmen
    const ata = token.getAssociatedTokenAddressSync(DUMMY_MINT, plans[i].owner);
    if (!plans[i].ata.equals(ata)) throw new Error("ATA stimmt nicht ueberein: " + plans[i].name);
    sum += plans[i].rawAmount;
  }
  if (sum !== 10n ** 19n) throw new Error("Summe passt nicht: " + sum);
});

Deno.test("Plan: Gleitkomma-Falle 33.33/33.33/33.34 ist exakt (kein Rest)", () => {
  const plans = buildPlan(input(1000, 0, {
    a: 0.3333, b: 0.3333, c: 0.3334,
  }));
  const got = plans.map((p) => p.rawAmount.toString());
  const expect = ["333", "333", "334"];
  for (let i = 0; i < 3; i++) {
    if (got[i] !== expect[i]) throw new Error("Anteil " + i + ": " + got[i] + " != " + expect[i]);
  }
});

Deno.test("Plan: unguellige Verteilungen werden abgelehnt (keine stille Rundung)", () => {
  const cases: Record<string, { totalSupply: number; decimals: number; distribution: Record<string, number>; owners: PublicKey[]; mint: PublicKey }> = {
    "addiert nur zu 99 %": {
      totalSupply: 100, decimals: 0,
      distribution: { a: 0.5, b: 0.49 },
      owners: [Keypair.generate().publicKey, Keypair.generate().publicKey],
      mint: DUMMY_MINT,
    },
    "Owner-Anzahl stimmt nicht": {
      totalSupply: 100, decimals: 0,
      distribution: { a: 0.5, b: 0.5 },
      owners: [Keypair.generate().publicKey],
      mint: DUMMY_MINT,
    },
    "u64-Ueberlauf (10^14 @ 9 Dez.)": {
      totalSupply: 100000000000000, decimals: 9,
      distribution: { a: 1.0 },
      owners: [Keypair.generate().publicKey],
      mint: DUMMY_MINT,
    },
    "Prozentsatz < 0": {
      totalSupply: 100, decimals: 0,
      distribution: { a: 1.5, b: -0.5 },
      owners: [Keypair.generate().publicKey, Keypair.generate().publicKey],
      mint: DUMMY_MINT,
    },
  };
  for (const [label, inp] of Object.entries(cases)) {
    let threw = false;
    try { buildPlan(inp); } catch { threw = true; }
    if (!threw) throw new Error("Fall nicht abgelehnt: " + label);
  }
});

// Optin-End-to-End: erzeugt einen eigenen, leeren Test-Mint (2 Dez.),
// laesst die exakte Konfig-Verteilung mit kleiner Menge (1000) auf vier
// einweg-ATAs und prueft exakte Saldo/Mint-Supply.
async function reachable(): Promise<boolean> {
  try {
    const bh = await conn().getLatestBlockhash();
    return !!bh.blockhash;
  } catch {
    return false;
  }
}
const localnetOk = await reachable();

Deno.test({
  name: "integration: vierstufige Emission lokal (LOCALNET-TEST)",
  ignore: !localnetOk ? "Kein erreichbarer Test-Validator auf " + rpcUrl() + " (DEVNET-RUNBOOK.md)." : undefined,
  fn: async () => {
    const c = conn();
    const cfg = loadConfig();
    const t = cfg.token;

    const admin = await getWallet("test-admin", { regenerate: true });
    const s1 = await c.requestAirdrop(admin.publicKey, 2 * LAMPORTS_PER_SOL);
    await confirmSignature(c, s1);

    // Test-Mint: exakt die Konfig-Verteilung, aber Menge 1000 und
    // 2 Dezimalstellen — reicht fuer die exakte Plan-Pruefung,
    // schneller und oekonomischer als der Gesamtlauf.
    const mint = Keypair.generate();
    const t1 = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: admin.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports: await c.getMinimumBalanceForRentExemption(token.MINT_SIZE),
        space: token.MINT_SIZE,
        programId: token.TOKEN_PROGRAM_ID,
      }),
      token.createInitializeMintInstruction(mint.publicKey, 2, admin.publicKey, admin.publicKey),
    );
    await sendTx(c, t1, [admin, mint]);
    console.log("  Test-Mint:", mint.publicKey.toBase58());

    // Emissions-Lauf: exakt wie distribute.ts, aber mit diesem Test-Mint
    // und Gesamtmenge 1000 (Verteilung bleibt die Konfig-Verteilung).
    const total = 1000;
    const names = Object.keys(t.distribution).filter((k) => typeof t.distribution[k] === "number");
    const owners = names.map(() => Keypair.generate().publicKey);
    const plans = buildPlan({
      totalSupply: total, decimals: 2,
      distribution: t.distribution, owners, mint: mint.publicKey,
    });

    for (const p of plans) {
      const tx = new Transaction().add(
        token.createAssociatedTokenAccountIdempotentInstruction(admin.publicKey, p.ata, p.owner, mint.publicKey),
        token.createMintToInstruction(mint.publicKey, p.ata, admin.publicKey, p.rawAmount, []),
      );
      await sendTx(c, tx, [admin]);
    }

    // Pruefung: exakte Saldo = Anteil der Konfig-Verteilung.
    let sum = 0n;
    for (const p of plans) {
      const acc = await token.getAccount(c, p.ata);
      if (acc.amount !== p.rawAmount) throw new Error(p.name + "-Saldo: " + acc.amount + " != " + p.rawAmount);
      sum += p.rawAmount;
    }
    const m2 = await token.getMint(c, mint.publicKey);
    if (m2.supply !== sum) throw new Error("Mint-Supply != Summe der Anteile: " + m2.supply + " vs " + sum);
    if (m2.supply !== BigInt(total) * 100n) throw new Error("Mint-Supply ueberrascht: " + m2.supply);
    console.log("  OK: vierstufige Emission exakt verteilt (Supply " + m2.supply + ")");
  },
  sanitizeOps: true,
  sanitizeResources: false,
} as Deno.TestDefinition);
