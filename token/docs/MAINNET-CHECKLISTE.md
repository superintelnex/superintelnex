# Mainnet-Checkliste (token/)

Stand: 10.11.2026 · **Mainnet-Launch + Revoke finalisiert, DEX-Pool LIVE** —
Mint `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z`
(Emission 09.11.2026 22:07–23:38 UTC, Distribution 81/10/5/4 zu 100 %),
beide Vollmachten entzogen + finalized, Raydium-CLMM-Pool (SIN/WSOL)
LIVE (siehe `MAINNET-LAUNCH-BERICHT.md` + `MAINNET-LAUNCH-RUNBOOK.md`
+ `MORNING-HANDOVER-POOL.md`). Diese Liste dokumentiert die
Vorbereitungs-Phase; erledigte Punkte sind abgehakt, offene
Restarbeiten (Vesting, Rechts-/Audit-Themen) stehen unten.

## 1. Entscheidungen (Betreiber)

- [x] **Ticker/Kürzel** festgelegt: `SIN` (Devnet-Bestätigung
      09.11.2026; der Mainnet-Lauf bestätigt das
      Kürzel — Mint on-chain `A4WSPb…`).
- [x] **Gesamtmenge** fest: `100.000.000.000.000` = 10^14
      (on-chain emittiert; frühere Vorschlagszahl
      1.000.000.000 ist überholt).
- [x] **Dezimalstellen** fest: `5` (on-chain fix per Mint; technisch
      gebunden an die Supply `10^14`, siehe
      `config.token.decimalsNote`; frühere Vorschlagszahl 9 gilt
      nicht).
- [x] **Verteilung** fest: 81/10/5/4 — community/liquidity/founder/
      marketing (on-chain ausgeführt, Signaturen in
      `MAINNET-LAUNCH-BERICHT.md` + `result/DISTRIBUTION.txt`).
- [x] **Admin-Vollmachten: beide entzogen** (09.11.2026 23:38 UTC,
      finalized: Mint-`SetAuthority` Sig
      `2w7dM443…PWKVJY` (Slot 467504907), Freeze-`SetAuthority` Sig
      `2qn9jSPU…r5xVi1Wzt` (Slot 467504911), Journal
      `revoke-mint-authority` + `revoke-freeze-authority`):
      `mintAuthority = (none)`, `freezeAuthority = (none)` —
      Supply final (siehe `AUTHORITIES.md`).
- [x] **Metadaten-URI** entschieden: **Raw-URL des `main`-Branch**
      (`https://raw.githubusercontent.com/superintelnex/superintelnex/main/token/metadata/superintelnex-token.json`,
      Commit `08e71fc`) — im Launch on-chain fixiert
      (`isMutable: false`, PDA `3UVHFDS3WXofjanwA3U5ND255YfkALnvQ5wyyc5qrWPY`,
      HTTP 200 live). IPFS/Arweave-Pinning bleibt **optional** für
      spätere Migration (siehe `METADATEN-SPEICHERUNG.md`).

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
      ausgeführt** (Emission 09.11.2026 22:09 UTC,
      Journal-Schritte `distribute*`, Emissions-Transaktionen in
      `result/DISTRIBUTION.txt`) — `distribute.ts` emittiert die
      Gesamtmenge exakt nach `config.token.distribution` (81/10/5/4)
      auf vier separate Emissions-ATAs (SPL-Standard, keine
      Emissions-Programme). Planungslogik in `lib/distribution.ts`
      (exakt, ohne Gleitkomma-Reste), offline- + Localnet-Tests in
      `tests/distribute.test.ts` (10/10 ok inkl. E2E). Signaturen
      (Emission) in `MAINNET-LAUNCH-BERICHT.md`: `75NFP9Cn…`
      (community), `5KqN3KeF…` (liquidity), `CZgWrgG9…` (founder),
      `2w64JnQJ…` (marketing).
- [x] **Mainnet-Launch ausgeführt** (09.11.2026):
      Mint `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z`,
      Metadaten on-chain fixiert, Emission 81/10/5/4 zu 100 %, beide
      Vollmachten entzogen + finalized. Details:
      `MAINNET-LAUNCH-BERICHT.md`.
