# fable · SIN-Recherche: CLMM-Range-Check (Pool-Geometrie, read-only)

Stand: 2026-11-14 ~02:20Z (Version 2 — Decode-Fix + Exponent-Kalibrierung,
auflöst die "offenen Verifikationen" von Version 1) ·
Quelle: agents/research/pool-range-check.ts (read-only: Pool/Config/Bitmap
+ 2× Tick-Array getAccountInfo, mainnet-beta).

## Verifizierte Befunde

1. **Spot-Kreuzverifikation (3. unabhängiger Kurs-Kanal ✓):**
   On-Chain-Decode: spotRawSinPerLamportSol = 1,053841839e9 (aus
   sqrtX64 598835365968752693317639). night.jsonl (1,0538e9): 0,004 %.
   Jupiter 0,001-SOL (1,0520e18 → 1,0520e9): 0,17 %.
   → Kurs von 3 Kanälen belegt, alle <0,2 % gegeneinander.

2. **tickSpacing = 10** · tickCurrent = 207767 · liqRaw = 20031261577933.

3. **KERN-FINDING: WIR SIND DIE EINZIGE LP-POSITION IM POOL.**
   Decode (Version 2, korrigiert): in Array 1 (Start 178800) genau 1
   aktiver Tick bei **tickLower = 179280**, in Array 2 (Start 259200)
   genau 1 aktiver Tick bei **tickUpper = 259280**. Pro-Array
   grossLiqSumRaw = 20031261577933 = **exakt die Pool-liqRaw** (die
   CLMM-Gross-Buchung trägt in jeder grenztick-Richtung die volle
   Position-Liquidität). → 100 % der aktiven Pool-Liquidität gehört
   zu einer einzigen Position (unsere). Bestätigt die
   Impact-Analyse-These (Position ≈ 23 % der USD-Liquidität, weil
   der USD-Wert beider Reserves einbezieht; CLMM-Anteil = 100 %).
   Konsequence: jeder Kurs-Verlauf im Pool ist zu 100 % von unserem
   Range-Design bestimmt — und wir können ihn auch zu 100 %
   anpassen (out-of-range-Modifikation, wenn je genehmigt).

4. **Range-Geometrie (kalibriert, s. 5) — SIN-Kurs-Richtung:**
   P_SINperSOL ∝ exp(1e-4·tick) → SIN-Kurs ∝ exp(−1e-4·tick).
   - tickUpper 259280 → SIN-Kurs = **5,79 % des Spot-Niveaus
     (−94,2 %)** = Abwärts-Out-of-Range-Grenze (nächere Kante)
   - tickLower 179280 → SIN-Kurs = **17,27× Spot (+1627 %)**
     = Aufwärts-Out-of-Range-Grenze (ferne Kante)
   - Breite: 80000 Units = 8000 Ticks → **asymmetrische** Range:
     unten eng (−94,2 % Crash), oben extrem weit (+1627 % Moon).
     Out-of-range NUR bei −94 % Crash oder ×17-Moon-Event.
   - tickCurrent 207767 liegt 28487 Units über der unteren Kante
     (51513 unter der oberen).

5. **Tick→Preis-Kalibrierung (empirisch, gegen echten Preispuls):**
   Pre-Puls (21:36–21:41Z): tick 211829, sqrtX64 7,3369404570156348e23.
   Post-Puls: tick 207767, sqrtX64 5,98835365968752693e23.
   Δtick = −4062 ↔ (Price-ratio)² = (5,988354/7,336940)² = 0,66632.
   → ln(1/0,66632)/4062 = **1,0001e-4 pro Tick-Unit**, exakt
   Faktor e^(1e-4 · tick) (konventionell: Preis = exp(tick·1e-4)
   in SIN/SOL-Richtung; tick runter = SIN runter). Alle
   USD-Korridore oben mit diesem (kalibrierten) Exponenten.

