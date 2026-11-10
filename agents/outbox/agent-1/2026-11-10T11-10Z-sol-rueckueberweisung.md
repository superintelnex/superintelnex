# agent-1 → Operator/CIO · SOL-Rücküberweisung (Budget-Rückführung nach Trading)

Zeit: 2026-11-10 11:10 UTC
Freigabe: Operator „kannst du mir mein solona zurücküberweisen?" (11:05 UTC)
Ziel: `F9Sj9aUajhGDZzoDsX7ZkJ1cBWyWn3Z7xGZaeWniGxsD` (von Operator, 11:09 UTC)

## Transfer (on-chain finalisiert)
- Sig: `32CHH4oGSrNmoGotHExbDChBJEGvbfM9mdq2oun5gqPje9UbNk5YPmUXcuxDvYDjc5QumMvz3NZwaNNbrtwogWTQ`
- Slot 467698753 (11:10:37 UTC), finalized, err=null, CU 300, Fee 5.000 Lamports
- **0,006655161 SOL (6.655.161 Lamports)**: Provider `DNEBNj…` (7.551.041) → Ziel `F9Sj9a…` (70.109.559 → **76.764.720 Lamports = +0,006655161 SOL exakt**)

## Bewusste Entscheidung (Operator-Bestätigung erhalten)
- **SIN bleibt im Pool:** 2.284.861.759,79 SIN (2.284,86M) im
  Provider-ATA `FD1WzT…` — wird NICHT verkauft/abgezogen.
  Begründung: (a) dünn-flüssiger Pool, zwei Swaps in beide
  Richtungen ≈ 0,08 % Fees + ~0,8 % Impact, (b) sichtbares
  Bestehen-Beleg im Burn-&-Earn-Narr (24h-Vol ~16 USD),
  (c) Operator hat „Behalten" gewählt.

## Provider-Zustand (nach Transfer)
- `DNEBNj…`: **890.880 Lamports (= 0,000890880 SOL = Rent-Exempt-Boden)**
  + 2.284,86M SIN. Adresse bleibt weiter nutzbar (Team-Topups
  10:48 UTC kamen vom Haupt-Key `9kT5Ew…` — der Kanal ist offen).
- **Wichtig für das Team:** Eigene Transfer-Sweep-Reserve-Guards
  müssen den Rent-Boden respektieren (erster Versucht mit
  45.000-Lamports-Reserve wurde vom RPC-Simulator mit
  `InsufficientFundsForRent` sauber abgefangen — der Guard
  im neuen Transfer-Skript sitzt jetzt auf 890.880).

## Artefakte
- `token/scripts/transfer-sol-out.ts` (neu, mit Send-Gates
  `SIN_DRAIN_SEND=1` + `SIN_MAINNET_OK=1`, Ziel-Validierung,
  Projekt-Key-Sperre, Sweep mit Rent-Reserve)
- Journal `clmm.solTransferOut` + `TRANSFER-DETAILS-1794309037000.txt`
- LOG.md 11:10 UTC-Eintrag

## Knacken (Doku)
1. Skript stürzte nach erfolgreicher Sendung an doppelter
   Conf-Prüfung (`c.confirmSignature` — `sendTx()` bestaetigt
   intern bereits) → Fix in diesem Commit.
2. Journal + Details-Datei wurden manuell nachgetragen
   (selbes Muster wie beim Buy-#1-Exec).

## Impact auf 20:00-Abnahme (19:00 UTC)
- Checkliste P.1–5 bleiben unverändert (Exec-Proofs #1–#3 + Burn).
- Neuer Punkt: **Budget-Rückführung** — SOL-Rest an den
  Operator zurück, SIN-Beleg bleibt im Pool. Damit ist das
  €50-Budget vollständig abgewickelt: ~0,73 USD Trades,
  ~0,03 USD Gas/Fees, Rest ~0,0067 SOL zurückgeführt.
- Provider-Key `DNEBNj…` ist ab jetzt auf Rent-Boden + SIN-ATA:
  **kein weiterer Buy ohne Fresh-Topup vom Haupt-Key.**

Stand: ZURÜCKGABE ABGESCHLOSSEN.
