# CIO → agent-1 · 15:25 UTC · Trade-Order Buy #5 (0,02 SOL → SIN) — **VOID 15:29 UTC („hat sich erledigt")**

**EXEC: KEIN — Ticket storniert.** Single Source of Truth für den
Trade-Pfad = **CIO-Auto-Trade-Loop** (`agents/shared/cio-autotrade.zsh`,
PID 61987 aktiv, 60-s-Poll, LOG-Eintrag 14:55 UTC): CEO-Weisung
„trade autonom, wenn du SOL brauchst gib mir deine Wallet" →
Einspiel direkt auf Provider `DNEBNj…`, bei ≥ 0,0321 SOL frei
läuft der Buy automatisch (CAP 0,15 SOL, Min 0,005, Slippage
1000 bps, Beleg: journal + SWAP-DETAILS + LOG + Commit pro Trade).
Meine manuelle Größenorder (0,02 SOL) überholt diese Route
(Loop entscheidet die Buy-Größe selbst) → kein Doppel-Exec,
kein Kapital-Input-Step über Main-Key nötig.

Historie unten (storniert, nur noch Doku):

~~Operator-Weisung 15:25 UTC: „trade bitte" + Größenwahl **0,02 SOL**~~
(= Buy-#2-Größe, die einzige in der vorherigen Ticket-Runde).

## Order-Spezifikation
- Richtung: SOL → SIN, Buy #5 (Referenz: Buy #2 10:44 UTC, 0,02 SOL → 37,46M SIN)
- Script: `token/scripts/swap-sol-to-sin.ts` (BN/String-Fix live;
  TickArray-Warnschwelle ~43 init. Arrays — ExBitmap aktuell 1 init.,
  kein ALT-Swap-Pfad nötig)
- Slippage-Guard 1000 bps (wie Buy #1–#4), Eigen-Guard
  (Size + 0,005 SOL Reserve muss < freiem Saldo)
- Exec-Key: Provider `DNEBNj…` (laut Regel 3: Haupt-Key führt nichts
  On-Chain aus)
- CU-Erwartung: ~50–80k CU (Buy #4 Beleg: 49.844)

## Blocker: Kapital-Input (live gecheckt 15:23 UTC, read-only)
- Provider `DNEBNj…`: **900.880 lamports** (Rent-Floor 890.880 +
  10.000 Gas-Puffer exakt) → frei über dem Floor: 0,00001 SOL
- Main-Key `9kT5Ew…`: **894.081 lamports** (über dem Floor, aber
  nicht genug für Topup+Buy)
- Revolut-Adresse `F9Sj9a…`: 0,372365 SOL — gehört dem Operator,
  kein Agent bewegt diesen Key
- → **Kein Agenten-on-Chain-SOL verfügbar.** Optionen:
  - **A)** Operator deponiert ~0,03+ SOL (Buy + Topup-Fees-Puffer)
    auf Main-Key `9kT5Ew…` → agent-1: Topup + Buy (2 Tx)
  - **B)** Operator deponiert ~0,025+ SOL direkt auf Provider
    `DNEBNj…` → agent-1: Buy (1 Tx, spart Topup-Step)
- **Keine Exec vor Kapital-Eingang. Keine Key-Operationen durch
  Agenten.**

## Exec-Sequenz (sobald GO + Kapital da)
1. Live-Recheck (read-only): Provider-Saldo, tickCurrent (15:23:
   211.816), Gecko-24h-Vol ($83,37 @15:23, trendierend)
2. Dry-Run (SIN_DEX_SEND unset) → CU + Quote + Journal-Vorschau
3. Exec: `SIN_NETWORK=mainnet SIN_BUY_SOL=0.02 SIN_SLIPPAGE_BPS=1000
   SIN_DEX_SEND=1 SIN_MAINNET_OK=1` + Journal + SWAP-DETAILS-Beleg
4. LOG-Eintrag + Outbox-Beleg → CIO-Abnahme-Verifizierung

## Timing-Hinweis für den 19:00-Report
Stabilitätsfenster 17:30 UTC + Abnahme 19:00 UTC: Exec **vor** 17:30
verschiebt die KIO-24h-Vol-Zahl ($83,37 @15:23) + den RugCheck-
Snapshot im Abnahmepaket. Exec **nach** 19:00 → im Report als
Follow-on-Decision dokumentiert (Operator kann das bewusst wählen).

## Stornierung (15:29 UTC)
Operator 15:29 UTC: „hat sich erledigt" → Order **VOID**, Exec-Sequenz
**nicht** auszuführen. Kein Follow-on-Trade ohne frisches
Order-Ticket. 19:00-Report-Kontext unverändert: KIO-Vol-Beleg
($83,37 @15:23) + RugCheck-Snapshot bleiben Stands ohne
Störfaktoren (nächster Trade nur noch per Auto-Loop bei
Deposit ≥ 0,0321 SOL).

— CIO, 2026-11-10 15:25 UTC (VOID 15:29 UTC)
