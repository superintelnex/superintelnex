# Operator-Order (via agent-1, 15:49 UTC) · „30 % der Gesamt-Supply selbst halten" — Buy-Order-Ticket #6

**Status: TICKET ERTEILT (neues Ticket löst den 15:45-Storno-Kanon für Folge-
Buys ab — Buy #5 bleibt VOID, dieses ist das neue kanonische Ticket).**
**Exec: NEIN von agent-1 (Kanon: Folge-Trade nur via frischem Ticket → dieses
Ticket, Exec-Key = Provider DNEBNj… via CIO-Auto-Trade-Loop).**

## Operator-Instruktion (15:49 UTC, Chat)
„ich will aber davon 30 % halten selbst" — Bezug: SIN-Mint-Supply
(on-chain Read 15:43: **10.000.000.000 SIN**, 9 Dec, final).
Zielformulierung (per Operator-Wahl): **30 % der Gesamt-Supply = 3.000.000.000 SIN**
als team-/operator-eigener Holding-Anteil.

## Ziffer-Basis (Gecko on-chain Read 15:30 UTC, read-only)
- SIN/SOL-Spot: 6,189e-9 SOL/SIN → 3 Mrd. SIN ≈ **18,6 SOL Spot-Wert
  (≈ $1.570 @ $84,69)** — rein spot-basiert.
- Pool `4erqAhdH…`: Vol h24 **$83,37**, h6 $72,24, h1 $8,87 →
  **Einzel-Trade in 3-Mrd.-Größe ist nicht fillbar** (Slippage-Durchbrennen
  der gesamten freien LP; team-LP liegt 100 % in Post-Burn-Escrow
  FNLo81…, unverfügbar).

## Order-Spezifikation (für CIO-Auto-Trade-Loop, PID 61987)
- **EXECUTABLE-LEG (sofort, bei Deposit-Ankunft):** der Loop feuert bei
  freiem Saldo > Fire-Schwelle (≥0,03 SOL-Kanon aus 15:45-Kalkulation:
  0,005 Reserve + ~0,0203 SIN-ATA-Rent) mit **Buy-Size = min(freier
  Saldo − 0,005, 0,02 SOL-Referenzgröße)** — exakt wie Buy #5-Spec
  (Slippage-Guard 1000 bps, Eigen-Guard, CU ~50–80k), **plus neue
  Holding-Regel: HOLD_RATIO 30 % → SELL-Size = Buy-Size × 70 %**
  (Buy #1–#4-Sell-Protokoll mit abgezogener 30 %-Quote;
  Buy #2-Referenz: 0,02 SOL → 37,46M SIN → Hold ≈ 11,24M SIN).
- **DCA-LEG (3-Mrd.-Ziel, Aufbauplan):** kumuliert über wiederholte
  Executable-Legs. Ziel 3.000.000.000 SIN = **≥18,6 SOL Eigenkapital
  (Spot) + Slippage-Aufschlag** → Operator muss Deposit-Budget
  bestätigen (aktuell: ein Deposit in Unbekannter Größe pending,
  Poller 2-min-Intervall läuft).
- **Kein Folge-Trade ohne weiteres frisches Ticket** (Kanon 15:45
  gilt weiter für Größenüberschreitungen über die 0,02-SOL-
  Referenz hinaus).

## RugCheck-Tradeoff (Operator ist per Instruktion informiert)
3 Mrd. SIN (30 % Supply) in einer Team-ATA = Top-Holder-Konzentration →
erwartet negativer Effekt auf den RugCheck-Score (aktuelle Erwartung
70+ post-Exit laut Briefing) — Operator akzeptiert (Holding-Willen).

## Offene Punkte (vor Erhöhung der Executable-Size)
1. Operator: Deposit-Budget (reicht das pending Deposit für eine
   0,02-SOL-Executable-Leg? → Hold 11,24M SIN in Runde 1).
2. Deposit on-chain sichtbar? (agent-1-Poller Stand 15:47: Provider
   900.880 lamports, noch nicht da.)
3. Loop-Config: HOLD_RATIO 30 % + DCA-Ziel-Counter in
   `cio-autotrade.zsh` ergänzen (CIO-Exec, agent-1 rührt den Loop
   nicht an — CIO-eigener Exec-Loop, Kanon 15:45).

— agent-1, 2026-11-10 15:50 UTC (Ticket-Erstellung auf Operator-
Instruktion, kein Exec; Größenkalkulation read-only)
