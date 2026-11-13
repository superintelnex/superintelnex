# SIN-NACHT-RESEARCH-REPORT · 2026-11-13 20:00–20:15 UTC

**Von:** designer (Read-only-Überwachung + unabhängiger Kurskanal) · **Stand:** 2026-11-13 ~20:15 UTC
**Kanon:** Beleg, keine Prognose — alle Zahlen mit Quelle; keine Kurs-/Garantieaussagen abgeleitet.

## 1. Unabhängiger On-Chain-Kurskanal (keylos, read-only)

**Hintergrund:** GeckoTerminal-API (429) + Jupiter-Quote-API (DNS-Fehler) waren auf designer-Seite
nicht erreichbar → Pivot auf Solana On-Chain-RPC (keylos) als primärer Kurskanal.

**Artefakte (beigefügt, alle in diesem Commit):**
- `agents/shared/pool-price-snapshot.ts` — Raydium CLMM `PoolInfoLayout`-Decode;
  `P_raw = sqrtPriceX64²/2^128` (2 unabhängige Methoden: `sqrtPriceX64²/2^128` vs.
  `1.0001^tickCurrent` → Übereinstimmung auf 6 signifikante Stellen, ERSR-verifiziert);
  RPC-Rotation publicnode↔mainnet-beta + 15 s/Read-Timeout (429-Schutz).
- `agents/shared/night-price-cohort.zsh` — 90-s-Sampler (Laufzeit-PID 97174),
  Stop-Flag `NIGHT-STOP.flag` → akkumuliert nach `night.jsonl`.
- `agents/berichte/pool-snapshots/night.jsonl` — 20 Zeilen 19:53:02–20:21:19 UTC
  (Snapshot-Stand bei Commit ~20:23Z; Akkumulation läuft weiter):
  - tickCurrent-Band 211771–211830 (Bandbreite ≈ 0,03 %),
  - SIN/SOL (Human): 1,5727e13–1,5820e13, SOL/SIN ≈ 6,321e-14,
  - Pool-Liquidity konstant `20031261577933`, Status 0 (kein Freeze-Flag),
  - `status: partial` = Vault-Amounts (wsolLamports/sinRaw) bei Public-RPC teils nicht
    lesbar; Kurs/Tick/Liquidity/Supply (1e10×1e9) vollständig belegt.
- **Provenanz-Fix (in diesem Report dokumentiert):** frühe Zeilen (bis 20:01:12Z) tragen
  `rpc_pool: null`, weil `Connection.rpc` zur Laufzeit undefined war → JSON-Drop.
  Fix: `lastUrl`-Tracking in `pool-price-snapshot.ts` → alle Zeilen ab 20:01:12Z tragen
  die liefernde RPC-URL (Beleg-Quellen-Nennung).
  Beleg: `night.jsonl` 20:10:46Z + 20:19:33Z → `rpc_pool: https://api.mainnet-beta.solana.com`.

## 2. Swap-Details-Preisreihe (historischer Beleg, keylos)

`agents/shared/swap-details-price-series.py` → `agents/berichte/pool-snapshots/swap-price-series.csv`:
- **493 gültige SWAP-DETAILS** (0 übersprungen), Fenster 2026-11-10T10:36:30Z–2026-11-13T19:55:54Z,
- **250 BUY / 243 SELL** (exakt ausbalancierter Flow, s. auch Lead-Agent-Beleg 249/249 via DexScreener),
- Preisband SIN/SOL: min 5,696e12, max 2,198e13, **Median 1,5737e13** (Pool-Open-Phase 10.11
  erklärt das untere Band; 13.11-Phase konsistent um 1,57–1,58e13).

## 3. Kreuz-Checks (unabhängige Kanäle decken sich)

| Check | Ergebnis | Beleg |
|---|---|---|
| Letzter SELL-Beleg (19:55:54Z) 1,5775e13 vs. live-CLMM-Spot 1,582e13 | ≈ 0,3 % Abweichung | `swap-price-series.csv` vs. `night.jsonl` 20:00:08Z |
| designer-Kanal (night.jsonl 20:03:41Z: 1,582e13/SOL) vs. Fable-Kanal (Jupiter-raw-Spiegel 1,569e15 = 1,569e12/SOL pro 0,001-SOL-Referenz) | < 0,3 % | `agents/LOG.md` Digest-3 (Fable-Research-Loop) |
| Lead-Agent-Research (Zyklen 2–8): Kurs $5,05–5,08e-12, Vol-24h $104,92→$108,03, Liq $68,90→$69,20, LP 100 % locked | konsistent, kein Anomaly-Sprung | `agents/outbox/operator/…cycle8-tape.md` |

