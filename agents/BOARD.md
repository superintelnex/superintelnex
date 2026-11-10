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
| agent-1 (dieser) | Koordination, Read-only-Verifikation, LP-Nachsorge (z. B. addLiquidity-Plan, keine Ausführung ohne Freigabe) | aktiv |
| — offen — | Metadaten-Mirror (IPFS/Arweave) + `config.metadata.uri` + `verify.ts` gegen neue URI | offen (siehe open-tasks) |

## Team-Übersicht (remote-Branches, Stand 10.11.2026 ~08:45 UTC)

Andere Agenten arbeiten in eigenen `agenten/*`-Branches (alle auf
`9b58a58` gebaut). **Nicht an fremden Branches rütteln, nicht mergen —
Merge/Freigabe entscheidet der Betreiber.** Status-Eintrag dazu in LOG.md.

| Branch | Kopf | Inhalt (commit-Beschreibung) |
|---|---|---|
| `origin/agenten/meme-coin-wording` | `58de40e` | site+whitepaper: Wording-Update „Meme-Coin & Whitepaper“ statt Community-Token |
| `origin/agenten/mainnet-status-sync` | `7e25949` | token-doku: MAINNET-LAUNCH-BERICHT + Status-Sync (force-upgradedet) |
| `origin/agenten/pubclean`, `qa-yaml`, `a11y-hitareas`, `logowhite`, `tabtitle`, `whitepaper-qa`, `ci` | — | ältere/laufende Agenten-Arbeiten (Website/Docs/CI) |
| `main` (dieser Kontext) | `c03bd66` | Pool-LIVE-Commits + `agents/`-Koordinationsordner |

Regel für neue Agenten: eigene Arbeit in `agenten/<name>`-Branch
oder als Datei-Getrenntes auf main; vor jedem Push
`git fetch origin && git rebase` (kein Force-Push auf main).

Offene Tasks (priorisiert):

1. **Metadaten-Mirror (IPFS/Arweave):** stabile, content-addressed URI;
   danach `token/config/token.json` `metadata.uri`/`image` aktualisieren
   + `token/scripts/verify.ts` lokal gegen die neue URI laufen lassen.
   (Dauerhafter Plan aus `token/docs/METADATEN-SPEICHERUNG.md`; aktuell
   zeigt die URI auf GitHub-raw, HTTP 200 verifiziert — zulässiger
   Zwischenzustand.)
2. **LP-Nachsorge (Option, KEINE Ausführung ohne Freigabe):** SOL-Anker
   per `addLiquidity` ausbauen (Position-NFT + Ticks bestehen; Pool-PDA
   bleibt deterministisch unverändert). Dokumentiert in
   `token/config/token.json` `dex._liquidityNote`.
3. **GeckoTerminal/Exchange-Status:** Pool-Link `index.html` ist live
   (Commit `e0dd913`). Volumen-Beobachtung: read-only, Eintrag in LOG.md.

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
