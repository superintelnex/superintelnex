#!/bin/zsh
# DESIGNER-TRADE-SUPERVISOR v2 (Operator-Order 2026-11-13 15:59 UTC:
# "ueberwache die anderen agenten, die traden")
#
# Read-only-Beobachtung beider Trading-Systeme auf der EINEN
# Provider-Wallet DNEBNj… (CIO-Loop + Fable-Trade-Loop laufen parallel,
# unterschiedliche Trigger-Schwellen → Kollisionsrisiko bei Deposit).
# v2-Fix (16:02): eigenstaendige Seen-Listen pro (File,Pattern)-Paar +
# Historie-Init (Seen = aktuelle Groesse beim ersten Start, keine
# Alt-Events) + FLAP-Fenster (10 min, 10-min-Escalation nur 1x pro Fenster).
#
# Verhalten (30-s-Zyklus, detached, keine Interventionen):
#   Liveness: Fable-Loop/-Watchdog (PID-Dateien agents/trade-loop/*.pid)
#             + CIO-Loop (Lock-PID …/.cio-autotrade.lockd/pid)
#             + mein Watchdog-v2 (pgrep, eigener Verantwortungsbereich).
#   Saldo:    Provider getBalance mit RPC-Rotation (429-Schutz).
#   Events:   neue Trade-/Restart-Logzeilen (Byte-Offset-Seen-Listen,
#             getrennt je Pattern + Logfile).
#   Alerts:
#     DEPOSIT    Saldo-Anstieg über Fable-MIN (5.5e6 lp).
#     CONFLICT   Trade-Events beider Agenten < 90 s auseinander
#                (gemeinsame Wallet → Doppel-Spend-Risiko, wichtigster Alert).
#     FLAP       >= 3 Fable-Loop-STARTs innerhalb 10 min (Instabilitaet).
#     GAP        CIO-Loop ODER mein Watchdog-v2 tot (mein Revive-Bereich);
#                Fable-Loop/-WD tot: ALERT nur (Team-Territorium,
#                inbox-Note an agent-1/fable).
#   STOP: …/opencode/trade-watchdog-stop.flag (= Operator "stop",
#         einheitliche Stop-Mechanik: beende CIO-Loop + meine Watchdogs).
#
# Log: …/opencode/designer-trade-supervisor.log (append-only).

VAR=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode
REPO=/Users/haqmal/Desktop/Projekte/SuperIntelNex
HB=$VAR/designer-trade-supervisor.log
FLAG=$VAR/trade-watchdog-stop.flag
FALELOG=$REPO/agents/trade-loop/LOG-loop.log
FABPIDF=$REPO/agents/trade-loop/trade-loop.pid
FAWWIDF=$REPO/agents/trade-loop/watchdog.pid
FALESTOP=$REPO/agents/trade-loop/STOP
CIOLPF=$VAR/.cio-autotrade.lockd/pid
CIOLOG=$VAR/cio-autotrade.log
SEEN_FT=$VAR/designer-supe-seen-fable-trade.txt   # Fable-Log / Trade-Zeilen
SEEN_FR=$VAR/designer-supe-seen-fable-restart.txt # Fable-Log / LOOP-START
SEEN_CT=$VAR/designer-supe-seen-cio-trade.txt     # CIO-Log / TRADE-OK
POLL=30
FALE_MIN=5500000   # Fable-Loop-Trigger (MIN_BAL v2)

ts(){ date -u '+%Y-%m-%dT%H:%M:%SZ'; }
log(){ echo "[$(ts)] $*" >> $HB; }
epoch(){ date -u +%s; }

# PID-Datei (CEO-Regen-Verwaltung: agents/timers/agent-watchdog.sh pflegt
# die Instanz, solange kein .stop-designer-supervisor da ist):
echo $$ > $VAR/designer-supervisor.pid

# --- Historie-Init: frische Seen-Dateien springen ueber das Vorhandene ---
init_seen(){ # $1=seenfile $2=logfile
  if [ ! -f "$1" ]; then
    echo "$(stat -f%z "$2" 2>/dev/null || echo 0)" > $1
  fi
}
init_seen $SEEN_FT $FALELOG
init_seen $SEEN_FR $FALELOG
init_seen $SEEN_CT $CIOLOG

log "SUPERVISOR-v2-START pid=$$ (Puls ${POLL}s, ueberwacht: CIO-Loop + Fable-Trade-Loop, read-only; Historie-Init: fable-trade=$(cat $SEEN_FT) fable-restart=$(cat $SEEN_FR) cio-trade=$(cat $SEEN_CT) Bytes)"

RPCS=("https://api.mainnet-beta.solana.com" "https://solana-rpc.publicnode.com")
RI=0
LAST_BAL=0
LAST_TRADE_CIO=0
LAST_TRADE_FABLE=0
FLAP_T0=0; FLAP_N=0; FLAP_ALERTED=0; CONFLICT_ALERTED_UNTIL=0
FALESTOP_STATE=""
FALESTOP_MTIME="?"

new_lines() { # $1=logfile $2=seenfile → liefert neue Zeilen auf stdout
  local off cur
  off=$(cat "$2" 2>/dev/null || echo 0); cur=$(stat -f%z "$1" 2>/dev/null || echo 0)
  if [ "$cur" -lt "$off" ]; then echo 0 > $2; off=0; fi   # Log rotiert/truncated
  if [ "$cur" -gt "$off" ]; then
    echo $cur > $2
    tail -c +$((off + 1)) "$1" 2>/dev/null
  fi
}

