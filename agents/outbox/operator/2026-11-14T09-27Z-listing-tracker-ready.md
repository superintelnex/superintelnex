# LISTING-TRACKER-READY · wenn-dann-Checkliste · 2026-11-14 ~09:27 UTC
Zweck: NOTIZ für den Operator — definiert, welche Trigger ein Listing-/DEX-Tracker-Momentum-Post auslösen. NUR notiert, NICHT gepostet. Keine Social-Keys, Posting bleibt beim Operator.

## Aktueller Trigger-Status (09:27 UTC, keyless Beleg)
| Trigger | Zustand | Beleg |
|---|---|---|
| CoinGecko gelistet | NICHT erfüllt | GeckoTerminal `coingecko_coin_id: null`, CoinGecko-Lookup `{}` |
| Telegram-Community ≥ 200 | NICHT erfüllt (bekannt: <200) | BOARD/Night-Research — Operator-Beleg, keyless nicht prüfbar |
| Vol-Break > $500/24h | NICHT erfüllt | Vol-24h ≈ $119,8 (DexScreener 09:27 UTC) |
| Buy/Sell-Drift > ±15 % | NICHT erfüllt | 287/279 = +2,9 % Kauf-Drift (≈1:1, stabil organisch) |

Fazit: KEIN Trigger erfüllt → KEIN Momentum-Post. Erst posten, wenn mind. 1 Trigger unten zutrifft.

## Wenn-dann-Checkliste (Operator, bei nächstem Snapshot-Check)
1. **CoinGecko-Listing** → Momentum-Post „SIN offiziell auf CoinGecko" mit Listing-URL + frischer keyless-Snapshot-Basiszeile (Zyklus-Kanon: `Snapshot <UTC> · DexScreener · keyless API`).
2. **Telegram ≥ 200 Mitglieder** → Community-Meilenstein-Post, Faktenbasiert, KEINE Kurs-/Profitaussagen.
3. **Vol-Break > $500/24h** → „Volume-Break"-Post mit Vol-24h (USD-Raw) + Buy/Sell-Zahlen; nur wenn der Break organisch bleibt (Drift-Check, s. 4).
4. **Buy/Sell-Drift > ±15 %** → Transparenz-Post: Drift-Wert nennen + Kontext (LP 100 % im Raydium-Lock, keine Team-Tx); KEINE Kursprognose, KEINE Panik-/FOMO-Sprache.
5. **DEX-Tracker-Boost (z. B. DEXTools/GeckoTerminal-Top-Liste)** → Tracker-Post mit Screenshot-Fakt (keyless Beleg) + Basiszeile.
6. Jeder Trigger-Post: dark-only geprüfbar — KEINE Agenten-Namen, KEINE GitHub-Interna, KEINE Secrets, Preise NUR als USD-Raw oder rel. % (Dezimals-5-Falle).
