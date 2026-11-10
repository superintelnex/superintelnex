#!/bin/zsh
# CIO-WATCHDOG-20S (CEO-Order 2026-11-10 ~18:15 UTC: „Timer stellen der
# alle 20 s aufwacht und andere Agenten bei der Arbeit unterstützt,
# bis morgen Nachmittag").
#
# Verhalten (20-s-Zyklus, DETACHED via nohup):
#   1) Triage-Queue: neue Dateien in agents/inbox/cio/ +
#      agents/outbox/agent-1/ (seen-Listen, nur NEUES meldet).
#   2) Git: origin/main-Remote-Head vs. lokal (fetch ~alle 60 s,
#      read-only, KEIN pull/push).
#   3) Loop-Puls: PIDs 85755 (CIO-Auto-Trade) / 60475 (Abnahme) /
#      66713 (FillIn-Helper) — meldet GEFÄLLT-Prozesse.
#   4) Meilenstein-Alerts (einmalig): 18:50 Rescore-Belegdatei da?,
#      19:02 Abnahme-Fenster (Operator a/b/c + DCA).
#   5) Auto-Exit 2026-11-11 13:00 UTC („bis morgen Nachmittag" erfüllt).
#
# Read-only: KEIN push, KEINE Tx, KEIN Loop-Tuning (CIO-Regeln).
#   Output: var-Folder cio-watchdog-20s.log (Herzschlag) +
#   cio-watchdog-queue.md (Alarms-Queue, append-only).

REPO=/Users/haqmal/Desktop/Projekte/SuperIntelNex
VAR=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode
HB=$VAR/cio-watchdog-20s.log
Q=$VAR/cio-watchdog-queue.md
SEENIN=$VAR/cio-watchdog-seen-inbox.txt
SEENOUT=$VAR/cio-watchdog-seen-outbox.txt
STATE=$VAR/cio-watchdog-state.txt
LOOPS=(85755 60475 66713)
EXIT_EPOCH=$(date -j -f "%Y-%m-%d %H:%M" "2026-11-11 13:00" +%s)
M1850=$(date -j -f "%Y-%m-%d %H:%M" "2026-11-10 18:50" +%s)
M1902=$(date -j -f "%Y-%m-%d %H:%M" "2026-11-10 19:02" +%s)
RESFILE="agents/outbox/agent-1/2026-11-10T18-50Z-rugcheck-full-rescore.md"

mkdir -p "$VAR"
[ -f "$SEENIN" ]  || { cd "$REPO" && find agents/inbox/cio -type f | sort > "$SEENIN"; }
[ -f "$SEENOUT" ] || { cd "$REPO" && find agents/outbox/agent-1 -type f | sort > "$SEENOUT"; }
[ -f "$STATE" ]   || : > "$STATE"
echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] WATCHDOG-20S START pid=$$ (Auto-Exit $(date -u -r $EXIT_EPOCH '+%H:%M:%SZ' 2>/dev/null || echo '13:00Z'))" >> "$HB"
echo "# CIO-Watchdog-20s-Queue (append-only, read-only-Triage) — start $(date -u '+%Y-%m-%dT%H:%M:%SZ')" > "$Q"

ts(){ date -u '+%Y-%m-%dT%H:%M:%SZ'; }
now(){ date -u +%s; }
flagged(){ case "$(cat "$STATE" 2>/dev/null)" in *"$1"*) return 0;; *) return 1;; esac; }

