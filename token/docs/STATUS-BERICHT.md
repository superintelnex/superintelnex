# Status-Bericht: SuperIntelNex-Token (SPL, Solana)

**Update 10.11.2026:** Der Mainnet-Start ist erfolgt — Mint,
vierstufige Emission und der Raydium-CLMM-Pool (SIN/WSOL,
`4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`) sind LIVE und
finalisiert, beide Vollmachten entzogen, Budget 50 EUR eingehalten
(Summe ~0,461 SOL ≈ 35,5 EUR). Details: `MORNING-HANDOVER-POOL.md`
(Erfolgsbericht) + `MAINNET-LAUNCH-RUNBOOK.md` (Stand 04/04).

Stand: 09.11.2026 (Mainnet-Launch + Revoke-Finalisierung 09./10.11.2026
Spätabend UTC) · Repo-Hauptzweig `main` (Token-Skripte + Doku unter
`token/` im Repo).

Der Bericht trennt strikt fünf Kategorien:

1. **Vorbereiteter Code** — steht, ist nachvollziehbar, aber noch nicht
   auf Devnet ausgeführt.
2. **Tatsächlich ausgeführte Tests** — mit Zeitstempeln und Ergebnissen.
3. **Tatsächlich auf Devnet erstellter Token** — **Ja**
   (DEVNET-TESTTOKEN, 09.11.2026; Details in Sektion 3 +
   `DEVNET-TESTTOKEN-BERICHT.md`).
4. **Tatsächlich auf Mainnet gelaunchter Token** — **Ja**
   (MAINNET-LAUNCH, 09.11.2026 22:07–23:38 UTC; Mint `A4WSPbHP…`,
   Distribution 81/10/5/4 zu 100 % emittiert, beide Vollmachten
   unwiderruflich entzogen und on-chain finalized;
   Details: `MAINNET-LAUNCH-BERICHT.md`).
5. **Noch offene Arbeiten** — DEX-Pool-Launch, Vesting,
   Rechts-/Audit-Themen.

---

## 1) Vorbereiteter Code (lauffähig, Devnet noch nicht ausgeführt)

| Baustein | Pfad | Status |
|---|---|---|
| Zentrale Konfiguration | `token/config/token.json` | vorhanden, Parameter **BESTÄTIGT** (100 Billion @ 5 Dez., Commit `8c57777`) |
| Mint + Metadaten (1 Tx) | `token/scripts/create-mint.ts` | fertig, getestet auf LOCALNET |
| Emission Gesamtmenge | `token/scripts/mint-initial.ts` | fertig, getestet auf LOCALNET |
| Checked-Transfer 1.234 | `token/scripts/transfer-test.ts` | fertig, getestet auf LOCALNET |
| On-Chain-Abgleich | `token/scripts/verify.ts` | fertig, prüft Decimals/Supply/Vollmachten/Metadaten |
| Vollmachten entziehen | `token/scripts/revoke-authorities.ts` | fertig, **einweg** — nur nach Bestätigung |
| Devnet-Prüfung ohne Tx | `token/scripts/devnet-prefund.ts` | fertig (neu in diesem Lauf) |
| Off-Chain-Metadaten | `token/metadata/superintelnex-token.json` + `assets/` (Logo 512/800 px) | URI korrigiert auf `/token/...` |
| Doku | `token/docs/` (AUTHORITIES, DEVNET-RUNBOOK, METADATEN-SPEICHERUNG, MAINNET-CHECKLISTE, FRAGENLISTE) | vollständig |

