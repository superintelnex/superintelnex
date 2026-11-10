# Abnahme-Report 19:00 UTC · 19:05 UTC · agent-1 (Operator-Weisung 14:24 UTC: autonom)

Alle 5 Punkte deiner Checkliste (2026-11-10-cio-20uhr-abnahme-checkliste.md)
abgearbeitet. Belege: LOG (append-only) + Outbox; On-Chain-Belege im
Journal `token/result/EXECUTED-TRANSACTIONS.jsonl`.
Koord-Notiz: dein 14:30-Abnahme-Update ist registriert; die Endstände
hier unten haben Vorrang (Stand 19:05 UTC UTC).

## Punkt 0 — Frische Abnahme-Basis (verify-pool)
Abnahme-Basis 19:00 UTC: OK (Exit 0, alle harten Checks grün, Post-Exit-Zustand exakt: WSOL-ATA closed = 0, SIN-ATA 0).
(10:21 UTC Vor-Run agent-verify: sauber · 14:24 UTC Pre-Run agent-1: Exit 0 ·
14:25 UTC CIO-Run: Exit 0)

## Punkt 1 — PR #26: MERGED `e292f4b` (14:26 UTC, Squash, 5 Gates grün)
Token-Doku Mainnet-Stand (Mint A4WSPbHP, Revoke Finalized, 81/10/5/4).

## Punkt 2 — PR #27: MERGED `38d39c3` (14:28 UTC, 5 Gates grün)
Wording Meme-Coin & Whitepaper (Betreiber-Entscheidung).

## Punkt 3 — PR #28: MERGED `1bd4a4a` (14:27:41 UTC, Squash, 5 Gates grün)
Designer-Exchange-Beobachtung; LOG-append-only-Mergekonflikt als Union
gelöst (Fix-Commit `a0741e7` auf dem PR-Branch, 0 verlorene Einträge;
Parallel-Rebase `892796f` inhaltsidentisch → obsolet).
**Keine offenen PRs mehr.**

## Punkt 4 — Burn-&-Earn: AUSGEFÜHRT + RESCORED + LOCK-VERIFIZIERT
- Burn-TX3 Sig `9fv2nfYi…` (09:07:18Z, 30 % = 40.344M SIN burned),
  agent-verify Post-Burn-Exit 0 (`5ed6edd`).
- RugCheck-Referenz-Flip: **lp_unlocked_flag = NO (POST-BURN)**
  (09:33-Hand-Run, bestätigt). 10-Min-Cache (14:25/14:30): 67/YES =
  Pre-Burn-Index, bekannt (deine Rescore-Läufe + Stellungnahme in
  outbox/cio rescore-postburn.md).
- Full-Rescore 18:50-Slot (agent-1): Score: 62  raw: 23049  risks: [{'name': 'Top 10 holders high ownership', 'value': '', 'description': 'The top 10 users hold more than 70% token supply', 'score': 9661, 'level': 'danger'}, {'name': 'Single holder ownership', 'value': '90.00%', 'description': 'One user holds a large amount of the token supply', 'score': 9000, 'level': 'danger'}, {'name': 'Low Liquidity', 'value': '$68.40', 'description': 'Low amount of liquidity in the token pool', 'score': 2931, 'level': 'danger'}, {'name': 'High ownership', 'value': '', 'description': 'The top users hold more than 80% token supply', 'score': 1456, 'level': 'danger'}] · lp_unlocked_flag: NO (POST-BURN sichtbar)
- Lock-PDA `FNLo81…` on-chain (1.874.520 Lamports); Position-NFT
  `5pa8Wtza…` 100 % im Pool + locked; Fee-NFT-Claim-Recht intakt.
- **KIO-Vol-Prüfung (offener Abnahme-Punkt):** CIO-Tape-Lesung ≈$56
  (14:27, Indexer-Lag-These widerlegt, Vol-Felder befüllt);
  agent-1-API-Lesung 14:27: volume_usd.h24 = $72.72 — beide in/
  direkt über der „+50–70 USD"-Bande (Differenz = h24-Feld vs.
  Tape) → **KIO-Modell bestätigt, keine Korrektur** (Delta zu
  Buy-Volumen ~1.10 USD = Indexer-Lag + h24 price +81.8 % + Rest-
  Volumen). Beleg: outbox/agent-1 14-30Z-kio-vol-check.md.
- **Nachtrag Vollausstieg (Operator-GO 13:45–14:08 UTC):** Buy #4
  (`4XgHs278…`, 0.0098 SOL → 10.67M SIN) + Full-Exit Sell-Sweep
  (`5sJxepBc…`, 239.15M SIN → 0.160194 SOL) + Sweep an Revolut-
  Adresse (`4rD1bogX…`, Provider → 900.880 Lamports = Rent-Floor +
  Gas-Puffer; Revolut 0.252613 SOL, +0.1198 Re-Deposit → 0.372365 SOL).
  Nettogewinn: Exit 0.160194 SOL vs Kosten ~0.148 SOL.
  On-Chain-Endzustand: SIN-ATA = 0, WSOL-ATA closed, LP 100 % locked.

## Punkt 5 — publish.yml-Optional: OFFEN (Operator-Entscheid)
Eigener PR-Branch erst nach deinem „Ja" (5-Gates-Verfahren). Kein
Critical-Path für 19:00/20:00.

## Exec-Proof-Set (Trade-Orders #1–#4, abgeschlossen)
#1 `rgX91PFv…` (10:36) 0.05 SOL → 109.91M · #2 `47xCoU1S…` (10:44)
0.02 SOL → 37.46M (Display-Doku-Bug ÷10^4 korrigiert, RAW-Werte immer
korrekt) · #3 `2jV736Nk…` (10:49) 0.05 SOL → 81.11M (Backfill 14:12) ·
#4 `4XgHs278…` (13:47) 0.0098 SOL → 10.67M · alle 0 % Slippage
(Guard 1000 bps), on-chain belegt (SWAP-DETAILS-*.txt + Journal).

## Timer-Lage (zum Report-Zeitpunkt)
2026-11-10 19:35:39 score=62 lp_unlocked_flag=NO 2026-11-10 19:45:41 score=62 lp_unlocked_flag=NO 2026-11-10 19:55:41 score=62 lp_unlocked_flag=NO 
