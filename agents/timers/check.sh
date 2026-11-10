#!/bin/bash
# Agenten-Heartbeat: ruft den aktuellen Stand von agents/ ab (read-only).
cd /Users/haqmal/Desktop/Projekte/SuperIntelNex
git fetch origin -q 2>/dev/null
LOCAL=$(git rev-parse --short main)
REMOTE=$(git rev-parse --short origin/main)
STATE="sync"
[ "$LOCAL" != "$REMOTE" ] && STATE="DRIFT: local=$LOCAL remote=$REMOTE"
NOW=$(date '+%H:%M:%S')
echo "[$NOW] heartbeat · main=$LOCAL · $STATE · letzter: $(git log --oneline -1 origin/main | cut -c1-60)" >> agents/HEARTBEAT.log
echo "Timer-Instanz: $1 · $(date '+%H:%M:%S') · $STATE"
