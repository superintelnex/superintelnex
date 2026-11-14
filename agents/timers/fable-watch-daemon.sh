#!/bin/zsh
# fable-watch-daemon.sh — Event-Getriebener Wache-Terminal für fable (Session-Timer-Ersatz)
#
# Takt: 20 s. Schreibt alle 20 s ein Live-Board ($VAR/fable-live-board.txt) und
# prüft auf Zustandswechsel. Bei CRITICAL-Event → EXIT (Session-Benachrichtigung
# weckt fable; danach Neustart des Daemons). Alle 600 s ohne CRITICAL →
# HEARTBEAT-EXIT (10-Min-Wache-Pass wie gehabt).
#
# CRITICAL-Events (sofortig Exit):
#   DEPOSIT-FRÜHWARNUNG  Provider-lp ≥ 8e6  (CIO-Regime ≥12e6 = zweites Ereignis)
#   HARDWARE             Akku nicht-langsamer-Charging-fallende-Untergrenze:
#                        <35 % oder „not charging" oder AC getrennt
#   FREEZE               neuer Sleep-Eintrag in pmset-Log (alle Loops eingefroren)
#   LOOP-TOT             ein Team-Loop-PID fehlt (Watchdogs könnten relaunchen →
#                        fable prüft beim Wachen ob er neu lebt)
# NOTE-Events (nur Board, kein Exit):
#   GIT-NEU              origin/main lieferte neue Commits (andere Agenten aktiv)
#   INBOX-NEU            neue Notiz in agents/inbox/fable/
#
# Regimen: read-only, keine fremden Dateien, kein Push aus dem Daemon.
# State: $VAR/fable-watch-state (fortführung über Neustarts).
setopt null_glob print_exit_value
REPO=/Users/haqmal/Desktop/Projekte/SuperIntelNex
VAR=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode
BOARD=$VAR/fable-live-board.txt
STATE=$VAR/fable-watch-state
EVENTS=$VAR/fable-watch-events.log
DESUP=$VAR/designer-trade-supervisor.log
CIOLOG=$VAR/cio-autotrade.log
cd "$REPO" || exit 1

# --- Ein-Instanz-Guard (23:26Z-Doppel-Heartbeats: parallele Daemon-Instanzen
# teilen sich $STATE und feuern doppelte Heartbeats) --------------------------
LOCK=$VAR/fable-watch-daemon.lock
if [[ -f $LOCK ]] && kill -0 "$(cat $LOCK 2>/dev/null)" 2>/dev/null; then
  echo "FABLE-WATCH-DAEMON: andere Instanz läuft (PID $(cat $LOCK)) — EXIT ohne Heartbeat"
  exit 0
fi
echo $$ > $LOCK
trap 'rm -f $LOCK' EXIT

# --- State laden oder initialisieren -----------------------------------------
load_state() {
  LAST_LP=; LAST_BATT=; LAST_AC=; SLEEP_COUNT=; LAST_GIT=; LAST_INBOX_MTIME=0; LAST_INBOX_NOTE=; HEARTBEAT_TICKS=0
  if [[ -f $STATE ]]; then
    while IFS='=' read -r k v; do
      case $k in
        LAST_LP) LAST_LP=$v ;; LAST_BATT) LAST_BATT=$v ;; LAST_AC) LAST_AC=$v ;;
        SLEEP_COUNT) SLEEP_COUNT=$v ;; LAST_GIT) LAST_GIT=$v ;;
        LAST_INBOX_MTIME) LAST_INBOX_MTIME=$v ;; LAST_INBOX_NOTE) LAST_INBOX_NOTE=$v ;;
      esac
    done < $STATE
  fi
}
save_state() {
  { echo LAST_LP=$LAST_LP; echo LAST_BATT=$LAST_BATT; echo LAST_AC=$LAST_AC
    echo SLEEP_COUNT=$SLEEP_COUNT; echo LAST_GIT=$LAST_GIT; echo LAST_INBOX_MTIME=$LAST_INBOX_MTIME; echo LAST_INBOX_NOTE=$LAST_INBOX_NOTE; } > $STATE
}
ev() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*" >> $EVENTS; echo "WATCH-EVENT: $*" }
cr_exit() { ev "$@"; save_state; exit 0 }

load_state
START_TICKS=$(( $(date +%s) ))

