# Mainnet-Checkliste (token/)

Stand: 10.11.2026 · **Mainnet-Start erfolgt** — Mint, Emission und
Raydium-CLMM-Pool sind LIVE (siehe `MAINNET-LAUNCH-RUNBOOK.md` +
`MORNING-HANDOVER-POOL.md`). Diese Liste bleibt die Vorlage für die
Phase „öffentlicher Launch"; die erledigten Posten sind mit `[x]`
markiert, die restlichen sind offene Arbeit.

## 1. Entscheidungen (Betreiber)

- [x] **Ticker/Kürzel** festgelegt: `SIN` (Devnet-Bestätigung
      09.11.2026; der Mainnet-Lauf 10.11.2026 bestätigt das
      Kürzel — Mint on-chain `A4WSPb…`).
- [x] **Gesamtmenge** fest: `100.000.000.000.000` = 10^14
      (on-chain emittiert am 10.11.2026; frühere Vorschlagszahl
      1.000.000.000 ist überholt).
- [x] **Dezimalstellen** fest: `5` (on-chain fix per Mint; technisch
      gebunden an die Supply `10^14`, siehe
      `config.token.decimalsNote`; frühere Vorschlagszahl 9 gilt
      nicht).
- [x] **Verteilung** fest: 81/10/5/4 — community/liquidity/founder/
      marketing (on-chain ausgeführt, Signaturen in
      `result/DISTRIBUTION.txt`).
- [x] **Admin-Vollmachten: beide entzogen** (10.11.2026,
      Journal `revoke-mint-authority` + `revoke-freeze-authority`):
      `mintAuthority = (none)`, `freezeAuthority = (none)` —
      Supply final (siehe `AUTHORITIES.md`).
- [ ] **Metadaten-URI**: aktuell GitHub-raw der main-Branche
      (HTTP 200 verifiziert); die Entscheidung GitHub Pages
      (provisorisch) gegen IPFS/Arweave (dauerhaft) bleibt offen
      für den post-Launch-Plan (siehe `METADATEN-SPEICHERUNG.md`).

## 2. Technische Vorbereitungen

- [x] **Budget-Rahmen: 50 EUR — live eingehalten** (SOL-Preis
      77 EUR/SOL, Stand 09.11.2026 = ca. 0,65 SOL). Die gesamte
      On-Chain-Kostenkette ist am 10.11.2026 durchgelaufen und blieb
      im Rahmen (Summe ca. 0,461 SOL ≈ 35,5 EUR, Details in
      `MORNING-HANDOVER-POOL.md` §4):
      - On-Chain-Launch (Mint + Metadaten + 4x ATA + 4x Emissions-
        Transaktionen): ca. **0,030 SOL** (~2,30 EUR) — erledigt
      - Raydium-CLMM-Pool: **0,415457 SOL gesamt Bedarf** (live
        gemessen per getMinimumBalanceForRentExemption, siehe
        `launch-clmm-pool.ts`): 0,3 SOL Initial-Liquiditaet +
        0,115457 SOL Rest-Rent + Fees-Puffer
      - **Initial-Liquidität: 0,3 SOL** (~23,10 EUR) — die quote-seitige
        SOL-Liquidität im Pool (plus SIN-seitig 10M Tokens, raw
        `1e18`); `config.dex.initialLiquiditySol` = 0,3 (oder per
        `SIN_INITIAL_LIQ` bei Dry-Run-Läufen überschrieben)
      - Puffer für Priority-Fees/Unerwartetes: ca. **0,000105 SOL**
        (live gemessen in launch-clmm-pool.ts)
      - Provider (recipient.json) hielt 0,520944 SOL (inkl. 0,0158-SOL
        Provider-Top-up, Journal-Schritt `clmm.providerTopup`) →
        **kein weiterer Top-up nötig**, nichts lag über dem Kasten.
      - Keine Kurs-/Profit-Aussage: die 0,3 SOL Liquiditaet bedeutet
        KEINE Wertbindung an einem festen Kurs — sie ist der
        quote-seitige SOL-Anteil des ersten Pools.

