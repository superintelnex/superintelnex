#!/bin/zsh
# DESIGNER-TRADE-WATCHDOG v2 (Operator-GO 2026-11-13 15:45 UTC: "trade die
# ganze Zeit bis stop; Timer damit nicht einschlafen")
#
# v2-Fix (13.11 ~15:55): Liveness-Basis = CIO-Lock-PID-Datei
# (…/.cio-autotrade.lockd/pid + kill -0) statt pgrep -f — der v1-pgrep
# zählte fremde Shells/Commands mit (Selbstmatch-Fehler, E2E-Fall 15:53:
# Loop per kill -9 tot, Watchdog meldete weiter "alive" an Test-Shell-PID).
#
# Verhalten (30-s-Zyklus, detached):
#   1) CIO-Loop-Liveness: Lock-PID existiert + kill -0 → OK.
#      Sonst → REVIVE: CIO-Loop neu starten (Unique-Guard im Loop-Skript
#      übernimmt Stale-Lock race-sicher, neue PID landet im Lock).
#   2) STOP-FLAG: …/trade-watchdog-stop.flag existiert → CIO-Loop (via
#      Lock-PID) + Watchdog beenden, sauberes Ende (v1-Flag-Semantik).
#   3) Herzschlag: …/trade-watchdog.log (append).
#
# Stopp: touch …/trade-watchdog-stop.flag  (= Operator "stop").

VAR=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode
REPO=/Users/haqmal/Desktop/Projekte/SuperIntelNex
HB=$VAR/trade-watchdog.log
FLAG=$VAR/trade-watchdog-stop.flag
LOCKPIDF=$VAR/.cio-autotrade.lockd/pid
POLL=30

ts(){ date -u '+%Y-%m-%dT%H:%M:%SZ'; }

lock_pid(){ cat $LOCKPIDF 2>/dev/null; }
alive(){
  local p; p=$(lock_pid)
  [ -n "$p" ] && kill -0 "$p" 2>/dev/null
}

stop_all(){
  local p; p=$(lock_pid)
  echo "[$(ts)] STOP: beende CIO-Loop${p:+ (PID $p)} + Watchdog" >> $HB
  [ -n "$p" ] && kill "$p" 2>/dev/null
  rm -f $FLAG
  exit 0
}

echo "[$(ts)] TRADE-WATCHDOG-v2 START pid=$$ (Puls ${POLL}s, Liveness=Lock-PID, Stop=$FLAG)" >> $HB

while :; do
  [ -f "$FLAG" ] && stop_all
  if alive; then
    echo "[$(ts)] OK: CIO-Loop alive (Lock-PID $(lock_pid))" >> $HB
  else
    echo "[$(ts)] REVIVE: CIO-Loop tot/fehlt (Lock-PID $(lock_pid || echo 'leer')) → Neustart" >> $HB
    cd "$REPO" || break
    nohup zsh agents/shared/cio-autotrade.zsh >/dev/null 2>&1 &
    disown
    sleep 8
    np=$(lock_pid)
    if [ -n "$np" ] && kill -0 "$np" 2>/dev/null; then
      echo "[$(ts)] REVIVE-OK: CIO-Loop neu (Lock-PID $np)" >> $HB
    else
      echo "[$(ts)] REVIVE-FAIL: Start nicht bestaetigt (naechster Puls)" >> $HB
    fi
  fi
  sleep $POLL
done
