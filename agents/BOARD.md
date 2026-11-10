# Agenten-Koordination · SIN-Meme-Coin (Solana Mainnet)

Ordnung für alle Agenten (aktuell: `agent-1` [dieser Instanz]; es können
weitere Agenten folgen — jeder bekommt ID + Inbox in `agents/inbox/<id>/`).
Gemeinsames Ziel: der SIN-Meme-Coin (Solana Mainnet).

## Status (10.11.2026)

- **Pool LIVE:** Raydium-CLMM `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`
  (SIN/SOL). Details + Beweise: `token/docs/MORNING-HANDOVER-POOL.md`,
  `token/result/POOL-ADDRESS.txt` (lokal, gitignored).
- **Supply final:** Mint `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z`,
  mint/freeze-Autorität on-chain entzogen (09.11. 23:38 UTC, Journal
  `revoke-*`-Einträge).
- **Budget 50 EUR:** ~0,461 SOL (~35,5 EUR) verbraucht, im Kasten.

## Kern-Parameter (nicht ändern)

- Mint `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z` · 5 Dez. · Supply 1e14 fixed
- CLMM-Pool `4erqAhdH…` · A=WSOL / B=SIN · Ticks 179280…259280 · P0 `1065023265662834340099552`
- Provider (LP-Owner) `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`
  (Keys lokal, gitignored) — LP-Operationen nur über diesen Owner.

## Regeln (alle Agenten)

1. **Austausch hier:** eigene Einträge NUR append-only in
   `agents/LOG.md` (Zeitstempel UTC + ID + was + Ergebnis).
2. **Inbox/Outbox:** an einen anderen Agenten → `agents/inbox/<zieli>/`
   (eine Datei pro Nachricht). Eigene Notizen → `agents/outbox/<eigene-id>/`.
3. **Git:** Änderungen in getrennten Dateien/Ordnern. Vor Push:
   `git fetch origin main && git rebase origin/main`. Keine Force-Pushes.
   Keine fremden Dateien anfassen (`.github/headers.yml`, `assets/`,
   `sprint-board.html` gehören zu einem anderen Kontext — liegen
   bewusst untracked).
4. **Geheimhaltung:** KEINE Keys/Seed-Phrases ins Repo (wallets/result
   gitignored, nicht entsperren). Keine Kurs-/Profit-/Garantieaussagen
   auf öffentlichen Seiten (Inhaltsregeln AGENTS.md).
5. **Publik-Oberfläche:** dark-only Theme; NULLE GitHub-Erwähnungen auf
   öffentlichen Seiten.
6. **On-chain:** keine neuen Tx ohne explizite Freigabe (Budget +
   Vollmachten). Read-only-Inspektion jederzeit in Ordnung — nutzen
   dazu `agents/shared/verify-pool.ts` (keylos, sendet nichts).

## Aufgabenverteilung (Stand 10.11.2026)

| ID | Aufgabe | Status |
|---|---|---|
| agent-verify (Koordination) | **Aufgaben-Verwaltung + Agenten-Koordination** (Betreiber-Entscheidung 10.11., ~09:24 lokal): Tasks hier vergeben/verfolgen, 20s/1min-Timer-Wache, Inbox-Drain je Tick, PR-Status-Watch #26/#27/#28, finale Abnahme-Basis vor 20:00 (frische `verify-pool.ts`-Ausführung + LOG-Eintrag) | aktiv |
| agent-1 (dieser) | Read-only-Verifikation, LP-Nachsorge-Pläne (z. B. addLiquidity-Plan, keine Ausführung ohne Freigabe), `publish.yml`-Metadata-JSON-Entwurf als Team-Branch (kein main-Push, kein Merge) | aktiv |
| cio | addLiquidity-Fahrplan (read-only: exakte Ticks/Beträge/CU) + 20:00-Abnahme-Checkliste (Pool-Burn-&-Entscheidungsvorlage für den Betreiber) | aktiv (CIO-Abnahme Pool: OK, 08:45 UTC) |
| designer | Exchange-Beobachtung (Task 3, read-only, GeckoTerminal-Public-API), Kanal `agents/exchange-observations.md`; Checkpoints 11:00/15:00/18:30 UTC | aktiv (2. Checkpoint `b92344e`: LP $52.00, 24h noch leer) |

Aufgaben-Status: Metadaten-Mirror (IPFS/Arweave) + `config.metadata.uri` + `verify.ts` gegen neue URI → offen, Priorität **niedrig** (on-chain-URI = raw.githubusercontent, 200 belegt 08:00 UTC; Zwischenzustand zulässig).

## Team-Übersicht (remote-Branches, Stand 10.11.2026 ~08:45 UTC)

Andere Agenten arbeiten in eigenen `agenten/*`-Branches (alle auf
`9b58a58` gebaut). **Nicht an fremden Branches rütteln, nicht mergen —
Merge/Freigabe entscheidet der Betreiber.** Status-Eintrag dazu in LOG.md.

| Branch | Kopf | Inhalt (commit-Beschreibung) |
|---|---|---|
| `origin/agenten/meme-coin-wording` | `58de40e` | site+whitepaper: Wording-Update „Meme-Coin & Whitepaper“ statt Community-Token |
| `origin/agenten/mainnet-status-sync` | `7e25949` | token-doku: MAINNET-LAUNCH-BERICHT + Status-Sync (force-upgradedet) |
| `origin/agenten/designer-exchange-observation` | `656bd6e` | Exchange-Beobachtung (Task 3, read-only, GeckoTerminal), Kanal `agents/exchange-observations.md` |
| `origin/agenten/pubclean`, `qa-yaml`, `a11y-hitareas`, `logowhite`, `tabtitle`, `whitepaper-qa`, `ci` | — | ältere/laufende Agenten-Arbeiten (Website/Docs/CI) |
| `main` (dieser Kontext) | `c03bd66` | Pool-LIVE-Commits + `agents/`-Koordinationsordner |

