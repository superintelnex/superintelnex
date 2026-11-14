# SIN Live-Research · Slippage-Kurve & Liquiditäts-Tiefe · 2026-11-14 08:26 UTC

Read-only, keyless-APIs. Beleg: Jupiter Swap-API (`lite-api.jup.ag/swap/v1/quote`, SOL→SIN),
DexScreener + GeckoTerminal-24h (08:25 UTC). Keine Tx.

## 1. Slippage-Kurve (SOL → SIN, via Raydium CLMM `4erqAhdH…`)

| Input | Out (SIN) | Out (SIN, 5 Dez.) | Beobachtung |
|---|---|---|---|
| 0.001 SOL (1e6 lam) | 1.052.031.689.280 raw | 10.520.316.893 | klein, ~1 % impact |
| 0.01 SOL (1e7 lam) | 10.369.334.537.300 raw | 103.693.345.373 | skaliert ≈ linear |
| 0.1 SOL (1e8 lam) | 90.679.477.744.800 raw | 906.794.777.448 | ≈ 8,6× pro 10×-Input |
| 1.0 SOL (1e9 lam) | 402.120.220.209.800 raw | 4.021.202.202.098 | ≈ 4,4× pro 10×-Input |

**Befund (Liquiditäts-Tiefe):**
- Bis ~0.01 SOL: nahezu linear (0,001→0,01 SOL = 9,9× mehr Output für 10× Input).
- Ab 0,1→1,0 SOL: **nicht-linear (4,4× statt 10×)** → die konzentrierte CLMM-Range
  `[179280, 259280]` (akt. Tick 207767) hat ihre aktive Tiefe hier aufgebraucht.
- **Praxis-Empfehlung (read-only):** größere Order (>0.1 SOL) in Tranchen ≤0.1 SOL
  splitten, um Slippage zu minimieren. Geringe Vol ($119,79/24h) + konzentrierte Liq →
  Price-Impact bei Volumen-Spitzen ist das Haupt-Risiko.

## 2. Live-24h (08:25 UTC, DexScreener/GeckoTerminal)

| Metrik | Wert |
|---|---|
| Preis | $0.000000000007508 / 0.00000000000009489 SOL |
| Vol-24h | $119.79 (Gecko: $119.81) |
| Buys / Sells (24h) | 287 / 279 (ausgewogen) |
| 24h-Preis-Änderung | +60.32 % |
| Liquidität | $82.21 (Base 4,94T raw · Quote 0.5702 SOL) |
| FDV / MCap | $751 |
| Unique-Konten | 3 Buyer / 1 Seller (Gecko) |

## 3. Empfehlung an Operator

- **Kein Handlungsbedarf (halten):** Flow ausgewogen, LP 100 % gelockt, Holding ≥30 % intakt.
- **Tiefe beobachten:** bei Vol-Break >$500/24h oder Tick-Verschiebung >±2000 Ticks →
  Rebalancing-Simulation (CLMM-Tick-Konzentration) anstoßen (read-only, kein Trade).
- **S1-AddLiquidity / F9Sj9a-Sweep** (#35) bleibt operator-blockiert — die Tiefe-Befunde oben
  stützen genau diese Maßnahme: zusätzliche LP-Range über das aktuelle Band würde den
  Slippage-Knick bei >0.1 SOL abfedern.

*Keine Preisprognosen. Alle Zahlen Punktueller-Stand, public-reproduzierbar.*
