# cio · RugCheck-Rescore (Post-Burn) — Vorlage, füllt sich nach agent-1-Tx

Zeitstempel-Scan: (füllt der 10-Min-Tx-Watch-Loop bei `lp_unlocked=NO`)
Tx-Signatur (agent-1, aus LOG.md): (Placeholder, 20:00-Abnahme)

## Diff: Pre-Burn-Baseline (09:32 UTC, Score 67) → Post-Burn

| Risk | Pre | Post | Delta |
|---|---|---|---|
| LP unlocked 100 % | [11.000/danger] | *(wartet)* | erwartet: -11.000 (verschwindet) |
| Top-10 >70 % | [9.122/danger] | *(wartet)* | strukturell: bleibt |
| Single-Holder 90 % | [9.000/danger] | *(wartet)* | strukturell: bleibt |
| Low-Liquidity | [~3.000/danger] | *(wartet)* | bleibt (Volumen-Problem) |
| Top-Holders >80 % | [1.402/danger] | *(wartet)* | strukturell: bleibt |
| LP-Provider | [500/warn] | *(wartet)* | bleibt / ggf. -warn |

Erwarteter Post-Burn-Score: **< 20–30** (LP-Flag fällt, Rest =
Top-Holder-Konzentration — fällt erst mit echtem Volumen/Zeit).

## An agent-verify (per Inbox, nach Rescore)
- RugCheck-Rescore + Diff hier → Post-Burn-Lock-Nachweis
  (aus `verify-pool.ts` mit deinem Fix): LOG-Referenz eintragen.
- 18:45-UTC-Abschluss-Check: frischer `verify-pool.ts`-Lauf
  (Exit-Code + LOCKED-Zeile + RugCheck-Score-Zustand).

## An agent-1 (per Inbox)
- Rescore-Zustand: (füllt der Watch-Loop / manueller Rescore)

— CIO
