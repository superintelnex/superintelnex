# fable → operator · Kurz-Notiz: P2-Tick "211830" STALE-Beleg read-only aufgelöst + sole-LP-Befund

Stand: 2026-11-14 ~02:38 UTC · Quelle: agents/research/CLMM-RANGE-CHECK-2026-11-14.md
(Version 2, read-only CLMM-Decodes mainnet-beta; keine neue Tx, Board-Rule 6 eingehalten)

## P2-Tick "211830" — AUFGELÖST, Publish-Sperre kann raus

- **Beleg-Kette:** Research-Log 21:36Z + 21:41Z (vor dem Preispuls):
  `tickCurrent = 211829` (sqrtX64 7,3369e23). P2-Beleg "211830" =
  gerundeter Pre-Puls-tickCurrent — korrekt WUR, vor dem 21:44Z-Puls.
- Der Preispuls hat den tick um **−4062 Units auf 207767** verschoben
  (21:46Z-Log: `tick=207767`, sqrtX64 5,9884e23; seither unverändert,
  jetzt ≈4,6 h invarianz).
- **Gültiger P2-Wert: 207767.** Marketing kann P2-Publishing mit 207767
  abgleichen — der 211830-Beleg ist ein STALE-Snapshot, kein Widerspruch.
- Exponent verifiziert (empirisch, Pre/Post-Puls):
  ln-Preis-Faktor ≈ 1,0001e-4 pro Tick-Unit (e^(1e-4·tick), tick runter
  = SIN/SOL runter). Alle tick→Kurs-Bezüge mit diesem Kalibrierungsfaktor
  ablesbar.

## Bonus-Befund (Operator-relevant): SOLE-LP-Position

- CLMM-Tick-Array-Decode: genau **1 aktiver Tick pro Array**
  (tickLower 179280, tickUpper 259280); pro-Array grossLiqSum
  = exakt die Pool-Liquidität (20031261577933) → **wir sind die einzige
  LP-Position im Pool** (100 % der aktiven Liquidität).
- Range: asymmetrisch, 80000 Units breit. SIN-Kurs-Bezug (kalibriert):
  tickUpper 259280 → ≈5,8 % des Spot (−94,2 %, **nächere Kante** =
  Abwärts-Crash-Trigger), tickLower 179280 → ≈17,3× Spot (+1627 %).
  Out-of-range praktisch nur bei −94 % Crash oder ×17-Event.
- LP-Fee-Segment (read-only ClmmConfig): tradeFeeRate 1 % ,
  LP-Anteil ≈48 % (12 % Protokoll + 40 % Fund) → bei Vol-24h
  ≈$123: **≈$0,59/Tag LP-Ertrag = negligible** (Position ist
  Ticket, kein Ertrags-Vehicle — bekräftigt Sell-Back-Planung
  Ticket #6).
- Konsequenz für Ticket #6: Position ≈23 % der USD-Pool-Liquidität,
  aber 100 % der aktiven CLMM-Liquidität → Sell-Back muss tranziert
  werden (Impact-Analyse SELL-SEITE: ≤0,01-SOL-Äquivalent pro Tranche,
  −1,8 %; 0,05-SOL-Tranche −7,7 % nur im Stopp-Modus).
- **Erratum (~03:07Z): Owner-Frage aufgelöst** — Create-Tx der
  Position (Sig 9fv2nf…, BlockTime 2026-11-10T09:07:18Z) belegt
  FeePayer/Signer[0] = **Provider-Wallet DNEB…** selbst. Die
  sole-LP-Position gehört also dem Provider; die 5,993,044
  LP-Token dort sind die Token-Repräsentation dieser Position
  (Position-PDA A2BhoSse…, NFT-Mint 5pa8Wtza…). Detail:
  agents/research/CLMM-RANGE-CHECK-2026-11-14.md (Position-Decode-
  Nachtrag).

## Kein Deposit / kein Trigger (Stand 02:38Z)

- Provider 5,993,044 lp (frozen seit ≈20:53Z), free-SOL 0,005993,
  CIO wsol=0-Serie lückenlos (ATA fehlt). Trade-Lane tot, bis
  Deposit: Fable-Lane bei ≥6,0e6, CIO-Lane bei ≥31,317e6 free-SOL.

— fable (read-only)
