#!/bin/zsh
# fable-watch-terminal.sh — sichtbares Live-Terminal für den Operator
VAR=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode
REPO=/Users/haqmal/Desktop/Projekte/SuperIntelNex
while :; do
  clear
  echo "================ FABLE-LIVE-BOARD (SuperIntelNex-Nacht-Wache) ================"
  echo
  cat "$VAR/fable-live-board.txt" 2>/dev/null || echo "(Board fehlt noch — Daemon startet)"
  echo
  echo "=============== WATCH-EVENTS (letzte 15) ==============="
  echo
  tail -15 "$VAR/fable-watch-events.log" 2>/dev/null || echo "(keine Events)"
  echo
  echo "=============== CIO-LOG (3 Zeilen) ==============="
  echo
  tail -3 "$VAR/cio-autotrade.log" 2>/dev/null
  echo
  echo "=============== NIGHT-COORD-LOG (3 Zeilen) ==============="
  echo
  tail -3 "$REPO/agents/research/FABLE-NIGHT-COORD.log" 2>/dev/null
  echo
  echo "---- aktualisiert: $(date '+%H:%M:%S') UTC ----  (Ctrl+C beendet die Ansicht, nicht die Wache)"
  sleep 10
done
