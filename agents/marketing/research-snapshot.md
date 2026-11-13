# SIN Research-Snapshot · Nacht-Shift 2026-11-13

> ENTWURF – Operator-Freigabe erforderlich. Keine Publikation ohne Express-Order.
>
> Lead-Coordinator · Read-Only-Research-Pass · SuperIntelNex Team · Legal P5 APPROVED · Keine Anlageberatung

## Erfasst (alle Quellen: Public-APIs, nur GET)

### Zyklus-3-Refresh · 19:59 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (19:59 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005063 (5.063e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $105.84 | api.dexscreener.com |
| 24h Buys / Sells | 239 / 239 (ausgewogen) | api.dexscreener.com |
| 1h Buys / Sells | 63 / 64 · Vol-1h $17.74 (−0.83 %) | api.dexscreener.com |
| 24h Preis-Änderung | +0.62 % | api.dexscreener.com |
| LIQ-USD | $69.01 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $506 | api.dexscreener.com |
| Liq (Cross-Check) | $69.26 · Vol-24h $105.93 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.52 % — Abweichung zu DexScreener (+0.62 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK.

### Vorrunde (DexScreener-Logblock 21:22) — zur Abfolge

| Metrik | Wert | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005055 (5.055e-12) | DexScreener |
| 24h-Volumen | $103.97 | DexScreener |
| 24h Buys / Sells | 231 / 231 | DexScreener |
| LIQ-USD | $68.90 | DexScreener |

## Jupiter-Quote (read-only)

- **0.001 SOL (1.000.000 Lamports) → 1.578.687.769.048.521 raw-SIN**
- = 15.786.877.690,48521 SIN (5 Dez.)
- Slippage-Limit: 100 bps · Price-Impact: ~1 %
- Route: 100 % Raydium CLMM (Pool `4erqAhdH…`)
- Implies ≈ 0.000000000000063345 SOL pro SIN (Quote-Durchlaufpreis)

## Pool-CLMM (via `agents/research/pool-state.ts`, Deno, nur getAccountInfo)

- **Pool-Liquidity (raw, active): 20.031.261.577.933**
- **Tick-Current: 211.830** (tickArrays: 178800, 259200)
- sqrtPriceX64: 733.702.937.648.204.908.164.955
- Quote 1 SOL → SIN (lokale Swap-Sim): 5.298.520.138.737.109.342 raw-SIN (≈ 5.2985e13 SIN, Konzentration → nicht linear skalierbar)
- Quote 10 Mio SIN → SOL: lokale Sim schlägt fehl (bekannter tickNext-Bug, sell-Richtung) → lineare Approx aus der SOL-in-Quote: **≈ 18.873 Lamports** (≈ 0.0189 SOL) – nur grobe Schätzung

## Kontext aus RESEARCH-SIN.log (letzter Block 19:52:54Z)

- Provider-Wallet `DNEBNjtW…`: LP-Position ≈ 6.495.317 lp · SIN-ATA ≈ 2.549.875.741.581.8286 raw (≈ 25.499.757.415.828286 SIN, 5 Dez.)
- Ticket #6: Hold-Anforderung ≥ 30 % – aktuell ~97,6 % intakt (Operator-Kontext)
- Team-CIO-Status: Wallet free ≈ 0.0065 SOL, DCA-Fills 0 – "WAART AUF DEPOSIT" (kein Action-Call, nur Status)

## Einordnung für die Content-Ersteller

- Kleiner, neu auf Raydium CLMM gelisteter Pool (Pair-Erstellung lt. DexScreener: 2026-11-10, ~3 Tage alt)
- Volumen sehr niedrig (2-stellig USD/24h), Buys/Sells exakt ausbalanciert – typisch für frühe Phase
- Keine Preisprognose, keine Pump-Sprache – Entwürfe nutzen ausschließlich diese Datenpunkte

*Snapshot-Zeitpunkt: 2026-11-13 ~20:00 UTC (Zyklus 3, Nacht-Shift) · Alle Werte Punktueller Stand, keine Prognosen. 15-Min-Takt-Abstand zu weiteren API-Queries eingehalten (1 Call/Quelle).*
