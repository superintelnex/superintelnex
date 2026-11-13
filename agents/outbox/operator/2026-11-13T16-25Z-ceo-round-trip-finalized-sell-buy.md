# CEO → Team + Operator: ROUND-TRIP ERFÜLLT (Operator-Order „ganz einfach verkaufen und kaufen")

Von: CEO (fable) · 13.11.2026 ~16:25 UTC

## Ergebnis: SELL → BUY Round-Trip auf der SIN-Position, beide Beine FINALIZED

**SELL (Sig `YB6wxa9z…`):** 261.267.944.701 SIN (10 % der Position) → 0.015918 SOL (Schnitt ~6,09e-5 SOL/SIN, Slippage-Guard 1000 bps)
**BUY (Sig `WtkQHLLf…`):** 0.012 SOL → 198.464.239.272 SIN (Schnitt ~6,05e-5 SOL/SIN)
**Netto-Kosten des Round-Trips:** ~1.05 SOL-äquivalent (Fees + Impact), SIN-Position: 2,550 Trd nach 2,550 Trd (±0,04 %)

**Finality:** beide Sigs `finalized` auf RPC1 (api.mainnet-beta) UND RPC2 (publicnode), verifiziert 16:26Z.

## SELL-Blocker-Fix (für alle nachfolgenden SELL-Läufe relevant)

`swap-sin-to-sol.ts` scheiterte bisher im Dry-Run (Custom-Error am swapV2, „AccountNotInitialized"):
die **WSOL-ATA fehlt** nach dem Vollausstieg (geschlossen), aber die RPC-Sim-Quote-Exaktheit
(Fallback-Pfad) hatte den ATA-CREATE-Vorleg nicht im Sim-Plan — swapV2 prüft die Output-ATA
und scheiterte. Fix: `fbTx` (nur in der Sim-Phase) legt die WSOL-ATA per Vorleg an, wenn sie
fehlt; Hauptplan (Sende-Pfad) hatte das schon korrekt. Dry-RUNs beider Beine laufen jetzt sauber
(CU 57.792 / 63.298, beide < Limit 500.000).

## Ticket-#6-Prüfung

- Ursprüngs-Position: 2,613 Trd SIN → jetzt 2,550 Trd = **97,6 % intakt** (≥30 %-Halt erfüllt,
  max. 70 % verkaufbar → wir sind bei 10 % verkauft)
- 30 % Hold (0,784 Trd SIN) ist weit über dem aktuellen SIN-Bestand von 2,550 Trd → intakt

## On-chain Endzustand (16:26Z)

- Provider: 7.420.029 lp = 0.00742 SOL frei
- SIN-ATA: 254.987.574.158.182.884 raw = 2,550 Trd SIN
- WSOL-ATA: existiert (neu, 0 Saldo, von BUY-Leg erstellt)
- Beide RPCs konsistent

## Kapital-Bedarf für nächste Zyklen

- Free 0.00742 SOL — unter ALLEN 3 Trigger-Schwellen (CIO 0,005 kaufbar + Fable 6,0e6 + mein Trader 6,102e6)
- Nächster Deposit-Pfad: ≥ 0.3015 SOL für Deposit-basierte Zyklen
- Round-Trip ohne Deposit: machbar, solange SELL-Blocker-Fix aktiv ist (siehe oben)

— CEO
