#!/bin/zsh
# AGENT-WATCHDOG (generisch, CEO + weitere Agenten)
#
# Hueetet die in agents/timers/watchdog-reg.json registrierten Agenten:
#   1) RESTART  Ist die PID tot und kein Stop-Marker da -> Prozess neu starten.
#   2) WAKE     Liegt ein Status-Signal mit wake_reason vor -> OpenCode-Instanz
#                mit dem registrierten Wake-Prompt starten (Cooldown je Agent).
#
# Registry-Format (eine Key pro Agent, enabled=false = deaktiviert):
#   cmd          Startkommando (Shell-String, wird in der workdir via nohup ausgefuehrt)
#   workdir      Arbeitsverzeichnis (Default: Repo-Root)
#   pidfile      PID-Datei (relativ zum Repo-Root)
#   stopmarker   Datei (relativ): existiert = kein Restart / kein Wake
#   statusfile   Status-JSON mit {ts, reason, ...}
#   logfile      Restart-Output-Redirect
#   wake_reasons Liste der triggernde Reasons
#   wake_prompt  Prompt fuer die opencode-Weck-Instanz
#   cooldown_s   Mindestabstand zwischen zwei Wecks (Default 1800)
#
# Not-Off: agents/timers/.stop-all existiert -> Watchdog EXIT.
# Einzel-Off je Agent: agents/timers/.stop-<name> existiert -> dieser Agent nicht gemanagt.
# Protokoll: agents/timers/watchdog.log
#
# Start: nohup zsh agents/timers/agent-watchdog.sh > /dev/null 2>&1 &

setopt shwordsplit
BASE=/Users/haqmal/Desktop/Projekte/SuperIntelNex
REG="$BASE/agents/timers/watchdog-reg.json"
LOGF="$BASE/agents/timers/watchdog.log"
OCDIR=/Users/haqmal/.opencode/bin/opencode
CHECK_S=30

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" >> "$LOGF"; }

pid_alive() {
  local pidfile=$1
  [[ -f "$pidfile" ]] || return 1
  local pid
  pid=$(cat "$pidfile" 2>/dev/null)
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

log "AGENT-WATCHDOG gestartet (Registry: $REG, Check-Zyklus: ${CHECK_S}s)"

while :; do
  [[ -f "$BASE/agents/timers/.stop-all" ]] && { log "STOP-ALL-Marker gefunden -> EXIT"; break; }

  entries=$(python3 -c "
import json
reg = json.load(open('$REG'))
for k, v in reg.items():
    if k.startswith('_'):
        continue
    if v.get('enabled', True):
        print(k)
")

  for name in $entries; do
    [[ -f "$BASE/agents/timers/.stop-$name" ]] && { log "$name: Einzel-Stop-Marker -> nicht gemanagt"; continue; }

    cfg=$(python3 -c "
import json
print(json.dumps(json.load(open('$REG'))['$name']))")

    cfgget() { echo "$cfg" | python3 -c "import json,sys; v=json.load(sys.stdin); print(v.get('$1','') if '$1' != 'wake_reasons' else ' '.join(v.get('wake_reasons',[])))"; }
    workdir=$(cfgget workdir);        [[ -z "$workdir" ]] && workdir="$BASE"
    relpid=$(cfgget pidfile);        [[ -z "$relpid" ]] && continue
    relstop=$(cfgget stopmarker)
    relstatus=$(cfgget statusfile);   [[ -z "$relstatus" ]] && continue
    logfile=$(cfgget logfile);       [[ -z "$logfile" ]] && logfile="nohup.log"
    cmd=$(cfgget cmd);              [[ -z "$cmd" ]] && continue
    reasons=$(cfgget wake_reasons)
    prompt=$(cfgget wake_prompt)
    cooldown=$(cfgget cooldown_s);  [[ -z "$cooldown" ]] && cooldown=1800

    pidfile="$BASE/$relpid"
    statusfile="$BASE/$relstatus"

    # --- 1) RESTART-Check ---
    if ! pid_alive "$pidfile"; then
      if [[ -n "$relstop" && -f "$BASE/$relstop" ]]; then
        log "$name: Prozess tot + Stop-Marker -> Endzustand, kein Restart"
      else
        log "$name: Prozess tot -> NEU STARTEN: $cmd"
        ( cd "$workdir" && nohup zsh -c "$cmd" >> "$BASE/$logfile" 2>&1 & )
        sleep 2
      fi
    fi

    # --- 2) WAKE-Check ---
    [[ -f "$statusfile" ]] || continue
    statusdata=$(cat "$statusfile" 2>/dev/null)
    reason=$(echo "$statusdata" | python3 -c "import json,sys
try: print(json.load(sys.stdin).get('reason',''))
except Exception: print('')")

    for r in $reasons; do
      if [[ "$reason" == "$r" ]]; then
        lastwake="$BASE/agents/timers/.lastwake-$name"
        now=$(date +%s); last=0
        [[ -f "$lastwake" ]] && last=$(cat "$lastwake")
        if (( now - last >= cooldown )); then
          echo "$now" > "$lastwake"
          log "$name: WAKE-Signal (reason=$reason) -> opencode run"
          ( cd "$workdir" && nohup $OCDIR run "$prompt" >> "$BASE/agents/timers/.wake-$name.log" 2>&1 & )
        else
          log "$name: WAKE-Signal ($reason) -> Cooldown aktiv, beim naechsten Tick erneut pruefen"
        fi
      fi
    done
  done

  sleep "$CHECK_S"
done
