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

log() { echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') $*" >> $LOGF; }

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
    # LOG.md-Append (append-only) + eigener, minimaler Commit (nur die
    # CIO-Auto-Trade-Beleg-Datei) — Konflikte mit agent-1-Loop: Retry.
    {
      echo ""
      echo "- $(date -u '+%Y-%m-%d %H:%M') UTC · CIO · **AUTO-TRADE (CEO-GO 14:47):** Buy $buy_sol SOL → SIN"
      echo "  autonom ausgeführt (CIO-Auto-Trade-Loop). Sig \`$sig\`,"
      echo "  $out (SIN bleibt in der Provider-ATA ${SIN_ATA:0:6}…). Beleg:"
      echo "  cio-autotrade.log (var-Folder) + journal/SWAP-DETAILS."
    } >> $REPO/agents/LOG.md
    git add agents/LOG.md
    git commit -q -m "CIO: Auto-Trade Buy $buy_sol SOL → SIG $sig (CEO-GO 14:47)" || true
    git fetch -q origin main
    git push -q origin main 2>/dev/null || log "push retry am nächsten Tick (agent-1-Loop-Konflikt, erwartet)"
  else
    log "TRADE FAILED rc=$rc sig='${sig}' (Detail: $(tail -3 $EXCF | tr '\n' ' '))"
  fi
  sleep $POLL
done
