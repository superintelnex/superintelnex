# Issue #30 · Deep Coin-Research & CLMM-Tiefenanalyse — Read-only-Artefakt · 2026-11-14 08:11 UTC

**Grenzen:** Streng read-only (keine Tx, keine Intervention in fremde Loops). Alle On-Chain-Belege: `getAccountInfo`/Mint-Reads via Public RPC (kein Key, keine Signatur); Jupiter/Keyless-APIs: 1 Call/Quelle. Keine public-Copy-Änderung (Zuständigkeit Taskforce).

## 1. Liquiditäts- & Slippage-Profil (Jupiter keyless, 08:10Z, SOL→SIN)

Basis-Beleg 0,001 SOL: `out=1052031689280177` raw-SIN (≈1,052e10 SIN) — identisch zum fable-Research-Kanal (6 Runden in Folge, 07:41–08:06Z). Kurven-Impact = Abweichung vom linearen Maßstab der 0,001-SOL-Referenz (API-`priceImpact`-Feld liefert `None` für diesen Token):

| Eingabe (SOL) | ≈USD (SOL=$76) | out (raw-SIN) | ≈SIN (5 Dez.) | Kurven-Impact | <1,5 %-Prüfung |
|---|---|---|---|---|---|
| 0,001 | ~$0,08 | 1052031689280177 | 1,0520e10 | 0,000 % (Referenz) | ✅ |
| 0,005 | ~$0,38 | 5226337152743618 | 5,2263e10 | **0,643 %** | ✅ |
| 0,010 | ~$0,76 | 10369334537305766 | 1,0369e11 | **1,435 %** | ✅ (Obergrenze) |
| 0,050 | ~$3,80 | 48737949110674808 | 4,8738e11 | **7,345 %** | ❌ (>1,5 %) |

**Optimale Transaktionsgröße für Slippage <1,5 %: 0,01 SOL (~$0,76) — Kurven-Impact 1,435 %, direkt an der Schwelle. Sweet Spot: 0,005 SOL (0,643 %).** minOut-Werte (150 bps): 0,001→1036251213940975 · 0,005→5147942095452464 · 0,01→10213794519246180 · 0,05→48006879874014686.

Hinweis: Kurven-Impact relativ zur 0,001-Referenz (erste Ordnung); Raydium-CLMM-Fee (0,25 %, config-spezifisch) in den minOut-Quoten bereits einbegriffen.

## 2. Tick-Range & Rebalancing-Audit (RPC-Reads, 08:09Z)

- **Einzige LP-Position** PDA `A2BhoSse3puvcos3gQH4Qqc6QdFKXsed8qJbB28ievtM`: tickLower **179280** / tickUpper **259280** (Byte-Verifikation @Offsets 73/77) · Liquidity **20031261577933** = exakt = Pool-`liqRaw` (fable-Kanal 08:06:46Z) → **100 % der Pool-Liquidität = diese eine Position** (Sole-LP-Bestätigung aus On-Chain, nicht nur aus dem fable-Beleg).
- **TickCurrent = 207767** (fable-Kanal 08:06:46Z, seit 21:47:56Z 13.11. fix) → mittig in `[179280, 259280]` (Spanne 80.000 Ticks, Position nutzt die gesamte konfigurierte Range → **maximal breite, flache Dichteverteilung**).
- **Fee-Accumulation (Issue #32-Punkt 3):** `feeGrowthInside0Last = 0`, `feeGrowthInside1Last = 0`, `tokensOwed0 = 0`, `tokensOwed1 = 0` → **keine aufgelaufenen Fees, kein Rebalancing-Auslöser**.
- **Rebalancing-Option (Zukunft, Operator-Entscheidung):** Engere Range um tick 207767 (z. B. [±] 10–20 k Ticks) würde L_eff erhöhen → Impact pro SOL sinkt → engere Spreads. **Nur via neuem LP-Add (On-Chain, Operator) — kein read-only-Vorschlag zur Ausführung.**

## 3. Divergenz-Monitoring (300-s-Takt)

- DexScreener-Liq **$82,21** vs GeckoTerminal-Reserve **$70,24** (Z93-RÜCKFALL-Wert) → **Gap ≈$12,0** (tape-intern, Z93-Beleg; public-Blindwerte unverändert).
- 300-s-Dokumentation **läuft bereits**: fable-Research-Loop (PID 97509) schreibt `agents/research/RESEARCH-SIN.log` (Zeile 08:06:46Z: Markt/Jupiter/Pool/Provider-Blöcke) → Aufgabe = **bestanden/verankert**, kein neuer Loop nötig (kein Doppel-Instanz — Kanon: 1 Loop/Aufgabe).

## 4. Supply-Verifikation (RPC read-only, 08:10Z)

- Mint-Account `A4WSPb…4A44Z`: `totalSupply raw = 10000000000000000000`, `decimals = 5` → **1e14 Display-SIN** (revokiert, unveränderlich).
- **Korrektur-Flag (transparent):** ATA-Bestand (fable-Beleg 2.549875741581,8286 uiAmount @5 Dez. = **2,5499e12 SIN**) = **≈2,55 % Supply** — Issue-#32-Aussage „aktuell ~97,6 % = 2,549 Bio. SIN" ist mit dem On-Chain-Supply-Read **nicht konsistent** (2,55 %, nicht 97,6 %; „2,549 Bio." = 2,549e12? notiert: 2,549e12 = 2,549 **Billionen** — vermutlich Einheiten-/Prozent-Fehler in #32). → **Operator-Verifikation empfohlen** (welcher Bezugsmaßstab gemeint ist: Supply-Anteil oder Position-Quote).

## 5. Transparenz-Notizen

- Jupiter-`priceImpact`-Feld = `None` bei allen 4 Quotes → Kurven-Impact aus outAmount-Serielle abgeleitet (Methode oben, reproduzierbar).
- Position-Decode: Byte-Suche + SDK-belegte Offsets (fable pool-state.ts, `@raydium-sdk-v2-Layouts`); eigene Offset-Raten des Vormittags (443/451, 296/300) = defekt, verworfen — Beleg-Korrektur hier transparent, nicht im fremden Log.
- fable-Territorium (`agents/research/`, CIO, Watchdogs) nur read-only gelesen, 0 Edits.

*— Read-only-Artefakt · Hauptsession-Kolaboration · 2026-11-14 08:11 UTC*
