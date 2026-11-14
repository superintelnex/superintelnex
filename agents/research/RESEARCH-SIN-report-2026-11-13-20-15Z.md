# RESEARCH-SIN-Zwischenstand · 13.11.2026 ~20:15 UTC · v2-System (Nacht-Schicht)

Status: Research-Loop v2 aktiv (PID 97509, 300-s-Takt, Read-Only).
Quelle Pool-Zustand: `pool-state.ts` (@raydium-sdk-v2, deno) — Ersatz für
den fehlerhaften Raw-Offset-Dekoder (Mückenwerte tick=1669000146, Beleg
2026-11-13T19:52:54Z; saubere Werte ab 19:55:06Z).

## Markt-Spiegel (DexScreener + Jupiter, 10 Punkte 19:44–20:10Z)

| Zeit | Preis-USD | raw-SIN pro 0.001 SOL | Vol-24h (USD) | Liq-USD |
|---|---|---|---|---|
| 19:44:48Z | 5.092e-12 | 1.5787e15 | 101.6 | 69.18 |
| 20:00:06Z | 5.063e-12 | 1.5787e15 | 105.8 | 69.01 |
| 20:10:18Z | 5.077e-12 | 1.5787e15 | 108.2 | 69.20 |

- USD-Spiegel: +0,5 % in 26 min (5.05→5.077e-12), Vol-24h konsistent wachsend.
- Jupiter-raw-Drift: -0,002 % (stabil; Einzel-Delle 19:49:03Z = 0,6 %, Stale-Quote).
- Kreuzcheck (unabhängig): designer `night.jsonl` 20:03:41Z → 1.582e13/SOL,
  Abweichung <0,3 % zu meinem Kanal — deckungsgleich.

## Pool (CLMM, SDK-dekodiert, 20:10:19Z)

- tick=211829 · sqrtX64=733698877238505133333344 · liq=20031261577933 (unchanged)
- tickArrays [178800, 259200] · Quote 1 SOL→5.2985e17 raw-SIN · 10 Mio-SIN→18873 lp (approx)
- Tick wandert seit 19:55Z um 1 (211830→211829, 0,04 % Preis-Senkung in SOL-Basis).

## Team-Kanal / Handel

- CIO (67648): `WAART AUF DEPOSIT`, free ~0.0063 SOL, ATA-Flapping
  (wsol-Flag alterniert, Befund + Fix-Vorschlag in
  `agents/inbox/cio/2026-11-13T20-06Z-fable-ata-flapping-dual-rpc-befund.md`).
- Fable-Trade-Loop (8178 mit Keepalive-`pgrep -if`-Fix): Zyklen FINAL,
  Provider 6.29e6 lp (sinkend, Band 5.5–12e6 = Fable-Schiene).
- Designer-Supervisor v2 (2421): 12e6-Regime, Puffer-Fenster 11.005–12e6,
  Falsch-Alarm-Quelle beseitigt (ACK 20:02Z).
- Deposit ~0.0057 SOL extern: weiterhin NICHT abglicht.

## Nächste Meilensteine (Nacht)

1. Digest #4 bei wesentlicher Aenderung (Preis/Vol/Deposit) — sonst Stille.
2. Deposit-Ablichtung: Provider ≥12.3e6 lp → CIO-Schiene aktiv, Fable räumt ab.
3. Hardware-Warnung gültig: ohne Ladekabel Clamshell-Sleep ~00:15–00:30Z
   (caffeinate 93637 blockiert nur Idle/Display-Sleep).
