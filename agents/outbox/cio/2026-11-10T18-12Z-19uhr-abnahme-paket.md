# CIO · 19:00-Abnahme-Paket (Briefing für den Operator, Stand 18:12 UTC)

Public-free · Basis: CIO-18-06Z-ACK + `agents/shared/sin-decimal-kanon.md`
+ `outbox/cio/…18-06Z-addliquidity-sektion5-kapital-korrektur.md`.
Abfolge: agent-1-Druckfrische Belege 18:45/18:50 → Operator-Entscheidung
19:00 → Exec (read-only-Prep jetzt, Exec NUR nach OK).

## a) Abnahme agent-1 (19:00, Operator-Bestätigung)
- 18:45: `verify-pool.ts`-Run **EXIT 0** erwartet (Abnahme-Loop PID 60475).
- 18:50: RugCheck-Full-Rescore **Kanon-Zahl aus Loop-Beleg-Datei**
  `agents/outbox/agent-1/2026-11-10T18-50Z-rugcheck-full-rescore.md`
  (De-Risking 62/NO nur Trend-Referenz). FillIn-Helper (PID 66713)
  füllt 18:53 die `__PLATZHALTER` im 19:00-Report-Draft
  (`agents/inbox/cio/2026-11-10T19-00Z-abnahme-report.md`) strikt aus
  den Loop-Belegen — CIO liest gegen, keine eigene Zahl.
- Abweichung → transparent im §7 des 19:00-Reports.

## b) addLiquidity (Ja/Nein-Decision + Kapital-Frame)
**Empfehlung: JA, S1** (0,3 SOL, Launch-Range 179280…259280,
550k CU, 0 neue TickArrays). Kapital-Bedarf (korrigierter Frame,
18:06-Kanon):

| Seite | Bedarf | Herkunft |
|---|---|---|
| SIN (B-Seite) | ≤ 1,4624e12 UI-SIN (Cap) | **0 extern** — Provider-ATA `FD1WzT52…` deckt 177,3 % (raw `259304346191112734`, 2,5930e12 UI-SIN) |
| WSOL (A-Seite) | 0,301500000 SOL (Cap +0,5 %) | **Operator-SOL-Topup an Provider `DNEBNj…`** (WSOL-ATA `4eA5jc…` = 0; Provider hält 0,005008 SOL = Rent-Floor + Gas) |
| Gas | ~0,001 SOL | im Provider-Bestand |

→ **Operator-Aktion bei „b = JA, S1“: ~0,31–0,35 SOL Topup an
`DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`** — dann CIO-Exec
(keylose Simulation + frischer Dry-Run-Snapshot, Beträge neu ankeren;
aktuelle Ticks: tickCurrent 203575 @17:17, weiter driftend;
amountMax-Caps +0,5 %, 550.000 CU-Limit).
Alternativen: S2 (0,5 SOL, Deckung 106,4 % — dünner) · S3 (GAP
6,819e11 UI-SIN externer SIN nötig → NICHT default).

## c) Deposit #2 (Folge-Buys)
Provider 0,005008 SOL < Fire-Schwelle 0,011005 → Loop feuert NICHT.
**Empfehlung Deposit #2 ≥ 0,1 SOL** (Deckt 6–8 Buys,
CAP 0,15/Trade, MIN 0,005). Ohne Deposit: Loop bleibt sauber idle
(85755, „WARTET AUF DEPOSIT“).

## D-Entscheidung (Ticket #6, DCA-Ziel) — EINS von:
- **(a) wörtlich 3 Mrd. (3e9 UI-SIN)** — Loop-Config wie heute
  (`DCA_TARGET=300000000000000` raw = 3e9 UI-SIN) = 0,0030 % der
  1e14-UI-Supply. Günstig, aber der 15:49-Frame „30 % Supply“ gilt
  damit NICHT (10⁴-Fehler erkannt, Kanon-Datei).
- **(b) 30 %-Kanon: 3e13 UI-SIN (raw `3000000000000000000000`)**
  = 30 % der echten Supply. Konfig-Change (10×-Ziffer) +
  DCA-Laufzeit-Betrachtung (bei 0,001-SOL-Fills ein Jahrzehnt —
  realistisch erst ab Deposit-Budget + ggf. größerem Buy-Cap).
Bis dahin + ohne Deposit-OK: `HOLD_ON=0` (Buy-only), kein
SELL-Leg, DCAF=0 — Konfig inert.

## Exec-Gates (CIO, nach 19:00-OK)
1. Frischer Dry-Run-Snapshot (Raydium-SDK read-only), Beträge neu
   ankeren + amountMax +0,5 %.
2. WSOL-ATA-Check im Exec-Schnappschuss (Topup angekommen?).
3. addLiquidity: CU 550.000 (S1), Simulation → Sendung via
   bewährtem Exec-Pfad (agent-1/Operator — CIO baut KEINEN eigenen
   Tx), Slippage-Caps, P0-Kreuzcheck vor Sendung.
4. D-Entscheidung + Deposit-Budget erst nach dem addLiquidity-Exec
   (HOLD_ON-Flip = separater, nachgelagertes GO).

Status 18:12: Loops 60475/66713/85755 aktiv · git `ea81634` (Remote) ·
inbox/cio leer seit 17:22 · Provider 0,005008 SOL · ATA 2,5930e12 UI-SIN.

— CIO, 18:12 UTC
