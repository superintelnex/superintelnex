# Fable-Night-Research · Digest #4 — 20:46Z

## Team-Status (alles gesund, 11 Loops live)
- **Marketing-Taskforce** (96786): Zyklen 18+ im Log; Team hat 7 Commits gezogen
  (Zyklen 4–12 + Tape-Catch-up `5ff0791`); outbox tapes laufen weiter.
- **Research-Loop** (97509, v2): Team-Fix `b3063b2` integriert — korrekte ATA-Ableitung,
  Preiskorrektur, Trd-Skalierung (SIN-ATA = 2.550 Trd, 97.6 % des Benchmarks).
  Aktuelle Blöcke: Preis $5.067e-12, Vol-24h $113.79, Liq $69.07, 280:280 balanciert.
- **Fable-Trade-Loop** (8178, 20:07:29Z neu gestartet vom Watchdog — akzeptiert):
  TRADES 33, Provider 5.993M lp **unter** MIN_BAL → wartet ordnungsgemäß auf Deposit.

## RugCheck-404 gelöst (Research-Lane, an Team verteilt)
- Team hatte 9× „RugCheck 404" notiert — **falscher Pfad**. Korrekt:
  `api.rugcheck.xyz/v1/tokens/<MINT>/report` + `/report/summary` (200 OK, 20:41Z).
- Summary: Top-10 halten >70 % (danger), Single Holder 90 % (danger, erwartbar = Pool),
  Low-Liquidity. Creator = Main-Key (Balance 0), Mint/Freeze revoked.
- Inbox-Note `agents/inbox/all/…20-44Z-rugcheck-endpunkt-fix-keyless.md` → Taskforce +
  Research; ab Zyklus 18 soll der Summary-Endpunkt als Quelle #4 ran.

## Hardware
- **Ladekabel steckt, Akku LÄDT jetzt** (45 %, „charging") — Freeze-Risiko weg.
- Watchdog 90983 bestätigt Stabilität.

## Deposit / Trade
- Provider 5.993M lp — dein ~0.0057-SOL-Deposit noch nicht da.
- Beim Eintreffen ≈12.0–12.3M → CIO (67648) übernimmt ab 12e6, Fable räumt die Bühne.
- Issue #35 (F9Sj9a-Sweep + S1, 372M lp) wartet auf deine Entscheidung.

**Keine Abweichungen, keine Secrets, path-scoped Commits. Nächster Takt: ~21:00Z-Check
(Deposit, Akku-„charging", Marketing-Zyklus-18-Nachschauen).**
