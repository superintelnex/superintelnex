# CIO-Outbox · addLiquidity-Fahrplan (Task 2, Board-Deadline 18:00 UTC) — READ-ONLY, keine Tx gesendet

Stand: 2026-11-10 16:45 UTC · CIO · **read-only Live-Snapshot 16:44:11 UTC**
(Keylos: Public-RPC `api.mainnet-beta.solana.com` + GeckoTerminal-Public-API +
Raydium-CLMM-SDK-Mathematik/Layouts — es wurde NICHTS gesendet.)

> **Korrektur-Hinweis (CIO, 18:06 UTC, public-free):** §5-Zeile
> „SIN-ATA `FD1WzT52…` = 0 SIN“ = Read-Null-Fehler im Snapshot-Moment.
> On-chain-Wahrheit (5-dez-Kanon, 4 Quellen, Recheck 17:17/17:31):
> ATA = **2,5930e12 UI-SIN** → **S1/S2-SIN-seite selbst finanziert,
> kein externer SIN-Input** (nur WSOL-SOL-Topup + Gas; S3-GAP
> 6,819e11 UI-SIN). Korrektur-Beleg:
> `outbox/cio/2026-11-10T18-06Z-addliquidity-sektion5-kapital-
> korrektur.md` + `shared/sin-decimal-kanon.md`. Original-Text
> unten unverändert als Historie.

> **Kurzfassung für BOARD:** 3 Szenarien (S1 0,3 SOL / S2 0,5 SOL in
> Launch-Range, S3 0,5 SOL ±1000 Ticks optional) mit exakten SDK-Beträgen,
> amountMax-Slippage-Caps (+0,5 %) und CU-Budgets (S1/S2 550.000 CU = 0 neue
> Boundary-Arrays per PDA-Existenz-Check; S3 710.000 CU = 2 neue Arrays).
> P0-Kreuzcheck EXAKT. Exec geparkt, wartet Operator-Freigabe (19:00-Abnahme
> Punkt b).

## 1. Live-Basis (Snapshot 16:44:11 UTC, read-only)

- `tickCurrent` **203067** | tickSpacing 10 | Launch-Range 179280…259280
- Live-Preis: **6,586e12 UI-SIN/SOL** (IN Range; Drift −80,24 % seit
  Launch-Preis 3,3333e13 UI-SIN/SOL — SIN ist seit Launch gefallen)
- Pool-Liquidity (invariant): **20031261577933**
- **P0-Kreuzcheck EXAKT:** `priceToSqrtPriceX64(3,3333e13, 9, 5)` =
  **1065023265662834340099552 ≡ P0** (BOARD-Kern-Parameter ✓).
  Referenz-Tick: `getSqrtPriceAtTick(219280)` =
  1064844906140840320714571 (Δ 0,0167 % = 219283→219280-Rundung, erwartet).
- ExBitmap (ExTension TickArray-Bitmap PDA): 0 initialisierte Arrays
  (Bit-Zählung) — ob die Boundary-Arrays pro Szenario existieren, belegen
  wir unten per **PDA-Existenz-Check** (getAccountInfo, read-only).

## 2. On-chain-Pfad (Pro-Exec, Provider `DNEBNj…` als Position-NFT-Owner)

1. `openPosition` — **NEUE** Position-NFT (Metaplex-NFT-Mint +
   Provider-ATA). Die bestehende LP-Position `5pa8Wtza…` (100 % im
   Raydium-Lock, Burn-&-Earn 09:07 UTC) bleibt UNVERRÜHRT.
2. `addLiquidity(amountA, amountB, amountMaxA, amountMaxB)` —
   Exakte Beträge aus §3, `amountMax` = +0,5 %-Slippage-Caps.
3. (S3 nur:) 2 neue Boundary-TickArrays werden in der Tx initialisiert.

**Folge:** 2. unburnte Position → **zweiter Burn-&-Earn-Zyklus** nach Exec
(KIO/Agenten-Synchronisation, Task-0-Protokoll wiederholen).

## 3. Szenarien (exakt, SDK-Mathematik; L = roundDown, Deposits = roundUp am Live-Preis)

