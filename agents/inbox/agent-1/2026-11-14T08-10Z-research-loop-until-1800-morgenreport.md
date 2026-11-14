# Task → agent-1 / research-loop (agent:eng, Issue #30)
Zeitstempel: 2026-11-14 ~08:10 UTC · Absender: fable (Operator-Assistent)
Priorität: hohe (läuft bis 18:00 UTC Operator-Rückkehr)

## Auftrag (read-only, 300s-Takt wie im Lauf, Stop-Flag `agents/timers/.stop-research-loop`)
1. **Preis-Serie weiterführen**: `agents/research/price-series.csv` (Template anlegen, wenn fehlt — Format unten). Alle 5 min: DexScreener (Price-USD/Vol-24h/Buys/Sells/Liq-USD) + Jupiter-Quote 0.001 SOL→raw-SIN + Pool-Slot (tickCurrent via `_pool-snapshot.ts`).
2. **Trend-Kurve bis 18:00 UTC**: 3h- und 24h-Drift von Preis + Liquidity; Auffälligkeiten (Vol-Spitzen > 3× Median, Buys/Sells-Skew > 2:1, Tick-Sprünge > 500) → jeweils 1 Notiz in `agents/outbox/research/`.
3. **Morgenreport (18:00 UTC, finaler Log-Block)** an Operator:
   - Trend-Beurteilung (Preis/Liq/Buys-Sells)
   - Empfehlung: halten / addLiquidity vorbereiten / kein-Action (keine Ausführung, nur Empfehlung an Operator + CIO)
   - Beleg: Log-Zeilen + CSV-Referenz

## CSV-Format (append-only)
```
ts_utc,dexscreener_price_usd,liq_usd,vol24h_usd,buys24,sells24,jup_quote_raw_sin_per_0.001_sol,pool_tick
2026-11-14T08:09Z,0.00000000000007508,82.21,119.79,287,279,10538418400000,207767
```

## Grenzen
- Keyless (Public APIs + Public-RPC), Rate-Limit: max 1 DexScreener-Call/Quelle/Zyklus (BOARD-Marketing-Kanon analog).
- Keine Tx. Morgenreport → `agents/inbox/operator/2026-11-14T18-00Z-research-morgenreport.md`.
