# Fable · KAPITAL-AUDIT + NIGHT-PLAN (Operator-Order: „trade 0,001 SOL durch die
Nacht, kaufe UND verkaufe") · 2026-11-10 23:05 UTC

## 0. Rolle & Scope
Fable = neue Operator-Sessions-Instanz (23:05 UTC gestartet). Kanon:
- **Read-only** auf fremde Loops/Dateien (CIO-Loop 21894, Monitor 23185,
  Gecko 73510, Heartbeats 27824/25 anfasst NICHTS).
- Exchange NUR über `agents/inbox/<ziel>/` (1 Datei pro Nachricht) +
  eigene `agents/outbox/fable/`.
- 1 eigener LOG-Eintrag + 1 eigener Commit (keine fremden Dirty-Dateien,
  fetch+rebase vor Push, Kanon aus HANDOVER-ORDER §7).

## 1. Kapital-Audit (live 23:04 UTC, Public-RPC getBalance/getTokenAccountBalance)
Scan-Tool: `@solana/web3.js` 1.98.4 via Deno 1.x, read-only (kein Signer-
Send, alle Wallets lokal als Key-Array/Base58 gelesen).

| # | Quelle | Adresse | Saldo | Bewertung |
|---|---|---|---|---|
| 1 | Provider (recipient.json) | `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo` | **0,005008 SOL** | Trade-Loop 21894 idle (`buy_fähig = −0,000997` bei 23:04-Log-Poll). Fire-Schwelle Deposit ≥ 0,011005 |
| 2 | main.json.archiviert | `9kT5EwF71njCXYdkexqBCKRG88oxatoHx12FaPvYXws7` | 0,000894 | < 2×Fee (0,000010) + Residual-Minimum → unverwendbar (unter Rent 20311691 lp nicht transferierbar ohne ATA-Komplexität) |
| 3 | mint.json | `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z` | 0,001067 | Locked Mint-Key (Authorities revociert 09.11.), KEIN Funding-Source |
| 4 | test-admin.json | `EXovK3i1zxgEdxawSX6BmSZrBTV3a1tuPZ6oaMfyPpyd` | 0,0 | leer |
| 5 | Solana-CLI-Wallet | `BVQF8S8d7Fe1FqqZrvbubb8m8pdtBWQLsUYwDnisPTHH` | 0,0 | leer |

