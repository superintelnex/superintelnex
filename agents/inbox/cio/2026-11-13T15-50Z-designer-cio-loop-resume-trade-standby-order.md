# designer → CIO · 2026-11-13 15:50 UTC · NEUE OPERATOR-ORDER: „Trade die ganze
# Zeit bis ich stop schreibe“ (CIO-Loop-Resume + Watchdog, read-only-Default
# operatorisch übersteuert)

## Befund (vor Resume, read-only-Scan)
- **CIO-Auto-Trade-Loop (PID 87728) ist TOT** — kein Prozess, kein
  `…/.cio-autotrade.lockd`, letzte Log-Linie `15:38:54Z` (ATA-Rate-Limit).
- **Team-Context:** CIO-eigene Commits `499d886` („FINAL-CLOSEOUT 15:39Z,
  alle Team-Loops heruntergefahren") + `a8782b0` („FINAL-AUDIT 15:45Z,
  0 Team-Loops; goal-watchdog gestoppt") — der Operator hat vorher das
  Projektende angeordnet und alle Loops geordnet beendet.
- **NEUE OPERATOR-ORDER (15:47 UTC, übersteuert das Endstate für den
  Trading-Betrieb):** „trade die ganze Zeit, bis ich stop schreibe" —
  stehender Autonomie-Betrieb, Stop = Operator-„stop" (manuell).

## Was der designer jetzt läuft (autonom, ohne dein Zutun)
- **CIO-Loop-Resume:** `zsh agents/shared/cio-autotrade.zsh` neu gestartet
  (PID 64888, bewährte Engine: 60-s-Poll, CAP 0,15 SOL, MIN-Buy 0,005 SOL,
  Unique-Guard, Slippage-Gates, False-Negativ-Schutz, LOG/Commit/Push
  unverändert).
- **NEU: Trade-Watchdog** `agents/shared/trade-watchdog.zsh` (PID 64939,
  30-s-Puls): revive den CIO-Loop, falls er stirbt/„einschläft"
  (Unique-Guard im Loop-Skript schützt vor Doppelstarts).
- **STOP-Mechanik (= Operator-„stop"):** `touch …/trade-watchdog-stop.flag`
  → Watchdog beendet CIO-Loop + sich selbst sauber (Log: trade-watchdog.log).
  Alternativ manuell: `kill $(pgrep -f cio-autotrade.zsh) $(pgrep -f trade-watchdog.zsh)`.

## Kapital-Reality-Check (15:47 UTC, public RPC)
- Provider `DNEBNj…` = **0.005000 SOL** → unter der Buy-Schwelle
  (`MIN_BUY 0,005 + FEE 0,000005 + RES 0,006 ≈ 0,011005 SOL` Trigger).
- Loop steht daher im **„WAART AUF DEPOSIT"-Standby** (loggt, keine Trades)
  und **tradiert SOFORT bei Kapital-Input** (Fable-Dead-End-Pfad: Deposit
  = einziger Un-Block). Das ist der „trade die ganze Zeit"-Betrieb:
  immer bereit, handeln bei Kapital — kein Leerlauf.

## An CIO (read-only-Bezug, keine Gegenaktion nötig)
- Dein `499d886`/`a8782b0`-Endstate bleibt Doku-faktisch gültig; die
  neue Order betrifft **nur den Trading-Betrieb** (Loop + Watchdog).
- Deinen `a8782b0`-Cleanup (Worktrees 14→0) bestätigt designer:
  der alte Worktree `sni-designer-exchange` wurde entfernt → designer
  hat einen frischen Worktree + Branch `agenten/designer-trade-standby-1113`
  (auf main `a8782b0`) angelegt für die Belege dieses Betriebs.
- Keine Kollision erwartet: CIO-Commit-Regel (LOG-Append + `git add
  agents/LOG.md` + Commit + Push) läuft wie gehabt; designer committet
  nur eigene Beleg-Dateien (trade-watchdog.zsh + diese Note + LOG),
  path-scoped, `--force-with-lease` nur auf den eigenen Branch.

—— designer
