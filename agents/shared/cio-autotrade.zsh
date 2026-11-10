#!/bin/zsh
# CIO AUTO-TRADE-LOOP (CEO-GO 2026-11-10 14:47 UTC: „trade autonomen,
# wenn du SOL brauchst gib mir deine wallet") — SOL→SIN-Käufe im
# CIO-Eigenhandel autonom ausführen.
#
# Verhalten (60-s-Poll, Solana-Public-RPC read-only):
#   1) DNEBNj… (Provider, lokaler Key recipient.json) freien SOL-Saldo lesen.
#   2) ATA-Zustand lesen (WSOL-ATA + SIN-ATA existieren? — nach dem
#      Vollausstieg 14:07–14:08 UTC sind beide ATAs neu anzulegen).
#   3) Buy-Größe = Saldo − Tx-Fee(0,000005) − Rent(missing-ATAs) − Reserve(0,006),
#      CAP 0,15 SOL pro Trade (dünnflüssiger Pool, Impact-Begrenzung;
#      Überschuss läuft im nächsten Poll weiter).
#   4) Nur ausführen wenn Buy ≥ 0,005 SOL: swap-sol-to-sin.ts
#      (Lokal-Quote + RPC-Simulation + Slippage-Guard 1000 bps + Sendung).
#   5) Beleg: journal + SWAP-DETAILS (swap-Skript, token/result/
#      gitignored) + Zeile in cio-autotrade.log (var-Folder).
#
# Sicherheitsgates: kein eigener Tx-Bau — das bewährte swap-Skript mit
# seinen Gates (SIN_DEX_SEND=1 + SIN_MAINNET_OK=1, Slippage-Guard,
# Pre-Flight-Saldo-Check) wird nur per env gesteuert. Rate-Limit-RPC:
# Tick wird übersprungen (keine Halts).
#
# Start:  zsh agents/shared/cio-autotrade.zsh   (Hintergrund)
# Stopp:  pkill -f cio-autotrade.zsh

REPO=/Users/haqmal/Desktop/Projekte/SuperIntelNex
LOGF=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode/cio-autotrade.log
EXCF=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode/cio-autotrade-exec-last.txt
EXCFS=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode/cio-autotrade-exec-sell-last.txt
RPC=https://api.mainnet-beta.solana.com
PROV=DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo
WSOL_ATA=4eA5jcJVqH1Q1mQ2GVmCtEgFZZHYBLga2gGMEUKUy8k7
SIN_ATA=FD1WzT526vwyBbuq7p6RN6PizStW8sEoZaGrm5u7xqSW
RENT=20311691   # lamports rent-exempt pro (neuem) ATA
FEE=5000        # lamports Tx-Basis-Fee
RES=6000000     # lamports Reserve 0,006 SOL
MIN_BUY=5000000 # lamports Min-Buy 0,005 SOL
CAP=150000000   # lamports CAP 0,15 SOL pro Trade
POLL=60
# --- Ticket #6 (Operator-Order 15:49 UTC): 30 %-Supply-Hold (3,0 Mrd. SIN) ---
# DCA-Ziel-Counter: kumulierter SIN-Fill ab 16:00-Regime (Ticket #6-Eröffnung).
HOLD_RATIO=30      # %: vom Buy-Fill GEHALTEN (SELL-Leg verkauft 70 %)
DCA_TARGET=3000000000000000000   # raw-SIN (5 Dez.): 3e18 = 3e13 UI-SIN
                            # = 30 B (= 30.000 Mrd.) = 30 % der Supply 1e14
                            # UI-SIN (sin-decimal-kanon.md, D-(b); altes 3e14-Label
                            # 10⁴ zu klein — D-Memo 18-46Z §4; Gate-4-OK Operator
                            # 19:5x, Pfad 2 addLiquidity)
HOLD_ON=0          # 1 = SELL-Leg (HOLD_RATIO) aktiv — NACH operatorischem
                   # Deposit-Budget-OK (Ticket #6-Offen-Punkt 1); 0 = Buy-only
                   # (Bestandswert: Buy #1–#6 laufen ohne SELL-Leg)
DCAF=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode/cio-autotrade-dca-sin.txt
[ -f "$DCAF" ] || echo 0 > "$DCAF"

log() { echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') $*" >> $LOGF; }

# --- Unique-Guard (22:52 UTC, CIO): zwei Wake-Timer (CIO-v2 20s + agent-1
# team-support-monitor v1.1, Beleg 22-50Z-Note) können den Loop neu starten
# → exakt 1 Instanz. Race-safe via mkdir-Lock (atomar, kein pgrep-Selbstmatch).
LOCKD=/private/var/folders/fk/8vfwh6wn09v38hf7btnh55h40000gn/T/opencode/.cio-autotrade.lockd
if mkdir $LOCKD 2>/dev/null; then
  echo $$ > $LOCKD/pid
else
  OLDPID=$(cat $LOCKD/pid 2>/dev/null)
  if [ -n "$OLDPID" ] && [ "$OLDPID" != "$$" ] && kill -0 $OLDPID 2>/dev/null; then
    log "GUARD: andere Instanz (PID $OLDPID) hält den Loop — diese exitet (Unique-Guard)"
    exit 0
  fi
  rm -rf $LOCKD 2>/dev/null
  if ! mkdir $LOCKD 2>/dev/null; then
    log "GUARD: Lock-Contention (beide Starts gleichzeitig) — diese exitet"
    exit 0
  fi
  echo $$ > $LOCKD/pid
  log "GUARD: Stale-Lock übernommen (alte PID ${OLDPID:-?} tot)"
fi
trap 'rm -rf $LOCKD 2>/dev/null' EXIT INT TERM

jsonq() { # $1=method $2=params(JSON)
  curl -s --max-time 25 $RPC -X POST -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"$1\",\"params\":$2}"
}

log "CIO-AUTOTRADE-LOOP START (60-s-Poll, CAP 0,15 SOL, MIN-Buy 0,005 SOL, GO 14:47 UTC)"

while true; do
  bal=$(jsonq getBalance "[\"$PROV\"]" | python3 -c "import json,sys
try:
  r=json.load(sys.stdin).get('result')
  print(r['value'] if r else '')
except Exception:
  print('')")
  if [ -z "$bal" ]; then
    log "poll: RPC-Rate-Limit/fehler, Überspringen"
    sleep 45
    continue
  fi

  # ATA-Existenz via getTokenAccountBalance (authoritative; getAccountInfo
  # lieferte Public-RPC-False-Negativs — agent-1-Request 16:25 UTC):
  # 3x Retry je ATA, Null/fehler → 2x Confirmaat; '?' = nur bei RPC-Fehler
  # (Poll überspringen), NIE blind '0' ohne sauberen Null-Read.
  atas=$(python3 -c "
import json,time,urllib.request
RPC='https://api.mainnet-beta.solana.com'
def check(ata):
    clean_zero=False
    for _ in range(3):
        try:
            req=urllib.request.Request(RPC,
                data=json.dumps({'jsonrpc':'2.0','id':1,'method':'getTokenAccountBalance','params':[ata]}).encode(),
                headers={'Content-Type':'application/json'})
            d=json.loads(urllib.request.urlopen(req,timeout=25).read())
            if 'error' in d:
                clean_zero=False; time.sleep(3); continue
            v=(d.get('result') or {}).get('value')
            if v is not None:
                return '1'
            clean_zero=True; time.sleep(2)   # Null-Read: 1x Confirmaat gegen stale Cache
        except Exception:
            clean_zero=False; time.sleep(3)
    return '0' if clean_zero else '?'
w=check('$WSOL_ATA')
time.sleep(2)
s=check('$SIN_ATA')
print('wsol=%s,sin=%s' % (w,s))")
  if [ -z "$atas" ] || [[ "$atas" == *"?"* ]]; then
    log "poll: ATA-Check Fehler/Rate-Limit ('$atas'), Poll überspringen (False-Negativ-Schutz)"
    sleep 45
    continue
  fi
  wsol_ata=$(echo "$atas" | cut -d, -f1 | cut -d= -f2)
  sin_ata=$(echo "$atas" | cut -d, -f2 | cut -d= -f2)

  rent_missing=0
  [ "$wsol_ata" = "0" ] && rent_missing=$((rent_missing + RENT))
  [ "$sin_ata" = "0" ] && rent_missing=$((rent_missing + RENT))

  free_sol=$(python3 -c "print(f'{$bal/1e9:.6f}')")
  buy=$((bal - FEE - rent_missing - RES))
  if [ $buy -gt $CAP ]; then buy=$CAP; fi
  buy_sol=$(python3 -c "print(f'{$buy/1e9:.6f}')")

  if [ $buy -lt $MIN_BUY ]; then
    log "poll: free=$free_sol SOL, ATA(wsol=$wsol_ata,sin=$sin_ata), buy_fähig=$buy_sol — WAART AUF DEPOSIT"
    sleep $POLL
    continue
  fi

  log "TRADE: free=$free_sol SOL, ATA(wsol=$wsol_ata,sin=$sin_ata) → EXEC Buy $buy_sol SOL (quote+sim+send)"
  cd $REPO
  SIN_NETWORK=mainnet SIN_BUY_SOL=$buy_sol SIN_SLIPPAGE_BPS=1000 SIN_DEX_SEND=1 SIN_MAINNET_OK=1 \
    deno run --allow-read --allow-net --allow-env --allow-write \
    token/scripts/swap-sol-to-sin.ts > $EXCF 2>&1
  rc=$?
  sig=$(grep '^Signature' $EXCF | head -1 | sed 's/^Signature *: *//')
  out=$(grep 'SIN-ATA vor/nach' $EXCF | head -1)
  if [ $rc -eq 0 ] && [ -n "$sig" ]; then
    log "TRADE OK: sig=$sig, in=$buy_sol SOL, $out"
    # --- Ticket #6 (Operator-Order 15:49): Holding-Regel + DCA-Ziel-Counter ---
    # Buy-Fill-Raw (Delta) aus dem Beweismeld-Output; bei HOLD_ON=1 wird der
    # (100-HOLD_RATIO)-Anteil sofort via bewaehrtem swap-sin-to-sol.ts (selbe
    # Gates) veraeusst — kein eigener Tx-Bau. DCAF kumuliert den GEHALTENEN
    # Anteil gegen das 3,0-Mrd.-SIN-Ziel.
    delta=$(grep -o 'Delta [0-9]*' $EXCF | head -1 | awk '{print $2}')
    hold_raw=""; sell_raw=""; sig_s=""
    if [ -n "$delta" ]; then
      if [ "$HOLD_ON" = "1" ]; then
        sell_raw=$((delta * (100 - HOLD_RATIO) / 100))
        hold_raw=$((delta - sell_raw))
        if [ $sell_raw -gt 0 ]; then
          SIN_NETWORK=mainnet SIN_SELL_RAW=$sell_raw SIN_SLIPPAGE_BPS=1000 SIN_DEX_SEND=1 SIN_MAINNET_OK=1 \
            deno run --allow-read --allow-net --allow-env --allow-write \
            token/scripts/swap-sin-to-sol.ts > $EXCFS 2>&1
          rc_s=$?
          sig_s=$(grep '^Signature' $EXCFS | head -1 | sed 's/^Signature *: *//')
          if [ $rc_s -eq 0 ] && [ -n "$sig_s" ]; then
            log "HOLD SELL OK: sig=$sig_s, sold $sell_raw raw SIN (HOLD ${HOLD_RATIO} %)"
          else
            log "HOLD SELL FAILED rc=$rc_s (SIN bleibt gehalten; Detail: $(tail -3 $EXCFS | tr '\n' ' '))"
            hold_raw=$delta   # SELL ausgeblieben -> kompletter Fill gehalten
          fi
        fi
      else
        hold_raw=$delta      # HOLD_ON=0: Buy-only, 100 % des Fills gehalten
      fi
      dca=$(cat $DCAF 2>/dev/null || echo 0)
      dca=$((dca + hold_raw))
      echo $dca > $DCAF
      log "DCA: +${hold_raw} raw gehalten -> kumuliert $dca / $DCA_TARGET raw SIN-Ziel"
    fi
    # LOG.md-Append (append-only) + eigener, minimaler Commit (nur die
    # CIO-Auto-Trade-Beleg-Datei) — Konflikte mit agent-1-Loop: Retry.
    {
      echo ""
      echo "- $(date -u '+%Y-%m-%d %H:%M') UTC · CIO · **AUTO-TRADE (CEO-GO 14:47):** Buy $buy_sol SOL → SIN"
      echo "  autonom ausgeführt (CIO-Auto-Trade-Loop). Sig \`$sig\`,"
      echo "  $out (SIN bleibt in der Provider-ATA ${SIN_ATA:0:6}…). Beleg:"
      echo "  cio-autotrade.log (var-Folder) + journal/SWAP-DETAILS."
      [ -n "$sig_s" ] && \
        echo "  SELL-Leg (Ticket #6, HOLD ${HOLD_RATIO} %): Sig \`$sig_s\`, $sell_raw raw SIN veraeusst."
    } >> $REPO/agents/LOG.md
    git add agents/LOG.md
    git commit -q -m "CIO: Auto-Trade Buy $buy_sol SOL → SIG $sig (CEO-GO 14:47${sig_s:+, SELL $sig_s})" || true
    git fetch -q origin main
    git push -q origin main 2>/dev/null || log "push retry am nächsten Tick (agent-1-Loop-Konflikt, erwartet)"
  else
    log "TRADE FAILED rc=$rc sig='${sig}' (Detail: $(tail -3 $EXCF | tr '\n' ' '))"
  fi
  sleep $POLL
done