- [x] Distributions-Skript: **implementiert UND auf Mainnet
      ausgefuehrt** (10.11.2026, Journal-Schritte `distribute*`,
      Emissions-Transaktionen in `result/DISTRIBUTION.txt`) —
      `distribute.ts` emittiert die Gesamtmenge exakt nach
      `config.token.distribution` (81/10/5/4) auf vier separate
      Emissions-ATAs (SPL-Standard, keine Emissions-Programme).
      Planungslogik in `lib/distribution.ts` (exakt, ohne
      Gleitkomma-Reste), offline- + Localnet-Tests in
      `tests/distribute.test.ts` (10/10 ok inkl. E2E).
- [ ] Off-Chain-Metadaten auf dem gewählten permanenten Speicher
      (IPFS/Arweave) hochladen, `uri` in `config/token.json`
      aktualisieren und vor dem Mainnet-Mint testen
      (`verify.ts` lokal gegen die neue URI).
- [ ] Explorer-Verlinkung im Ergebnis-Protokoll auf
      `?cluster=mainnet-beta` umstellen (aktuell: Devnet/Localnet).
- [ ] Keine Test-Adressen, keine `DEVNET-TESTTOKEN`-Labels in
      öffentlichen Dokumenten — `result/` ist ohnehin gitignoriert.

## 3. Sicherheit / Schlüsselschutz

- [ ] **Keine einweg-Test-Wallet für Mainnet** — neue,
      getrennte Haupt-Tresor-Wallets (z. B. Hardware-Wallet) für
      Emission und (falls behalten) Freeze-Vollmacht.
- [ ] Keys niemals in Repo, Logs, Screenshots oder Frontend.
- [ ] Emissions-Skript gegen Mainnet: per `SIN_NETWORK=mainnet`
      ausführen (das Skript liest das Netz aus der Umgebungsvariable,
      NICHT aus `networks.default` — das bleibt bei `localnet`).
- [ ] Vor dem Entzug: Bestätigung, dass alle Emissionen
      abgeschlossen sind — danach ist die Supply endgültig fix.

## 4. Rechtliches / Transparenz (nicht erledigt)

- [ ] **Audit** der Emissions- und Distributions-Logik (externer
      Auditor; kein Audit durchgeführt).
- [ ] **Rechtslage** für den konkreten Startmarkt prüfen (kein
      Rechtsstand gegeben, keine Freigabe).
- [ ] **Risikohinweis** auf der Website bleibt sichtbar
      (Abschnitt `#risiko` auf der Landingpage).
- [ ] **Impressum/Datenschutz** vor öffentlichem Launch
      finalisieren (siehe Website-Dokumentation).

## 5. Kein Kurs-, Profit- oder Garantieberichten

- [ ] Keine Kursprognose, keine „geprüft von"-Angaben, keine
      erfundenen Zahlen (Inhaltsregeln AGENTS.md gelten auch hier).
- [ ] Alle Zahlen im Launch-Skript stammen aus `config/token.json`
      und sind dort mit Quellen belegt (in `docs/QUELLEN.md`
      ergänzen, falls neue Fakten hinzukommen).

## 6. Betrieb (nach Mainnet-Erstellung)

- [x] Mint-Adresse + Emissions-Signaturen im öffentlichen
      Ergebnis-Protokoll dokumentiert (explizit `MAINNET-LAUNCH`
      gelabelt, nicht „DEVNET/TESTTOKEN"):
      `result/MINT-ADDRESS.txt`, `result/DISTRIBUTION.txt`,
      `result/EXECUTED-TRANSACTIONS.jsonl` (gitignoriert, lokal
      Nachweis; öffentliche Auszüge ohne Keys in
      `MORNING-HANDOVER-POOL.md`).
- [x] Explorer-Links zum Mint + zur Erzeugungs-Transaktion
      verlinkbar (siehe Links-Block in MORNING-HANDOVER-POOL.md §5).
- [x] Vollmachten entzogen (10.11.2026, Journal `revoke-mint-authority`
      + `revoke-freeze-authority`, Signaturen protokolliert) —
      beweisbarer Zustand `mintAuthority = (none)`, `freezeAuthority
      = (none)`; Supply final.

## Was in diesem Prototyp NICHT enthalten ist

- Kein Mainnet-Start, kein Sale, keine Liquidität, kein Realgeld.
- Keine Token-2022-Extensionen (Fee, Hook, Freeze-Beschränkung
  jenseits der Standard-SPL).
- Keine versprochenen Listings, keine Partnerschaften, keine
  „geprüft von"-Angaben.