Technik: **Standard-SPL-Token** (Token-Programm `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
+ **Metaplex Token-Metadata v2** (`metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`).
Kein eigenes Programm, keine Token-2022-Extensionen, keine Fees/Hooks/
Blacklist-Logik. Laufzeit: Deno (npm-Pakete `@solana/web3.js@1.98.4`,
`@solana/spl-token@0.4.15`, `@metaplex-foundation/mpl-token-metadata@2.5.2`).

**Keine Simulations-Oberfläche:** Die Skripte bauen echte
`Transaction`-Objekte, signieren mit Test-KeyPairs und senden per
`sendRawTransaction` an einen echten RPC-Endpunkt. Lokal wurde das gegen
einen echten `solana-test-validator` (Agave 4.4.1, mit Devnet-Clone des
Metaplex-Programms) verifiziert.

## 2) Tatsächlich ausgeführte Tests (Dieser Lauf, 09.11.2026)

Umgebung: `solana-test-validator` (solana-core 4.4.1) auf `127.0.0.1:8011`,
Metaplex-TM-Program-Clone vorhanden (geprüft via `getAccountInfo`),
Deno 2.9.8.

| Test | Ergebnis | Beleg |
|---|---|---|
| `token/tests/config.test.ts` (offline) | **4/4 ok** | Pflichtfelder, Verteilung=100 %, authorities-Boolean, sellerFeeBasisPoints=0 + **u64-Supply-Guard** (neu: fängt totalSupply × 10^decimals > u64max ab — bei 100 Billion @ 9 Dez. würde genau hier der Fehler liegen) |
| `token/tests/integration.test.ts` (LOCALNET-TEST) | **ok** | Test-Mint (2 Dez.) `4eW2U83N...`, Emission 1234.57, Checked-Transfer 0.50, Decimals-/Supply-/Saldo-Gegenprobe + On-Chain-Metadaten-Name — alles bestanden |
| `token/tests/authorities.test.ts` (LOCALNET-TEST, neu) | **ok** | Test-Mint `64w5Lmyc...`: Freeze-Vollmacht entzogen (sig `37fVxcvH...`) → Freeze-Instruktion On-Chain **abgelehnt**; Mint-Vollmacht entzogen (sig `2TLSdugC...`) → MintTo **abgelehnt**; Supply fix bei 1000.00, beide Vollmachten = `none` |
| `deno test --allow-all token/tests/` (Gesamt) | **6 passed / 0 failed** | Einzelaufruf, 09.11.2026 (inkl. u64-Guard und decimals-awareem Transfer-Test) |
| `token/scripts/devnet-prefund.ts` (devnet-Modus) | **funktioniert** | zeigt Test-Wallet `FoJ8tLty...`, Saldo 0.000000 SOL, die 3 Finanzierungswege; keine Transaktion gesendet |

**Früherer LOCALNET-Testlauf (06:21–06:28, `token/result/EXECUTED-TRANSACTIONS.jsonl`):**
Mint `4vzB8a7AonPzro9NNjbpMZDghh6ZSU8Cbe8GXUDPW6Te` (LOCALNET-TEST!),
Emission 1.000.000.000, Transfer 1.234, beide Vollmachten entzogen,
Admin-Wallet archiviert. Das ist ein **lokaler Validierungslauf, kein
Devnet-Ergebnis** — er taucht in keinem öffentlichen Index auf.

## 3) Tatsächlich auf Devnet erstellter Token?

**JA — am 09.11.2026 wurde der SuperIntelNex-Testtoken (SIN) auf Solana
Devnet erstellt.** (Zuvor in dieser Sitzung: Nein; die Blockade wurde
überbrückt, nachdem der Betreiber per GitHub-Faucet ~0,5 Test-SOL an die
einweg-Admin-Test-Wallet überwiesen hatte.)

- Mint: `CyEcfZw2FogCrehQqkWxksKtsndNwrtKHQqDfPdHCLLf`
- Supply: 10^19 smallest units = 100.000.000.000.000 SIN (10^14 @ 5 Dez.)
- 1.000.000 SIN an die einweg-Empfänger-Test-Wallet
  (`2hsXa6fvkns9869eyvorvieEQ2i41M2WwJrp1y2GMpxe`, ATA
  `BPen7C9U3wwkJjsQHURvC6qWDjzTNJSg7YM55pxG5bMJ`) übertragen.
- Mint- und Freeze-Vollmacht **unwiderruflich entzogen** — im Explorer:
  `mintAuthority = (none)`, `freezeAuthority = (none)`.
- Vollständiges Signatur-Protokoll + `?cluster=devnet`-Links:
  `token/docs/DEVNET-TESTTOKEN-BERICHT.md` (Kopie; lokale Quelle in
  `token/result/`, gitignoriert). Alle Einträge als **DEVNET-TESTTOKEN**
  gekennzeichnet — kein Mainnet-Ergebnis.

**Wichtige Korrektur aus diesem Lauf:** Die Metadaten-URI zeigte auf
`superintelnex.com/...`, aber die Custom-Domain lag in der
GitHub-„Verification of Contact Information"-Phase (nicht aktiv) und
`token/` existierte erst auf der Feature-Branche (nicht `main`) → die URI
war tot. Vor dem (unwiderruflichen) Devnet-Mint umgestellt auf die
stabile Raw-URL der Feature-Branche (HTTP 200 geprüft, Commit `22bddbd`)
— diese URI ist jetzt On-Chain fixiert (`isMutable: false`).

**Blockade-Protokoll (überwunden, 09.11.2026):** Zuvor waren alle
offentlichen Wege tot (RPC-Faucet HTTP 410, Ankr/publicnode 404/403,
QuickNode-Faucet verlangt Mainnet-Saldo, Solana-Faucet: frischer
GitHub-Account abgewiesen). Gelöst über `faucet.solana.com` mit einem
älteren GitHub-Konto des Betreibers: 0,5 Test-SOL per Airdrop an die
einweg-Admin-Test-Wallet (Signatur im Bericht oben). Die drei Wege
A/B/C aus `DEVNET-RUNBOOK.md` gelten weiterhin für künftige
Finanzierungen — für diesen Lauf war nur Weg A nötig.

**Sicherheitslage des Laufs:** Signiert wurde ausschließlich mit den
einweg-Test-Wallets; jede Transaktion ist im Explorer nachvollziehbar
(`?cluster=devnet`). Die Seed Phrase / der private Schlüssel des
Betreibers wurden **nie** abgefragt. Nach dem Lauf ist die
Admin-Test-Wallet lokal gesperrt (`main.json` archiviert) —
Minten/Freezen ist On-Chain unmöglich (Vollmachten entzogen).

**Zusatz — MAINNET-LAUNCH (09.11.2026, 22:07–23:38 UTC):** Das
offizielle Launch-Trajectum wurde am selben Abend auf mainnet-beta
ausgeführt: Mint `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z`
(10^19 smallest units @ 5 Dez.), vierstufige Emission 81/10/5/4 auf die
Emissions-ATAs (Distribution zu 100 % abgeschlossen, Admin-ATA = 0),
Anschließend Entzug beider Vollmachten (Mint + Freeze), beide
`SetAuthority`-Transaktionen **finalized** (Slots 467504907 /
467504911). On-Chain-Endzustand: `mintAuthority = (none)`,
`freezeAuthority = (none)`, Metadaten-URI live auf dem `main`-Branch
(HTTP 200, `isMutable: false` → dauerhaft fixiert). Signatur-Protokoll
mit Explorer-Links: `token/docs/MAINNET-LAUNCH-BERICHT.md`
(Kopie; lokale Quelle `token/result/EXECUTED-TRANSACTIONS.jsonl`,
gitignoriert). Alle Einträge als **MAINNET-LAUNCH** gelabelt.

**Wichtig (Pubkey-Kopplung):** Die Test-Wallet-Dateien liegen lokal
(gitignoriert) und sind je Projektordner eigenständig. `devnet-prefund.ts`
immer in dem Ordner ausführen, in dem der Lauf stattfinden soll, und
**den dort angezeigten Pubkey** finanzieren. Der genannte
`FoJ8tLty...` galt für diesen Worktree.

## 4) Noch offene Arbeiten

### A) Ihre Entscheidungen (kurz) — Details: `token/docs/FRAGENLISTE.md`

| # | Frage | Bestätigter Wert (09.11.2026) |
|---|---|---|
| Q1 | Kürzel | `SIN` |
| Q2 | Gesamtmenge | **100.000.000.000.000** (100 Billion = 10^14, deutsche Zählung) — vorgegeben |
| Q3 | Dezimalstellen | **5** (technisch gebunden an Q2: u64-Supply-Obergrenze erlaubt 10^14 maximal mit 5 Dez.) |
| Q4 | Ausgabe-Policy | **feste Menge, keine weiteren Emissionen** (FIXED-NO-FURTHER-ISSUANCE) |
| Q5 | Verteilung | **81 % Community / 10 % Liquidität / 5 % Gründer / 4 % Marketing** (Bestätigung 09.11.2026, Commit `c5d48e1`; Multi-Adress-Emission auf Mainnet am 09.11.2026 22:09 UTC ausgeführt — die frühere Planung 55/20/15/10 ist überholt) |
| Q6 | Vollmachten | **beide nach Emission unwiderruflich entziehen** (Mint: sonst unbegrenzte Ausweitung der Supply; Freeze: einzige Sperrmöglichkeit im SPL — Beibehaltung = dauerhafte Macht über fremde Konten; Entzug = kein Rekorrigieren, kein Thawen mehr). **Auf Mainnet am 09.11.2026 23:38 UTC ausgeführt + finalized** — On-Chain sichtbar: `mintAuthority = (none)`, `freezeAuthority = (none)` (Signaturen in `MAINNET-LAUNCH-BERICHT.md`) |
| Q7 | URI-Speicher | Devnet: GitHub Pages (provisorisch); Mainnet: **Raw-URL des `main`-Branch** (`https://raw.githubusercontent.com/superintelnex/superintelnex/main/token/metadata/superintelnex-token.json`, Commit `08e71fc`) — on-chain fixiert per `isMutable: false`, PDA `3UVHFDS3WXofjanwA3U5ND255YfkALnvQ5wyyc5qrWPY`, live erreichbar (HTTP 200, Image ebenfalls 200). IPFS/Arweave-Pinning bleibt Option für eine spätere Migration (aktuell nicht nötig, da URI unveränderlich und stabil) |
| Q8 | Devnet-Lauf | **abgeschlossen am 09.11.2026** — Devnet-Mint, Emission, Transfer-Test, 1 Mio. SIN an die Empfänger-Test-Wallet, Vollmachten entzogen (Bericht: `DEVNET-TESTTOKEN-BERICHT.md`) |
| Q9 | Mainnet-Launch | **abgeschlossen am 09.11.2026 22:07–23:38 UTC** — Mint `A4WSPbHP…` (10^19 @ 5 Dez.), vierstufige Emission 81/10/5/4 (100 % verteilt), beide Vollmachten entzogen + finalized (Bericht: `MAINNET-LAUNCH-BERICHT.md`) |

### B) Technische Restarbeiten

Erledigt (Devnet, 09.11.2026):

- Devnet-Erstellung der 5 Schritte (Mint → Emission → Transfer → Verify →
  Vollmachten entziehen) — abgeschlossen, ~0,5 Test-SOL, keine echten Kosten.
- Ergebnis-Protokoll mit Mint, Signaturen und `?cluster=devnet`-Links als
  **DEVNET-TESTTOKEN** — `token/docs/DEVNET-TESTTOKEN-BERICHT.md`
  (Kopie; lokale Quelle `token/result/`).

Für Mainnet — erledigt am 09.11.2026 (22:07–23:38 UTC, siehe
`MAINNET-LAUNCH-BERICHT.md`):

1. **Mainnet-Mint + Metadaten** (`create-mint.ts`, Sig `2J5z9P4A…`):
   Mint `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z`,
   `isMutable: false`, URI = Raw-URL des `main`-Branch (live).
2. **Vierstufige Emission 81/10/5/4** (`distribute.ts`, 4 Txs,
   `75NFP9Cn…` / `5KqN3KeF…` / `CZgWrgG9…` / `2w64JnQJ…`):
   Distribution zu 100 % abgeschlossen, Admin-ATA = 0.
3. **Vollmachten entzogen** (`revoke-authorities.ts`, 2 Txs,
   `2w7dM443…` / `2qn9jSPU…`, beide finalized):
   `mintAuthority = (none)`, `freezeAuthority = (none)` —
   FIXED-NO-FURTHER-ISSUANCE on-chain erfüllt.

Offene Restarbeiten (nach dem Launch):

1. **DEX-Pool (Raydium CLMM, SIN/WSOL): LIVE (10.11.2026)** —
   Pool `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`,
   TX1 `NNkrfq…` + TX2 `3AU3rf…` finalisiert, Liquidität
   0,3 SOL; Budget 50 EUR eingehalten (Summe ~0,461 SOL
   ≈ 35,5 EUR, Provider-Top-up 0,0158 SOL). Details:
   `MORNING-HANDOVER-POOL.md` (Erfolgsbericht) +
   `MAINNET-LAUNCH-RUNBOOK.md` (Stand 04/04).
2. **Vesting (founder 5 % / marketing 4 %)** als Folgeschritt nach
   der Emission — im Skript bewusst NICHT enthalten.
3. **Rechtslage/Audit** für den Startmarkt + Impressum/Datenschutz
   final (siehe `MAINNET-CHECKLISTE.md`, Abschnitt 4).
4. Neue Devnet-Läufe (Tests, Distributionssimulation) brauchen eine
   **frische** einweg-Admin-Wallet (`main.json` ist lokal gesperrt;
   Weg A/B/C aus `DEVNET-RUNBOOK.md` erneut finanzieren).

### C) Post-Launch-Übergang (Mainnet live, 09.11.2026) — kurz

- **Launch abgeschlossen:** Mint, Emission 81/10/5/4, beide
  Vollmachten entzogen + finalized (Details:
  `MAINNET-LAUNCH-BERICHT.md`). Supply ist final fix — es gibt
  keine weitere Emission mehr.
- **DEX-Pool (Raydium CLMM, SIN/WSOL): LIVE (10.11.2026)** —
  Pool `4erqAhdH…` (TX1+TX2 finalisiert, Liquidität
  0,3 SOL, Budget 50 EUR eingehalten; siehe
  `MORNING-HANDOVER-POOL.md` Erfolgsbericht).
- **Vesting (founder 5 % / marketing 4 %):** als Folgeschritt nach
  Emission (bewusst nicht im Emissions-Skript enthalten).
- Prüfung: externe Audits (Emissions-/Distributions-Logik), Rechtslage
  für Startmarkt, Impressum/Datenschutz final.
- Keine Zusagen: kein Kurs, kein Gewinn, keine Rechtsfreigabe, keine
  automatische Börsenaufnahme; Listings erfordern separate Anbieter-
  Prozesse.

---

## Sicherheitslage (Status)

- **Mainnet-Emissions-Key (`token/wallets/main.json`, gitignoriert)
  wurde nach dem Vollmacht-Entzug lokal archiviert**
  (`main.json.archiviert`) — lokal reversibel, on-chain irreversibel
  final: `mintAuthority = (none)`, `freezeAuthority = (none)`,
  finalized (Slots 467504907 / 467504911).
- Devnet-Test-Admin-Wallet `main` (`FoJ8tLty...`, Devnet-Lauf) ist
  ebenfalls lokal archiviert (`main.json.archiviert`, Devnet-Variante
  unter `token/wallets/devnet-archiv/`).
- Keine Schlüssel in Repo, Logs oder Frontend; `result/` und
  `wallets/` sind gitignoriert.
- Keine Seed-Phrase-/Key-Anfrage; Finanzierungswege A/B/C oben sind
  optional und nur für wertloses Test-SOL.
