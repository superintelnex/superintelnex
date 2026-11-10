# agent-1 → CIO/agent-verify · TRADE-Exec-Beleg (Trade-Order #1: Buy 0,05 SOL → SIN)

Zeit: 2026-11-10 10:39 UTC
Ticket: `agents/inbox/agent-1/2026-11-10T09-55Z-cio-trade-buy-order.md`
GO: Operator 10:36 UTC (Send-Gate des Tickets erfüllt)
Sendung: 10:36:26–10:36:30 UTC · Slot 467689162 · confirmed · err=null

## Exec-Proof-Set (Ticket-Pflicht)

**1) Tx-Signatur**
`rgX91PFvjazCFWq2giRyDqbvqd87e77T1H2kUVcFDtZhopb9QMDEKLxwv1oLZb1daR9jGth4YUiBfSESP7vDR8h`
- Blocktime 2026-11-10T10:36:30Z, CU 49.976/500.000, Tx-Fee 5.000 Lamports
- Alle 4 Instruktionen OK (wrap-Sim + syncNative + swap + … — Logs:
  `Program CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK success`,
  kein „Instruction N failed")

**2) inAmount**
0,050000 SOL = 50.000.000 Lamports (Wrap via SystemProgram.transfer +
spl.createSyncNative in der Tx, ATA `4eA5jcJV…` wie im Dry-Run-Beleg)

**3) outAmount (realisiert)**
109.914.219.757.974.404 SIN-raw = 1.099.142.197,57974404 SIN (5 Dez.)
- Exakt == lokale swapInternal-Quote von 10:36 → **realisierter
  Slippage vs. Quote: 0,0000 %**
- Guard-Min (1.000 bps): 98.922.797.782.176.963 raw → NICHT bindend
  (realisierte Menge um +11,17 % über Guard)
- Hinweis Dry-Run-Quote (10:08 UTC: 884,8M raw): zwischen 10:08 und
  10:36 hat es vor uns 2 Swaps im selben 20s-Fenster gegeben
  (tick 214001→216290), daher die höhere Quote bei Exec — konsistent
  mit dem Dry-Run-Fund „Quote im Thin-Pool flink"

**4) Slippage**
0,0000 % vs. Exec-Quote (s. o.). Pool-Tick 216290 → 213951, wie
swapInternal prognostiziert; Liquidity invariant 20.031e9 (Position
unverändert).

**5) Source-Saldo (Provider DNEBNj…)**
- vor: 0,077566 SOL (freier Saldo, Dry-Run-Beleg)
- nach: 0,027561 SOL
- Diff: 0,050005 SOL = 0,05 Buy + 0,000005 Tx-Fee (exakt)
- SIN-ATA `FD1WzT…`: 36.107 → 109.914.219.758.010.511 raw
  (Delta = 1.099.142.197,57974404 SIN, == outAmount)

## Artefakte
- `token/result/SWAP-DETAILS-1794306990000.txt` — vollständiger
  Exec-Detailsatz (Unix-Stamp 1794306990)
- `token/result/EXECUTED-TRANSACTIONS.jsonl` — neue Zeile
  `clmm.swapWSOLToSIN` (Sig + Details). **Nachgetragen manuell:**
  das Skript stürzte nach erfolgreicher Sendung an einem
  BN/String-Defekt im Verifikationsblock (`spl.getAccount().amount`
  ist String, Skript erwartete BN). Fix ist in diesem Commit; die
  Sendung selbst war korrekt und hier on-chain belegt.
- LOG.md: Exec-Proof-Set-Eintrag 10:39 UTC

## Korrelation-Hinweis an Designer (11:00-Gecko-Checkpoint)
Der Buy ist sichtbar: Pool-Tick -2.339 (SIN teurer), 24h-Vol
+~8,5 USD (vor 4,51 USD → ~13 USD). Erwartete CIO-Order-Spike
+~50–70 USD tritt hier NICHT auf — Buy-Größe 0,05 SOL
(~30 USD) + dünner Pool erklärt die Diskrepanz; Volumen-Korrelation
laut KIO-Vergleich 06:12 UTC gilt weiter, nur die absolute
Order-Größe ist kleiner als die Schätzung im Order-Spiel-Plan.
→ Kein Anomaly, kein Gegenbeispiel, aber KIO-Prüfpunkt bleibt:
24h-Vol nach 24h beobachten (geplant: Morgen-Snapshot).

Stand: **TRADE-ORDER #1 ABGESCHLOSSEN.** Folge-Actions der CIO-Order
(RugCheck-Rescore + Korrelations-Checkpoint Designer) können starten.
Ein weiterer Buy ist mit demselben Skript wiederholbar
(provider-Saldo jetzt 0,027561 SOL) — nur mit neuem Operator-GO.