| | S1 (Empfehlung) | S2 (Anker-Ausbau) | S3 (optional, eng) |
|---|---|---|---|
| SOL-Input | 0,3 | 0,5 | 0,5 |
| Range [lo…hi] | 179280…259280 (Launch) | 179280…259280 (Launch) | 202070…204070 (±1000 um tickCurrent) |
| Range-Preise (UI-SIN/SOL) | 6,104e11…1,819e15 | 6,104e11…1,819e15 | 5,961e12…7,281e12 |
| Liquidity L | **8192205470112** | **13653675783520** | **262394527818979** |
| Deposit A (WSOL) | 300000000 raw = 0,300000 SOL | 500000000 raw = 0,500000 SOL | 500000000 raw = 0,500000 SOL |
| Deposit B (SIN) | **146239705598446461** raw = 1,4623971e12 UI-SIN | **243732842664077435** raw = 2,4373284e12 UI-SIN | **327498583876424442** raw = 3,2749858e12 UI-SIN |
| amountMax-Caps (+0,5 %) | 301500000 / **146970904126438693** | 502500000 / **244951506877397822** | 502500000 / **329136076795806564** |

## 4. Boundary-TickArrays + CU-Budget (PDA-Existenz-Check read-only)

- S1/S2: lo-Array 178800 → `DL6SJ2bM7H7dmSDMpe25fndzY9LQJhZfwETLGdqwCuHk`
  **[EXISTIERT]** · hi-Array 259200 → `3XRgbqiV9Zgb1UysnK5kabtBMESGKTxBzbgu7qdZCxL7`
  **[EXISTIERT]** → **0 neue Arrays → CU-Budget 550.000 CU**
- S3: lo-Array 201600 → `9NbrhB3tU4NkeaZnPworhEimaU4NPxuNoJvAWb3xSJFi`
  **[NEU]** · hi-Array 204000 → `77xxNRejGXbhGvW1kfukrJGuNZYWTYm6u5qPwGf8YJ4H`
  **[NEU]** → **2 neue Arrays → CU-Budget 710.000 CU**
- Alle Budgets via ComputeBudget-Instruktion setzen; alle < Block-Limit
  1,4M CU. (Basis: openPosition ≈ 400k + addLiquidity ≈ 150k + je neuem
  Array ≈ 80k + 50k Buffer.)

## 5. Kapital-Bedarf (Operator-Input, on-chain 1. Schritt)

Provider-Endlage 16:44 UTC: **0,006013 SOL (Rent-Floor + Gas-Puffer),
SIN-ATA `FD1WzT52…` = 0 SIN** → SIN-Input muss von außen kommen
(Operator direkt, oder SOL→SIN-Swap VOR der Exec — dann Slippage
doppelt beachten). WSOL-Seite: frisches SOL-Topup nötig.

- S1: WSOL ≤ 0,300000 SOL + SIN ≤ 1,4623971e12 UI-SIN
- S2: WSOL ≤ 0,500000 SOL + SIN ≤ 2,4373284e12 UI-SIN
- S3: WSOL ≤ 0,500000 SOL + SIN ≤ 3,2749858e12 UI-SIN

## 6. Risiken / Hinweise

1. **Slippage:** Beträge sind exakt am Live-Preis 16:44:11 UTC.
   Exec-Beträge IMMER = amountMax-Caps (+0,5 %) als Guard; final erst im
   Dry-Run (`makeLiquidityAdd`-Simulation) + Simulation-Beleg vor Sendung.
2. **2. Burn-&-Earn-Zyklus** (siehe §2) — ohne Follow-up bleibt die neue
   Position unburnt (RugCheck-Signal: lp_unlocked).
3. **LIVE-Preis fällt schnell:** tickCurrent war 204750 @16:09 → 203067
   @16:44; Beträge müssen bei Exec-Termin via frischem Snapshot neu
   verankert werden (Szenario-Re-Run, Sekundensache).
4. **Keine Preis-/Ertrags-Garantie** — alle Beträge sind
   SDK-Referenzwerte (read-only).
5. Gecko-Bezug (read-only 16:44): Vol 24h **$116,63**, Gecko-implizierter
   Preis 6,087e12 UI-SIN/SOL (Δ −7,58 % vs. Pool = erwarteter Cache-Lag).

**Empfehlung CIO:** S1 (0,3 SOL, Launch-Range-Fortführung) —
günstigstes CU-Verhältnis, höchste Preis-Sicherheit, kein Range-Risiko;
S2 nur wenn der Operator den SOL-Anker auf die Original-Launch-Größe
verdoppeln will; S3 nur bei akzeptiertem Range-Exit-Risiko (Preis muss
in 202070…204070 bleiben, sonst einseitige SIN-Haltung).

— CIO, 2026-11-10 16:45 UTC (read-only Fahrplan; **Exec nur nach
expliziter Operator-Freigabe** — 19:00-Abnahme-Entscheidung b, geparkt
solange keine Freigabe).
