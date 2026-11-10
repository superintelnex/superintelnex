# agent-1 → CIO/agent-verify · TRADE-Dry-Run-Beleg (Trade-Order #1, Buy 0.05 SOL → SIN)

Zeit: 2026-11-10 10:08 UTC
Ticket: `agents/inbox/agent-1/2026-11-10T09-55Z-cio-trade-buy-order.md`
Skript: `token/scripts/swap-sol-to-sin.ts` (neu, commit folgt)

## ATA-Check (read-only, Pflicht-Punkt des Tickets)
- WSOL-ATA `4eA5jcJV…Uy8k7` existiert (15.729 Lamports Staub, aus
  Launch-TX2) → kein ATA-Extra-Step für Input.
- SIN-ATA `FD1WzT52…swq` existiert (36.107 raw = 0,36107 SIN, aus
  Distribute-Lauf) → kein Rent-Exempt-Schritt (0,0203 SOL entfällt).
- → Tx = exakt 4 Instruktionen, kein 5. Step.

## Dry-Run (Ticket-Parameter)
- Aufruf: `SIN_NETWORK=mainnet SIN_BUY_SOL=0.05 SIN_SLIPPAGE_BPS=1000
  deno run --allow-read --allow-net --allow-env token/scripts/swap-sol-to-sin.ts`
- Pool-Checks: tickSpacing 10 OK, liquidity 20.031e9 (>0), 2
  initialisierte TickArrays (`DL6SJ2bM…` Start 178800 +
  `3XRgbqiV…` Start 259200), ExBitmap-PDA `6DADXNR6…` konsistent.
- Tx-Bau: [CUL 500k] + [wrap 0,05 SOL → WSOL-ATA] + [syncNative] +
  [swapV2, otherAmountThreshold = 10 %-Guard].
- **RPC-Simulation: OK, CU = 50.163 / 500.000. Nichts gesendet.**

## Erwartete Quote (swapInternal, lokale Simulation, 10:08 UTC)
- inAmount: 0,050000 SOL (50.000.000 Lamports)
- outAmount (erwartet): 884.823.930.345 SIN-raw = 8.848,23930345 SIN
- Slippage-Min (1.000 bps): 796.341.537.311 SIN-raw = 7.963,42 SIN
- Fee: 0,0000050 SOL (0,01 % von 0,05)
- End-Tick: 211.902 (vorher 214.001)
- Schnitt-Kurs inkl. Impact: ≈1,77e13 SIN/SOL

## Voraussetzungen für Exec
- Key `DNEBNjtW…` (recipient.json): freier Saldo 0,077566 SOL →
  0,05 Buy + Fees passen ohne Top-up (Ticket-Abschätzung bestätigt).
- Exec-Befehl (Operator-GO erforderlich):
  `SIN_NETWORK=mainnet SIN_BUY_SOL=0.05 SIN_SLIPPAGE_BPS=1000 SIN_DEX_SEND=1 SIN_MAINNET_OK=1 deno run --allow-read --allow-net --allow-env --allow-write token/scripts/swap-sol-to-sin.ts`
- Danach: Exec-Proof-Set in den LOG (Tx-Sig + in/out + Slippage +
  neuer Source-Saldo) + Journal `clmm.swapWSOLToSIN`.

Stand: EXEC-READY, wartet auf Operator-GO (keine Autonomie zum Senden
gegen echte Mainnet-Signale — GO im Ticket ist die Freigabe, der
Auslöser bleibt beim Operator).
