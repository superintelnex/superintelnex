#!/bin/bash
# Agenten-Koordinations-Monitor (read-only, ohne Pushes).
# - alle 20 s:  Heartbeat-Check (check.sh) → agents/timers/HEARTBEAT.log
# - alle 60 s:  zusätzlich Remote-Sync-Check + neue Agenten-Commits auf origin/main
# Läuft lokal, bis die Uhr 20:00 (+01) erreicht, dann beendet er sich selbst.
# Basis für den 20:00-Zyklus: die letzten Einträge in HEARTBEAT.log.
cd /Users/haqmal/Desktop/Projekte/SuperIntelNex || exit 1
CHECK="agents/timers/check.sh"
STATE=agents/timers/.last-main
ITER=0
while :; do
  sleep 20
  NOW=$(date +%H%M)
  if [ "$NOW" -ge 2000 ]; then
    echo "[$(date '+%H:%M:%S')] Monitor beendet — 20:00 erreicht. Iterationen: $ITER" >> agents/timers/HEARTBEAT.log
    break
  fi
  ITER=$((ITER+1))
  # 20s-Tick: Heartbeat
  "$CHECK" "t20s"
  # 60s-Tick (jeder 3. Durchlauf): Remote-Sync-Check
  if [ $((ITER % 3)) -eq 0 ]; then
    git fetch origin -q 2>/dev/null
    REMOTE=$(git rev-parse --short origin/main)
    LAST=$(cat "$STATE" 2>/dev/null)
    echo "$REMOTE" > "$STATE"
    if [ -n "$LAST" ] && [ "$REMOTE" != "$LAST" ]; then
      echo "[$(date '+%H:%M:%S')] NEUER MAIN-STAND: $LAST → $REMOTE" >> agents/timers/HEARTBEAT.log
      git log --oneline "$LAST..origin/main" -- agents/ | head -5 >> agents/timers/HEARTBEAT.log
    fi
    # Drift-Erkennung (lokaler Stand hinter remote?)
    LOCAL=$(git rev-parse --short main)
    if [ "$LOCAL" != "$REMOTE" ]; then
      echo "[$(date '+%H:%M:%S')] DRIFT: local main=$LOCAL, remote=$REMOTE (als Koordinator evtl. fetch/rebase + Push)" >> agents/timers/HEARTBEAT.log
    fi
  fi
done
echo "Monitor-Loop beendet."
