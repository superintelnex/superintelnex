# agent-1 → Operator · addLiquidity-S1: KIT-READY + Exec-Fahrplan (2026-11-10 ~23:07 UTC)

## Status: Kit fertig, Dry-Run exit-0 — Blocker NUR: WSOL-Top-up

## 1. Belege
- `token/result/ADD-LIQUIDITY-S1-DRYRUN-2026-11-10T23-05Z.txt` (Disk-only, Konsole-Abbild)
- Script: `token/scripts/add-liquidity.ts` (alle Fixes: OOR-L-Formel, SDK-API-Fixes
  (TickUtil/SqrtPriceAtTick + inline-Overflow-Check), Sim-Handling, Deckung-Display)
- Kit-Ready: Simulation exit-0, L-Mathematik + 0-ExBitmap-Pfad + CU 550k belegt

## 2. Live-Zahlen (23:05 UTC, read-only)
- Pool 4erqAhdH…: L 20031261577933, tickCurrent 201073 (In-Range: 179280/259280)
- SIN-ATA FD1WzT52…: 2,593 B UI-SIN = **228,2 %** des S1-Bedarfs (1,136 B UI-SIN)
- Provider DNEBNj…: **0.005008440 SOL frei** → reicht NICHT (Feuer-Schwelle 0.011005)

## 3. Exec-Order (Operator-Seite)
1. **Top-up: ≥ 0.301500000 SOL an `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`**
   (Quelle: Operator F9Sj9a…, dort 0.372364773 SOL — deckt's mit Buffer)
2. **Exec** (Operator-Wallet, Provider-Key als recipient.json importiert):
   ```
   cd /Users/haqmal/Desktop/Projekte/SuperIntelNex
   SIN_NETWORK=mainnet SIN_DEX_SEND=1 SIN_MAINNET_OK=1 \
     /Users/haqmal/.deno/bin/deno run --allow-read --allow-net --allow-env --allow-write \
     token/scripts/add-liquidity.ts
   ```
   (Tier-S2-Umschalter optional: `SIN_DEX_ADD_TIER=S2`)
3. **Post-Exec-Verifikation (mache ich, read-only):**
   - Vault C6iR5D…: WSOL-Seite Δ (erwartet ~+0.30 wrap)
   - Position-L: Δ von 20031261577933 (erwartet → 27401348404691)
   - SIN-ATA FD1WzT52…: Δ (erwartet −1,136 B UI-SIN)
   - Tx-Sig + Journal-Eintrag + LOG + path-scoped Commit
4. **Nebenwirkung: CIO-Autotrade-Loop feuert autonom** — Deposit ≥ 0.1 SOL an den
   Provider löst den Kauf-Trigger (Loop-PID 21894, Watchdog 24188 hält's am Leben).

## 4. Nacht-Kontrollstand (frische Belege pro Turn)
- CIO-Autotrade-Loop: 60-s-Poll, `WAART AUF DEPOSIT` (0.005008 < 0.011005)
- Watchdog: 20s/60s-Ticks, bei Loop-Tod auto-Restart
- Team-Support-Monitor v1.2 (PID 23185): Guard-geschützt

Sobald der Top-up on-chain ist (Provider-Balance ≥ 0.301500), liegt die Exec-Order
scharf. Bis dahin: Loops + Belege laufen, nichts on-chain.
