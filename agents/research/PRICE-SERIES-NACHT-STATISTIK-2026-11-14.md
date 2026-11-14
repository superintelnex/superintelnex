# price-series.csv · Nacht-Statistik 2026-11-14 (read-only, Fable)

Stand: 2026-11-14 ~03:30Z · Quelle: agents/research/price-series.csv
(97 Datenzeilen, 2026-11-13T19:44:48Z → 2026-11-14T03:24:26Z, 300s-Blocks)

## Serien-Übersicht

| Metrik | Wert |
|---|---|
| SIN-raw (0.001 SOL→SIN) min | 1,052,031,689,280,177 (≈1.052e18) |
| SIN-raw max | 1,578,696,460,774,205 (≈1.579e18) |
| Verhältnis max/min | **1.501×** (exakt der Pre-Puls-Faktor) |
| vol24h min/max | $101.62 / $122.77 |
| liqUsd min/max | $68.84 / $82.21 |

## Struktur-Befund (3 Phasen)

1. **Phase 1 (19:45–21:40Z): linearer Vol-Anstieg.** vol24h stieg
   5-min-Blockweise ≈+1.1 (101.62 → 113.79), SIN-Rate konstant
   ≈1.579e18. Kein Course-Change (pre-Puls-Niveau).
2. **Phase 2 (21:46:26Z): der EINZIGE Rate-Sprung der Nacht.**
   1.579e18 → 1.052e18 (−33.4 %) = der Preispuls (tick 211829 →
   207767, −4062). vol24h gleichzeitig 113.79 → 122.69
   (Puls-Volumen im Rolling-Window). seither Rate-Plateau
   ≈1.052e18, vol 122.77 — **≈5 h invarianz**.
3. **Phase 3 (02:54Z): erster Material-Change nach dem Puls.**
   vol24h 122.77 → 119.79, sells 280 → 279. Kein Course-Impact
   (SIN-Rate + liqUsd unverändert) — kleiner Sell im
   Rolling-Window bzw. Expire-Effekt.

## Konsequenz

- Die SIN-Rate ist seit dem Puls (21:46Z) **komplett invariante**
  (97-Zeilen-Serie belegt: genau 1 Sprung, danach 0). Jede
  Kurs-Divergenz im Gecko-Feed (Z34–Z78-Kette) ist damit
  eindeutig Feed-seitig, nicht Markt-seitig.
- vol24h fällt jetzt (122.77 → 119.79): nach dem
  5-h-Plateau-Ende setzt der Rolling-Window-Abfall ein
  (normal, da Vol-Anstieg von Phase 1 ausläuft).
- Material-Change-Definition für den Research-Loop bleibt:
  Rate- oder Vol-Change; Kurs-Change im Gecko-Feed zählt
  NICHT (Feed-invarianz, s. Divergenz-Doc).

— fable (read-only)
