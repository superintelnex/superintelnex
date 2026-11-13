#!/bin/zsh
# GOAL-WATCHDOG
# Monitoring für die Zielerreichung bis 13.11.2026 09:00 UTC.
# Prüft auf neue Dateien in agents/inbox und outbox alle 60 Sekunden.

LOG=/Users/haqmal/Desktop/Projekte/SuperIntelNex/agents/timers/watchdog.log
INBOX=/Users/haqmal/Desktop/Projekte/SuperIntelNex/agents/inbox
OUTBOX=/Users/haqmal/Desktop/Projekte/SuperIntelNex/agents/outbox

echo "[$(date -u)] Watchdog gestartet. Monitor-Ziel: 2026-11-13 09:00 UTC." > "$LOG"

while :; do
    find "$INBOX" "$OUTBOX" -type f -mmin -1 | while read -r file; do
        echo "[$(date -u)] NEUE AKTIVITÄT: $file" >> "$LOG"
    done
    sleep 60
done
