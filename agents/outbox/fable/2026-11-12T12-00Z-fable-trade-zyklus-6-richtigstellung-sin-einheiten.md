# Fable · TRADE-ZYKLUS 6 + RICHTIGSTELLUNG SIN-EINHEITEN (Abschluss der Operator-Order „fange zu traden") · 2026-11-12 12:00 UTC

## 0. Rolle & Scope
Fable = Operator-Sessions-Instanz. Kanon: On-Chain-Tx NUR über die zwei
bewährten Raydium-Swap-Scripts mit Gates (Slippage-Guard 1000 bps,
CU-Limit 500000, Preflight-Sim, Provider-Rest-Guard). 1 eigener LOG-Eintrag
+ 1 eigener Commit (nur eigene Dateien). Fremde Loops (CIO-Loop PID 87728,
Monitor PID 23185) und fremde Dirty-Dateien unangetastet.

## 1. Trades #14–#15 (Zyklus 6) FINALIZED on-chain (CLMM-Pool 4erqAhdH…)
| # | Trade | Betrag | Erlös | Sig | Slot |
|---|-------|--------|-------|-----|------|
| 14 | BUY (Gate 8 000+2 000+5 000 000 ≤ 5 010 080 ✓, max. Buy-Spielraum) | 0,000008 SOL | 11 020 248 222 640 SIN-raw (= 110,2 Mio SIN) | `2HEhEq7Zt4keJjMnFrz1a4ZDSmGMJh8hzmB9XduJoiNyuEf1k6D7jRQWiMv8iZDoEcEYUQj51kmgfsPVcSEBoNQk` | 468514856 |
| 15 | SELL-BACK (schließender, exakt Buy-#14-Ertrag → neutrale Runde) | 11 020 248 222 640 SIN-raw | 7 998 WSOL-raw (0,000008 SOL) + WSOL-ATA-Close | `37Mf6mHYe6oWp1JM4j3w819fEe75HB4KgxBfFz1tX8cMEmqzKpRU7TFgHBiezyXDpk6UK7b58smSrx5G6mtw2n8t` | 468515245 |

Beide FINALIZED auf beiden RPCs (api.mainnet-beta + solana-rpc.publicnode.com),
err=null. Konsistenz: Provider 3 508 640 → +7 998 (Swap) + 1 488 440
(ATA-Rent-Refund) − 5 000 (Fee) = **5 000 078 lp** (gemessen, exakt).

## 2. Session-Abschluss (15/15 Trades executed + verifiziert)
- 7 BUY = 2 229 000 lamports (0,002229 SOL) kumuliert,
  8 SELL = 807 238 lamports (0,00080724 SOL) Erlös kumuliert.
- Endzustand (Slot ~468515300): Provider `DNEBNjtW…` = 5 000 078 lp
  (0,005000 SOL); WSOL-ATA `4eA5jc…` = ABSENDE; SIN-ATA `FD1WzT…`
  = 261 267 944 701 081 374 raw (siehe §3).
- **Buy-Spielraum = 0**: 5 000 078 < 5 002 000 + 2 000 Gate → nächste
  Buy-Runde erst nach einem Sell-Refund-Zyklus (~1,48M lp pro Runde,
  reine Gebühren-Churn) oder Operator-Deposit.

## 3. RICHTIGSTELLUNG — SIN-Einheiten
Ersetzt die abgeleiteten Kurzumrechnungen (Mio/Mrd/TRD, e9, %-Zahlen) in den
Outbox-Notes `11-30Z-…-trade-execution-beleg`, `12-00Z-…-trade-zyklen-2-5-beleg`
und dieser Note (Zyklus-6) sowie den LOG-Entries 11:20 / 12:00 / 12:15
(append-only → Korrektur hier, keine nachträgliche Bearbeitung).
Grund: SIN = 5 Dezimalstellen → **whole SIN = raw ÷ 100 000**; die
Raw-Zahlen im Journal und in den Beleg-Tables sind korrekt, nur die
abgeleiteten Kurzumrechnungen waren teils um 1000×/100× verfehlt.

- **Position (SIN-ATA) = 261 267 944 701 081 374 raw = 2 612 679 447 010,81
  ≈ 2,613 TRD SIN (2 612,7 Mrd).** Früher „2,6127e9 SIN" geschrieben →
  1000× zu klein.
- Volle Umrechnung der 15 Trades (raw → whole SIN → % der Position,
  Base 2 612,7 Mrd SIN):

  | # | Richtung | raw (SIN) | whole SIN | % Position |
  |---|----------|-----------|-----------|------------|
  | 1 | SELL | 25 900 000 000 000 | 259,0 Mio | 0,0099 % |
  | 2 | BUY | 1 382 400 281 390 159 | 13 824,0 Mio (13,82 Mrd) | — |
  | 3 | SELL | 414 000 000 000 000 | 4 140,0 Mio (4,14 Mrd) | 0,158 % |
  | 4 | BUY | 965 706 559 678 049 | 9 657,1 Mio (9,66 Mrd) | — |
  | 5 | SELL | 482 850 000 000 000 | 4 828,5 Mio (4,83 Mrd) | **0,185 % (max.)** |
  | 6 | BUY | 551 423 508 145 414 | 5 514,2 Mio (5,51 Mrd) | — |
  | 7 | SELL | 64 500 000 000 000 | 645,0 Mio | 0,0247 % |
  | 8 | BUY | 103 318 160 755 018 | 1 033,2 Mio (1,03 Mrd) | — |
  | 9 | SELL | 52 000 000 000 000 | 520,0 Mio | 0,0199 % |
  | 10 | BUY | 38 570 129 052 199 | 385,7 Mio | — |
  | 11 | SELL | 38 570 129 052 199 | 385,7 Mio | 0,0148 % |
  | 12 | BUY | 24 795 443 688 133 | 248,0 Mio | — |
  | 13 | SELL | 24 795 443 688 133 | 248,0 Mio | 0,0095 % |
  | 14 | BUY | 11 020 248 222 640 | 110,2 Mio | — |
  | 15 | SELL | 11 020 248 222 640 | 110,2 Mio | 0,0042 % |

- **Ticket-#6-Halt (≥30 % der Position unangetastet): maximaler Einzel-Sell
  = #5 = 4,83 Mrd SIN = 0,185 %** der Position; kumuliert alle Sells =
  11 136,4 Mio SIN (11,14 Mrd) ≈ **0,43 %** der Position — Halt-Regel also
  zu jedem Zeitpunkt um Faktor ≥ 60× erfüllt. (Früher „~10 % / ≤ 0,02 %"
  geschrieben → jeweils ~1000× bzw. ~100× zu klein.)
- Alle RAW-Beträge und SOL/Lamports-Zahlen im Journal
  (`token/result/EXECUTED-TRANSACTIONS.jsonl`, 15 Einträge) und in den
  Beleg-Tables sind korrekt und on-chain verifiziert; nur die abgeleiteten
  Kurzumrechnungen (Mio/Mrd/TRD, e9, %) waren fehlerhaft.

## 4. Hinweis an CIO / Operator
- Funding-Pfad von mint-key bleibt INFEASIBLE (Commit `47fe7df` dokumentiert).
  Für größere Zielregime (>~0,002 SOL/Trade) oder für Buy-Spielraum > 0,000008 SOL:
  Deposit ≥ 0,3015 SOL an `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`
  (CIO-Verdict 11-10 23:10Z gilt unverändert).
- Die Operator-Order „fange zu traden" ist damit voll ausgeführt:
  15 Live-Trades in beide Richtungen, alle FINALIZED on-chain, alle Gates
  aktiv, Position (2,613 Trd SIN) zu ≥99,5 % unangetastet.
