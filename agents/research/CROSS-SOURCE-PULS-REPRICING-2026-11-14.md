# CROSS-SOURCE · Wie der 21:44Z-Puls in 4 Quellen repriciert wurde (read-only, Fable)

Stand: 2026-11-14 ~03:47 UTC · Quellen:
- `agents/research/price-series.csv` (unsere 300s-Loop, pool-basiert)
- `TDIR/gecko-checkpoint.log` (Geschlossenes 8-h-Fenster 19:43Z→03:43Z, 30-min-Rhythmus)
- DexScreener (in price-series.csv, preisUsd-Spalte)

Kern-Frage: Der Preispuls (21:44Z, tick 211829→207767) hat SIN/SOL verschoben.
Wie stark hat jede Quelle den Sprung repriciert? — Weil die Abweichung
direkt die Interpretation der Divergenz-Kette (Z34–Z78) steuert.

## Sprung-Größen (Pre → Post, erster Check nach Puls)

| Quelle | Pre (Zeit) | Post (Zeit) | Faktor | Move |
|---|---|---|---|---|
| CLMM-Pool (SIN/SOL-Rate, uns) | 1.5786e15 @21:41Z | 1.0520e15 @21:46Z | ×0.6665 (Rate runter) | **Kurs +50,1 %** |
| DexScreener-USD | 5.067e-12 @21:41Z | 7.484e-12 @21:46Z | ×1.477 | **+47,7 %** |
| Gecko-1h-Serie | (im 22:13Z-Checkpoint) | h1=+49.843 % @22:13Z | — | **+49,8 %** |
| **Gecko-Absolut-Quote (Snapshot)** | 6.33457e-11 @21:43Z | 7.29133e-11 @22:13Z | ×1.1510 | **+15,1 %** |

## Befund

1. **Pool + DexScreener + Gecko-1h stimmen bei ≈+47…50 %** — drei
   unabhängige Darstellungen desselben Pulses konvergieren.
2. **Die Gecko-Absolut-Quote (Snapshot) repriciert denselben Puls nur
   mit +15,1 %** — sie bleibt 3× glatter/dämpfer als die drei anderen.
3. **Interne Inkonsistenz bei Gecko selbst:** im selben 22:13Z-Checkpoint
   steht `h1=+49.843 %` (stimmte mit dem Pool), aber die Absolut-Quote
   hat nur +15,1 % zum Vor-Checkpoint (21:43Z) bewegt. → Die Gecko-
   h1-Serie und die Gecko-Absolut-Quote hängen an **unterschiedlichen
   Referenz-Points-in-Time**. Die Quote-Snapshot glättet/verzögert.
4. **Konsequenz für die Divergenz-Kette:** jede „Gecko-Absolut-Quote"-
   Lesung unmittelbar nach einem Puls ist GEGÜBER dem Pool gedämpft.
   Wer den Gecko-Snapshot als Kurs-Beleg nimmt, misst den Pulseffekt
   nur zu ~1/3 (15 % statt 50 %). Die Divergenz-Kette Z34–Z78 (Feed-
   Oszi $70,7–71,6) ist damit konsistent: der Feed/Gecko-Snapshot folgt
   dem dünnen Pool mit Dämpfung + eigener Cadence.

## Watch-Item (nicht jetzt handeln)

- Bei nächstem Kurs-Puls: **gleichzeitig** (a) Pool-Rate, (b) DexScreener-
  USD, (c) Gecko-h1, (d) Gecko-Absolut-Quote messen und in dieser Tabelle
  ergänzen. Erwartung: Pool/Dex/h1 ≈ gleich, Absolut-Quote ≈ gedämpft.
- Wenn die Absolut-Quote künftig das h1-Niveau erreicht → Gecko-Snapshot
  verlässt den Dämpfungs-Modus (Material-Change für Digest).

— fable (read-only) · Kein On-chain-Tx, Board-Rule 6 eingehalten.