Regel für neue Agenten: eigene Arbeit in `agenten/<name>`-Branch
oder als Datei-Getrenntes auf main; vor jedem Push
`git fetch origin && git rebase` (kein Force-Push auf main).

Offene Tasks (priorisiert, Zuweisungen agent-verify 10.11. ~09:30 lokal):

0. **LP-Burn & Earn — FREIGEGEBEN 08:29 UTC (Betreiber), Ausführung heute:**
   CLMM-Position-NFT permanent in das Raydium-Lock-Programm
   `LockrWmn6K5twhz3y9w1dQERbmgSaRkfnTeTKbpofwE` (Escrow,
   Fee-Key-NFT bleibt beim Provider `DNEBNjtW…`). 1 Tx,
   ~0,003 SOL, LP bleibt zu 100 % im Pool.
   *Zuständig: `agent-1` — Execution (lockPosition-V2-Script via
   Raydium-SDK, Simulation → Sendung, Zeitstempel in LOG).
   `agent-verify` — `verify-pool.ts` um Lock-Check erweitern +
   Post-Burn-Verifikation + finale Abnahme-Basis 18:45 UTC inkl.
   Lock-Status. `cio` — RugCheck-Rescore + Diff (67/5× danger) +
   20:00-Board-Punkt-Burn-Endstatus. `designer` — „LP locked“-
   Nachweis im Exchange-Kanal (11:00/15:00/18:30 UTC).*

1. **Metadaten-Mirror (IPFS/Arweave) — Priorität NIEDRIG, blockiert:**
   On-chain-URI = GitHub-raw (PDA-geprüft 08:00 UTC, HTTP 200) →
   Zwischenzustand zulässig, kein On-Chain-Action nötig.
   *Zuständig: `agent-1` — `publish.yml`-Metadata-JSON-Add
   (Copy-Liste + paths) als Team-Branch `agenten/metadata-pipeline`
   entwerfen + Testen, **kein main-Push, kein Merge** (Betreiber-
   Entscheidung bei 20:00-Abnahme). `agent-verify`: koordiniert/verfolgt.
   IPFS/Arweave-Upload selbst: erst nach Bereitstellung von
   Credentials/Keys durch den Betreiber (lokal nicht vorhanden).*
2. **LP-Nachsorge addLiquidity (Option, KEINE Ausführung ohne Freigabe):**
   SOL-Anker per `addLiquidity` ausbauen (Position-NFT + Ticks bestehen;
   Pool-PDA bleibt deterministisch unverändert). Dokumentiert in
   `token/config/token.json` `dex._liquidityNote`.
   *Zuständig: `cio` — exakter Fahrplan (Ticks, Beträge, CU-Bedarf)
   bis 18:00 UTC als `agents/outbox/cio/`-Note + Kurzfassung in
   BOARD. `agent-1`: Test-Script `add-liquidity-test.ts` (ohne
   Senden) gegen den 1-SOL-Basiswert anpassen.*
3. **GeckoTerminal/Exchange-Status:** Pool-Link `index.html` ist live
   (Commit `e0dd913`). Volumen-Beobachtung: read-only, Eintrag in LOG.md.
   *Zuständig: `designer` — Checkpoints 11:00 / 15:00 / 18:30 UTC
   (letzer vor der 19:00-UTC-Abnahme), Kanal
   `agents/exchange-observations.md`.
   Anomalie-Meldung (Kurs-/Liquiditäts-Sprung) sofort via Inbox.*
4. **20:00-Abnahmepaket (neu, 10.11.):** Entscheidungsvorlage für den
   Betreiber: (a) Burn-&-Earn-Vorlage + Budget-Status, (b) addLiquidity-
   Fahrplan, (c) PR-Merge-Empfehlung #26/#27/#28, (d) publish.yml-
   Metadata-Add (Task 1), (e) finale `verify-pool.ts`-Ausführung.
   *Zuständig: `cio` — 16:30 UTC Abnahme-Checkliste in `agents/BOARD.md`
   (Abschnitt „20:00-Abnahme") + Abnahme-Notiz in `agents/outbox/cio/`.
   `agent-verify`: 18:45 UTC finale `verify-pool.ts`-Ausführung +
   LOG-Eintrag als Abnahme-Basis. `agent-1`: PR-Merge-Empfehlung
   (Mergeable-/Gate-Status aller 3 PRs) in eigene Outbox.*
5. **Koordinations-Dienst (agent-verify, laufend):** 20s/1min-Timer,
   Inbox-Drain je Tick, PR-#26/#27/#28-Status-Watch, neue `origin/main`-
   Drift-Meldung → LOG. Ab 17:30 UTC keine neuen Board-Änderungen mehr
   außer Abnahmepaket-Aktualisierung (Stabilitätsfenster vor 19:00 UTC).

## Verifikation (keylos, read-only)

```bash
deno run --allow-read --allow-net --allow-env agents/shared/verify-pool.ts
```

(Prüft Tx-Statuses, Pool-Account, Mint-Supply/Vollmachten,
Provider-Saldo + ATA-Reste. Sendet nichts, braucht keine Keys.
Exit 0 = alle harten Checks ok. Hinweis: Public-RPC liefert für
historische Signaturen teils `null` — das Script wertet das als
informatives `[?]`, nicht als Fehler; ein `err != null` wäre ein harter
Fehler. Bei `deno`-Pfad-Problem: `/Users/haqmal/.deno/bin/deno`.)
