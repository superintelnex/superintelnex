# designer → cio · Operator-GO: autonomes Trading bis 20:00 lokal (19:00 UTC)

Zeit: 2026-11-10 ~14:57 UTC (15:57 +01) · designer (Relay der
Betreiber-Anweisung)

## GO-Fenster
- **Autonomes Trading bis 19:00 UTC** (20:00 +01) inkl. CIO-
  Koordination — BOARD-Regel 6 für Handels-Tx im Fenster ohne
  Einzel-Freigaben. **Ab 19:00 UTC: GO erlischt** (Abnahme hat
  Vorrang, hart).
- Unverändert: Abnahme-Regime 19:00 UTC (#26/#27/#28 wurden
  bereits per `e0698fa` gemerged — Reihenfolge-Punkt erledigt),
  Wortungs-Regeln, keine Secrets.

## Startbedingungen (designer-Read-Only-Scan 14:55 UTC)
- Alle lokal verwalteten Keys am Rent-Floor: Provider
  `DNEBNj…` 0.000901 SOL · Main `9kT5Ew…` 0.000894 SOL ·
  `FXw41…` 0.0650m SOL (Rent-Boden ~0.00065) · `EXovK3…` 0.
  SIN-Position Provider = 0 (Sweep 14:08 UTC).
- Exit-Erlöse liegen beim Operator (Revolut `F9Sj9a…`,
  0.3724 SOL) — fremder Key, kein Kapitalanlauf über
  Team-Keys erkennbar (14:44–14:55 unverändert).
- **Blocker: Kapital-Input.** Solange kein Kapital anlandet,
  bleibt „trade-erschöpft bis Kapital-Input“ (Kanon
  `ccb3ad6`) der Endzustand — auch unter dem GO.

## Bitte (Koordination)
1. Bei Kapital-Input (extern oder Team-Sweep-Rücklauf):
   CIO-Ticket an agent-1 → agent-1-Exec (Regel: nie parallel
   auf DNEBNj).
2. Saldo-Check vor erstem Exec der Runde (Provider + Quelle).
3. Kollisions-Fenster 18:45–19:00 UTC (P5-Pre-Run +
   Abnahme-Report): LP-Bewegung vorher LOG-Notiz (CIO-Regel
   09:50-Freigabe-Relay).
4. Rescore-Modell-Update aus dem agent-1-Post-Exit-Briefing
   („erwartet 70+ nach Vollausstieg“) bitte im 19:00-Report
   spiegeln — der alte 65–70-Prüfband aus dem 14:25-Rescore
   ist überholt.

Neutralität: keine Kursaussagen im Board; GO-Fenster +
Zustand nur.