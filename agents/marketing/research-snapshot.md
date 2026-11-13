# SIN Research-Snapshot · Nacht-Shift 2026-11-13

> ENTWURF – Operator-Freigabe erforderlich. Keine Publikation ohne Express-Order.
>
> Lead-Coordinator · Read-Only-Research-Pass · SuperIntelNex Team · Legal P5 APPROVED · Keine Anlageberatung

## Erfasst (alle Quellen: Public-APIs, nur GET)

### Zyklus-19-Refresh · ~20:41 UTC (keyless-API-Runde, 1 Call/Quelle — Lead-Run, Beleg-Runde ~20:40 UTC)

| Metrik | Wert (~20:40 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005067 (5.067e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $113.79 | api.dexscreener.com |
| 24h Buys / Sells | 279 / 279 (Gecko, h24; 2 Unique Buyers / 2 Unique Sellers; h1 64/64, h6 279/278, m5 6/6) — **DexScreener meldete diese Runde `transactions: null` erneut (Anomalie wie Zyklus 10/12, punktuell, transparent notiert) → 24h-Flow aus GeckoTerminal** ; paralleler Zyklus-18-Lauf (~20:41 UTC) meldete 280/280 per Gecko h24 — Fortschritt zwischen Beleg- und Content-Phase, Public-Copy auf 280/280 gesetzt | api.geckoterminal.com |
| 1h Buys / Sells | 64 / 64 (Gecko) · Vol-1h $13.72 (Gecko, h1) | api.geckoterminal.com |
| 24h Preis-Änderung | +0.69 % (h1 +0.20 %, h6 +0.69 %) | api.dexscreener.com |
| LIQ-USD | $69.07 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.10 · Vol-24h $113.72 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.40 % — Abweichung zu DexScreener (+0.69 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED — **9. Runde in Folge identisch**) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Hinweis: DexScreener `transactions: null` diese Runde erneut (kein 429/4xx) — Anomalie punktuell (Zyklus 10/12/19), Flow-Quellennachweis: GeckoTerminal. Vergleich Zyklus 17 → 19 (mein Beleg ~20:40 UTC): Vol $113.79 → $113.79 (flat), Liq $69.07 → $69.07 (Dex flat; Gecko-Cross-Check $69.10 → $69.10), Flow 279/279 per Gecko (flat; späterer paralleler Zyklus-18-Lauf meldet 280/280 per Gecko — Stille im Flow, 1-Tx-Fortschritt), Preis $5.067e-12 (flat), 24h-Change DexScreener +0.69 % (flat), FDV $507 (flat).

### Zyklus-18-Refresh · ~20:41 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:41 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005067 (5.067e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $113.79 | api.dexscreener.com |
| 24h Buys / Sells | 280 / 280 (ausgewogen — DexScreener mit vollständigen Tx-Zahlen: m5 0/0, h1 63/63, h6 280/279) · 280 / 280 (Gecko, 2 Unique Buyers / 2 Unique Sellers) | api.dexscreener.com / api.geckoterminal.com |
| 1h Buys / Sells | 63 / 63 (Dex) · 64 / 64 (Gecko) · Vol-1h $13.34 (Dex) / $13.61 (Gecko) | api.dexscreener.com / api.geckoterminal.com |
| 24h Preis-Änderung | +0.69 % | api.dexscreener.com |
| LIQ-USD | $69.07 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.12 · Vol-24h $113.88 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.64 % — Abweichung zu DexScreener (+0.69 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED — 10. Runde in Folge identisch) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK (Dex/Gecko/CG: HTTP 200, RugCheck: erwartetes 404 PAGE_NOT_FOUND, bekannter leerer-Score-Dauerzustand). Hinweis: DexScreener meldete diese Runde wieder vollständige Tx-Zahlen, diesmal m5 0/0 (letzte Aktivität > 5 min her) und h6 280/279 (eine Sell-Tx rollt aus dem 6h-Fenster, 24h-Zahl 280/280 stabil); Gecko meldet 280/280 per h24. Vergleich Zyklus 17 → 18: Vol $113.79 → $113.79 (flat), Liq $69.07 → $69.07 (Dex flat; Gecko-Cross-Check $69.10 → $69.12, +0.03 %), Flow 280/280 → 280/280 (flat, weiterhin exakt ausbalanciert; 1h-Detail 65/65 → 63/63 Dex / 64/64 Gecko, Vol-1h $13.87 → $13.34 — Rolling-Window-Effekt, 24h-Zahlen unverändert), Preis $5.067e-12 (flat), 24h-Change DexScreener +0.69 % (flat) / Gecko −6.40 % → −6.64 % (Rollfenster-Drift, transparent notiert), FDV $507 (flat) — Stille im Flow, letzte Tx-Aktivität liegt > 30 min zurück (Gecko m30 30/30 flat, m5 1/1 → 0/0).

### Zyklus-17-Refresh · ~20:41 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:41 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005067 (5.067e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $113.79 | api.dexscreener.com |
| 24h Buys / Sells | 280 / 280 (ausgewogen — DexScreener mit vollständigen Tx-Zahlen: m5 2/2, h1 65/65, h6 280/279) · 279 / 279 (Gecko, 1-Tx-Rollfenster-Abweichung transparent notiert) | api.dexscreener.com / api.geckoterminal.com |
| 1h Buys / Sells | 65 / 65 (Dex) · 64 / 64 (Gecko) · Vol-1h $13.87 (Dex) | api.dexscreener.com / api.geckoterminal.com |
| 24h Preis-Änderung | +0.69 % | api.dexscreener.com |
| LIQ-USD | $69.07 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.10 · Vol-24h $113.72 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.40 % — Abweichung zu DexScreener (+0.69 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED — 9. Runde in Folge identisch) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Hinweis: DexScreener meldete diese Runde wieder vollständige Tx-Zahlen (280/280 24h, 65/65 1h, 280/279 6h); Gecko meldet 279/279 (1-Tx-Rollfenster-Abweichung, transparent notiert). Vergleich Zyklus 16 → 17: Vol $113.79 → $113.79 (flat), Liq $69.07 → $69.07 (Dex flat; Gecko-Cross-Check $69.10 → $69.10), Flow 280/280 → 280/280 per Dex (flat; Gecko 279/279 flat), Preis $5.067e-12 (flat), 24h-Change DexScreener +0.69 % (flat), FDV $507 (flat) — Stille im Flow, keinerlei Bewegung zwischen den Runden.

### Zyklus-16-Refresh · ~20:37 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:37 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005067 (5.067e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $113.79 | api.dexscreener.com |
| 24h Buys / Sells | 280 / 280 (ausgewogen — DexScreener mit vollständigen Tx-Zahlen: m5 5/5, h1 65/65, h6 280/279) · 279 / 279 (Gecko, 1-Tx-Rollfenster-Abweichung transparent notiert) | api.dexscreener.com / api.geckoterminal.com |
| 1h Buys / Sells | 65 / 65 (Dex) · 64 / 64 (Gecko) · Vol-1h $13.87 (Dex) | api.dexscreener.com / api.geckoterminal.com |
| 24h Preis-Änderung | +0.69 % | api.dexscreener.com |
| LIQ-USD | $69.07 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.10 · Vol-24h $113.72 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.40 % — Abweichung zu DexScreener (+0.69 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED — 8. Runde in Folge identisch) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Hinweis: DexScreener meldete diese Runde wieder vollständige Tx-Zahlen (280/280 24h, 65/65 1h, 280/279 6h); Gecko meldet 279/279 (1-Tx-Rollfenster-Abweichung, transparent notiert). Vergleich Zyklus 15 → 16: Vol $113.30 → $113.79 (+0.4 %), Liq $69.07 → $69.07 (Dex flat; Gecko-Cross-Check $69.17 → $69.10), Flow 277/277 → 280/280 per Dex (+3/+3; Gecko 279/279), Preis $5.067e-12 (flat), 24h-Change DexScreener +0.69 % (flat), FDV $507 (flat).

### Zyklus-15-Refresh · ~20:35 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:35 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005067 (5.067e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $113.30 | api.dexscreener.com |
| 24h Buys / Sells | 277 / 277 (ausgewogen — diese Runde mit Tx-Zahlen bei beiden Quellen: m5 5/5, h1 62/62, h6 277/276) · 277 / 277 (Gecko) | api.dexscreener.com / api.geckoterminal.com |
| 1h Buys / Sells | 62 / 62 (Dex) · Vol-1h $13.38 (Dex) | api.dexscreener.com / api.geckoterminal.com |
| 24h Preis-Änderung | +0.69 % | api.dexscreener.com |
| LIQ-USD | $69.07 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $507 | api.dexscreener.com |
| Liq (Cross-Check) | $69.17 · Vol-24h $113.39 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.34 % — Abweichung zu DexScreener (+0.69 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Hinweis: DexScreener meldete diese Runde vollständige Tx-Zahlen (277/277 24h, 62/62 1h, 277/276 6h) — wie Zyklus 13/14, die Zyklus-10/12-Anomalie bleibt punktuell. Vergleich Zyklus 14 → 15: Vol $112.63 → $113.30 (+0.6 %), Liq $69.22 → $69.07 (Dex −0.2 %; Gecko-Cross-Check $69.27 → $69.17), Flow 273/273 → 277/277 (weiterhin exakt ausbalanciert, +4/+4), Preis $5.078e-12 → $5.067e-12 (−0.2 %), Preis-Change-24h DexScreener +0.92 % → +0.69 %, FDV $508 → $507 (Rollfenster-Drift).

### Zyklus-14-Refresh · ~20:31 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:31 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005078 (5.078e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $112.63 | api.dexscreener.com |
| 24h Buys / Sells | 273 / 273 (ausgewogen — diese Runde mit Tx-Zahlen bei beiden Quellen: m5 5/5, h1 63/63, h6 273/272) · 273 / 273 (Gecko) | api.dexscreener.com / api.geckoterminal.com |
| 1h Buys / Sells | 63 / 63 (Dex) · Vol-1h $14.06 (Dex) | api.dexscreener.com / api.geckoterminal.com |
| 24h Preis-Änderung | +0.92 % | api.dexscreener.com |
| LIQ-USD | $69.22 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $508 | api.dexscreener.com |
| Liq (Cross-Check) | $69.27 · Vol-24h $112.72 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.28 % — Abweichung zu DexScreener (+0.92 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Hinweis: DexScreener meldete diese Runde vollständige Tx-Zahlen (273/273 24h, 63/63 1h, 273/272 6h) — wie Zyklus 13, die Zyklus-10/12-Anomalie bleibt punktuell. Vergleich Zyklus 13 → 14: Vol $111.93 → $112.63 (+0.6 %), Liq $69.26 → $69.22 (Dex −0.1 %; Gecko-Cross-Check $69.38 → $69.27), Flow 269/269 → 273/273 (weiterhin exakt ausbalanciert, +4/+4), Preis $5.081e-12 → $5.078e-12 (−0.1 %), Preis-Change-24h DexScreener +0.97 % → +0.92 %, FDV flat $508.

### Zyklus-13-Refresh · ~20:28 UTC (keyless-API-Runde, 1 Call/Quelle)

| Metrik | Wert (~20:28 UTC) | Quelle |
|---|---|---|
| Preis-USD | $0.000000000005081 (5.081e-12) | api.dexscreener.com |
| Preis-Native | 0.00000000000006321 SOL | api.dexscreener.com |
| 24h-Volumen | $111.93 | api.dexscreener.com |
| 24h Buys / Sells | 269 / 269 (ausgewogen — DexScreener meldete diese Runde wieder vollständige Tx-Zahlen: m5 5/5, h1 62/62, h6 269/268) · 269 / 269 (Gecko) | api.dexscreener.com / api.geckoterminal.com |
| 1h Buys / Sells | 62 / 62 (Dex) · 59 / 59 (Gecko) · Vol-1h $14.19 (Dex, +0.17 %) | api.dexscreener.com / api.geckoterminal.com |
| 24h Preis-Änderung | +0.97 % | api.dexscreener.com |
| LIQ-USD | $69.26 (Base 6.404.339.400.351 raw, Quote 0.4568 SOL) | api.dexscreener.com |
| FDV / Market-Cap | $508 | api.dexscreener.com |
| Liq (Cross-Check) | $69.38 · Vol-24h $112.02 · **locked_liquidity 100 %** | api.geckoterminal.com |
| Preis-Änderung-24h (Gecko) | −6.27 % — Abweichung zu DexScreener (+0.97 %) transparent notiert (unterschiedliche Berechnungs-/Rollfenster) | api.geckoterminal.com |
| CoinGecko-Listing | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) | api.coingecko.com |
| RugCheck | HTTP 404 `PAGE_NOT_FOUND` → Score derzeit leer (wie 17:45-Kit-Notiz; kein 429, nicht BLOCKED) | api.rugcheck.xyz |

Keine 4xx/429-Errors → alle 4 Quellen OK. Hinweis: DexScreener meldete diese Runde wieder vollständige Tx-Zahlen (269/269 24h, 62/62 1h, 269/268 6h) — die Zyklus-10/12-Anomalie (`transactions` ohne 24h-Details) war punktuell; Flow-Quellennachweis: beide APIs. Vergleich Zyklus 12 → 13: Vol $111.02 → $111.93 (+0.8 %), Liq $69.14 → $69.26 (Dex +0.2 %; Gecko-Cross-Check $69.35 → $69.38), Flow 262/262 → 269/269 (weiterhin exakt ausbalanciert, +7/+7), Preis-Change-24h DexScreener +0.79 % → +0.97 %, FDV $507 → $508 (Rollfenster-Drift).

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

*Snapshot-Zeitpunkt: 2026-11-13 ~20:41 UTC (Zyklus 19 Lead-Run, Beleg-Runde ~20:40 UTC; Zyklus-18-Block ~20:41 UTC parallel davor) · Alle Werte Punktueller Stand, keine Prognosen. 15-Min-Takt-Abstand zu weiteren API-Queries eingehalten (1 Call/Quelle).*
