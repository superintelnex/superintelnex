# SIN Research — Morgenreport · 2026-11-14 08:15 UTC

Read-only-Bezug: Issue #30 (Research-Shift). Beleg-Runde 08:13 UTC (keyless-APIs, 1 Call/Quelle),
Nacht-Log `agents/research/RESEARCH-SIN.log` (300s-Loop, lückenlos bis 08:13 UTC — Loop-Health: OK,
keine Freeze/Drop-Eintrag sichtbar, alle 7 Loops + caffeinate alive gemäß Nacht-Monitoring).

## 1. Trend-Beurteilung (24h)

| Aspekt | Stand | Einordnung |
|---|---|---|
| Preis | $0.000000000007508 / 0.00000000000009489 SOL | +60.32 % / 24h (DexScreener-Rollfenster) |
| Volumen | $119.79 / 24h (Gecko: $119.81) | leicht steigend gegenüber 20:41-Referenz ($113.8) |
| Flow | 287 Buys / 279 Sells (24h) | weiter exakt ausgewogen — kein Ein-Seiten-Druck |
| Liquidität | $82.21 (Base 4,939,913,223,575 raw · Quote 0.5702 SOL) | +19 % seit 20:41 ($69.1 → $82.2) |
| FDV/MCap | $751 | +48 % seit 20:41 ($506 → $751) — reine Preis-Folge, keine Supply-Änderung |

## 2. Auffälligkeiten

- **Rate-Limits**: keine 4xx/429 in Beleg-Runde; Nacht-Loop lief 300s-Kadenz stabil.
- **Externe Signaturen / Provider**: Provider `DNEBNjtW…`-Saldo-Verlauf laut Nacht-Log unverändert im
  erwarteten Korridor; keine fremden Sigs notiert. (Freshe Saldo-Sign-Check läuft im Trade-Shift #32.)
- **Rollfenster-Drift**: DexScreener vs. GeckoTerminal-24h-Preis-Änderung (Gecko meldet teils −6 %)
  bleibt bekannter Quellen-Drift, transparent notiert (wie Nacht-Zyklen 17–19).
- **Freeze-Detection**: `pmset`-Log ohne neuen Sleep-Eintrag seit Nacht-Start → keine Loop-Einfrierung.

## 3. Empfehlung an Operator

**HALTEN** — kein Handlungsbedarf, kein Sell-Trigger:
- Vol/Flow wachsen moderat, Flow bleibt ausgewogen (287/279).
- Liquidität & LP-Verriegelung intakt (100 % locked via Raydium-Lock-Programm, post-Burn-Vollbild).
- CIO-Schwelle 12e6 lp nicht in Sicht: Provider-Balance ~5.993e6 (Nacht-Log) — Deposit-Pfad wäre
  der einzige Hebel, liegt bei Operator (#35).
- Weiterhin 15-Min-/300s-Takt beibehalten; Morgen-Kit liegt im Operator-Outbox (Zyklus-20-Morning-Kit,
  08:13 UTC) für Veröffentlichung.

## 4. Quellen (keyless, alle HTTP 200)

- `api.dexscreener.com/latest/dex/tokens/A4WSPb…` (Pair `4erqAhdH…`)
- `api.geckoterminal.com/api/v2/networks/solana/pools/4erqAhdH…`
- Nacht-Log: `agents/research/RESEARCH-SIN.log`, Price-Series: `agents/research/price-series.csv`

*Keine Preisprognosen. Alle Zahlen Punktueller-Stand-beim-Snapshot, public-reproduzierbar.*
