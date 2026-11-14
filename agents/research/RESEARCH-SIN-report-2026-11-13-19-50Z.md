# RESEARCH · SIN-Coin — Erster Nacht-Research-Report (Fable, ~19:50Z 13.11)

Order: "deine aufgaben die ganze nacht an diesen coin zu forschen und weiter
zu arbeiten mit anderen agenten". Dieser Report ist die First-Delivery; alle
5 min liefert der Research-Loop (PID 90888, watchdog-registriert) neue
Blöcke in `agents/research/RESEARCH-SIN.log`, Preisserie in
`price-series.csv` (gitignored-freundlich: liegt unter agents/research/,
Commit-Status siehe Repo .gitignore).

## 1) Markt-Bild (19:47–19:48Z, DexScreener + Jupiter)
- Preis: **$5,05e-12/USD** (0.000000000005050)
- 24h-Volumen: **$102,5** (extrem dünn) · Buys/Sells 24h: **225/225**
- Liquidität (DexScreener-USD): **$68,84**
- Jupiter 0,001 SOL → **1,578693e15 raw-SIN** (≈1,578 Mio SIN), Price-Impact 0.0

## 2) Pool-Bild (CLMM `4erqAhdH…`, Dual-RPC + SDK-Snapshot `pool-state.ts`)
- Liquidity (invariant, raw): **20.031.261.577.933**
- tickCurrent: **~211.830** (aktuell live-gelesen 211.830; schwankt mit Trades)
- TickArrays: **178800 + 259200** (2 Arrays, PDA-generiert, nie hardcoden)
- SDK-Quote (lokal): 1 SOL → **529.853.519.762.063.006 raw-SIN** (≈529,85 Mio)
- Pool-24h-Volumen (raw-Counter, Offset-160-Decode): im Log pro Tick
- Fee-Rate (AmmConfig `4BLNHt…`): **tradeFeeRate=100 (0,01 %)**, configVersion=2

## 3) Position & P&L (Ticket #6, Stand nach Round-Trip 16:25Z)
- SIN-ATA: **254.987.574.158.182.884 raw = 2,550 Trd SIN** (97,6 % der
  Ursprungslagerung 2,613 Trd intakt → Ticket #6 Hold ≥30 % erfüllt,
  wir liegen bei ~97,6 %)
- Round-Trip-Verlust (26,126 Mio SIN 10-%-Zyklus): Buy-Leg 0.012 SOL →
  19,846 Mio SIN; Sell-Leg 26,126 Mio SIN → 0,015918391 SOL.
  Spread+Fee im Zyklus = ~0,3–1 % (fein zu 0,01-%-Fee + 2-Runden-
  Slippage auf 1,58 Mrd SIN-Basis)
- Provider-Wallet: ~8,7–8,84e6 lamports frei (0,0087 SOL), WSOL-ATA
  aktuell ABSENT (nach Sell-back geschlossen — exakt wie designed),
  SIN-ATA aktiv

## 4) Externe Aktivität (Watchlist, No-Action)
- 2 externe Signaturen (13.11, erkannt 15:xxZ): `49F8SRgi7qRf…` +
  `SLyFGSddfVdz…` — beide **fehlgeschlagene Simulationen/Queries**,
  keine Funds-Bewegung, kein ATA-Build-Versuch → keine Reaktion,
  aber weiter im Research-Log beobachtet.
- CIO-Loop-Status: `free=0,006557 SOL, ATA(wsol=0,sin=1),
  buy_fähig=-0,019760 — WAART AUF DEPOSIT` (Deposit-Trigger aktiv,
  Single-Writer-Gewährung durch CIO-Live-Guard)

## 5) Nächste Schritte (Nacht-Plan)
1. Research-Loop tickt alle 5 min (DexScreener+Jupiter+Pool+Provider+
   Team-Kanal) → Log + CSV; Watchdog (`agent-watchdog.sh` + Registry
   `research-loop`) revivt bei Crash.
2. `pool-state.ts` = SDK-Deep-Snapshot (Liquidity/Tick/Quote/Config),
   on-Demand + für Quote-Drift-Checks.
3. Team-Koordination: Inbox-Notizen an cio/fable/designer + Outbox-
   Status-Note (diese Lieferung) + GitHub-Push.
4. Bei Deposit ≥ 0,005 SOL (CIO) / 12e6-lp-Schwelle (Fable, neu):
   Single-Writer-Fire; bei EXTERNAL-ACTIVITY: Watchdog-Wake (ceo-trader).
