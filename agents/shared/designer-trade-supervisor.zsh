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
#                Regime 19:55Z (CIO_MIN_BAL 32e6→12e6): >=12e6 = CIO-only,
#                6–12e6 = Fable-only, Puffer-Fenster nur 11.005e6–12e6.
#     CONFLICT   Trade-Event + das ANDERE System lebend (Konkordat-16:08Z:
#                CIO-Live-Guard = Fable feuert NUR bei totem CIO; Einzel-
#                Writer-Verletzung = Doppel-Spend-Risiko).
#                CIO-tot/Fable-tot-Solo = erwartet, nur Event-Zeile.
#                Regime 19:55Z (CIO_MIN_BAL 32e6→12e6): CONFLICT-Alarm NUR im
#                Puffer-Fenster 11.005e6–12e6 (einziger Doppel-Feuer-Spielraum);
#                darunter = Fable-only-Schiene, darueber = CIO-only-Schiene
#                (CIO-Process-lebend ist keine Kollision, nur Event-Zeile).
#     FLAP       >= 3 Fable-Loop-STARTs innerhalb 10 min (Instabilitaet).
#     FABLE-STOP Fable-eigenes STOP-Flag (agents/trade-loop/STOP): aktiv
#                → Fable-Loop/-WD-Ausfall = ERWARTET (kein GAP-Alarm),
#                nur Event-Zeile + Herzschlag-Label; Flag weg → State-Reset.
#                (0-byte-Flag ~16:02 UTC, Herkunft ungeklaert → inbox-Note.)
#     GAP        CIO-Loop ODER mein Watchdog-v2 tot (mein Revive-Bereich);
#                Fable-Loop/-WD tot: ALERT nur (Team-Territorium,
#                inbox-Note an agent-1/fable) — NUR ohne aktives FABLE-STOP.
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
FALE_MIN=6000000   # Fable-Loop-Trigger (MIN_BAL v2 = 0.006 SOL)
# Regime-Fix 19:55Z (fable-trade-loop.sh: CEO-Entscheid ~16:50Z, CIO_MIN_BAL 32e6→12e6):
#   6–12e6 lp  = Fable-only (CIO inaktiv)
#   >=12e6 lp  = CIO-only (Fable raeumt ab)
#   Puffer-Fenster 11.005e6–12e6 = einziger theoretischer Doppel-Feuer-Spielraum.
CIO_MIN_BAL=12000000
CIO_FIRE_MIN=11005000  # CIO-Trigger (ATA-geheilt, fable-Note 19:55Z): CIO-Feuer erwaet ab 11.005e6

ts(){ date -u '+%Y-%m-%dT%H:%M:%SZ'; }
log(){ echo "[$(ts)] $*" >> $HB; }
epoch(){ date -u +%s; }

# --- Unique-Guard (Regen-Duplex-Schutz, Fix 16:09Z): die CEO-Registry
# (agents/timers/agent-watchdog.sh, watchdog-reg.json Eintrag
# "designer-supervisor") pflegt die Instanz ebenfalls — ohne Guard
# liefen Registry-Neustarts und manuelle Instanzen parallel (Beleg:
# 16:05/16:08Z zwei PIDs + zweifacher SUPERVISOR-v2-START im Log).
# PID-Datei: designer-supervisor.pid (= Registry-Liveness-Override).
GUARDF=$VAR/designer-supervisor.pid
if [ -f "$GUARDF" ]; then
  oldpid=$(cat $GUARDF 2>/dev/null)
  if [ -n "$oldpid" ] && kill -0 "$oldpid" 2>/dev/null; then
    exit 0   # lebende Instanz (PID in der Datei) -> nicht duplizieren
  fi
fi
echo $$ > $GUARDF

# --- Unique-Guard (CEO 13.11): CIO-Trade-Watchdog + CEO-Agenten-Watchdog
# koennen die Instanz gleichzeitig neu starten -> mkdir-Lock (race-safe).
SUPLOCKD=$VAR/.designer-supervisor.lockd
if mkdir $SUPLOCKD 2>/dev/null; then
  echo $$ > $SUPLOCKD/pid
