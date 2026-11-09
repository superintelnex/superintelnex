// Vierstufige Emissions-Planung (community / liquidity / founder / marketing).
// Reine Logik OHNE RPC-Zugriff: waehlerisch importierbar und offline
// testbar. Die eigentliche Emission (ATA-Anlagen + MintTo pro Anteil)
// erledigt ../distribute.ts.
//
// Designentscheid (Operator-Bestaetigung 09.11.2026):
//  - KEINE eigenen Programme — nur SPL-Standard (ATA + MintTo). Jeder
//    Anteil laedt in die ATA einer eigenen Emissions-Wallet (ATA-Owner).
//  - Der ATA-Owner ist eine beliebige Wallet-Pubkey (keine Signatur des
//    Holders noetig: MintTo signiert NUR die Mint-Vollmacht + ATA-Payer).
//    Die Owner-Pubkeys kommen aus config.token.distributionTargets oder
//    SIN_DISTRIBUTION_TARGETS (siehe distribute.ts).
//  - KEIN Vesting im Skript. Vesting (founder 5 % / marketing 4 %) bleibt
//    ein Planpunkt fuer nach der Emission (siehe MAINNET-CHECKLISTE.md).
import {
  PublicKey,
} from "npm:@solana/web3.js@1.98.4";
import * as token from "npm:@solana/spl-token@0.4.15";

export interface DistributionPlan {
  /** Anteil-Name, exakt wie im config-block "distribution" (kleinschreibung). */
  name: string;
  /** Prozentsatz aus der Konfiguration (z. B. 0.81 = 81 %). */
  percent: number;
  /** Anteil der Gesamtmenge in kleinen Einheiten (exakt berechnet). */
  rawAmount: bigint;
  /** Dezimaler Anteil (z. B. 81000000000000 SIN) — nur fuer Logs/Protokolle. */
  humanAmount: number;
  /** ATA-Owner: die Emissions-Wallet (Pubkey, muss NICHT signieren). */
  owner: PublicKey;
  /** ATA der Emissions-Wallet fuer den Token-Mint. */
  ata: PublicKey;
}

export interface PlanInput {
  /** Gesamtmenge in Token-Einheiten (z. B. 10^14). */
  totalSupply: number;
  /** Nachkommastellen des Mints (z. B. 5). */
  decimals: number;
  /** Anteil-Prozente, exakt wie config.token.distribution (nur numerische Werte). */
  distribution: Record<string, number>;
  /** ATA-Owner-Pubkeys, exakt einer pro Distribution-Name (gleiche Reihenfolge). */
  owners: PublicKey[];
  /** Der Token-Mint, dessen ATAs geplant werden. */
  mint: PublicKey;
}

// U64-Obergrenze der SPL-Programme fuer den Supply-Wert (siehe auch
// tests/config.test.ts, Abschnitt "Regressionsschutz").
const U64_MAX = 18446744073709551615n;

/**
 * Prueft die Verteilung (exakt, ohne Gleitkomma) und liefert den Emissions-
 * Plan: ein ATA + Menge + Signer pro Anteil.
 *
 * Garantien (andernfalls Fehler):
 *  - Die Prozente addieren sich exakt zu 100 % (Skalierung auf 10^9, um
 *    Gleitkomma-Rundung auszuschliessen).
 *  - Fuer jeden Distribution-Name liegt exakt ein Payer vor (und umgekehrt).
 *  - Pro Anteil: p_i/100 * totalSupply in kleinste Einheiten, exakt
 *    ganzzahlig; die Summe aller Anteile ist exakt die Gesamtmenge und
 *    passt in den u64-Supply-Wert.
 */
