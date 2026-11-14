# Issue #38 — CLMM-Depth-Rebalancing-Simulation · Abgabe Fable 08:45 UTC

**Status: ABGESCHLOSSEN (read-only, keine Tx).** Tool: `agents/research/clmm-depth-sim.ts` (Deno,
NUR lokale Mathematik — sendet nichts). Belege: Jupiter-Live-Quotes 08:26 UTC + Pool-Snapshot 08:37 UTC
(`_pool-snapshot.ts`, on-chain: tickCurrent 207767, L-Base 20,031,261,577,933, Provider 0.005993 SOL).

## 1. Kernergebnis: Der Pool ist ein exakter CPMM — keine verdeckte Tiefe

2-Punkt-Fit (0.001/0.01 SOL Jupiter) → aktive Reserven: **y0 = 0.617 SOL · x0 = 6.503e9 SIN**
(K = L² = 4.01e9, p0 = 9.49e-11 SOL/SIN).

**Verifikation: alle 4 Jupiter-Punkte (0.001/0.01/0.1/1.0 SOL) werden mit Residuum <1e-6 % wiedergegeben.**
→ Es gibt KEINE „aufgebrauchte Tiefe" / verdeckte Reserven: Die Slippage-Charakteristik ist der reine
AMM-Verlauf einer dünnen CLMM-Range (Tick-Space 10, Range [179280, 259280]).

## 2. Echte Slippage-Werte (Basis, f = 1)

| Order (SOL) | Slippage |
|---|---|
| 0.001 | 0.16 % |
| 0.01 | 1.6 % |
| 0.1 | **13.9 %** |
| 0.5 | 44.8 % |
| 1.0 | 61.8 % |

Praxis-Regel: **Ordern ≤0.01 SOL = <2 % Slippage** — darüber skaliert quadratisch-nah.

## 3. Szenarien (addLiquidity / Range-Erweiterung, L skaliert um Faktor f)

| Szenario | 0.1 SOL | 0.5 SOL | 1.0 SOL |
|---|---|---|---|
| Basis | 13.9 % | 44.8 % | 61.8 % |
| +100 % L (S2, 0.5 SOL-LP) | 7.5 % | 28.8 % | 44.8 % |
| +200 % L | 5.1 % | 21.3 % | 35.1 % |
| +400 % L | 3.1 % | 13.9 % | 24.5 % |

## 4. Empfohlener Fahrplan (read-only, Execution nur via Provider-Owner + Express-Freigabe #35)

- **Ziel 1 (Empfehlung): +200 % LP** = Slippage bei 0.1 SOL ≤5.1 % — abgedeckter Standard-Flow,
  ~1.5 SOL Quote-Reserve (0.617×3). CU: addLiquidity ≈ 550k (0 neue Tick-Arrays, PDA-Existenz-Check
  gemäß cio-Fahrplan S1/S2). ±1000-Tick-Range-Erweiterung ≈ 710k CU (2 neue Arrays).
- **Ziel 2 (Budget-Sparmaß): +100 % LP (S2, 0.5 SOL)** = 0.1 SOL auf 7.5 % — guter Kompromiss
  bei kleinem Budget.
- **Nicht empfohlen:** ±1000-Tick-Erweiterung ALLEIN (Tiefe am Rande, Slippage im Zentrum unverändert).

## 5. Trigger-Automation (läuft)

Fable-Monitor (65289, 15-Min-Takt): bei Vol-Break >$500/24h oder Tick-Verschiebung >±2000 (akt.
207767) → Simulation aktualisieren + Digest. Nächste Prüfung im 2h-Cron-Takt.

**Keine On-Chain-Tx. Alle Zahlen public-reproduzierbar (Jupiter-Quote + Solana-RPC-Read).**
