// CLMM-DEPTH-SIMULATION (read-only, NUR LOKALE MATH — sendet NIENTS).
// Zweck: Issue #38 — Liquiditäts-Tiefe / Slippage von SIN (Raydium CLMM `4erqAhdH…`).
//
// Modell: Innerhalb der aktiven Range [179280, 259280] verhält sich der CLMM
// wie ein konstantes-Produkt-AMM mit K = L² (x0 = L/sqrtP, y0 = L·sqrtP,
// x0·y0 = L²). Bei L-Skalierung um Faktor f: y0' = f·y0 → Slippage skaliert ~1/f.
//
// Fit: 2 IN-RANGE-Punkte (0.001 / 0.01 SOL) bestimmen y0 (Quote-Reserve) + x0 (Base-Reserve).
// Verifikation: alle 4 Jupiter-Punkte (08:26 UTC) gegen Fit → Residuen.
//
// Aufruf: /Users/haqmal/.deno/bin/deno run agents/research/clmm-depth-sim.ts

// Jupiter-Live 08:26 UTC (SOL→SIN, 100% Raydium CLMM), [Δy SOL, xOut SIN]
const JUP: [number, number][] = [
  [0.001, 10.520316893e6],
  [0.01,  103.693345373e6],
  [0.1,   906.794777448e6],
  [1.0,   4021.202202098e6],
];

// --- Fit y0, x0 aus den 2 kleinsten (in-range) Punkten ---
const [d1, x1] = JUP[0]; // 0.001 SOL
const [d2, x2] = JUP[1]; // 0.01 SOL
// xOut = x0·Δy/(y0+Δy)  →  y0 = Δy1·Δy2·(x2−x1) / (x1·Δy2 − x2·Δy1)
const y0 = (d1 * d2 * (x2 - x1)) / (x1 * d2 - x2 * d1); // SOL (Quote-Reserve)
const x0 = x1 * (y0 + d1) / d1;                          // SIN (Base-Reserve)
const K = x0 * y0;                                        // = L²
const L = Math.sqrt(K);
const p0 = y0 / x0;                                       // SOL pro SIN (Spot)

console.log("CLMM-DEPTH-SIM · Issue #38 · Beleg 08:26 UTC (Jupiter, 100% Raydium CLMM)");
console.log("FIT (2 in-range Punkte 0.001/0.01 SOL):");
console.log(JSON.stringify({
  y0_SOL: +y0.toPrecision(4), x0_SIN: +x0.toPrecision(5), K_L2: +K.toPrecision(4), L: +L.toPrecision(5),
  p0_SOL_per_SIN: +p0.toPrecision(4),
}, null, 0));

// --- Verifikation gegen alle 4 Jupiter-Punkte ---
console.log("\nFit-Verifikation (xOut = x0·Δy/(y0+Δy), Residuum vs. Jupiter):");
for (const [dy, xout] of JUP) {
  const pred = x0 * dy / (y0 + dy);
  console.log(JSON.stringify({ in_SOL: dy, jup_SIN: xout, fit_SIN: +pred.toPrecision(9), resid_pct: +(((pred - xout) / xout) * 100).toPrecision(3) }));
}

// --- Slippage pro Order-Größe (Basis, f=1) ---
const slip = (dy: number, f = 1) => (dy / (f * y0 + dy)) * 100;
console.log("\nSlippage (Basis, f=1) vs. linearer Spot-Rate:");
for (const o of [0.001, 0.01, 0.1, 0.5, 1.0]) {
  console.log(JSON.stringify({ order_SOL: o, slippage_pct: +slip(o).toPrecision(3) }));
}

// --- Szenarien: L-Skalierung (addLiquidity / Range-Erweiterung) ---
console.log("\nSzenario-Tabelle (Slippage %, kleiner = besser):");
for (const s of [{ f: 1, l: "Basis (L-aktuell)" }, { f: 2, l: "+100% L" }, { f: 3, l: "+200% L (Ziel 0.1SOL≤5%)" }, { f: 5, l: "+400% L" }]) {
  const row: Record<string, string> = {};
  for (const o of [0.01, 0.1, 0.5, 1.0]) row[o + "SOL"] = slip(o, s.f).toFixed(1) + "%";
  console.log(JSON.stringify({ s: s.l, ...row }));
}

// --- Ziel: 0.1 SOL ≤ 5% Slippage → nötiges f ---
const target = 5, dyT = 0.1;
const fNeed = dyT / (target / 100) / y0 - 1 / y0 * dyT; // Δy/(f·y0+Δy)=t → f = (Δy/(t·y0)) − (Δy/y0)·… exakt: f = Δy·(1/(t)−1)/(y0·Δy)·Δy
// korrekt: Δy/(f·y0+Δy) = t/100 → f·y0 = Δy·(100/(t−... )  → f = (Δy/(t/100) − Δy)/y0
const fExact = (dyT / (target / 100) - dyT) / y0;
console.log("\nZiel '0.1 SOL bei ≤5% Slippage':");
console.log(JSON.stringify({ f_notwendig: +fExact.toPrecision(3), L_zusatz_pct: +((fExact - 1) * 100).toPrecision(3), note: "L skaliert um Faktor fExact, d.h. +" + ((fExact - 1) * 100).toFixed(0) + "% LP" }));

// --- CU-Bezug (cio-Fahrplan 13.11.) ---
console.log("\nCU-Bezug: addLiquidity ohne neue Tick-Arrays ≈ 550k CU; ±1000-Tick-Erweiterung ≈ 710k CU. S2 (0.5 SOL) deckt +~… — s. cio-Fahrplan outbox/cio/2026-11-10T16-45Z.");