export function buildPlan(input: PlanInput): DistributionPlan[] {
  const { totalSupply, decimals, distribution, owners, mint } = input;

  const names = Object.keys(distribution).filter((k) => typeof distribution[k] === "number");
  const raws = names.map((k) => distribution[k]!);

  // Exakte Prozent-Pruefung: Prozentwerte mit Faktor 1e9 skalieren und als
  // Integer vergleichen (0.81 * 1e9 = 810000000, exakt in der Binary-Repraesentation).
  const S = 10n ** 9n;
  const intScale = 1e9;
  const weights: bigint[] = raws.map((p) => {
    if (typeof p !== "number" || !Number.isFinite(p) || p <= 0) {
      throw new Error("Prozentsatz ungueltig: " + p);
    }
    const n = Math.round(p * intScale);
    if (n <= 0) throw new Error("Prozentsatz ungueltig: " + p);
    return BigInt(n);
  });
  const intSum = weights.reduce((a, b) => a + b, 0n);
  if (intSum !== S) {
    throw new Error(
      "Verteilung addiert sich nicht exakt zu 100 % (Skalierung 1e9: "
      + intSum.toString() + "/" + S.toString() + ")");
  }

  // Owner-Pruefung: exakt einer pro Anteil-Name.
  if (owners.length !== names.length) {
    throw new Error(
      "Zahl der ATA-Owner (" + owners.length +
      ") entspricht nicht der Zahl der Anteile (" + names.length + ")");
  }

  // Gesamtmenge in kleinen Einheiten: totalSupply * 10^decimals.
  if (!Number.isInteger(totalSupply) || totalSupply <= 0) {
    throw new Error("totalSupply muss eine positive ganze Zahl sein");
  }
  const rawTotal = BigInt(totalSupply) * 10n ** BigInt(decimals);
  if (rawTotal > U64_MAX) {
    throw new Error(
      "Gesamtmenge in kleinen Einheiten (" + rawTotal +
      ") ueberlaeuft u64 — siehe tests/config.test.ts fuer die Grenze.");
  }

  // Exakte Anteile: Anteil_i = rawTotal * (p_i * 1e9) / 1e9.
  // Da die Gewichte exakt 1e9 ergeben, ist der letzte Anteil als Rest
  // gesetzt — die Summe aller Anteile ist dann exakt rawTotal (ohne
  // Rundungsreste).
  const rawAmounts: bigint[] = [];
  let used = 0n;
  for (let i = 0; i < names.length; i++) {
    if (i === names.length - 1) {
      rawAmounts.push(rawTotal - used);
    } else {
      const part = (rawTotal * weights[i]) / S;
      rawAmounts.push(part);
      used += part;
    }
  }
  const sumCheck = rawAmounts.reduce((a, b) => a + b, 0n);
  if (sumCheck !== rawTotal) {
    throw new Error("Anteile addieren sich nicht zur Gesamtmenge: " + sumCheck + " != " + rawTotal);
  }

  const tenToDec = 10n ** BigInt(decimals);
  const plans: DistributionPlan[] = [];
  for (let i = 0; i < names.length; i++) {
    const ata = token.getAssociatedTokenAddressSync(mint, owners[i]);
    plans.push({
      name: names[i],
      percent: distribution[names[i]]!,
      rawAmount: rawAmounts[i],
      humanAmount: Number(rawAmounts[i] / tenToDec),
      owner: owners[i],
      ata,
    });
  }
  return plans;
}

/**
 * Die zwei SPL-Standard-Instructions fuer einen einzelnen Emissions-Anteil:
 *  1) ATA idempotent anlegen (Payer: Admin-/Tresor-Wallet, Owner: die
 *     Emissions-Adresse),
 *  2) die exakte Anteil-Menge vom Mint direkt in die ATA minten.
 * Signer fuer die Transaktion: nur der Payer (Mint-Vollmacht + ATA-Payer).
 * Die Emissions-Adresse selbst muss NICHT signieren (ATA-Owner-Pubkey
 * reicht — das Token laedt in ihre ATA).
 */
export function distributeInstructions(
  plan: DistributionPlan,
  mint: PublicKey,
  payer: PublicKey,
) {
  return [
    token.createAssociatedTokenAccountIdempotentInstruction(payer, plan.ata, plan.owner, mint),
    token.createMintToInstruction(mint, plan.ata, payer, plan.rawAmount, []),
  ];
}
