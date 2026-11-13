#!/bin/zsh
# Fable Night-Coord-Loop v2 · POLL=15s (10–20s-Takt, Operator-Feedback 20:57Z) · autonom (kein Chat-Trigger)
# Stop-Flaggen: agents/timers/.stop-all | agents/timers/.stop-fable-night
# Log: agents/research/FABLE-NIGHT-COORD.log (append-only, im Repo)
# Event-Tapes: agents/outbox/operator/<ts>-fable-night-event-<typ>.md
# Kanon: path-scoped Commits (nur eigene Files), ff-only, NIEMALS force-push,
#       keine Secrets in Log/Tapes/Commits, fremde Dirty-Files unangetastet.
setopt null_glob
cd /Users/haqmal/Desktop/Projekte/SuperIntelNex || exit 1
POLL=15
LOG=agents/research/FABLE-NIGHT-COORD.log
TDIR=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode
MY_TAIL=$TDIR/fable-my-log-tail.txt      # meine LOG-Blöcke seit letztem origin-Push
DENO=/Users/haqmal/.deno/bin/deno
BAL=/tmp/bal-check.ts
GECKO=$TDIR/gecko-checkpoint.log
DEPOSIT_WARN=8000000
CIO_REGIME=12000000
BATT_WARN=35
# path-scoped eigene Dateien (glob null_glob)
MY_FILES=(
  "agents/research/fable-night-coord-loop.zsh"
  "agents/research/fable-night-coord.pid"
  $LOG
  agents/inbox/all/*-fable-night*.md
  agents/outbox/operator/*-fable-night-event-*.md
)
echo $$ > agents/research/fable-night-coord.pid

log()  { local m="$(date -u +%Y-%m-%dT%H:%M:%SZ) $*"; echo "$m" >> $LOG; echo "$m" >> $MY_TAIL; }

pre_sync() { # ff-only-Pull; bei un-pusheten eigenen Commits → Recovery
  git fetch -q origin 2>/dev/null
  if (( $(git rev-list origin/main..main --count 2>/dev/null) > 0 )); then
    push_fail_recovery
    return $?
  fi
  if (( $(git rev-list main..origin/main --count 2>/dev/null) > 0 )); then
    if ! git pull --ff-only -q origin main 2>/dev/null; then
      log "PRE-SYNC: ff-only-Pull blockiert (fremde dirty Files?) — Commit dieser Zyklus verzögert, Retry nächste Runde (kein force)"
      return 1
    fi
  fi
  return 0
}

push_fail_recovery() { # Push-Race: HEAD logisch zurück, fremde Worktree-Files bleiben unangetastet,
                      # LOG aus origin + meine eigenen Blöcke neu zusammensetzen, path-scoped Re-Commit
  git fetch -q origin 2>/dev/null || return 1
  local om=$(git rev-parse origin/main 2>/dev/null) || return 1
  git reset --mixed -q $om 2>/dev/null || { log "RECOVERY-FAIL: mixed-reset"; return 1; }
  git checkout -q origin/main -- agents/LOG.md 2>/dev/null
  [[ -f $MY_TAIL ]] && cat $MY_TAIL >> agents/LOG.md
  git add ${MY_FILES} 2>/dev/null
  git commit -q -m "fable-night-coord: Recovery-Commit (Push-Race ff-only, $(date -u +%H:%M:%SZ))" 2>/dev/null || { log "RECOVERY-FAIL: commit"; return 1; }
  if ! git push -q origin main 2>/dev/null; then
    log "RECOVERY-PUSH-FAIL: origin lieferte weiter, Retry nächsten Zyklus (kein force)"
    return 1
  fi
  : > $MY_TAIL
  log "RECOVERY-OK: ff-only-Recommit, fremde Dateien unangetastet"
  return 0
}

add_and_commit() { # $1=Meldung; pre-synced Aufruf erwartet (außer Recovery)
  pre_sync || return 1
  git add ${MY_FILES} 2>/dev/null
  if git diff --cached --quiet 2>/dev/null; then
    log "COMMIT-SPRING: $1 (keine Änderungen)"
    return 0
  fi
  git commit -q -m "fable-night-coord: $1" 2>/dev/null || return 1
  if git push -q origin main 2>/dev/null; then
    : > $MY_TAIL
    log "COMMIT+PUSH OK: $1"
  else
    push_fail_recovery
  fi
}

event() { # $1=typ $2=Belegtext (eigenes Tape → Outbox, path-scoped Commit)
  local ts tape
  ts=$(date -u +%Y-%m-%dT%H-%MZ)
  tape="agents/outbox/operator/${ts}-fable-night-event-$1.md"
  {
    echo "# Fable Night-Coord · Event: $1 · $(date -u)"
    echo
    echo "$2"
    echo
    echo "## Letzter Log-Kontext"
    tail -14 $LOG
  } > "$tape"
  log "EVENT[$1]: Tape $tape"
  add_and_commit "Event $1"
}

last_lp=""
batt_warned=""
dead_seen=""
log "LOOP-START v1 (POLL=600s, PID=$$)"
add_and_commit "Loop-Start (autonomer 10-Min-Takt, kein Chat-Trigger)"

while true; do
  if [[ -f agents/timers/.stop-all || -f agents/timers/.stop-fable-night ]]; then
    log "STOP-FLAG erkannt → Loop beende sauber (Flagge NICHT entfernt, Operator-Entscheidung)"
    rm -f agents/research/fable-night-coord.pid
    add_and_commit "Loop-End (Stop-Flag)"
    break
  fi

  n=$((n+1))
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  lp=""
  batt=""
  dead_now=""

  {
    echo "=== CYCLE $n · $ts ==="
    if [[ -f $BAL ]]; then
      lp=$($DENO run --allow-read --allow-net $BAL 2>/dev/null | grep '^DNEBNjtW' | sed 's/.*: *\([0-9]*\) lp.*/\1/' | head -1)
      echo "Provider-LP: ${lp:-FALL (deno/RPC)}"
    else
      echo "Provider-LP: FALL (bal-check.ts fehlt, Reboot?)"
    fi
    batt=$(pmset -g batt 2>/dev/null | sed -n '2p')
    echo "Battery: ${batt:-unbekannt}"
    for pat in "cio-autotrade.zsh" "trade-watchdog.zsh" "agent-watchdog.sh" "keepalive-trader.py" "gecko-checkpoint-loop.zsh" "fable-loop-watchdog.sh" "caffeinate" "marketing-taskforce-loop.zsh" "fable-research-loop.sh" "fable-trade-loop.sh"; do
      p=$(pgrep -f "$pat" 2>/dev/null | head -1)
      if [[ -n $p ]]; then echo "  ${pat%%.*}: LIVE($p)"; else echo "  ${pat%%.*}: TOT"; dead_now="$dead_now ${pat}"; fi
    done
    [[ -f $GECKO ]] && echo "Gecko-letzte: $(tail -1 $GECKO)"
    echo "Git: origin/main $(git rev-list main..origin/main --count 2>/dev/null) Commits vor main (ff-erhältlich)"
    echo
  } >> $LOG

  # Events (nur bei Zustandswechsel)
  if [[ -n $lp ]]; then
    if (( lp >= CIO_REGIME )) && (( ${last_lp:-0} < CIO_REGIME )); then
      event "cio-regime" "Provider $lp lp ≥ $CIO_REGIME → CIO-Regime: CIO übernimmt ab 12e6, Fable-Trade-Loop räumt die Bühne (Single-Writer-Kanon)."
    elif (( lp >= DEPOSIT_WARN )) && (( ${last_lp:-0} < DEPOSIT_WARN )); then
      event "deposit-frühwarnung" "Provider $lp lp ≥ $DEPOSIT_WARN → Deposit-Ankunft wahrscheinlich (Ziel-Regime $CIO_REGIME lp)."
    fi
    last_lp=$lp
  fi
  local pct
  pct=$(echo "$batt" | grep -o '[0-9]*%' | head -1 | grep -o '[0-9]*')
  if [[ $batt == *"not charging"* || ( -n $pct && $pct -lt $BATT_WARN ) ]] && [[ $batt_warned != "$batt" ]]; then
    event "akku-warnung" "pmset: $batt — nicht ladeend oder unter ${BATT_WARN}%, Hardware-Blocker-Risiko (Freeze/Reboot) prüfen."
    batt_warned=$batt
  elif [[ $batt != *"not charging"* && -n $batt_warned ]]; then
    batt_warned=""
  fi
  # Zustandwechsel: erst bei neuer Toter-Entität feuern; wiederlebende aus Sichteliste streichen
  for d in ${=dead_now}; do
    if [[ " $dead_seen " != *" $d "* ]]; then
      event "loop-tot:$d" "Team-Loop '${d%%.*}' nicht mehr erreichbar (pgrep-Muster leer). Watchdog-Check: agents/timers/watchdog.log."
      dead_seen="$dead_seen $d"
    fi
  done
  for d in ${=dead_seen}; do
    [[ " $dead_now " == *" $d "* ]] || dead_seen="${dead_seen// $d/}"
  done

  # Stündlicher Checkpoint-Commit (eigene Dateien, path-scoped)
  if (( n % 6 == 0 )); then
    add_and_commit "Zyklus-Checkpoint ($n)"
  fi
  sleep $POLL
done
log "LOOP-END $(date -u)"
