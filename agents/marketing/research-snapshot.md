# SIN Research-Snapshot · Nacht-Shift 2026-11-13

> ENTWURF – Operator-Freigabe erforderlich. Keine Publikation ohne Express-Order.
>
> Lead-Coordinator · Read-Only-Research-Pass · SuperIntelNex Team · Legal P5 APPROVED · Keine Anlageberatung

## Erfasst (alle Quellen: Public-APIs, nur GET)

### Zyklus-12-Refresh · ~20:24 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:24 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005072 (5.072e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $111.02 | api.dexscreener.com |
| 24h Buys / Sells | 262 / 262 (ausgewogen, per GeckoTerminal — DexScreener meldete diese Runde wieder keine Tx-Zahlen) | api.geckoterminal.com |
| 1h Buys / Sells | 63 / 63 (Gecko) · Vol-1h $14.99 (Dex, +0.17 %) | api.dexscreener.com / api.geckoterminal.com |
| 24h Preis-Änderung | +0.79 % | api.dexscreener.com |
| LIQ-USD | $69.14 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.35 · Vol-24h $110.73 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.24 % — Abweichung zu DexScreener (+0.79 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Hinweis: DexScreener meldete diese Runde erneut `transactions` ohne 24h-Details (kein 429/4xx) — 24h-Buys/Sells (262/262) aus GeckoTerminal entnommen, transparent notiert (Anomalie wechselt zwischen den Runden: Zyklus 11 mit Tx-Zahlen, Zyklus 12 ohne). Vergleich Zyklus 11 → 12: Vol $110.64 → $111.02 (flat +0.3 %), Liq $69.14 → $69.14 (Dex flat; Gecko-Cross-Check $69.35 → $69.35), Flow 262/262 → 262/262 (flat, weiterhin exakt ausbalanciert), 24h-Preis-Change +0.79 % (flat), FDV $507 (flat).

### Zyklus-11-Refresh · ~20:21 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:21 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005072 (5.072e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $110.64 | api.dexscreener.com |
| 24h Buys / Sells | 262 / 262 (ausgewogen — diese Runde mit Tx-Zahlen bei beiden Quellen) | api.dexscreener.com / api.geckoterminal.com |
| 1h Buys / Sells | 62 / 62 (Dex) · 63 / 63 (Gecko) · Vol-1h $14.90 | api.dexscreener.com / api.geckoterminal.com |
| 24h Preis-Änderung | +0.79 % | api.dexscreener.com |
| LIQ-USD | $69.14 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.35 · Vol-24h $110.73 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.24 % — Abweichung zu DexScreener (+0.79 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Hinweis: DexScreener meldete diese Runde wieder Tx-Zahlen (262/262, h1 62/62, h6 262/261) — die Zyklus-10-Anomalie (`transactions: null`) war punktuell; Flow-Quellennachweis: beide APIs. Vergleich Zyklus 10 → 11: Vol $109.47 → $110.64 (+1.1 %), Liq $69.28 → $69.14 (Dex −0.2 %; Gecko-Cross-Check $69.28 → $69.35), Flow 256/256 → 262/262 (weiterhin exakt ausbalanciert, +6/+6), Preis-Change-24h DexScreener +1.01 % → +0.79 %, FDV $508 → $507 (Rollfenster-Drift).

### Zyklus-10-Refresh · ~20:15 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:15 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005082 (5.082e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $109.47 | api.dexscreener.com |
| 24h Buys / Sells | 256 / 256 (ausgewogen, per GeckoTerminal — DexScreener meldete diese Runde keine Tx-Zahlen) | api.geckoterminal.com |
| 1h Buys / Sells | 63 / 63 · Vol-1h $15.82 (+0.29 %) | api.dexscreener.com / api.geckoterminal.com |
| 24h Preis-Änderung | +1.01 % | api.dexscreener.com |
| LIQ-USD | $69.28 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $508 | api.dexscreener.com |
| Liq (Cross-Check) | $69.28 · Vol-24h $109.56 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.31 % — Abweichung zu DexScreener (+1.01 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Hinweis: DexScreener meldete diese Runde `transactions: null` (kein 429/4xx) — 24h-Buys/Sells (256/256) aus GeckoTerminal entnommen, transparent notiert. Vergleich Zyklus 9 → 10: Vol $108.66 → $109.47 (+0.7 %), Liq $69.20 → $69.28 (Dex +0.1 %; Gecko-Cross-Check $69.47 → $69.28), Flow 252/252 → 256/256 (weiterhin exakt ausbalanciert, +4/+4 per GeckoTerminal), Preis-Change-24h DexScreener +0.89 % → +1.01 %, FDV flat $508.

### Zyklus-9-Refresh · ~20:15 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:15 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005077 (5.077e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $108.66 | api.dexscreener.com |
| 24h Buys / Sells | 252 / 252 (ausgewogen) | api.dexscreener.com |
| 1h Buys / Sells | 63 / 63 · Vol-1h $16.23 (+0.40 %) | api.dexscreener.com |
| 24h Preis-Änderung | +0.89 % | api.dexscreener.com |
| LIQ-USD | $69.20 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $508 | api.dexscreener.com |
| Liq (Cross-Check) | $69.47 · Vol-24h $108.75 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.34 % — Abweichung zu DexScreener (+0.89 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Vergleich Zyklus 8 → 9: Vol $108.03 → $108.66 (+0.6 %), Liq $69.20 → $69.20 (Dex flat, Gecko-Cross-Check $69.36 → $69.47), Flow 249/249 → 252/252 (weiterhin exakt ausbalanciert, +3/+3), Preis-Change-24h DexScreener +0.89 % (flat zu Zyklus 8).

### Zyklus-8-Refresh · 20:09 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (20:09 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005077 (5.077e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $108.03 | api.dexscreener.com |
| 24h Buys / Sells | 249 / 249 (ausgewogen) | api.dexscreener.com |
| 1h Buys / Sells | 63 / 63 · Vol-1h $16.54 (+0.40 %) | api.dexscreener.com |
| 24h Preis-Änderung | +0.89 % | api.dexscreener.com |
| LIQ-USD | $69.20 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $508 | api.dexscreener.com |
| Liq (Cross-Check) | $69.36 · Vol-24h $108.12 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.42 % — Abweichung zu DexScreener (+0.89 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Vergleich Zyklus 7 → 8: Vol $107.17 → $108.03 (+0.8 %), Liq $69.13 → $69.20 (Gecko-Cross-Check $69.34 → $69.36), Flow 245/245 → 249/249 (weiterhin exakt ausbalanciert, +4/+4), Preis-Change-24h +0.78 % → +0.89 %.

### Zyklus-7-Refresh · 20:06 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (20:06 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005071 (5.071e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $107.17 | api.dexscreener.com |
| 24h Buys / Sells | 245 / 245 (ausgewogen) | api.dexscreener.com |
| 1h Buys / Sells | 63 / 63 · Vol-1h $16.95 (+0.43 %) | api.dexscreener.com |
| 24h Preis-Änderung | +0.78 % | api.dexscreener.com |
| LIQ-USD | $69.13 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.34 · Vol-24h $107.05 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.41 % — Abweichung zu DexScreener (+0.78 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Vergleich Zyklus 6 → 7: Vol $106.73 → $107.17 (+0.4 %), Liq $69.13 → $69.13 (flat, Gecko-Cross-Check $69.22 → $69.34), Flow 243/243 → 245/245 (weiterhin exakt ausbalanciert, +2/+2).

### Zyklus-6-Refresh · 20:04 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (20:04 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005071 (5.071e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $106.73 | api.dexscreener.com |
| 24h Buys / Sells | 243 / 243 (ausgewogen) | api.dexscreener.com |
| 1h Buys / Sells | 63 / 63 · Vol-1h $17.16 (+0.43 %) | api.dexscreener.com |
| 24h Preis-Änderung | +0.78 % | api.dexscreener.com |
| LIQ-USD | $69.13 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.22 · Vol-24h $106.83 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.41 % — Abweichung zu DexScreener (+0.78 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Vergleich Zyklus 5 → 6: Vol $106.51 → $106.73 (+0.2 %), Liq $69.13 → $69.13 (flat, Gecko-Cross-Check $69.29 → $69.22), Flow 242/242 → 243/243 (weiterhin exakt ausbalanciert).

### Zyklus-5-Refresh · 20:04 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (20:04 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005071 (5.071e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $106.51 | api.dexscreener.com |
| 24h Buys / Sells | 242 / 242 (ausgewogen) | api.dexscreener.com |
| 1h Buys / Sells | 63 / 63 · Vol-1h $17.26 (+0.43 %) | api.dexscreener.com |
| 24h Preis-Änderung | +0.78 % | api.dexscreener.com |
| LIQ-USD | $69.13 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.29 · Vol-24h $106.61 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.53 % — Abweichung zu DexScreener (+0.78 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Vergleich Zyklus 4 → 5: Vol $106.29 → $106.51 (+0.2 %), Liq $69.01 → $69.13, Flow 241/241 → 242/242 (weiterhin exakt ausbalanciert).

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

*Snapshot-Zeitpunkt: 2026-11-13 ~20:24 UTC (Zyklus 12, Nacht-Shift-Fortsetzung; Zyklus-11-Block ~20:21 UTC davor) · Alle Werte Punktueller Stand, keine Prognosen. 15-Min-Takt-Abstand zu weiteren API-Queries eingehalten (1 Call/Quelle).*
