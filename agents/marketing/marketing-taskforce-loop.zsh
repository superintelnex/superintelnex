#!/bin/zsh
# MARKETING-TASKFORCE-LOOP (Lead-Agent-Taktgeber, Nacht-Shift 13.11.2026)
#
# Taktgeber + Protokoll-Logger + Stop-Monitor fuer die Marketing-Taskforce
# (Dreier-Rollen-Modell: Research-Agent / Content-Agent / Operator-Kanal).
#
# - Laueft unendlich alle 15 Min (sleep 900) — API-Rate-Limit-Schutz.
# - Jeder Zyklus = EIN Log-Block (append-only) in marketing-taskforce-log.txt
#   (Format = Lead-Agent-Briefing, Abschnitt 'Takt & Protokoll').
# - Fuehrt SELBST keine Research/Content-Arbeit aus:
#   Die inhaltlichen Research/Content-Runden laufen durch die
#   Agenten-Koordination. Dieses Skript haelt nur Takt + Protokoll.
# - Stop-Bedingung: agents/timers/.stop-all ODER
#   agents/research/RESEARCH-STOP-Flag existiert -> finaler
#   TASKFORCE-END-Block, PID-Datei entfernen, EXIT.
# - PID: eigene PID in agents/marketing/marketing-taskforce.pid
#   (beim Exit: rm -f).
#
# Start: nohup zsh agents/marketing/marketing-taskforce-loop.zsh > /dev/null 2>&1 &

setopt shwordsplit
BASE=/Users/haqmal/Desktop/Projekte/SuperIntelNex
LOGF="$BASE/marketing-taskforce-log.txt"
PIDF="$BASE/agents/marketing/marketing-taskforce.pid"
STOP1="$BASE/agents/timers/.stop-all"
STOP2="$BASE/agents/research/RESEARCH-STOP-Flag"
CYCLE_S=900   # 15-Min-Takt (kein 20-s-Flapping, Rate-Limit-Schutz)

# PID festhalten (am Ende beim Exit: rm -f)
echo $$ > "$PIDF"

log() { echo "$*" >> "$LOGF"; }
now_utc() { date -u +%H:%M:%S; }

stop_flag_missing() { [[ ! -f "$STOP1" && ! -f "$STOP2" ]]; }

# EIN Zyklus-Log-Block (Format gem. Briefing 'Takt & Protokoll').
# Inhaltliche Runden laufen in der Agenten-Koordination: hier nur Takt melden.
log_block() {
  local n=$1 now
  now=$(now_utc)
  log "--- Zyklus $n (Lead-Agent) - $now UTC ---"
  log "Research-Agent : wartet frische Beleg-Runde (keyless-APIs, 1 Call/Quelle/Zyklus)"
  log "Content-Agent  : wartet Content-Update P1–P5 auf frischem Snapshot (dark-only-geprüft: ja)"
  log "Operator-Kanal : naechster Output → agents/outbox/operator/"
  log "Status         : OK (Stop-Flaggen: $(stop_flag_missing && echo "fehlen" || echo "PRUEFEN"))"
  local nxt
  nxt=$(date -u -v +${CYCLE_S}S +%H:%M:%S 2>/dev/null || date -u -d "+${CYCLE_S} seconds" +%H:%M:%S 2>/dev/null || echo "??:??:??")
  log "Nächster Zyklus: ~$nxt UTC"
  log ""
}

log "--- MARKETING-TASKFORCE-LOOP gestartet (PID $$, Takt ${CYCLE_S}s = 15 Min) ---"
log ""

CYCLE=1
while :; do
  # Stop-Bedingung: .stop-all ODER RESEARCH-STOP-Flag -> geordnet beenden
  if [[ -f "$STOP1" || -f "$STOP2" ]]; then
    log "--- TASKFORCE-END (Grund: Stop-Flag) - $(now_utc) UTC ---"
    log "Auswertung: $(wc -l < "$LOGF" 2>/dev/null | tr -d ' ') Zeilen in marketing-taskforce-log.txt, letzter OK-Zyklus: $((CYCLE - 1))"
    log ""
    rm -f "$PIDF"
    exit 0
  fi

  log_block "$CYCLE"
  CYCLE=$((CYCLE + 1))
  sleep "$CYCLE_S"
done