LASTALERTS=""
cycle=0
while :; do
  # 0) Auto-Exit
  if [ "$(now)" -ge "$EXIT_EPOCH" ]; then
    echo "[$(ts)] WATCHDOG EXIT: Auftrag 'bis morgen Nachmittag' erfüllt — Auto-Stop 11.11. 13:00 UTC. (pid $$)" >> "$HB"
    echo -e "\n## $(ts) WATCHDOG-EXIT: Auto-Stop 11.11. 13:00 UTC (CEO-Auftrag erfüllt), Log: cio-watchdog-20s.log" >> "$Q"
    exit 0
  fi

  cd "$REPO" || { echo "[$(ts)] ALERT: REPO fehlt — Watchdog stoppt" >> "$HB"; exit 1; }
  alerts=()
  cycle=$((cycle + 1))

  # 1) Git-Remote-Head (fetch alle ~60 s)
  if [ $((cycle % 3)) -eq 1 ]; then
    git fetch -q origin 2>/dev/null
  fi
  remote=$(git rev-parse --short origin/main 2>/dev/null)
  localh=$(git rev-parse --short HEAD 2>/dev/null)
  [ -n "$remote" ] && [ "$remote" != "$localh" ] && \
    alerts+=("GIT-NEU: origin/main=$remote ≠ lokal=$localh → Chat-Turn: git pull + Triage (agent-1-Commits)")

  # 2) Neue Inbox-Dateien (agent-1 → CIO)
  curin=$(find agents/inbox/cio -type f | sort)
  newin=$(comm -13 <(cat "$SEENIN" 2>/dev/null) <(printf '%s\n' "$curin") 2>/dev/null)
  if [ -n "$newin" ]; then
    printf '%s\n' "$curin" > "$SEENIN"
    for f in $newin; do alerts+=("NEU-INBOX: $f (CIO-Triage im nächsten Chat-Turn)"); done
  fi

  # 3) Neue agent-1-Outbox-Dateien (Belege/Fahrpläne)
  cout=$(find agents/outbox/agent-1 -type f | sort)
  newout=$(comm -13 <(cat "$SEENOUT" 2>/dev/null) <(printf '%s\n' "$cout") 2>/dev/null)
  if [ -n "$newout" ]; then
    printf '%s\n' "$cout" > "$SEENOUT"
    for f in $newout; do alerts+=("NEU-AGENT1-OUTBOX: $f"); done
  fi

  # 4) Meilensteine (einmalig)
  n=$(now)
  if [ $n -ge $M1850 ] && ! flagged m1850; then
    if [ -f "$RESFILE" ]; then
      alerts+=("18:50-RESKORE-DATEI DA: $RESFILE → CIO: §4-Platzhalter im 19:00-Report + Board-Bullet")
    else
      alerts+=("18:50 OVERDUE: $RESFILE FEHLT (Abnahme-Loop 60475/FillIn 66713 checken)")
    fi
    echo m1850 >> "$STATE"
  fi
  if [ $n -ge $M1902 ] && ! flagged m1902; then
    alerts+=("19:00-ABNAHME-FENSTER: Operator-Entscheidung a/b/c + DCA erwartet — CIO-Paket: outbox/cio/2026-11-10T18-12Z-19uhr-abnahme-paket.md")
    echo m1902 >> "$STATE"
  fi

  # 5) Loop-Puls
  alive=""; dead=""
  for p in $LOOPS; do
    if ps -p $p >/dev/null 2>&1; then alive="$alive $p"; else dead="$dead $p"; fi
  done
  [ -n "$dead" ] && alerts+=("LOOPS-GEFÄLLT: $dead (CIO 85755 / Abnahme 60475 / FillIn 66713)")

  # 6) Herzschlag + Alarm-Write (nur bei veränderter Alarm-Situation)
  loop1=$(tail -1 "$VAR/cio-autotrade.log" 2>/dev/null | sed 's/^/auto:[' | cut -c1-50)
  echo "[$(ts)] beat $((cycle)) git:local=$localh|remote=$remote loops:$alive${dead:+|GEFÄLLT:$dead} ${loop1}" >> "$HB"
  joined=""
  if [ ${#alerts[@]} -gt 0 ]; then joined=$(printf '%s§' $alerts | md5 -q 2>/dev/null); fi
  if [ "$joined" != "$LASTALERTS" ]; then
    for a in $alerts; do
      echo "[$(ts)] ALERT: $a" >> "$HB"
      printf '\n## %s · ALERT: %s\n' "$(ts)" "$a" >> "$Q"
    done
    LASTALERTS=$joined
  fi

  sleep 20
done
