#!/bin/zsh
# NIGHT PRICE COHORT (Designer, Operator-Order 19:40Z) — un-abhaengiger
# On-Chain-Kurskanal. Ruft pool-price-snapshot.ts in einem Intervall auf und
# sammelt so eine Kurs-/Liquiditaets-Zeitreihe fuer die Nacht. Read-only, keylos.
#
# Takt: 90 s (RPC-Rate-Limit-Schutz; kein 20-s-Polling). Jeder Lauf appendet
# eine Zeile nach agents/berichte/pool-snapshots/night.jsonl.
# Stopp: touch .../pool-snapshots/NIGHT-STOP.flag  → sauberes EXIT.

TOKEN_DIR=/Users/haqmal/Desktop/Projekte/SuperIntelNex/token
DENO=/Users/haqmal/.deno/bin/deno
SNAP=/Users/haqmal/Desktop/Projekte/SuperIntelNex/agents/shared/pool-price-snapshot.ts
OUTDIR=/Users/haqmal/Desktop/Projekte/SuperIntelNex/agents/berichte/pool-snapshots
STOP=$OUTDIR/NIGHT-STOP.flag
INT=90
cd "$TOKEN_DIR"
echo "[night-price-cohort] start $(date -u +'%H:%M:%S UTC') takt=${INT}s"
while :; do
  [ -f "$STOP" ] && { echo "[night-price-cohort] STOP-Flag -> EXIT"; break; }
  "$DENO" run --allow-read --allow-net --allow-env --allow-write "$SNAP" >/dev/null 2>&1
  sleep "$INT"
done
echo "[night-price-cohort] end $(date -u +'%H:%M:%S UTC')"
