# MORGEN-HANDOVER 10.11.2026 · 07:00 · Pool-Launch (eine Entscheidung)

Stand: alles Reversible ist erledigt (Dry-Run grün, Commit 77e6db9 pushed).
Der eine offene Schritt ist der irreversible One-Shot: 2 Mainnet-Tx
(TX1 createPool + TX2 openPosition, Raydium CLMM SIN/WSOL).

## 1) Die EINZIGE Entscheidung (Budget-Note)

Der CLMM-Pool braucht **0,765662 SOL** (live per getMinimumBalanceForRentExemption:
Rent 0,265662 + 0,5 Liquidität + 0,000110 Fees/Puffer).
Provider `recipient.json` (`DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`)
hält **0,55 SOL** → **Top-up 0,215662 SOL ≈ 17 EUR** (77 EUR/SOL).
Das schiebt die Program-Gesamtkosten um **~3 EUR über den 50-EUR-Kasten**.
Alternative: Senden erst mit weniger Liquidität (config dex.initialLiquiditySol
reduzieren) — aber der 10%-Anteil (10M SIN) soll vollständig im Pool liegen;
der 0,5 SOL/1e18-SIN-Kursanker ist im Runbook gesetzt.

## 2) Aktion (eine Hand, ~2 Min)

1. Top-up: **0,215662 SOL** an `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`
   (Phantom → Send → Adresse). Nicht der Main-Admin (9kT5Ew…), der
   hält nur den 0,0807 SOL-Puffer.
2. EINE Zeile ausführen (im Repo-Root):

   SIN_NETWORK=mainnet SIN_DEX_SEND=1 SIN_MAINNET_OK=1 deno run --allow-read --allow-net --allow-env --allow-write token/scripts/launch-clmm-pool.ts

3. Verifikation: `cat token/result/POOL-ADDRESS.txt` (Pool
   `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM` + Position-NFT +
   beide Signaturen) + Raydium-UI-Link aus der Datei.

Danach (optional, einweg): revoke-authorities.ts läuft NUR wenn Pool
live — Reihenfolge im Runbook §2 Schritt 6.

Falls Top-up NICHT genehmigt: einfach nicht senden; nichts ist verloren
(Mint + Emission sind live und final, Supply unveränderlich).

## 3) Ehrliche Notes

- **Kein Selbst-Wecker-Timer** (keine Self-Wake-Funktion in dieser
  Umgebung). Deshalb: alle reversible Arbeit ist in der Nacht-Session
  erledigt; der One-Shot wird NICHT autonom gesendet (irreversibel +
  Budget-Überschreitung = deine Entscheidung).
- Root-Cause-Fix dieser Nacht (kurz): CLMM-Programm erzwingt
  `token_mint_0 < token_mint_1` (Byte-Order) → mintA=WSOL, mintB=SIN;
  Ticks +174170…+254170; Pool-PDA `4erqAhdH…` (alt `8Buau2…` war für
  die falsche Ordnung). TX1-Simulation vor dem Fix: ConstraintRaw 2003;
  nach dem Fix: OK (51.771 CU).
