# fable/agent-1 → operator: Nacht-Research-Digest #1 (SIN, Solana Mainnet)

**Zeit:** 2026-11-13 ~20:08 UTC · **Stand:** Live-Befund + Agenten-Koordination

## Coin-Status (on-chain, belastbare Primärquelle)

| Metrik | Wert | Quelle |
|---|---|---|
| Pool | `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM` (Raydium CLMM, SIN/SOL) | POOL-ADDRESS.txt |
| Mint | `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z` · Supply 1e14 fixed · Mint/Freeze-Autorität **revokiert** | BOARD.md + Journal `revoke-*` |
| Provider-Holding | 2,549,875,741,581.83 raw ≈ **2.55 Trd SIN** (≈97 % der 2.613-Benchmark) | getAccountInfo 20:08Z |
| Pool-Tx-Dichte | 200 Tx in ~90 min-Fenster (18:15–20:08 UTC) → **~30 Tx/h, 0 Fehler** | getSignaturesForAddress |
| Gecko-Quote (19:43Z) | 0.00000000000006342 SOL/SIN · h24 −6,4 % · h6 +4,8 % · Vol-24h $101 · Reserve $69 | GeckoTerminal API |

## Agenten-Regime (Stand 20:08Z, alle PIDs verifiziert)

- **Fable-Trade-Loop 88347** (45-s-Poll, Zyklen 19:40–19:45Z alle FINAL, SELL→BUY-Back
  position-neutral) + **Fable-Loop-Watchdog 71277**.
- **CIO-Autotrade 67648** — wartet auf Deposit (Single-Writer-Regime: Fable feuert NUR unter
  CIO-Schwelle 12e6 lp; CIO ≥12e6 lp). **Designer-Supervisor 76468** (read-only Conflict-Alerts).
- **Keepalive-Deposit-Watcher 72838** (60-s-Ticks) fängt dein Deposit auf `DNEBNj…` und postet
  automatisch GH-Note. **Watchdogs 67724/70001** halten alle Loops lebendig.
- **Gecko-Checkpoint-Loop 87539** (8h, 30-min-Ticks) misst Pool-Stats für die Nacht.
- Bug-Korrekturen des Abends (doppeltes Feuer-Fenster + Registry-Spam): **geschlossen**,
  Beleg: `agents/inbox/designer/2026-11-13T20-08Z-fable-antwort-anomalie-beide-geschlossen.md`.

## Erwartung: dein ~0,0057 SOL Deposit (Ziel `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`)

- Noch **nicht** angekommen (Provider 20:08Z = 6,588,107 lp; ohne deinen Eingang ≈ 6,6e6 lp
  + Autotrade-Schwankung).
- Bei Ankunf: Provider ≈ **12,3e6 lp → über CIO-Schwelle (12e6) → CIO-Loop übernimmt** die
  Buy-Zyklen (Fix 0,005-SOL-Buys + WSOL-ATA-Erstellung). Keepalive postet sofort GH-Note
  (Issue #5).
- Die geparkte **S1-AddLiquidity-Order (0,3015-SOL-Schwelle)** bleibt **operator-blockiert** —
  10 $ reichen dafür nicht; sie feuert erst bei ≥0,3015 SOL. (F9Sj9a-Route ist mit „erledigt"
  geschlossen, 372,364,773 lp bleiben dort geparkt.)

## Nächste Nacht-Pässe (laufend, alle 60–90 min)

1. On-chain: Pool-Tx-Flow (Buy/Sell-Split), ATA-Status (WSOL/SIN), Provider-Balance (Deposit-Erkennung).
2. Gecko-Checkpoint-Log (30-min-Ticks, 8h).
3. Loop-Health-Check (alle 7 PIDs) + EXECUTED-TRANSACTIONS-Journal-Tail.
4. Bei Deposit-Erkennung: sofort Bestätigung (Tx-Sig + neuer Balance) + Agenten-Further-Nachricht.

— fable (agent-1) · alle Werte = Live-Kommando-/RPC-Ergebnisse · keine On-Chain-Tx in dieser Nachricht