6. **P2-Tick-"211830" STALE-Beleg ENTRÄTSALT (material, für Operator):**
   211830 = gerundetes **Pre-Puls-tickCurrent 211829** (Log-Beleg
   21:36/21:41Z). Der 21:44Z-Preispuls hat den tick um −4062 auf
   207767 verschoben. → Der Operator-P2-Offenpunkt ("211830 STALE,
   read-only verifizieren vor P2-Publishing") ist damit beantwortet:
   211830 ist korrekt WUR (vor Puls), heute ist 207767 gültig.
   Keine neue Tx, reine Read-only-Auflösung.

## Konsequenzen (aktuell: Watch, kein Trigger)

- **Keine Handlungsnotwendigkeit**: Position IN-Range, Range extrem
  weit, Kurs-Kalibrierung sauber. Der Range-Check ist fortan ein
  Routine-Beleg (bei tick-Change neu ausführen).
- **SELL-BACK-Impact-Bezug** (Impact-Analyse): Sell-Seite degrades
  stärker (−7,7 % bei 0,05 SOL), weil die SOL-Randreserve dünn ist —
  die 80000-Units-Breite erklärt warum: der Range-Preis-Korridor
  ist unten bei −94,6 %/obenzwischen, die SOL-Randverteiung
  konzentriert sich nahe am tickCurrent (weil Spot dort liegt).
  → SELL-Back-Tranchen ≤ 0,01-SOL-Äquivalent (bestätigt).
- **Operator-Digest-Vorschlag**: P2-Tick-Auflösung (Punkt 6) ist
  Operator-relevant — in den nächsten Operator-Digest (#6)
  einbauen, wenn ein Deposit/Event ohnehin die Digest-Grenze
  erreicht; sonst als Kurz-Notiz in Digest #6-Nächstem.

## LP-Ertrags-Schätzung (Nachtrag ~02:27Z, read-only ClmmConfig-Read)

- `tradeFeeRate = 100` → **1,00 % pro Swap** (Raydium-Basis 1/10000).
- `protocolFeeRate = 120000` (12 % der Swap-Fee → Protokoll),
  `fundFeeRate = 40000` (40 % → Fund) → **LP-Anteil ≈ 48 %**.
- Schätzung bei Vol-24h $122,77: $1,23 Swap-Fee/24h → **≈$0,59/Tag
  LP-Ertrag** (wir als einzige LP-Position zu 100 %; Position
  praktisch immer inrange s. 4).
- Konsequenz: **Yield ist negligible — die Position ist Ticket, kein
  Ertrags-Vehicle.** Rechtfertigt kein Halten-Argument für
  Sell-Back-Planung (Ticket #6); kein Trigger.

## Position-Decode (Nachtrag ~02:50Z, read-only getProgramAccounts)

- **genau 1 Position-Konto im Pool** (memcmp-Filter poolId):
  PDA `A2BhoSse3puvcos3gQH4Qqc6QdFKXsed8qJbB28ievtM`,
  Position-NFT-Mint `5pa8Wtzaaqr5DB16VDvcjJ9SrTxLqEKmHGDhDaxstyUX`.
- tickLower 179280 / tickUpper 259280 (stimmt exakt mit
  Tick-Array-Beleg), liquidity 20031261577933 = Pool-Liquidität →
  **sole-LP-Befund ein zweites Mal belegt** (Tick-Arrays +
  Position-Konto, zwei unabhängige Decode-Kanäle).
- feeGrowthInsideLast A/B = 0 und tokenFeesOwed A/B = 0:
  **kein offener Fee-Anspruch** (fehlen nur, wenn kein Swap seit
  Init/Claim lief — konsistent mit der ~4,6 h Invarianz).
- **Halter-Frage GELÖST (read-only Signatur-Query, ~03:01Z):**
  Create-Tx der Position-PDA: Sig 9fv2nf… (BlockTime
  2026-11-10T09:07:18Z), **FeePayer = DNEBNjtWf… = PROVIDER-WALLET**
  (Signer[0]). → Die Position gehört dem Provider (unser Wallet),
  das LP-Token 5,993,044 dort ist die Token-Repraesentation der
  einzigen Pool-Position. Fruehere Annahme "anderes Team-Wallet"
  RICKUFGEGRIFFEN: PDA-Seed = [position, poolId] (eine
  Personal-Position-PDA pro Pool, Owner via nftMint im
  Account-Data — PDA-Kandidaten-Test mit Owner-Seed lief
  deshalb leer).
- **2. PDA-Signatur eingeordnet (read-only, ~03:18Z):** Sig-Ältere
  `3AU3rfAF…` (BlockTime 2026-11-10T07:18:10Z, FeePayer = Provider):
  ATA-Init des LP-NFT-Token-Accounts (Log „Initialize the associated
  token account", AToken-Program-Invoke). Sig-Neuere = Create-Tx
  (09:07:18Z). Beide Sigs von Provider DNEB… — die Position-PDA
  hat exakt 2 Sigs, beide geparst, keine offene Tx.
- **CIO-Log-Voll-Scan wsol=1 (read-only):** letzte `wsol=1`-Poll
  2026-11-13T20:34:54Z (free 0.003507, buy_fähig −0.002498),
  Umschalt auf `wsol=0` um 20:36:13Z — deckt exakt den
  WSOL-ATA-Fehlt-Befund ab (seither 621 wsol=0-Polls, lückenlos
  bis 03:17Z). Keine neue wsol=1 → Designer-Note 23:12Z
  (Puffer-Fenster-Rekalibrierung) bleibt gültig, keine
  Obsolet-Markierung nötig.
- **Korrektur-Notiz zur Operator-Inbox-Note (02:38Z):** dort
  stand "Signatur laeuft ueber anderes Team-Wallet" — ist mit
  diesem Befund aehlzulegen: Provider-Wallet DNEB… ist
  Ersteller + Halter der Position.

## Version-1-Korrektur (Transparenz)

- Version 1 meldete "initializedTicks = 0" (mein `.initialized`-
  Feldname-Bug) und "Coverage-Band −26/+280 %" (ungeprüft,
  falscher Exponent). Beides ist hiermit ersetzt: echte Position-
  Ticks (179280/259280) + kalibrierter Exponent (Puls-Ereignis).
  Storage-Coverage (Array-178800-bis-260720 + 259200-bis-341120,
  1520-Overlap, lückenlos) bleibt gültig — das war von Anfang an
  korrekt (Bitmap-"all").

— fable
