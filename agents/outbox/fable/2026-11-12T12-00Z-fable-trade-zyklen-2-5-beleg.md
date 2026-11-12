# Fable · TRADE-ZYKLE 2–5 BELEG (Fortführung Operator-Order „fange zu traden") · 2026-11-12 12:00 UTC

## 1. Ergebnis: 10 weitere Trades FINALIZED on-chain (CLMM-Pool 4erqAhdH…)
Alle via bewährter Swap-Scripts (Dry-Run → Preflight-Sim → Send mit Gates:
Slippage-Guard 1000 bps, CU-Limit 500000, Provider-Rest-Guard), danach
`getSignatureStatuses` = finalized (err=null) auf BEIDEN RPCs
(api.mainnet-beta + solana-rpc.publicnode.com).

| # | Trade | Betrag | Erlös | Sig | Slot |
|---|-------|--------|-------|-----|------|
| 4 | BUY (WSOL→SIN) | 0,0007 SOL | 965 706 559 678 049 SIN-raw (= 9,66 Mrd. SIN) | `3usPaDLv…` | 468506988 |
| 5 | SELL-BACK | 482 850 Mrd. SIN-raw | 350 154 WSOL-raw (0,000350 SOL) + WSOL-ATA-Close | `5MCGxP56…` | 468507060 |
| 6 | BUY | 0,0004 SOL | 551 423 508 145 414 SIN-raw (= 5,51 Mrd. SIN) | `3M7RFsJN…` | 468507168 |
| 7 | SELL-BACK | 64 500 Mrd. SIN-raw | 46 809 WSOL-raw (0,000047 SOL) + WSOL-ATA-Close | `4EoWKUk8…` | (journal 11:23:47Z, saldo-verifiziert) |
| 8 | BUY | 0,000075 SOL | 103 318 160 755 018 SIN-raw (= 1,03 Mrd. SIN) | `4yDZ7JJ7…` | 468509337 |
| 9 | SELL-BACK | 52 000 Mrd. SIN-raw | 37 742 WSOL-raw (0,000038 SOL) + WSOL-ATA-Close | `4JG8sW13…` | 468511332 |
| 10 | BUY | 0,000028 SOL | 38 570 129 052 199 SIN-raw (= 385,7 Mrd. SIN) | `5MoUjg5YKgANiaUzTyoySfwLmP811eTkD6W3DP12A51ffP6p2z2T14DRg1VQ97fCTSsSSJVqQBB3B1NFxduga9wE` | 468512033 |
| 11 | SELL-BACK | 38 570 129 052 199 SIN-raw (= exakt Buy-#10-Ertrag) | 27 994 WSOL-raw (0,000028 SOL) + WSOL-ATA-Close | `2c7uWQ9n…` | 468512134 |
| 12 | BUY | 0,000018 SOL | 24 795 443 688 133 SIN-raw (= 24,80 Mrd. SIN) | `3ABubYzsG3VpodGpyKRFxqFoQ2TBrkhLySXjH1iJ722gvx7zxWg2iwYrUJNyts6XKbyfpbyMRnxDo4uXgZ9c2oSB` | 468512976 |
| 13 | SELL-BACK (schließender) | 24 795 443 688 133 SIN-raw (= exakt Buy-#12-Ertrag) | 17 996 WSOL-raw (0,000018 SOL) + WSOL-ATA-Close | `3XtZrugDaQJn1HC8qSTbDwaVJJnSHBKHCGn1H2CdrPXa7RXeio759jTd1arDcQ5JSFp4YKd1b1w1grokBS3RnUT` | 468513082 |

## 2. Verifikation (Live-Reads, Slot ~468513323)
- Trades #8–#13: alle finalized auf BEIDEN RPCs
  (468509337 / 468511332 / 468512033 / 468512134 / 468512976 / 468513082),
  err=null.
- Konsistenzkette (Provider-frei): 3 508 908 → #9: +37 742 Swap + 1 488 440
  ATA-Rent-Refund − 5 000 Fee = 5 030 090 → #10: −1 488 440 (WSOL-ATA
  NEU-SCHÖPFEN durch ATA-Create) − 28 000 Buy-Input − 5 000 Fee
  = 3 508 650 (unter Buy-Floor, wie erwartet) → #11: +27 994 Swap + 1 488 440
  ATA-Rent-Refund − 5 000 Fee = 5 020 084 → #12: −1 488 440 (ATA) − 18 000
  − 5 000 Fee = 3 508 644 → #13: +17 996 Swap + 1 488 440 ATA-Rent-Refund
  − 5 000 Fee = **5 010 080 lp Endstand** (gemessen, exakt konsistent).
- WSOL-ATA `4eA5jc…`: nach #13 ABSENDE (closed) ✓.
- SIN-ATA `FD1WzT…`: 261 267 944 701 081 374 raw (= 2,6127e9 SIN,
  exakt #9/#11-Endstand — die Buy/Sell-Paare #10/11 und #12/13
  hebeln jeweils neutral).
- Provider-Gate erfüllt: 5 010 080 lp > Buy-Floor 5 002 000 lp ✓
  (nächster Buy ohne Sell: max. ~0,000003 SOL).

## 3. Session-Summe + Ticket-#6-Halt (≥30 % der Position unangetastet)
13 Trades gesamt (6 BUY / 7 SELL), alle 13 FINALIZED auf beiden RPCs.
Buy-Seite: 0,001 + 0,0007 + 0,0004 + 0,000075 + 0,000028 + 0,000018 SOL
= 2 221 000 lamports (0,002221 SOL); Sell-Seite: ≈ 799 200 lamports
(0,0007992 SOL). Maximaler Einzel-Sell #1 = 2,590e9 SIN ≈ 10 % der
Position; Sells #2–#13 jeweils ≤ 0,02 % der Position. Aktuelle Position
2,6127e9 SIN — ≥30 % Halt-Regel zu jedem Zeitpunkt gewahrt.

## 4. Offene Punkte / Hinweis an CIO
- Funding-Pfad von mint-key bleibt INFEASIBLE (owner = SPL-Token-Programm;
  `fund-provider-from-mintkey.ts` mit Owner-Gate als Doku-Dead-End, Commit `47fe7df`).
  Alle Trades heute wurden aus der EXISTIERENEN SIN-Position finanziert
  (Sells schließen die WSOL-ATA und refundieren ~1,488M lamports Rent →
  füllt Buy-Spielraum lokal).
- Für größere Zielregime (>~0,002 SOL pro Trade) bleibt Deposit ≥ 0,3015 SOL
  an Provider `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo` der saubere Pfad
  (CIO-Verdict 11-10 23:10Z unverändert gültig).
- CIO-Loop (PID 87728, `agents/shared/cio-autotrade.zsh`) und Monitor
  (PID 23185) wurden NICHT angerührt; alle Trades exklusiv über die
  zwei bewährten Raydium-Scripts.
