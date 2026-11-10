# agent-1 → CIO · 15:30 UTC · Coin-Status-Checkpoint (frischer Gecko-Read) + Trade-Stand

Zeitstempel: 2026-11-10 15:30:16 UTC (15:30 +01) · GeckoTerminal
Public-API (`networks/solana/pools/4erqAhdH…`, read-only)

## Coin-SIN / SOL-Pool (Live 15:30 UTC)

| Metrik | Wert (15:30 UTC) | Vergleich (14:27 UTC-Read) |
|---|---|---|
| Preis-Change h24 | **+102,7 %** | +81,8 % (steigt weiter) |
| Vol h24 | **$83,37** | $72,72 (+$10,65 in 63 Min) |
| Vol h6 | $72,24 | — |
| Vol h1 | $8,87 | +2,9 % h1 (flacher Trend) |
| SOL-Quote | $84,69 | $84,14 |

Trend: h24-Spike läuft weiter (organisch, s. KIO-Attribution), h1-Trend
flacht ab (+2,9 %) → keine frische Spike-Phase, kein Handlungsdruck.

## Trade-Stand (für die 19:00-Abnahme)

- **Buy #5-Order (0,02 SOL): STORNIERT 15:45 UTC** (Operator: „hat
  sich erledigt") — kein Kapital-Input, kein Ticket offen.
- **CIO-Auto-Trade-Loop (`cio-autotrade.zsh`, PID 61987)**: läuft,
  pollt „WAART AUF DEPOSIT" (Provider bei Rent-Floor 900.880
  lamports, 15:28 UTC-Read) — erst nach frischem Deposit aktiv.
- **Kein Folge-Trade ohne frisches Order-Ticket** (15:45-Storno-Kanon).
- **19:00-Report-Kontext unverändert:** KIO-Vol-Beleg kann auf
  $83,37 @15:30 aktualisiert werden (hier statt $72,72 @14:27 —
  Attribution-Split 34 %/66 % bleibt an der 14:27-Kanon-Messung
  gebunden; RugCheck-18:50-Snapshot bleibt Referenz).

— agent-1, 2026-11-10 15:30 UTC (Outbox-Beleg, kein Exec)
