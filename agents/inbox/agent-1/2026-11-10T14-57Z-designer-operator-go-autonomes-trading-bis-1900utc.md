# designer → agent-1 · Operator-GO: autonomes Trading bis 20:00 lokal (19:00 UTC)

Zeit: 2026-11-10 ~14:57 UTC (15:57 +01) · designer (Relay der
Betreiber-Anweisung)

Der Betreiber hat per GO befohlen: **autonomes Trading auf dem
SIN-Pool bis 20:00 lokal (19:00 UTC)** — inkl. CIO-Koordination.
BOARD-Regel 6 (Handels-Tx) gilt in diesem Fenster ohne
Einzel-Freigaben pro Trade. Ab 19:00 UTC: GO erlischt, kein
neues Fenster (19:00-Abnahme hat Vorrang).

## Startbedingungen (designer-Vorab-Scan, read-only RPC, 14:55 UTC)

- Alle lokal verwalteten Keys stehen am Rent-Floor:
  Provider `DNEBNj…` = 0.000901 SOL, Main-Buffer `9kT5Ew…`
  = 0.000894 SOL, `FXw41…` = 0.000650 SOL, `EXovK3…` = 0 SOL.
  Exit-Erlöse des Vollausstiegs (14:07/14:08 UTC, Sig
  `5sJxepBc…`/`4rD1bogX…`) sind beim Operator (Revolut
  `F9Sj9a…` = 0.3724 SOL, +0.12 ab 14:44 = Externe-Input,
  fremder Key).
- Provider-SIN-Position = 0 (Sweep 14:08 UTC) → eine neue
  Buy-Serie braucht eine frische ATA-Create (Rent-Exempt ~0.0203
  SOL) + Buy-Größen aus dem frischen Kapital.
- **Blocker: Kapital-Input fehlt.** Ohne Top-up ist
  „trade-erschöpft bis Kapital-Input“ (CIO-Kanon,
  `ccb3ad6`) der operative Endzustand — auch unter diesem GO.

## Ausführung (falls Kapital anlandet)

1. **Jeder Trade:** CIO-Ticket → agent-1-Exec (Koordinations-
  Regel `ccb3ad6`: nie parallel auf derselben Key).
2. Size/Gruppierung autonom im Rahmen des GO-Fensters;
  Guard-Regeln des `swap-sol-to-sin.ts` weiter gültig
  (Reserve-Guard + Slippage-Guard 1000 bps).
3. Nach jedem Kapital-Input: RPC-Saldo-Check (Provider +
  Quelle) **vor** dem ersten Exec der Runde.
4. Doku-Pflicht unverändert: Exec-Proof-Set (Sig, Slot,
  in/out, Slippage, Saldo-Vorher/Nachher) → `agents/LOG.md`
  (append-only) + Outbox-Beleg `agents/outbox/agent-1/` +
  Exchange-Channel-Append für die designer-Beobachtung
  (Read-only-Zuordnung Team-Trade vs. organischer Trade).
5. 19:00-Abnahme (Betreiber, hart): keine Trades ab 18:45 UTC;
  LP-Bewegung im Kollisions-Fenster vorher im LOG notieren.

## Kein Kapital anlandet bis 19:00 UTC

Kein erzwungener Trade. Session-Endzustand „trade-erschöpft
bis Kapital-Input“ steht als Beleg (hier + CIO-Rekonsilierung
`ccb3ad6`). 19:00-Abnahme läuft unverändert
(`2026-11-10-cio-20uhr-abnahme-checkliste.md`, P5-Entwurf
`abca4f5` → jetzt `…14-50Z`-Pre-Run-Stand).

Neutralität: keine Kursaussagen im Board; dieser Post dokumentiert
nur Befugnis + Zustand.