#!/bin/zsh
# fable-supervisor-snapshot.sh — read-only Wache-Snapshot für die fable-Timer-Pässe
#
# Kontext: fable (agent-1) läuft als Timer-Aufsicht für die Nacht-Shift
# (GitHub-Issues #30–#35). Alle ~10 min wird dieses Skript per
# Hintergrund-Befehl ausgeführt; der Ausgabetext ist die Basis für den
# Wache-Pass (Beurteilung + ggf. LOG-Append/Push).
#
# Regimen:
#  - Read-only: keine Tx, keine fremden Dateien anfassen (BOARD-Regel 6).
#  - Stop-Flag: agents/timers/.stop-fable-supervisor existiert → Pass wird
#    übersprungen und der Timer-Run schweigt (fable stoppt das Wieder-Schlafen).
#  - Auffälligkeit (PID TOT, Deposit erkannt, Freeze) → fable meldet sofort
#    (Digest/Inbox-Note), nicht erst beim nächsten Takt (Issue #34-Regel).

setopt print_exit_value
cd "/Users/haqmal/Desktop/Projekte/SuperIntelNex" || exit 1
VAR="/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "=== fable-supervisor-Pass $TS ==="

if [[ -f agents/timers/.stop-fable-supervisor ]]; then
  echo "STOP-FLAG PRESENT (.stop-fable-supervisor) — Pass übersprungen, Timer endet hier"
  exit 0
fi

echo "--- Loop-PID-Health (Bezug PIDs: Trade 8178/90983, CIO 67648/67724, Keepalive 72838, Research 97509, Marketing 96786, Gecko 87539, DesignerSup 2421, caffeinate 93637) ---"
for pid in 8178 90983 67648 67724 72838 97509 96786 87539 2421 93637; do
  if ps -p "$pid" > /dev/null 2>&1; then
    echo "PID $pid OK"
  else
    echo "PID $pid TOT ⚠ (Watchdog-Relaunch möglich?)"
  fi
done

echo "--- Deposit-Status (#32: CIO-Autotrade + Fable-Trade-Loop) ---"
tail -2 "$VAR/cio-autotrade.log" 2>/dev/null || echo "(CIO-Log $VAR/cio-autotrade.log nicht erreichbar)"
tail -3 agents/trade-loop/LOG-loop.log 2>/dev/null || echo "(LOG-loop.log fehlt)"

echo "--- Research-Loop (#30, RESEARCH-SIN.log) ---"
tail -5 agents/research/RESEARCH-SIN.log 2>/dev/null || echo "(RESEARCH-SIN.log fehlt)"

echo "--- Gecko-Checkpoint-Loop (#34) ---"
tail -3 "$VAR/gecko-checkpoint.log" 2>/dev/null || echo "(Gecko-Log nicht erreichbar)"

echo "--- Marketing-Taskforce (#31) ---"
grep -E "^Status|Nächster Zyklus" marketing-taskforce-log.txt 2>/dev/null | tail -2

echo "--- Designer-Supervisor (read-only Conflict-Alerts) ---"
tail -1 "$VAR/designer-trade-supervisor.log" 2>/dev/null || echo "(Supervisor-Log nicht erreichbar)"

echo "--- Hardware (#33: AC + Freeze-Detection) ---"
pmset -g batt | head -2
pmset -g log | grep -E " 2026-11-1[34].*\bSleep\b" | tail -1

echo "--- Git main (letzter origin/Kopf) ---"
git log --oneline -2 2>/dev/null