while :; do
  NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  PIDS_OK=() PIDS_TOT=()
  # Team-Loops (Keepalive: PID wechselt bei Relaunch → Pattern-Check statt
  # Hard-PID 72838; 01:08Z-Loop-Tot-Event → Nacht-Wecker-Relaunch PID 171)
  for pid in 8178 96786 97509 87539 $(cat agents/research/fable-night-coord.pid 2>/dev/null); do
    (( ${#pid} > 2 )) && { ps -p "$pid" > /dev/null 2>&1 && PIDS_OK+=("$pid") || PIDS_TOT+=("$pid"); }
  done

  # Deposit: Provider-lp via Designer-Supervisor-Log (30-s-Frische)
  LP=$(tail -5 "$DESUP" 2>/dev/null | grep -oE "Provider [0-9]+ lp" | grep -oE "[0-9]+" | tail -1)
  [[ -n $LP ]] && LAST_LP=$LP

  # Akku (AC-Detektion NUR aus Header-Zeile 'Now drawing from ...' —
  # 21:57Z-Falschalarm: 'finishing charge'-Zustand hat 'charging' nicht
  # in der Akku-Zeile → falsch AC=0; Guard <35 % bleibt unverändert)
  BATTOUT=$(pmset -g batt 2>/dev/null)
  BATTLINE=$(echo "$BATTOUT" | tail -1)
  BATT=$(echo "$BATTLINE" | grep -oE "[0-9]+%" | head -1 | grep -oE "[0-9]+")
  AC=$(echo "$BATTOUT" | head -1 | grep -q "AC Power" && echo 1 || echo 0)

  # Freeze
  SLEEPC=$(pmset -g log 2>/dev/null | grep -c "Entering Sleep")

  # Git
  git fetch -q origin 2>/dev/null
  GITH=$(git rev-parse --short origin/main 2>/dev/null)

  # Inbox fable
  INBOX_MTIME=$(ls -lt agents/inbox/fable/ 2>/dev/null | head -2 | tail -1 | awk '{print $6, $7, $8}')

  # --- Live-Board (overwrite, lesbar für Mensch + fable) ---------------------
  {
    echo "FABLE-LIVE-BOARD $NOW"
    echo "Loops: OK=[${(j:,:)PIDS_OK}]"${PIDS_TOT[@]:+  TOT⚠=[${(j:,:)PIDS_TOT}]}
    echo "Provider-lp: ${LP:-?} (DEPOSIT-WARN 8e6 / CIO-REGIME 12e6)"
    echo "Akku: ${BATT:-?}%  AC=$AC  $(pmset -g batt 2>/dev/null | tail -1 | grep -oE 'charging;|AC Power' | head -1)"
    echo "Sleep-Events gesamt: ${SLEEPC:-?}"
    echo "origin/main: ${GITH:-?}"
    tail -1 "$CIOLOG" 2>/dev/null | sed 's/^/CIO: /'
  } > $BOARD

  # --- Keepalive-Loop-Check (PID wechselt bei Relaunch: 01:08Z 72838→171) ---
  if ! pgrep -f "keepalive-trader[.]py" > /dev/null 2>&1; then
    PIDS_TOT+=("keepalive-trader.py")
  fi

  # --- CRITICAL-Prüfungen -----------------------------------------------------
  if [[ -n $LP && $LP -ge 8000000 ]]; then
    cr_exit "DEPOSIT-FRÜHWARNUNG Provider-lp=$LP (≥8e6) — Check Deposit-Tx + CIO-Übernahme + GH-Note-Verifikation (Issue #32)"
  fi
  if [[ -n $BATT && $BATT -lt 35 ]]; then
    cr_exit "HARDWARE Akku ${BATT}% (<35%) — Issue #33: Laden prüfen (AC=$AC), ansonsten Digest + Operator-Alert"
  fi
  if [[ $AC == 0 && ${#LAST_AC:-} > 0 && $LAST_AC == 1 ]]; then
    cr_exit "HARDWARE AC getrennt (war 1, jetzt 0) — Akku-Drain läuft, Loops-Death-Fenster beginnt"
  fi
  if [[ -n $SLEEPC && -n $SLEEP_COUNT && $SLEEPC -gt $SLEEP_COUNT ]]; then
    cr_exit "FREEZE neuer Sleep-Eintrag (count $SLEEP_COUNT→$SLEEPC) — alle Loops eingefroren, Window loggen + Digest (Issue #34-Kanon)"
  fi
  (( ${#PIDS_TOT} > 0 )) && cr_exit "LOOP-TOT PIDs [${(j:,:)PIDS_TOT}] nicht mehr da — Watchdog-Relaunch-Check + LOG-Vermerk"
  LAST_AC=$AC; SLEEP_COUNT=$SLEEPC; LAST_GIT=$GITH

  # --- NOTE-Events (Board-Vermerk, kein Exit) ---------------------------------
  if [[ -n $GITH && -n $LAST_GIT && $GITH != "$LAST_GIT" && $LAST_GIT != "UNSET" ]]; then
    ev "GIT-NEU origin/main $LAST_GIT→$GITH: $(git log --format='%h %s' $LAST_GIT..$GITH 2>/dev/null | head -3 | tr '\n' ' | ')"
  fi
  NEWEST_INBOX=$(ls -lt agents/inbox/fable/ 2>/dev/null | head -2 | tail -1 | awk '{print $9}')
  if [[ -n $NEWEST_INBOX && $NEWEST_INBOX != "$LAST_INBOX_NOTE" ]]; then
    ev "INBOX-NEU agents/inbox/fable/$NEWEST_INBOX"
    LAST_INBOX_NOTE=$NEWEST_INBOX
  fi

  # --- Heartbeat-Exit alle ~600 s (30 Zyklen à 20 s) --------------------------
  HEARTBEAT_TICKS=$((HEARTBEAT_TICKS + 1))
  if (( HEARTBEAT_TICKS % 30 == 0 )); then
    ev "HEARTBEAT $NOW (kein CRITICAL seit letztem Exit; Board: $(tail -2 $BOARD | tr '\n' ' '))"
    save_state
    echo "FABLE-WATCH-HEARTBEAT: $NOW — kein CRITICAL-Event, Board-Standard-OK. fable: Wache-Pass (Logs/Digest-Prüfung) + Daemon-NEUSTART (fable-watch-daemon.sh)."
    exit 0
  fi
  LAST_GIT_KEEP=1
  save_state
  sleep 20
done