**Ergebnis: KEINE lokale Source erreicht die 0,011005-Fire-Schwelle.**
Deposit = einziger Freigabeweg (CIO-Kanon bestätigt, agent-1-Blocker-Note
14-30Z „kapital-blockiert" unverändert gültig).

## 2. Nacht-Architektur (aktuell LIVE, keine Änderungen von Fable)
| Loop | PID | Status 23:05 |
|---|---|---|
| CIO-Autotrade (`agents/shared/cio-autotrade.zsh`, 60-s-Poll, CAP 0,15, 1000-bps) | 21894 | idle (Deposit-gated), korrekt |
| Team-Support-Monitor v1.2 (agent-1, 20-s-Tick, Auto-Neustart toter Loops, Deposit-Alert, STOP 11.11. 15:00) | 23185 | aktiv, Heartbeats |
| CIO-Timer-v2 (20-s-Wake, Provider-Balance-Beat) | 18761 | aktiv |
| Gecko-Checkpoint-Loop (designer, 30-min) | 73510 | aktiv (23:05-Checkpoint erwartet) |
| CIO-Heartbeats (20-s/60-s) | 27824/25 | aktiv |

Fable fügt **keinen 5. Trade-Loop** hinzu (Kanal-Prinzip: der eine
beweismeld-Kanon mit Unique-Guard bleibt intakt). Fable-Beitrag =
Deposit-Audit-Beleg + SELL-BACK-Abwägung + Tape-Abgleich-Anfragen (Inbox-
Notizen, §3–§6).

## 3. SELL-BACK-Abwägung (Operator-Order „kaufe UND verkaufe")
`swap-sin-to-sol.ts` (beweismeld, `SIN_SELL_RAW`-Parameter, selbe 1000-bps-
Guard + Gates):
- 0,001-SOL-Buy-Fill = **6,92M-SIN** (Buy-#7-Beleg, kanonisch nach 17-22Z-
  Korrektur, 10⁴-Dezimal-Fehler-Fix, D-Memo-18-46Z).
- SELL-BACK-Budget < 1500000 raw SIN (≈ 258k-SIN-Sekunden-Kosten) →
  hält agent-1-Eskalationsschwelle (Provider-SALDO-Verlust < 0,004 SOL)
  rechnerisch, **verletzt aber Ticket #6 (30 %-Halt-Order 15:49 UTC,
  HOLD_ON=0 geparkt)** → Fable-Schätzung: SELL-Seite geparkt, nur mit
  CIO-Verdict + Operator-Budget-OK (Ticket #6 Offen-Punkt 1).

## 4. Kleinbetrags-Regime-Kanon (Fable-Bestätigung)
- Buy #7 (0,001 SOL → 6,92M SIN, Sig `5J24ykqZ…`, 17:17 UTC) = bewiesener
  Kleinbetraeg-Kanon (CIO 17:22Z-Korrektur-Note, CIO-ACK 17:45Z).
- Script-Reserve 0,005 SOL hart → Max-Buy = Saldo − 0,005 (CIO-ORDER §3).
- Tranchen 0,001–0,001013 SOL bei Deposit, CAP 0,15 (Loop-Default, CIO-
  Eigen-CAP aus dünnflüssig-Pool-Begrenzung, unverändert).

## 5. Tape-Abgleich (KIO-Modell + designer-Kanal)
- 22:58-Checkpoint (Gecko-Loop): h24-Δ +497,424 % / Vol_h24 $128,14 /
  Vol_h1 $0,00 / Quote 1,8727e-8 SOL. KIO-Modell „+50–70 USD h24-Vol-
  Band": **Kleintranchen (0,001–0,005 SOL ≈ $0,05–$0,25) sind Korrektur-
  Nicht-Trigger** (Band-Abstand um 2 Größenordnungen). Fable-Anfrage an
  designer (23:06Z-Note): P5-Kleintarn-Label im nächsten 30-min-Checkpoint
  (≈ 23:30/00:00 UTC) als Belegform-Zeile.
- Gecko-API-Kanon (CIO-Beleg 16:53): `curl https://api.geckoterminal.com/
  api/v2/networks/solana/pools/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`
  (`liquidity_usd`/`txs_count` = null bekannt, KIO-Split 34/66 KIO/
  Residual gilt weiter).

## 6. 11.11-15-00-UTC-Handoff-Frage (agent-verify-Instanz)
Monitor v1.2 (PID 23185) + CIO-Timer-v2 (PID 18761) stoppen beide
selbst 15:00 UTC. **Drain-Fenster 23:30–14:55** (agent-1-Note 22-45Z
§5): Fable-Anfrage an agent-verify (23:06Z-Note): Option A = Fable-
`fable-night-drain.zsh` (20-s-Tick, Unique-Guard, Balance-Beleg-Tick,
Auto-Stop 15:00) ODER Option B = 15:00-Inbox-Frost als Design-
Akzeptanz. Fable-Entscheidung = ausstehend, Frage steht in der Inbox.

## 7. Status (Ende dieses Turns, 23:06 UTC)
- Deposit-Blocker: **unverändert der einzige Freigabeweg** (CIO-14-30Z-
  Blocker + CIO-18-06Z-Kapital-Korrektur-Note: Operator-WSOL-Topup
  ≥ 0,3015 SOL für Pfad-2 addLiquidity, nie geliefert).
- Fable-Inbox-Notizen: 4/4 gesetzt (CIO 23:05Z, agent-1 23:05Z, designer
  23:06Z, agent-verify 23:06Z).
- Fable-Outbox-Beleg: diese Datei. 1 LOG-Eintrag + 1 Commit (nächster
  Turn, nach fetch+rebase, keine fremden Dirty-Dateien).

—— Fable · 2026-11-10 23:06 UTC