else
  OLD=$(cat $SUPLOCKD/pid 2>/dev/null)
  if [ -z "$OLD" ]; then
    log "GUARD: Lock-Kontention (PID noch nicht geschrieben) -> diese exitet (Fail-Safe)"
    exit 0
  fi
  if [ "$OLD" != "$$" ] && kill -0 $OLD 2>/dev/null; then
    log "GUARD: andere Instanz (PID $OLD) laeuft -> diese exitet"
    exit 0
  fi
  # Stale-Lock (PID tot): uebernehmen, aber ATOMAR nur wenn die Totpruefung
  # jetzt soeben bestaetigt wurde; Doppel-UEbernahme-Rescue:
  rm -rf $SUPLOCKD 2>/dev/null
  if ! mkdir $SUPLOCKD 2>/dev/null; then
    if [ -z "$(cat $SUPLOCKD/pid 2>/dev/null)" ]; then
      log "GUARD: Lock-Contention -> exit"
      exit 0
    fi
    # Lock uebernommen, aber noch ohne PID -> sofort neu anlegen:
    rm -rf $SUPLOCKD 2>/dev/null
    mkdir $SUPLOCKD 2>/dev/null || { log "GUARD: Lock-Contention -> exit"; exit 0; }
  fi
  echo $$ > $SUPLOCKD/pid
  log "GUARD: Stale-Lock uebernommen (alte PID ${OLD:-?})"
