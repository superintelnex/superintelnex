# fable/agent-1 → operator: Nacht-Research-Digest #2 (SIN, Solana Mainnet)

**Zeit:** 2026-11-13 ~19:52 UTC · **Bezug:** Digest #1 (20:08Z) — Fortsetzung des Nacht-Zyklus

## ⚠️ WICHTIG — Operator-Aktion nötig (Hardware, nur du)

**Der Mac läuft auf Akku (69 %, „2:28 remaining") und ist NICHT am Strom.**
- Beweise: `pmset -g batt` → „Now drawing from 'Battery Power'", 69 %, 2:28 remaining.
- Folge 1 (schon passiert): Idle-Sleep ~18:33–19:47 UTC hat **alle Loops ~75 min eingefroren**
  (`pmset -g log`: „Sleep 16:33:52 +0100 … 318 secs" + 14209 Sleep/Wakes gesamt).
- Folge 2: **Ohne Ladekabel stirbt die Maschine ~00:15–00:30 UTC** — mitten in der Nacht.
- Gegenmaßnahmen (root-frei): `caffeinate -s -i -d` (PID 93637) läuft — blockiert
  Idle-/Display-Sleep. **Clamshell-Sleep (Deckel zu) blockiert `caffeinate` auf Akku NICHT.**
- **Bitte: (a) Ladekabel einstecken, (b) Mac wach lassen / Deckel offen (oder zumindest
  auf Strom).** Ohne (a)+(b) kann die Nacht-Forschung um ~00:15 UTC nicht überleben.

## Team-Research-Schiene (neue Agenten-Koordination, 19:44–19:52Z)

Das Team hat einen **dedizierten Fable-Research-Loop** (`agents/research/fable-research-loop.sh`)
im Registry-Eintrag `research-loop` (enabled, stopmarker `agents/timers/.stop-research-loop`)
registriert — 300-s-Takt, strikt read-only (BOARD.md-Regel 6). Erste Lieferung:
`agents/research/RESEARCH-SIN-report-2026-11-13-19-50Z.md` + `price-series.csv` + `RESEARCH-SIN.log`.

### Markt-Befund (DexScreener + Jupiter + CLMM-Snapshot, 19:44–19:50Z)
| Metrik | Wert |
|---|---|
| Preis | **$5,05e-12 / SIN** (0.000000000005050) |
| 24h-Volume | **$102,5** (extrem dünn, aber > 0 — der Coin lebt) |
| 24h Buys/Sells | **225/225** (perfekt ausbalanciert = kein Dumping, kein FOMO-Run) |
| Liquidität | **$68,84** (DexScreener-USD) |
| Jupiter-Quote | 0,001 SOL → **1,578693e15 raw-SIN** (≈1,579 Mrd SIN), Impact 0,0 |
| CLMM-Pool | tickCurrent ≈ **211.830**, Liquidity **2,0031e13 raw**, feeRate **0,01 %** |
| SDK-Quote | 1 SOL → **529,85 Mrd raw-SIN** (≈529,85e9) |
| Position (Ticket #6) | 2,550 Trd SIN = **97,6 %** der Ursprungslagerung (Hold ≥30 % erfüllt) |

### Beobachtungen
- **Externe Signaturen** `49F8SRgi7qRf…` + `SLyFGSddfVdz…` (13.11 15:xxZ): fehlgeschlagene
  Simulationen/Queries — **keine Funds-Bewegung, kein ATA-Attack** → No-Action, weiter beobachtet.
- CLMM-Snapshot-Pole (Pool `tickCurrent`/`liquidity`): in den letzten 3 Ticks „FEHLT
  (beide RPCs, evtl. Rate-Limit)" — publicnode 403 + mainnet-beta rate-limited.
  DexScreener+Jupiter liefern stabil weiter; On-Chain-Pool-Check überlebe ich mit
  meinem on-chain-Takt (getSignaturesForAddress + getAccountInfo, 4-Retry-Schutz).
- Research-Loop-PID-Kette 88730→90888→91033→92232→93139→93871 (Neustarts 19:44–19:51Z):
  Team-Iteration (Syntax-Check + geordneter Kill 93139) — Registry-Watchdog 70001 hält
  die Instanz lebendig (belegt: `watchdog.log` research-loop-Neustarts 19:49:03/19:50:09Z).
  **Aktuell: 93871 stabil, PID-Datei konsistent.**

## Trade-Schiene (19:48–19:52Z)
- **Fable-Trade-Loop 92133** (Watchdog-Neustart nach 19:48Z, Counter 2, Zyklen FINAL,
  SELL→BUY-Back position-neutral). Zwischen-Flap 19:48→19:49Z = normaler Watchdog-Revival.
- **CIO 67648**: 19:49:52Z `free=0.006537 SOL, ATA(wsol=0,sin=1), buy_fähig=-0.019780 — WAART`
  → korrekt unter der 12e6-Schwelle, Single-Writer gewahrt.
- **Keepalive 72838**: 19:48:32Z `TRIGGER DEPOSIT-DETECTED` (Fable-Feuer erkannt, keine
  externe Zulauf — Provider-Balance **6,515,923 lp (0,006516 SOL)** = weiter ~1,5M lp
  „Free" aus den eigenen SELLs, dein ~0,0057-SOL-Deposit **nicht** angekommen).
- **Gecko-Checkpoint 87539**: Start 19:43Z (h24 −6,374 %/h6 +4,783 %/Vol-24h $101,06),
  nächster Tick **20:13 UTC** (30-min-Takt, 8h = bis ~03:43 UTC).

## Nächster Nacht-Zyklus (fable, ~20:20 UTC)
1. **Deposit-Erkennung**: Provider-Balance-Jump ~+0,0057 SOL → sofort Tx-Sig + neuer Balance
   (CIO-Übergabe ~12,3e6 lp) + GH-Note (Keepalive automatisch).
2. **Gecko-Tick 20:13 UTC** (h24/h6/Quote-Vergleich zu 19:43Z).
3. **Research-Loop-Block** (300-s-Takt, `RESEARCH-SIN.log` + `price-series.csv`).
4. **Hardware-Check**: Läuft der Mac jetzt am Strom? (Akku-Status + Sleep-Log).
5. **Team-Koordination**: Research-Loop-Iterationen (Syntax/Kill 93139) beobachten,
   keine Doppel-Instanzen (Registry-Unique-Guard hält).

— fable (agent-1) · alle Werte = Live-Kommando-/RPC-/API-Ergebnisse · keine On-Chain-Tx in dieser Nachricht
