#!/bin/zsh
# Fable Night-Coord-Loop v2 · POLL=15s (10–20s-Takt, Operator-Feedback 20:57Z) · autonom
# Stop-Flaggen: agents/timers/.stop-all | agents/timers/.stop-fable-night
# Log: agents/research/FABLE-NIGHT-COORD.log (rotation: >5000 Zeilen → TDIR-Archiv, mein Lane-File)
# Event-Tapes: agents/outbox/operator/<ts>-fable-night-event-<typ>.md (nur bei Zustandswechsel + Hysteresen)
# Kanon: path-scoped Commits (nur eigene Files), ff-only, NIEMALS force-push, keine Secrets.
#       Git-fetch nur bei Commits (Events/Stunden-Checkpoint), NICHT im 15s-Zyklus (Rate-Limit-Schonung).
setopt null_glob
cd /Users/haqmal/Desktop/Projekte/SuperIntelNex || exit 1
POLL=15
LOG=agents/research/FABLE-NIGHT-COORD.log
TDIR=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode
MY_TAIL=$TDIR/fable-my-log-tail.txt
DENO=/Users/haqmal/.deno/bin/deno
BAL=/tmp/bal-check.ts
GECKO=$TDIR/gecko-checkpoint.log
DEPOSIT_WARN=8000000
CIO_REGIME=12000000
BATT_WARN=35
LOG_MAX=5000
MY_FILES=(
  "agents/research/fable-night-coord-loop.zsh"
  "agents/research/fable-night-coord.pid"
  $LOG
  agents/inbox/all/*-fable-night*.md
  agents/outbox/operator/*-fable-night-event-*.md
)
echo $$ > agents/research/fable-night-coord.pid

log()  { local m="$(date -u +%Y-%m-%dT%H:%M:%SZ) $*"; echo "$m" >> $LOG; echo "$m" >> $MY_TAIL; }

pre_sync() { # ff-only; bei un-pusheten eigenen Commits → Recovery
  git fetch -q origin 2>/dev/null
  if (( $(git rev-list origin/main..main --count 2>/dev/null) > 0 )); then
    push_fail_recovery
    return $?
  fi
  if (( $(git rev-list main..origin/main --count 2>/dev/null) > 0 )); then
    if ! git pull --ff-only -q origin main 2>/dev/null; then
      log "PRE-SYNC: ff-only-Pull blockiert (fremde dirty Files?) — Commit verzögert, Retry (kein force)"
      return 1
    fi
  fi
  return 0
}

push_fail_recovery() { # Push-Race: fremde Worktree-Files unangetastet, LOG aus origin + meine Blöcke
  git fetch -q origin 2>/dev/null || return 1
  local om
  om=$(git rev-parse origin/main 2>/dev/null) || return 1
  git reset --mixed -q $om 2>/dev/null || { log "RECOVERY-FAIL: mixed-reset"; return 1; }
  git checkout -q origin/main -- agents/LOG.md 2>/dev/null
  [[ -f $MY_TAIL ]] && cat $MY_TAIL >> agents/LOG.md
  git add ${MY_FILES} 2>/dev/null
  git commit -q -m "fable-night-coord: Recovery-Commit (Push-Race ff-only, $(date -u +%H:%M:%SZ))" 2>/dev/null || { log "RECOVERY-FAIL: commit"; return 1; }
  if ! git push -q origin main 2>/dev/null; then
    log "RECOVERY-PUSH-FAIL: origin lieferte weiter, Retry (kein force)"
    return 1
  fi
  : > $MY_TAIL
  log "RECOVERY-OK: ff-only-Recommit, fremde Dateien unangetastet"
  return 0
}

add_and_commit() { # $1=Meldung
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

event() { # $1=typ $2=Belegtext
  local ts tape
  ts=$(date -u +%Y-%m-%dT%H-%MZ)
  tape="agents/outbox/operator/${ts}-fable-night-event-$1.md"
  {
    echo "# Fable Night-Coord · Event: $1 · $(date -u)"
    echo
    echo "$2"
    echo
    echo "## Letzter Log-Kontext"
    tail -20 $LOG
  } > "$tape"
  log "EVENT[$1]: Tape $tape"
  add_and_commit "Event $1"
  # CRITICAL → frische Agent-Instanz aufwecken (headless opencode, archiviert = taucht nicht in Session-Liste auf)
  #   kritische Typen: cio-regime / deposit-frühwarnung / akku-warnung / loop-tot:*
  if [[ $1 == cio-regime || $1 == deposit-frühwarnung || $1 == akku-warnung || $1 == loop-tot:* ]]; then
    wake_agent "$1" "$tape"
  fi
}

wake_agent() { # $1=typ $2=tape
  local brief
  brief="Kritisches Event aus der Fable-Night-Coord-Loop ($1). Lies das Event-Tape: ${2}. Prüfe den aktuellen Zustand (Deposit-Balance via /tmp/bal-check.ts, Akku via pmset, Team-Loops via pgrep, git origin/main) und triff die nächste Maßnahme im Kanon (path-scoped ff-only Commits, keine Secrets, fremde Dirty-Files unangetastet). Event-Tape + Log: agents/research/FABLE-NIGHT-COORD.log."
  log "WAKE-AGENT: spawn frische Instanz für Event '$1'"
  nohup opencode run --archived --auto "$brief" \
    >> $TDIR/fable-wake-agent.log 2>&1 &
  log "WAKE-AGENT: PID $! (out: $TDIR/fable-wake-agent.log)"
}

rotate_log() {
  local lines
  lines=$(wc -l < $LOG 2>/dev/null || echo 0)
  if (( lines > LOG_MAX )); then
    mv $LOG $TDIR/fable-night-coord-archive-$(date -u +%Y%m%dT%H%MZ).log
    : > $LOG
    log "LOG-ROTATION: Archiv $TDIR/fable-night-coord-archive-* (mein Lane-File, nicht append-only-Team-LOG)"
  fi
}

# Hysteresen-Zustände
last_lp=""
st_dep=0      # 0 = nicht gewarnt; 1 = Deposit-Frühwarnung aktiv (Clear erst unter 7.2e6 = 0.9*WARN)
st_cio=0      # 1-shot: CIO-Regime erkannt
st_batt=0     # 0 = Akku-OK-Status; 1 = gewarnt
batt_good_strikes=0

log "LOOP-START v2 (POLL=15s, PID=$$)"
add_and_commit "Loop-Start v2 (15s-Takt)"

while true; do
  if [[ -f agents/timers/.stop-all || -f agents/timers/.stop-fable-night ]]; then
    log "STOP-FLAG erkannt → Loop beende sauber (Flagge NICHT entfernt)"
    rm -f agents/research/fable-night-coord.pid
    add_and_commit "Loop-End (Stop-Flag)"
    break
  fi

  n=$((n+1))
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  lp=""
  batt=""
  dead_now=""

  # Zyklus-Block: billige Lokale (kein git-fetch im 15s-Zyklus)
  {
    echo "=== CYCLE $n · $ts ==="
    if [[ -f $BAL ]]; then
      lp=$($DENO run --allow-read --allow-net $BAL 2>/dev/null | grep '^DNEBNjtW' | sed 's/.*: *\([0-9]*\) lp.*/\1/' | head -1)
      echo "Provider-LP: ${lp:-FALL (deno/RPC)}"
    else
      echo "Provider-LP: FALL (bal-check.ts fehlt?)"
    fi
    batt=$(pmset -g batt 2>/dev/null | sed -n '2p')
    echo "Battery: ${batt:-unbekannt}"
    # Self-Referenz-Schutz (FP#17–25): Unsere Wake-Agents (opencode run) tragen den
    # Event-Namen (z. B. "loop-tot:gecko-checkpoint-loop.zsh") in der Kommandozeile →
    # pgrep -f false-positiv → Flap-Tode. opencode-Prozesse gelten NICHT als Live-Loop.
    for pat in "cio-autotrade.zsh" "trade-watchdog.zsh" "agent-watchdog.sh" "keepalive-trader.py" "gecko-checkpoint-loop.zsh" "fable-loop-watchdog.sh" "caffeinate" "marketing-taskforce-loop.zsh" "fable-research-loop.sh" "fable-trade-loop.sh"; do
      p=""
      for pid in $(pgrep -f "$pat" 2>/dev/null); do
        case "$(ps -o command= -p $pid 2>/dev/null)" in
          *opencode\ run*) continue ;;   # NUR Wake-Agent-CLI ausschließen (kein /T/opencode/-Pfad!)
        esac
        p=$pid
        break
      done
      if [[ -n $p ]]; then echo "  ${pat%%.*}: LIVE($p)"; else echo "  ${pat%%.*}: TOT"; dead_now="$dead_now ${pat}"; fi
    done
    [[ -f $GECKO ]] && echo "Gecko-letzte: $(tail -1 $GECKO)"
    echo
  } >> $LOG

  # --- Events (nur Zustandswechsel, mit Hysteresen gegen Flapping) ---
  if [[ -n $lp ]]; then
    # Deposit-Frühwarnung: Feuer bei Übergang nach oben; Clear erst unter 7.2e6
    if (( lp >= DEPOSIT_WARN )) && (( st_dep == 0 )); then
      st_dep=1
      event "deposit-frühwarnung" "Provider $lp lp ≥ $DEPOSIT_WARN → Deposit-Ankunft wahrscheinlich (CIO-Regime-Ziel $CIO_REGIME lp)."
    elif (( lp < DEPOSIT_WARN * 0.9 )) && (( st_dep == 1 )); then
      st_dep=0; last_lp=""
    fi
    # CIO-Regime: 1-shot
    if (( lp >= CIO_REGIME )) && (( st_cio == 0 )); then
      st_cio=1
      event "cio-regime" "Provider $lp lp ≥ $CIO_REGIME → CIO-Regime: CIO übernimmt ab 12e6, Fable-Trade-Loop räumt die Bühne (Single-Writer-Kanon)."
    fi
    last_lp=$lp
  fi
  # Akku: Warnung = (pct < 35) UND NICHT (AC-attached + aktiv ladend)
  pct=$(echo "$batt" | grep -o '[0-9]*%' | head -1 | grep -o '[0-9]*')
  charging_now=0
  [[ $batt == *"AC attached; charging"* ]] && charging_now=1
  if [[ -n $pct && $pct -lt $BATT_WARN && $charging_now -eq 0 ]]; then
    if (( st_batt == 0 )); then
      st_batt=1
      event "akku-warnung" "pmset: $batt — unter ${BATT_WARN}% und nicht aktiv ladend → Hardware-Risiko (Freeze/Reboot) prüfen."
    fi
    batt_good_strikes=0
  else
    if (( st_batt == 1 )); then
      batt_good_strikes=$((batt_good_strikes+1))
      if (( batt_good_strikes >= 3 )); then st_batt=0; batt_good_strikes=0; fi
    fi
  fi
  # Gecko 8h-Fenster: sauberes "CHECKPOINT-LOOP END" im Log = erwarteter Fenster-Ende,
  # KEIN Alarm → auto-Relaunch frischer 8h-Instanz (stoppt die FP-Tape-Flut).
  # Abnormales Ende (Log-Ende ≠ END) fällt durch → Event + Wake-Agent wie gehabt.
  if [[ $dead_now == *"gecko-checkpoint-loop.zsh"* ]]; then
    gtail=$(tail -1 $GECKO 2>/dev/null || echo "")
    if [[ $gtail == *"CHECKPOINT-LOOP END"* && -f $TDIR/gecko-checkpoint-loop.zsh ]]; then
      nohup zsh $TDIR/gecko-checkpoint-loop.zsh >/dev/null 2>&1 &
      log "GECKO-RELAUNCH: 8h-Fenster sauber beendet ('$(echo $gtail)') → frische Instanz PID $! (Ende ~+8h)"
      dead_now=${dead_now//gecko-checkpoint-loop.zsh/}
    fi
  fi

  # Team-Loop-tot: erst bei neuer Entität; wiederlebende aus Sichteliste streichen
  for d in ${=dead_now}; do
    if [[ " $dead_seen " != *" $d "* ]]; then
      event "loop-tot:$d" "Team-Loop '${d%%.*}' nicht mehr erreichbar (pgrep-Muster leer). Watchdog: agents/timers/watchdog.log."
      dead_seen="$dead_seen $d"
    fi
  done
  for d in ${=dead_seen}; do
    [[ " $dead_now " == *" $d "* ]] || dead_seen="${dead_seen// $d/}"
  done

  # Stunden-Checkpoint-Commit (git-fetch erst hier, 240 Zyklen × 15s = 1h)
  if (( n % 240 == 0 )); then
    add_and_commit "Zyklus-Checkpoint ($n)"
  fi
  rotate_log
  sleep $POLL
done
log "LOOP-END $(date -u)"