fi
trap 'rm -rf $SUPLOCKD 2>/dev/null; rm -f $VAR/designer-supervisor.pid 2>/dev/null; exit 0' EXIT INT TERM

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

  # Fable-STOP-Flag (0-byte-Datei, ungeklaerte Herkunft 16:02 UTC):
  # aktiv -> Fable-Loop/-WD-Ausfall ist ERWARTET (kein GAP-Alarm mehr),
  # sondern dokumentierter Zustand. Flag weg -> State-Reset (Fable-Site
  # aktiv => GAP-Logik wieder voll, FLAP-Zaehler neu).
  fst=""
  if [ -f "$FALESTOP" ]; then
    fst="$(stat -f '%Sm' -t '%H:%M:%S' "$FALESTOP" 2>/dev/null)"
    if [ "$FALESTOP_MTIME" != "$fst" ]; then
      FALESTOP_MTIME="$fst"
      FALESTOP_STATE="STOP"
      FLAP_T0=0; FLAP_N=0; FLAP_ALERTED=0
      log "EVENT: Fable-STOP-Flag AKTIV (mtime ${fst}) — Fable-Loop/-WD-Ausfall erwartet (kein GAP-Alarm); 0-byte-Herkunft ungeklaert (s. inbox-Note fable/agent-1)"
    fi
  else
    if [ "$FALESTOP_STATE" = "STOP" ]; then
      FALESTOP_STATE=""
      FLAP_T0=0; FLAP_N=0; FLAP_ALERTED=0
      log "EVENT: Fable-STOP-Flag ENTfernt — Fable-Site wieder aktiv (GAP-/FLAP-Logik voll, FLAP-Zaehler reset)"
    fi
  fi
  if [ "$FALESTOP_STATE" = "STOP" ]; then fst_active=1; else fst_active=0; fi

  now=$(epoch)
  [ -z "$cp" ] && log "ALERT GAP: CIO-Loop tot (mein Watchdog-v2 ${cw:-TOT} soll revive — naechster Puls pruefen)"
  [ -z "$cw" ] && log "ALERT GAP: mein Trade-Watchdog-v2 tot (CIO-Loop ${cp:-TOT})"
  if $fst_active; then
    :   # Fable-STOP-Flag: Ausfall dokumentiert, kein Alarm
  else
    if [ -z "$fp" ] && [ -z "$fw" ]; then
      log "ALERT GAP: Fable-Loop UND Fable-Watchdog tot (Team-Territorium → inbox-Note)"
    elif [ -n "$fp" ] && [ -z "$fw" ]; then
      log "ALERT: Fable-Loop OHNE Watchdog (nur Loop-PID $fp, Fable-eigene Keep-Alive laeckt)"
    fi
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
      # Regime-Fix 19:55Z (fable-Note / CIO_MIN_BAL 32e6→12e6):
      #   6–12e6 lp  -> Fable-only (CIO inactiv),
      #   >=12e6 lp   -> CIO-only (Fable raeumt ab, CIO_MIN_BAL=12e6),
      #   nur 11.005e6–12e6 = theoretisches Puffer-Fenster (False-Negativ-Schutz).
      # Escalation-Alarm nur im Ueberlappungs-Fenster + bei CONFLICT-Events.
      if [ "$bal" -ge "$CIO_MIN_BAL" ]; then
        log "ALERT DEPOSIT: Provider ${LAST_BAL}→${bal} lp (>= ${CIO_MIN_BAL}lp, CIO-Regime 19:55Z) — CIO-Feuer erwartet (Fable raeumt ab), CONFLICT-Fenster 90s"
      else
        log "ALERT DEPOSIT: Provider ${LAST_BAL}→${bal} lp (>= Fable-MIN ${FALE_MIN}, < ${CIO_MIN_BAL}) — Fable-Feuer erwartet (CIO inaktiv); nur im Puffer-Fenster 11.005e6–12e6 = erwaetetes Doppel-Feuer-Risiko"
      fi
    else
      log "SALDO-ANSTIEG: ${LAST_BAL}→${bal} lp (< Fable-MIN ${FALE_MIN}, noch kein Trade-Trigger)"
    fi
  fi
  [ "$bal" -gt 0 ] && LAST_BAL=$bal

  # --- 3) Neue Trade-/Restart-Events (getrennte Seen-Listen) ---
  # Konkordat-16:08Z-Regel (Fable-Team-Trading-Konkordat): CIO-Live-Guard
  # = Fable feuert NUR wenn CIO tot (Takeover). Alert-Bedingung ist daher:
  # Trade-Event + das ANDERE System war ZU DEM ZEITPUNKT LEBEND (beide
  # gleichzeitig → Guard-Verletzung/Doppel-Spend-Risiko, egal aus
  # welcher Richtung). Reine CIO-tot-Takeover = dokumentiert, kein Alarm.
  ft=$(new_lines $FALELOG $SEEN_FT | grep -cE "(TRADE-TRIGGER|ZYKLUS-ABSCHLUSS|BUY .*rc=0|SELL-BACK rc=0)")
  [ "${ft:-0}" -gt 0 ] && {
    LAST_TRADE_FABLE=$now
    if [ -n "$cp" ]; then
      # Regime-Fix 19:55Z (CIO_MIN_BAL 12e6): CONFLICT-Alarm NUR im
      # Puffer-Fenster 11.005e6–12e6 (einziger Doppel-Feuer-Spielraum).
      # Darunter = Fable-only-Schiene (CIO-Prozess lebt, feuert aber
      # nicht), darueber = CIO-only-Schiene → nur Event-Zeile.
      if [ "${LAST_BAL:-0}" -ge "$CIO_FIRE_MIN" ] && [ "${LAST_BAL:-0}" -lt "$CIO_MIN_BAL" ]; then
        log "ALERT CONFLICT: Fable-Trade ${now} — CIO-Loop LEBEND ($cp) + bal ${LAST_BAL}lp IM PUFFER-FENSTER ${CIO_FIRE_MIN}–${CIO_MIN_BAL}lp → CIO-Live-Guard verletzt (Doppel-Spend-Risiko, Wallet DNEBNj…)"
      else
        log "EVENT: Fable-TRADE (${ft} neue Log-zeile[n]) — CIO-Prozess lebt ($cp), bal ${LAST_BAL}lp = Fable-only-Schiene (< ${CIO_FIRE_MIN}lp) bzw. CIO-only-Schiene (>= ${CIO_MIN_BAL}lp) → kein Doppel-Feuer-Risiko (Regime 19:55Z)"
      fi
    else
      log "EVENT: Fable-TRADE (${ft} neue Log-zeile[n]) — CIO tot → Takeover gem. Konkordat (erwartet, kein Alarm)"
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
    if [ -n "$fp" ]; then
      # Symmetrisch (Regime 19:55Z): Alarm NUR im Puffer-Fenster
      # 11.005e6–12e6; sonsten Schienen-Solo → nur Event-Zeile.
      if [ "${LAST_BAL:-0}" -ge "$CIO_FIRE_MIN" ] && [ "${LAST_BAL:-0}" -lt "$CIO_MIN_BAL" ]; then
        log "ALERT CONFLICT: CIO-Trade ${now} — Fable-Loop LEBEND ($fp) + bal ${LAST_BAL}lp IM PUFFER-FENSTER ${CIO_FIRE_MIN}–${CIO_MIN_BAL}lp → Einzel-Writer-Regel verletzt (Doppel-Spend-Risiko, Wallet DNEBNj…)"
      else
        log "EVENT: CIO-TRADE (${ct} neue Log-zeile[n]) — Fable-Prozess lebt ($fp), bal ${LAST_BAL}lp = CIO-only-Schiene (>= ${CIO_MIN_BAL}lp) bzw. Fable-only-Schiene (< ${CIO_FIRE_MIN}lp) → kein Doppel-Feuer-Risiko (Regime 19:55Z)"
      fi
    else
      log "EVENT: CIO-TRADE (${ct} neue Log-zeile[n]) — Fable tot → CIO-Solo gem. Konkordat (erwartet, kein Alarm)"
    fi
  }

  # --- 4) Herzschlag ---
  fst_label="fable-stop=${FALESTOP_STATE:-aus}"
  [ "$fst_active" = "1" ] && fst_label="fable-stop=AKTIV(mtime ${FALESTOP_MTIME})"
  log "OK: $alive | ${fst_label} | Provider ${LAST_BAL} lp | CIO-letzte-Trade ${LAST_TRADE_CIO:-keiner} Fable-letzte-Trade ${LAST_TRADE_FABLE:-keiner}"
  sleep $POLL
done
