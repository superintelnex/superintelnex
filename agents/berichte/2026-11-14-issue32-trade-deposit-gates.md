# Issue #32 · Trade-Supervision, Deposit-Reaktion & Gate-Sicherheit — Read-only-Artefakt · 2026-11-14 08:13 UTC

**Grenzen:** Keine eigenmächtigen Swaps (Kanon: keine On-Chain-Tx aus dieser Session; Trade nur via CIO-Schiene nach Deposit, bzw. Operator-Hand-Trade). Fremde Loops (CIO 67648 / Fable-Trade 8178 / Keepalive 75432 / Watchdogs 67724/70001/90983) **nicht angefasst** — Status nur read-only geprüft.

## 1. Deposit-Bereitschaft (Provider `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`)

- **Balance: 5.993.044 Lamports ≈ 0,005993 SOL** (fable-Research-Kanal 08:06:46Z + CIO-Poll 08:06:17Z: `free=0.005993 SOL · ATA(wsol=0, sin=1) · buy_fähig=−0,020324 → WAART AUF DEPOSIT`).
- **Regime:** Deposit < 6e6-Schwelle → **Fable-only**, CIO-Trigger (≥12e6) **nicht erreichbar**, Puffer-Fenster (11.005–12e6) **nicht in Reichweite** (gap 11,005e6 − 5,993e6 ≈ 5,012e6 Lamports ausstehend).
- **CIO-Loop-Status (PID 67648):** aktiv, 60-s-Poll, Zustand `WAART AUF DEPOSIT` = korrekt & konform. **Soll unverändert scharf bleiben** — kein Neustart, kein Config-Change nötig (read-only-Befund: Setup intakt).
- **Bereitschaft bis 18:00: ERFÜLLT.** Deposit-Erzang (≥12e6, bzw. Puffer ≥11.005e6) = der einzige externe Auslöser; danach greift die automatische CIO-Reaktion ohne weitere Eingriffe.

## 2. Sicherheits- & Invarianten-Kontrolle (Beleg-Runde 08:06–08:10Z)

| Gate | Soll (#32) | Beleg | Status |
|---|---|---|---|
| Max Slippage | 1.000 bps | `SIN_SLIPPAGE_BPS=1000` (Buy **und** Sell, cio-autotrade.zsh L.159/179) | ✅ exakt konform |
| Compute-Unit-Limit | 500.000 | in `agents/trade-loop/`-Script/Config **nicht auffindbar** (Grep leer; 500000-Treffer = Lamports-Beträge, keine CU-Limits) | ⚠️ **Beleg-Lücke — Operator: CU-Limit-Beleg nachreichen oder Gate-Annahme bestätigen** |
| Preflight-Simulation | aktiv | in den Skripten nicht explizit nachweisbar (nur in `token/node_modules`-SDK-Lib) | ⚠️ wie oben |
| Holding-Invariante | ≥30 % SIN | ATA = 2,549875741581,8286 ui-SIN (5 Dez. fable-Beleg = 2,5499e12) · 30 % = 7,6496e11 · `wsol=0, sin=1` (komplette Position = SIN) → **kein Verkaufsdruck, Invariante erfüllt** | ✅ (siehe ⚠️-Korrektur unten) |

**⚠️ Transparente Korrektur (read-only, Issue #32-Body betrifft):** „~97,6 % = 2,549 Bio. SIN" ist intern nicht konsistent: 2,549e12 SIN = **≈2,55 % der Gesamt-Supply** (On-Chain-Mint-Read 08:10Z: totalSupply 1e14 @5 Dez.) und ≈100 % der ATA (kein wsol). Vermutet: „97,6 %" = ein älterer **Position-Anteils-Wert** (z. B. % der Trade-Wallet-Gesamtposition, Zeitpunkt unklar) — **nicht** verifizierbar aus den vorliegenden Belegen. → **Operator-Verifikation empfohlen** (Bezugsmaßstab klären). Die operative Invariante (≥30 % SIN, kein Sell-Druck) ist unabhängig davon **erfüllt**.

## 3. CLMM Fee-Accumulation Monitor (PDA `A2BhoSse3puvcos3gQH4Qqc6QdFKXsed8qJbB28ievtM`)

RPC-Read 08:09Z (getAccountInfo, read-only):
- `feeGrowthInside0Last = 0` · `feeGrowthInside1Last = 0`
- `tokensOwed0 = 0` · `tokensOwed1 = 0`
- Liquidity `20031261577933` = Pool-`liqRaw` exakt → **100 % Sole-LP** (On-Chain-beschrieben, nicht nur aus dem fable-Beleg)

**Befund: keine aufgelaufenen Fees, kein Rebalancing-Auslöser.** Fee-Kollektion wäre ein Operator-Aktion (`collectFee`-Tx) — aktuell nichts zu kollektieren; Monitoring-Punkt für den Folgetag: wenn `tokensOwed > 0` → Digest (read-only-Erkennung, Aktion = Operator).

## 4. Liveness-Verifikation (08:05–08:08Z)

`fable-trade-loop 8178` · `cio-autotrade 67648` · `keepalive-trader 75432` · `trade-watchdog 67724` · `agent-watchdog 70001` · `fable-loop-watchdog 90983` · `marketing-taskforce-loop 96786` · `night-price-cohort 97174` · `research-loop 97509` · `caffeinate -s -i -d 93637` → **alle alive** (7/7 Daemons + Taskforce + Research). `gecko-checkpoint-loop` = ABSENT (bekannt: Loop-Tot-Handling läuft via fable-night-coord-Events, kein Neustart ohne Operator).

## ZUSAMMENFASSUNG (für die 18:00-Zeit)
Deposit-Reaktion: **scharf, wartet korrekt** (12e6-Trigger). Gates: Slippage ✅ / CU-Limit + Preflight = **Beleg-Lücke** (Punkt ⚠️). Invariante ✅ (97,6 %-Figur klärungsbedürftig). Fees = 0. Loops = 7/7 +. Keine Intervention nötig, kein Handlungsbedarf vor Deposit.

*— Read-only-Artefakt · Hauptsession-Kolaboration · 2026-11-14 08:13 UTC*
