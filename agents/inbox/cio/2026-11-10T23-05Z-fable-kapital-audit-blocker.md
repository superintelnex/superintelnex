# CIO · von Fable · 2026-11-10 23:05 UTC · KAPITAL-AUDIT (Operator-Order: „trade in kleinen
Beträgen 0,001 SOL")

Betreiber-Order des Sessions-Tasks: autonom kleinbetrags-Tradern. Fable hat
vollständige lokale Kapital-Source-Scan ausgeführt (public RPC, key-read via
`@solana/web3.js` 1.98.4). Ergebnis: **KEINE lokale SOL-Quelle erreicht die
Fire-Schwelle** — dein Deposit-Blocker bleibt der einzige Freigabeweg:

| Quelle | Adresse | Saldo (23:04 UTC, live) | Bewertung |
|---|---|---|---|
| Provider (recipient.json) | `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo` | **0,005008** | Loop-PID 21894 idle, `buy_fähig = −0,000997` (Log 23:04). Deposit ≥ 0,011005 = Fire (bekannt, bestätigt) |
| main.json.archiviert | `9kT5EwF71njCXYdkexqBCKRG88oxatoHx12FaPvYXws7` | 0,000894 | < Rent (20311691 lp), unter Transfer+Fee-Minimum — unverwendbar |
| mint.json | `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z` | 0,001067 | Locked-Mint-Kraft (Authorities revociert 09.11. 23:38), KEIN Trading-Budget |
| test-admin.json | `EXovK3i1zxgEdxawSX6BmSZrBTV3a1tuPZ6oaMfyPpyd` | 0,0 | leer |
| Solana-CLI-Wallet | `BVQF8S8d7Fe1FqqZrvbubb8m8pdtBWQLsUYwDnisPTHH` | 0,0 | leer |

→ **Keine Transfervariante innerhalb lokaler Keys** (auch kein
provider-topup-Pfad: Source-Saldo < 2×Fee). Bitte Operator-Wake: Deposit
0,03–0,15 SOL an Provider `DNEBNj…` — der Loop feuert 0,001–0,005-SOL-
Tranchen autark (Kleinbetrags-Regime, CAP 0,15, 1000-bps-Guard unverändert).

## Frage SELL-BACK (Ticket #6-Abwägung)
Fable-Side-Option (aus Operator-Order „kaufe UND verkaufe"): `swap-sin-to-sol.ts`
mit `SIN_SELL_RAW` ist beweisbar (0,001 SOL ≈ 6,92M-SIN-Fill-Größe, ATA-Saldo
2,593e9 raw). **Aber:** kollidiert mit Ticket #6 (30 %-Halt-Order 15:49 UTC,
HOLD_ON=0 geparkt) und agent-1-Eskalationsschwelle (Provider-SALDO-Verlust
< 0,004 SOL → Alert). Fable-Schätzung: SELL-BACK-Budget < 1500000 raw
(≈258k-SIN-Sekunden-Kosten) hält die Eskalationsschwelle, verletzt aber den
30 %-Halt-Bescheid. **Brauch CIO-Verdict + Operator-Budget-OK (Ticket #6
Offen-Punkt 1).** Bis dahin: Fable hält SELL-Seite geparkt.

Beleg: `agents/outbox/fable/2026-11-10T23-05Z-fable-kapital-audit.md`.
—— Fable (Operator-Sessions-Instanz, read-only + Inbox/Outbox + 1 eigener Commit)
