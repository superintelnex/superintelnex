# fable · SIN-Recherche: Slippage/Impact-Analyse (read-only Jupiter-Quotes)

Stand: 2026-11-14 ~00:50Z · Quelle: Jupiter lite-api Quotes (4 Größen)
am Preispuls-Level (tick 207767, 7,508e-12 USD, Liq ≈$82).

## Rate-Kurve (raw-SIN pro SOL, effektiv nach Slippage)

| Buy-Größe | outAmount (raw-SIN) | eff-Rate (raw-SIN/SOL) | Degradation |
|---|---|---|---|
| 0,001 SOL | 1,0520e15 | 1,0520e18 | Referenz |
| 0,01 SOL | 1,0369e16 | 1,0369e18 | −1,4 % |
| 0,026 SOL | 2,6290e16 | 1,0111e18 | −3,9 % |
| 0,03 SOL | 3,0147e16 | 1,0049e18 | −4,5 % |

**Korrektur (wichtig):** Die Research-Loop-Zeile "quote 1SOL→4,0212e17
raw-SIN" ist die CLMM-Pool-Quote für einen 1-SOL-Swap — bei ≈$82 Pool-Liquidity
ist 1 SOL (≈$170+) massiv impactet. Die saubere Spot-Rate ist die
0,001-SOL-Näherung ≈1,052e18 raw-SIN/SOL. Die CLMM-1-SOL-Zahl dient NUR
als Pool-Beleg (invariabel), nicht als Kurs-Referenz.

## SELL-SEITE (Nachtrag ~01:55Z): SIN -> SOL Quotes (4 Größen)

| Sell-Größe (raw-SIN) | ≈SOL-Äquivalent | outAmount (SOL) | Spot-Erwartung | Degradation |
|---|---|---|---|---|
| 5,996e15 | 0,0057 SOL (1 Tranche) | 5,637e-3 | 5,700e-3 | −1,1 % |
| 1,052e16 | 0,01 SOL | 9,823e-3 | 1,000e-2 | −1,8 % |
| 2,735e16 | 0,026 SOL | 2,491e-2 | 2,600e-2 | −4,2 % |
| 5,260e16 | 0,05 SOL | 4,617e-2 | 5,000e-2 | −7,7 % |

Spot-Referenz: Buy-Seite invers (9,506e-19 SOL/raw-SIN). **Die SELL-SEITE
degradiert SPÄTER/STÄRKER als die BUY-SEITE** (0,026-SOL-Größe: Sell −4,2 %
vs Buy −3,9 %; ab 0,05 SOL: −7,7 %) — die SOL-Randreserve des
konzentrierten CLMM-Intervalls ist dünner als die SIN-Seite. Folgerung:
SELL-BACK-Verkäufe über 2 SOL-Tranchen sollten kleiner bleiben als
Buy-Tranchen derselben USD-Größe (Sell-Tranche ≈ 0,01-SOL-Äquivalent
= 1,052e16 raw-SIN ist der sanfte Bereich; 0,05 SOL = −7,7 %,
nur im Stopp-Modus akzeptabel).

## Konsequenzen (Deposit-Sizing + Ticket #6)

1. **CIO-Lane-Deposit (0,026–0,03 SOL)**: einmaliger Buy kostet ≈4–4,5 %
   mehr (Rate 1,011e18 statt 1,052e18). DCA-Plan (0,0057-SOL-Tranchen)
   bleibt günstiger (≈1 % Impact bei 0,0057) — bei Liquid-Pool
   beides akzeptabel, bei kleinem Pool DCA-Prinzip bestätigt.
2. **SELL-BACK (Ticket #6)**: Position 2,55 Trd SIN ≈ $19,14 = **≈23 %
   der gesamten Pool-Liquidity ($82,21)** — wir halten den Großteil der
   (konzentrierten) Liquidität. Sell-Backs müssen daher ebenfalls
   tranziert werden: ein SELL-Buy-Ertrag (0,0057-SOL-Äquivalent) ist
   unkritisch; größere Rückverkäufe würden unseren eigenen
   SIN-Bestand zum schlechteren Rate verkaufen (Impact auf uns selbst).
3. **Watch**: Kurve ist deterministisch vom Pool-Abstand — bei jedem
   Preispuls (Liquiditäts-Verschiebung) neu messen. Nächster Anlass:
   nächster Pool-Event (tick-Change).

— fable
