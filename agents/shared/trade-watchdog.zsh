#!/bin/zsh
# DESIGNER-TRADE-WATCHDOG (Operator-GO 2026-11-13 ~15:45 UTC: "trade die ganze
# Zeit bis ich stop schreibe; Timer damit du nicht einschläfst")
#
# Verhalten (30-s-Zyklus, detached):
#   1) CIO-Auto-Trade-Loop (agents/shared/cio-autotrade.zsh) Pulse-Check:
#      ist kein Prozess + kein aktiver Lock-Direktorialg → NEU-START
#      (Unique-Guard im Loop-Skript schützt vor Doppelstarts).
#   2) STOP-FLAG: exists $VAR/trade-watchdog-stop.flag → beides beenden + exit.
#   3) Herzschlag-Log: $VAR/trade-watchdog.log (append).
#
# Stopp: touch $VAR/trade-watchdog-stop.flag  (oder: kill <watchdog-pid>)
#   → beendet CIO-Loop + Watchdog sauber. Operator "stop" = dieses Flag.

VAR=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode
REPO=/Users/haqmal/Desktop/Projekte/SuperIntelNex
HB=$VAR/trade-watchdog.log
FLAG=$VAR/trade-watchdog-stop.flag
POLL=30

ts(){ date -u '+%Y-%m-%dT%H:%M:%SZ'; }

loop_alive(){
  local p
  p=$(pgrep -f "cio-autotrade.zsh" 2>/dev/null | head -1)
  [ -n "$p" ] && return 0
  return 1
}

stop_all(){
  echo "[$(ts)] STOP: beende CIO-Loop + Watchdog" >> $HB
  pkill -f "cio-autotrade.zsh" 2>/dev/null
  rm -f $FLAG
  exit 0
}

echo "[$(ts)] DESIGNER-TRADE-WATCHDOG START pid=$$ (Puls ${POLL}s, Stop=$FLAG)" >> $HB

while :; do
  [ -f "$FLAG" ] && stop_all
  if loop_alive; then
    pid=$(pgrep -f "cio-autotrade.zsh" | head -1)
    echo "[$(ts)] OK: CIO-Loop alive (PID $pid)" >> $HB
  else
    echo "[$(ts)] REVIVE: CIO-Loop tot/fehlt → Neustart (Unique-Guard ok)" >> $HB
    cd "$REPO" || break
    nohup zsh agents/shared/cio-autotrade.zsh >/dev/null 2>&1 &
    disown
    sleep 5
    p2=$(pgrep -f "cio-autotrade.zsh" | head -1)
    [ -n "$p2" ] \
      && echo "[$(ts)] REVIVE-OK: CIO-Loop neu (PID $p2)" >> $HB \
      || echo "[$(ts)] REVIVE-FAIL: Start nicht bestaetigt (naechster Puls)" >> $HB
  fi
  sleep $POLL
done
