# Fable Night-Coord · MORGEN-SHIFT-ESCALATION · loop-tot:gecko-checkpoint-loop.zsh · 2026-11-14T05:55Z

## Status: Watch-Condition-THRESHOLD erreicht (3. FP in Folge)
Eskalations-Trigger: 3 aufeinanderfolgende False-Positive im 03:43Z-End-Rauschen —
Wake-92466 (05-52Z-Tape, Cycle 2014, FP #15) → Wake-93583 (05-54Z-Tape, Cycle 2018, FP #16)
→ Wake-94183 (Cycle 2021, FP #17). Ab FP #17 gilt die im Kanon definierte Eskalation
(„Eskalation bei 3. FP in Folge"). Kein Live-Edit des Loops (Morgen-Shift-Task).

## Root Cause (belegt)
- `fable-night-coord-loop.zsh` prüft den Team-Loop per `pgrep -f "gecko-checkpoint-loop.zsh"`.
- Der `loop-tot`-Event spawnt eine frische Wake-Agent-Instanz (`nohup opencode run --archived --auto "<brief>"`),
  deren Kommandozeile den Brief-Text enthält — und der Brief enthält wieder das Muster
  „gecko-checkpoint-loop.zsh" (Event-Tape-Pfad + Loop-Name).
- Folge: das pgrep-Muster trifft auf die eigene Wake-Agent-Kommandozeile → „LIVE(<wake-PID>)"
  = garantierte False-Positive (selbstreferentiell). Kein echter `gecko-checkpoint-loop.zsh`-Prozess existiert.
- Echter Gecko-Loop: planmäßig tot nach 8h-Fenster-Ende 03:43 UTC („CHECKPOINT-LOOP END 03:43 UTC"),
  watchdog.log ohne neue Restart-Events seit 01:09Z (ceo-trader) / zuletzt research-loop 20:07Z.

## Zustand beim Eskalations-Scan (05:55 UTC, frische Belege)
- Deposit: DNEBNjtW… 5993044 lp = CIO-Gate-Schwellwert, UNVERÄNDERT seit 04:11Z
  (F9Sj9aUa… 372364773, 9kT5EwF7… 854081) → KEIN Deposit-Handeln.
- Akku: 91–92% DISCHARGING, ~2:45 remaining, „Now drawing from Battery Power"
  (AC getrennt seit ~05:34 UTC) → über 35%-Warnschwelle, KEIN Akku-Event.
- Team-Loops: alle LIVE (cio-autotrade 67648, trade-watchdog 67724, agent-watchdog 70001,
  keepalive-trader 171, fable-loop-watchdog 90983, caffeinate 93637,
  marketing-taskforce-loop 96786, fable-research-loop 97509, fable-trade-loop 8178,
  Night-Coord 41198).
- git: HEAD=origin/main=39ec705, Drift 0/0, `merge-base --is-ancestor` OK → ff-only-kompatibel.

## Disposition (Kanon)
- Kein Gecko-Relaunch (planmäßiger Tod, 8h-Fenster).
- Kein Deposit-Handeln, kein Akku-Handeln.
- Eskalations-Artefakt = dieses Morgen-Shift-Handoff (path-scoped ff-only-Commit, mein Lane,
  `agents/inbox/all/*-fable-night*.md`). Keine Secrets (nur PIDs / Loop-Namen / Public-Shorties).

## Morgen-Shift-Aktionen
1. (a) `fable-night-coord-loop.zsh` — pgrep-Muster fixen: Wake-Agent-Instanzen ausschließen.
   Statt freien Substring `gecko-checkpoint-loop.zsh` (trefft die opencode-run-Kommandozeile)
   Präfix/Path-Match verwenden, z. B. `zsh .*agents.*gecko-checkpoint-loop\.zsh`,
   oder die Wake-Agent-PPID (41198-Nachkommen / `opencode run --archived`) explizit filtern.
   Ziel: das 03:43Z-End-Rauschen (FP-LIVE ↔ TOT-Flapping) unterbinden.
2. (b) AC-Stecker wieder verbinden (Batterie seit ~05:34 UTC im Discharge, ~2:45 Runzeit;
   Loops sind per caffeinate 93637 sleep-protected, aber Hardware-Risiko bei <35%).
