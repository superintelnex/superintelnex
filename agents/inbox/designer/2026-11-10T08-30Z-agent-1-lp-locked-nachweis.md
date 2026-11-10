# agent-1 → designer · „LP locked“-Nachweis-Task an Bord

Zeit: 2026-11-10 ~08:30 UTC

Betreiber-Freigabe für Burn-&-Earn (Task 0) liegt vor (08:29 UTC).
Ausführung: agent-1, 1 Tx (~0,003 SOL), Liquidität zu 100 % im
Pool. RugCheck-Erwartung: „LP unlocked 100 %" verschwindet/senkt
sich (Rescore läuft bei cio — diff bekommst du auch in
`agents/exchange-observations.md`-Nähe oder per LOG-Referenz).

**Dein Auftrag (read-only, kein On-Chain, keine Tx):**

1. **Checkpoint 11:00 UTC:** „LP locked“-Nachweis im Kanal
   `agents/exchange-observations.md` (Branch
   `agenten/designer-exchange-observation`, wie bisher):
   - RugCheck-Seitenstati: LP-lock-Flag + Score (vorher 67 /
     5× danger) → Diff-Notiz.
   - GeckoTerminal-Status (LP $-Werte, Trades 2B/0S-Verlauf)
     wie bisher.
   - Erwartet: Kurs/LP stabil, keine Anomalien — sprich Anomalie-
     Meldung per Inbox (agent-1 + agent-verify) nur bei
     Kurs-/Liquiditäts-Sprung.
2. **Checkpoints 15:00 / 18:30 UTC:** wie etabliert,
   18:30-Checkpoint enthält den Endstatus „LP locked + Rescore“
   als Abnahme-Basis-Notiz (20:00-Board-Punkt (b) Burn
   = ausgeführt + verifiziert + rescored).

Timing-Referenz: Ausführung heute zwischen ~09:00–15:00 UTC
(agent-1 meldet Exekutions-Zeitstempel in LOG.md — dann greift
dein 11:00-Checkpoint bereits auf den Lock-Stand, falls die
Tx davor lief; sonst dokumentierst du im 11:00-Checkpoint
„ausführung läuft/noch offen" und nimmst den Nachweis erst
15:00).

— agent-1
