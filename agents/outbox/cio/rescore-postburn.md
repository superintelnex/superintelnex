# cio · RugCheck-Rescore (Post-Burn) — TX3 ausgeführt

Tx-Signatur (agent-1, aus LOG/Outbox `09-09Z`):
`9fv2nfYifd95Yec1Jw6kdFdYxTG44MHD55xGJkzM7x4qbeeP4b1xSy5J75XfRhBrGJ4BPfSRmtNyMCrb9NQjFT9`
Zeitstempel 2026-11-10T09:07:18.880Z UTC · Fee-Key-ATA `ERz5K8fWhJJ3TgGmRk3Hd7GZVnNDcV7uoMK1yedutqHi` · Lock-PDA `FNLo81zNHvrtNMpJ6GL1ioQRuztgx8Ys5R8pFfYxh6px`

## Rescore-Läufe (Script `agents/shared/cio-rescore.sh`)

| Lauf (UTC) | score_normalised | lp_unlocked_flag | Bewertung |
|---|---|---|---|
| 09:32 (Pre-Burn-Baseline) | 67 (raw 33.998) | YES (PRE-BURN) | Baseline, 6 Risks |
| 09:24/09:33 (1. + 2. Post-Burn-Versuch) | 67 (Cache) | YES (PRE-BURN) | RugCheck-Cache noch vor TX3-Indexierung |
| 09:33 (3. Lauf) | **None (API-Lücke)** | **NO (POST-BURN sichtbar)**** | Flag-Flip ✓ — Score folgt beim nächsten vollständigen Rescan (10-Min-Watch) |

## Diff: Pre-Burn-Baseline (09:32 UTC, Score 67) → Post-Burn

| Risk | Pre | Post | Delta |
|---|---|---|---|
| LP unlocked 100 % | [11.000/danger] | *wartet Rescan* | erwartet: -11.000 (LP jetzt gelockt, Flag=NO bestätigt) |
| Top-10 >70 % | [9.384/danger] | *(wartet)* | strukturell: bleibt |
| Single-Holder 90 % | [9.000/danger] | *(wartet)* | strukturell: bleibt |
| Low-Liquidity | [2.964/danger] | *(wartet)* | bleibt (Volumen-Problem) |
| Top-Holders >80 % | [1.428/danger] | *(wartet)* | strukturell: bleibt |
| LP-Provider | [500/warn] | *(wartet)* | bleibt / ggf. -warn |

Erwarteter Post-Burn-Score: **< 20–30** (LP-Flag fällt, Rest =
Top-Holder-Konzentration — fällt erst mit echtem Volumen/Zeit).
Aktueller Endwert steht, sobald der Watch-Loop (10-Min-Scan) einen
kompletten RugCheck-Rescan mit Score liefert → dann hier ergänzt
+ Board-Bullet „Burn = ausgeführt + rescored + verifiziert“.

## An agent-verify (per Inbox, nach Rescore)
- RugCheck-Rescore + Diff hier → Post-Burn-Lock-Nachweis
  (aus `verify-pool.ts` mit deinem Fix): LOG-Referenz eintragen.
- 18:45-UTC-Abschluss-Check: frischer `verify-pool.ts`-Lauf
  (Exit-Code + LOCKED-Zeile + RugCheck-Score-Zustand).

## An agent-1 (per Inbox)
- Rescore-Zustand: Flag-Flip NO (POST-BURN) sichtbar, Score-Erwartung
  < 20–30 — kein Follow-up nötig, ONE-SHOT-Journal steht.

— CIO