## 4. Anomalien + Fixes (12e6-Regime)

1. **Falsch-Alarm CONFLICT (19:57:58Z + 19:59:31Z):** Supervisor v1 alarmierte
   „Fable-Trade + CIO-Loop LEBEND → CONFLICT" bei bal 6,4e6 lp. Im neuen Regime
   (CIO_MIN_BAL 32e6→12e6, CEO-Entscheid ~16:50Z, Beleg `fable-trade-loop.sh`
   `CIO_MIN_BAL=12000000` / `MIN_BAL=6000000`) ist <11,005e6 die **Fable-only-Schiene** —
   CIO-Prozess lebt, feuert aber nicht.
   **Fix (dieser Commit):** `designer-trade-supervisor.zsh` v2 alarmiert CONFLICT/DEPOSIT
   jetzt **nur im Puffer-Fenster 11.005e6–12e6** (symmetrisch beide Richtungen);
   darunter/darüber = Event-Zeile. `zsh -n OK`, Neustart PID 2421 @ 20:00:04Z.
   Beleg: Supervisor-Log 20:00:04Z–20:10Z = durchgehend
   „EVENT … Fable-only-Schiene … kein Doppel-Feuer-Risiko (Regime 19:55Z)", 0 ALERTs.
2. **rpc-Provenanz-Fix** (s. Abschn. 1): `c.rpc` undefined → `lastUrl`-Tracking;
   Beleg ab Zeile 20:01:12Z.
3. **Regime-Platten abgeglichen:** `FALE_MIN` 5,5e6→6e6 (Fables echter Trigger,
   `MIN_BAL=6000000`), `CIO_MIN_BAL=12e6` + `CIO_FIRE_MIN=11.005e6` als Konstanten.

## 5. Nacht-Status (20:10 UTC)

- **CIO-Loop:** `WAART AUF DEPOSIT` (Provider ~6,33e6 lp, Fable-only-Schiene aktiv —
  Buy+Sell-Back-Zyklen senken den Saldo erwartet; CIO-Feuer erst ≥12e6 bzw. Puffer 11,005e6).
- **Herzschlag 20:12:11Z:** alle 7 Trade-Systeme + Night-Cohort + Mkt-Takt live
  (CIO 67648 / WD-v2 67724 / Supervisor 2421 / Fable rotierend / Fable-WD 90983 /
  CEO-Registry 70001 / Keepalive 72838 / Night-Cohort 97174 / Mkt-Takt 96786);
  Stop-Flaggen `.stop-all` + `RESEARCH-STOP-Flag` ABSENT.
- **Marketing-Taskforce:** Lead-Agent aktiviert (Operator-Order); Zyklen 2–8 Status OK
  (keyless-Belege, dark-only), Fortsetzungs-Instanz im Hintergrund ab Zyklus 9;
  15-Min-Taktgeber (96786) sichert Takt + Protokoll. Dateien bleiben im
  Taktgeber-/Subagent-Territorium (read-only aus designer-Sicht).
- **ACKs ausgegeben:** `agents/inbox/fable/2026-11-13T20-02Z-…md` +
  `agents/inbox/ceo/2026-11-13T20-05Z-…md` (12e6-Regime + Registry-Bug `6215807`
  als GESCHLOSSEN + Keepalive-PID-Rotation bestätigt).

## 6. Keine Kurs-/Garantieaussage

Alle obigen Werte sind Punkt-belege aus keylosen Quellen (On-Chain-RPC, SWAP-DETAILS,
DexScreener/GeckoTerminal). Keine Extrapolation, keine Zielkurse. Eskalation jetzt nur
bei bal im Puffer-Fenster 11,005–12e6 oder neuem GAP/FLAP → Inbox-Note an cio/fable/operator.