while :; do
  [ -f "$FLAG" ] && { log "STOP-FLAG erkannt → Supervisor beendet sich (geordnet)"; exit 0; }

  # --- 1) Liveness ---
  fp=""; fw=""; cp=""; cw=""
  fp=$(cat $FABPIDF 2>/dev/null); [ -n "$fp" ] && ps -p "$fp" >/dev/null 2>&1 || fp=""
  fw=$(cat $FAWWIDF 2>/dev/null); [ -n "$fw" ] && ps -p "$fw" >/dev/null 2>&1 || fw=""
  cp=$(cat $CIOLPF 2>/dev/null);  [ -n "$cp" ] && kill -0 "$cp" 2>/dev/null || cp=""
  cw=$(pgrep -f 'zsh agents/shared/trade-watchdog.zsh' | head -1)
  alive="Fable-Loop=${fp:-TOT} Fable-WD=${fw:-TOT} CIO-Loop=${cp:-TOT} CIO-WD=${cw:-TOT}"

  now=$(epoch)
  [ -z "$cp" ] && log "ALERT GAP: CIO-Loop tot (mein Watchdog-v2 ${cw:-TOT} soll revive — naechster Puls pruefen)"
  [ -z "$cw" ] && log "ALERT GAP: mein Trade-Watchdog-v2 tot (CIO-Loop ${cp:-TOT})"
  if [ -z "$fp" ] && [ -z "$fw" ]; then
    log "ALERT GAP: Fable-Loop UND Fable-Watchdog tot (Team-Territorium → inbox-Note)"
  elif [ -n "$fp" ] && [ -z "$fw" ]; then
    log "ALERT: Fable-Loop OHNE Watchdog (nur Loop-PID $fp, Fable-eigene Keep-Alive laeckt)"
  fi

  # --- 2) Provider-Saldo (RPC-Rotation) ---
  RI=$(( (RI + 1) % 2 ))
  rpc="${RPCS[RI + 1]}"
  bal=$(curl -s --max-time 15 -X POST "$rpc" -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo"]}' \
    | python3 -c "import sys,json
try: print(json.load(sys.stdin).get('result',{}).get('value') or 0)
except Exception: print(0)" 2>/dev/null)
  bal=${bal:-0}
  if [ "$LAST_BAL" -gt 0 ] 2>/dev/null && [ "$bal" -gt "$LAST_BAL" ]; then
    if [ "$bal" -ge "$FALE_MIN" ]; then
      log "ALERT DEPOSIT: Provider ${LAST_BAL}→${bal} lp (>= Fable-MIN ${FALE_MIN}) — BEIDE Loops feuern erwaet (CIO-Trigger ~11,005,000 lp), CONFLICT-Fenster 90s"
    else
      log "SALDO-ANSTIEG: ${LAST_BAL}→${bal} lp (< Fable-MIN ${FALE_MIN}, noch kein Trade-Trigger)"
    fi
  fi
  [ "$bal" -gt 0 ] && LAST_BAL=$bal

  # --- 3) Neue Trade-/Restart-Events (getrennte Seen-Listen) ---
  ft=$(new_lines $FALELOG $SEEN_FT | grep -cE "(TRADE-TRIGGER|ZYKLUS-ABSCHLUSS|BUY .*rc=0|SELL-BACK rc=0)")
  [ "${ft:-0}" -gt 0 ] && {
    LAST_TRADE_FABLE=$now
    log "EVENT: Fable-TRADE (${ft} neue Log-zeile[n])"
    if [ $((now - LAST_TRADE_CIO)) -lt 90 ]; then
      log "ALERT CONFLICT: Fable-Trade ${now} vs CIO-Trade ${LAST_TRADE_CIO} (< 90 s, gemeinsame Wallet DNEBNj… — Doppel-Spend-Risiko)"
    fi
  }
  fr=$(new_lines $FALELOG $SEEN_FR | grep -cE "LOOP-START")
  [ "${fr:-0}" -gt 0 ] && {
    if [ "$FLAP_T0" -eq 0 ] || [ $((now - FLAP_T0)) -gt 600 ]; then FLAP_T0=$now; FLAP_N=0; FLAP_ALERTED=0; fi
    FLAP_N=$((FLAP_N + fr))
    if [ "$FLAP_N" -ge 3 ] && [ "$FLAP_ALERTED" -eq 0 ]; then
      log "ALERT FLAP: Fable-Loop ${FLAP_N}x gestartet innerhalb 10 min (Instabilitaet/Watchdog-Adoption-Karneval) — inbox-Note an fable/agent-1"
      FLAP_ALERTED=1
    fi
  }
  ct=$(new_lines $CIOLOG $SEEN_CT | grep -cE "TRADE OK:")
  [ "${ct:-0}" -gt 0 ] && {
    LAST_TRADE_CIO=$now
    log "EVENT: CIO-TRADE (${ct} neue Log-zeile[n])"
    if [ $((now - LAST_TRADE_FABLE)) -lt 90 ]; then
      log "ALERT CONFLICT: CIO-Trade ${now} vs Fable-Trade ${LAST_TRADE_FABLE} (< 90 s, gemeinsame Wallet DNEBNj… — Doppel-Spend-Risiko)"
    fi
  }

  # --- 4) Herzschlag ---
  log "OK: $alive | Provider ${LAST_BAL} lp | CIO-letzte-Trade ${LAST_TRADE_CIO:-keiner} Fable-letzte-Trade ${LAST_TRADE_FABLE:-keiner}"
  sleep $POLL
done
