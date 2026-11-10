# agent-1 → CIO · 18-46Z · D-Entscheidung = (b) 30-Mrd-Kanon + 18-43Z-Memo-Korrektur

Stand: 2026-11-10 18:46 UTC · agent-1 · intern, public-free · Basis:
`agents/shared/sin-decimal-kanon.md` (18:06, verbindlich) + 18-12Z-
Abnahmepaket-D-Options + Operator-Chat (18:3x–18:46)

## 1. Operator-Entscheidung (D-Option)
- **D = (b) 30 %-Kanon: `DCA_TARGET = 3000000000000000000000` raw
  (3e18) = 3e13 UI-SIN = 30 Mrd SIN = 30 % der echten Supply (1e14
  UI-SIN, 5 Dez.).** Operator-Wortlaut: „reserviere die 30 %, also
  die 30 Mrd — wenn ich Geld habe will ich das kaufen". Ausführung =
  DCA via Loop bei seinen SOL-Deposits, HOLD-only (HOLD_ON=0, kein
  SELL-Leg), DCAF-Counter gegen 3e18-raw.
- Bitte: Loop-Config-Change (10⁴-Ziffer von 3e14 → 3e18 raw) gem.
  18-12Z-Exec-Gate-4 (nach 19:00-OK + addLiquidity-Exec).

## 2. agent-1-Korrektur (public-free)
- Meine 18-43Z-Note + LOG-Eintrag „Kanon-Korrektur 30 Mrd → 3 Mrd"
  ist **selbst Produkt des alten 9-Decimal-10-Mrd-Frame** und damit
  FALSCH — überholt durch sin-decimal-kanon.md (5 Dez., 1e14-
  Supply): 30 % = 30 Mrd = Operator-Zahl korrekt. Bitte meine
  18-43Z-Note (LOG-Referenz) lesen mit diesem Stand: **Operator-
  Wunsch = 3e18 raw, nicht 3e14 raw.**
- Budget-Richtwert für Operator-Budgetierung (Anker, nicht Exec-
  Zahl): TRADE #7 = 0,001 SOL → +6,92e9 UI-SIN (6,92 Mrd) →
  3e13 UI-SIN ≈ **4,3–5 SOL** (Impact im Thin-Pool + Tick-Drift
  addiert; CIO Exec-Gate-1 re-anchert den frischen Dry-Run).
  Deposit-Rhythmus: ab ≥ 0,1 SOL je Deposit (0,15-CAP-Tranche),
  ~29 Tranchen (ohne Impact-Rechnung).

## 3. Geprüft / unverändert
- Loop-Config bis Exec-Gate-4 unverändert (DCA 3e14 inert,
  HOLD_ON=0, DCAF=0; Provider 0,005008 < Fire 0,011005 → idle,
  korrekt). SELL-Leg bleibt geparkt.
- 19:00-Abnahmekurs unverändert (18:45 verify + 18:50 rescore-Slots
  laufen; §7/§8-Beischreibungen gem. 17-45Z-ACK).

— agent-1, 18:46 UTC (Keine Exec, keine Secrets)
