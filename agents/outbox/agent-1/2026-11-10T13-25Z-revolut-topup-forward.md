# agent-1 → Operator · Revolut-Schwelle: 0,009995 SOL weitergeleitet

Zeit: 2026-11-10 13:25 UTC
Freigabe: Operator „go" (13:17 UTC) + Topup „ich überweise dir auch"

## Ablauf (beide Tx on-chain belegt)
1. **Operator-Topup** `3D7eEkfpb4Yzm3U1YQa5aGSGRkiQMEPe…` (13:24:20 UTC):
   Provider `DNEBNj…` +10.000.000 Lamports exakt (890.880 → 10.890.880).
   Von der Revolut-Seite finanziert, kein Projekt-Budget.
2. **Forward** `9Ud1tfsnGFjotMktbE8GvM1z3s3ygwCutjnezkEqVfoHi6vBqTbMyqj7W1sdzqBbySQXobnf5Bc9Pg78LqdH9qC`
   (Slot 467736497, 13:25:18 UTC, finalized, err=null, CU 300, Fee 5.000):
   **9.995.000 Lamports (0,009995 SOL)** Provider → `F9Sj9aUajhGDZzoDsX7ZkJ1cBWyWn3Z7xGZaeWniGxsD`
   (76.764.720 → **86.759.720 Lamports = 0,086759720 SOL**).

## Warum 9.995.000 und nicht 10.000.000?
Exakte 10.000.000 + 5.000 Tx-Fee drückte den Provider auf 885.880 Lamports —
**unter** dem Rent-Exempt-Boden (890.880). Der Reserve-Guard im
`transfer-sol-out.ts` hat das in der RPC-Simulation sauber abgefangen.
9.995.000 lässt den Provider exakt auf dem Rent-Boden stehen (weiter
nutzbar) und überschreitet die Revolut-Schwelle trotzdem.

## Revolut-Folge
- Deposit-Adresse `F9Sj9a…D` steht jetzt bei **0,086759720 SOL** —
  deutlich über der ≈0,01-SOL-Mindesteinzahlung.
- Revolut bucht den **gesamten** Pending-Saldo (inkl. der 11:10-Überweisung
  von 0,006655 SOL und älteren Einlagen vom 07.11.) in einem
  zusammengefassten Schritt auf das Konto. Keine Zeitbegrenzung
  (verifiziert in der Revolut-Hilfe-Zentrale).

## Provider-Schlussstand
- `DNEBNj…`: exakt 890.880 Lamports (Rent-Boden) + 2.284,86M SIN im
  ATA `FD1WzT…` (unverändert). Ohne frischen Topup kein Trade mehr möglich.

## Artefakte
- `result/EXECUTED-TRANSACTIONS.jsonl` (Eintrag `clmm.solTransferOut`,
  automatisch vom Skript) + `result/TRANSFER-DETAILS-1794317119247.txt`
- LOG.md 13:25 UTC-Eintrag

Stand: VORWÄRTS-TRANSFER ABGESCHLOSSEN — Revolut-Schwelle überschritten.
