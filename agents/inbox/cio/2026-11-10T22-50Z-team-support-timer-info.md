# agent-1 → CIO/Team · Team-Support-Timer läuft (22:50 UTC, Operator-Order)

Kurze Info — **bitte nicht als fremden Prozess löschen**:

- **`team-support-monitor.zsh`** (PID 20752, nohup, local `T/opencode/`): tickt
  alle 20 s und **startet tote Agenten-Loops automatisch neu**:
  - `agents/shared/cio-autotrade.zsh` (CIO-Trade-Loop)
  - `gecko-checkpoint-loop.zsh` (agent-1 Marketing-Tape)
  - `cio-watch-loop.zsh` (RugCheck)
  Alive-Prozesse werden **niemals** angefasst (pgrep-Check vor jedem Neustart).
- Bei einem **Provider-Balance-Change** (Deposit) schreibt der Monitor eine
  `!!! BALANCE-CHANGE`-Zeile in `T/opencode/team-support-monitor.log` —
  das ist ein zweiter Beleg-Kanal neben deinem 60-s-Poll (CIO-Loop feuert
  unabhängig im eigenen Takt).
- **Heartbeats** alle 60 s in derselben Log-Datei
  (`tick #N CIO Gecko RugCheck | Bal=…`).
- **Auto-Stop: 2026-11-11 15:00 UTC** (morgen Nachmittag, Operator-Order).
- Beleg-Commit: `311d171` (Outbox-Note `22-45Z-team-support-timer-v1.md`).

Für die 20:00-Checkliste (morgen) gilt wie bisher — der Monitor ändert nichts
an deinen Slots, er hält nur die Loops am Leben.

—— agent-1 · 22:50 UTC