- [ ] Off-Chain-Metadaten auf dem gewählten permanenten Speicher
      (IPFS/Arweave) hochladen — **optional**: die URI ist bereits
      on-chain auf der Raw-URL des `main`-Branch fixiert
      (`isMutable: false`). IPFS-Pinning nur bei gewünschter
      Migration (siehe `METADATEN-SPEICHERUNG.md`).
- [x] Explorer-Verlinkung im Ergebnis-Protokoll auf
      `?cluster=mainnet-beta` umgestellt — `MAINNET-LAUNCH-BERICHT.md`
      enthält alle Explorer-Links mit `?cluster=mainnet-beta`.
- [x] Keine Test-Adressen, keine `DEVNET-TESTTOKEN`-Labels in
      öffentlichen Dokumenten — `result/` ist ohnehin gitignoriert.
      MAINNET-LAUNCH-Bericht nutzt exklusive `mainnet-beta`-Links.

## 3. Sicherheit / Schlüsselschutz

- [x] **Emissions-Admin-Key vor Mainnet getrennt** — frischer
      `main.json`-Keypair (`9kT5EwF7…`) diente als Payer + Signierer
      für den Launch (separat vom Devnet-Test-Admin `FoJ8tLty…`).
- [x] Keys niemals in Repo, Logs, Screenshots oder Frontend —
      `token/wallets/` + `token/result/` sind gitignoriert.
- [x] Emissions-Skript gegen Mainnet per `SIN_NETWORK=mainnet`
      + `SIN_MAINNET_OK=1` ausgeführt (`distribute.ts`,
      `create-mint.ts`).
- [x] Vor dem Entzug: Bestätigung, dass alle Emissionen
      abgeschlossen sind — **ausgeführt** (Distribution 100 %,
      Admin-ATA = 0, finalized Revoke-Sigs in `MAINNET-LAUNCH-BERICHT.md`).
- [x] **Admin-Test-Wallet nach Entzug lokal gesperrt** —
      `wallets/main.json` wurde in `wallets/main.json.archiviert`
      verschoben; kein Minten/Freezen mehr möglich (on-chain irreversibel).

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
      `MAINNET-LAUNCH-BERICHT.md` + `MORNING-HANDOVER-POOL.md`).
- [x] **Explorer-Links zum Mint + zu allen Erzeugungs-Transaktionen
      veröffentlicht** — in `MAINNET-LAUNCH-BERICHT.md`,
      `?cluster=mainnet-beta` (zusätzlich Links-Block in
      `MORNING-HANDOVER-POOL.md` §5).
- [x] **Signaturen beider `SetAuthority`-Transaktionen protokolliert**
      (beweisbarer Zustand `mintAuthority = (none)` /
      `freezeAuthority = (none)`, finalized, Slots 467504907 /
      467504911, Journal `revoke-mint-authority` +
      `revoke-freeze-authority`).

## Nach dem Launch (offene Restarbeiten)

- [x] **DEX-Pool (Raydium CLMM, SIN/WSOL): LIVE (10.11.2026)** —
      Pool `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`,
      TX1 `NNkrfq…` + TX2 `3AU3rf…` finalisiert, Liquidität
      0,3 SOL (Budget 50 EUR eingehalten). Details:
      `MORNING-HANDOVER-POOL.md` (Erfolgsbericht) +
      `MAINNET-LAUNCH-RUNBOOK.md`.
- [ ] **Vesting (founder 5 % / marketing 4 %)** als Folgeschritt
      nach der Emission — im Emissions-Skript bewusst NICHT
      enthalten.

## Was in diesem Prototyp NICHT enthalten ist

- Kein Sale (Mainnet-Token ist emittiert und auf 100 % verteilt;
  der DEX-Pool mit Liquidität ist LIVE — `MORNING-HANDOVER-POOL.md`).
- Keine Token-2022-Extensionen (Fee, Hook, Freeze-Beschränkung
  jenseits der Standard-SPL).
- Keine versprochenen Listings, keine Partnerschaften, keine
  „geprüft von"-Angaben.
