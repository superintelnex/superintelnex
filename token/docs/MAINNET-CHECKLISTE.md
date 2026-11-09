# Mainnet-Checkliste (token/)

Stand: Testtoken lokal/Devnet erstellt, **kein Mainnet-Start
erfolgt**. Diese Liste ist die Vorlage für die Phase „öffentlicher
Launch". Keine Einzelpost ist vorab erledigt; alles hier ist
**offene Arbeit**.

## 1. Entscheidungen (Betreiber)

- [ ] **Ticker/Kürzel** final festlegen (Bestätigung 09.11.2026: `SIN`
      für den Devnet-Testtoken; für Mainnet gilt erst nach erneuter
      Bestätigung).
- [ ] **Gesamtmenge** final festlegen (Devnet-Bestätigung 09.11.2026:
      `100.000.000.000.000` = 10^14, fest, keine weiteren Emissionen;
      die frühere Vorschlagszahl 1.000.000.000 ist überholt).
- [ ] **Dezimalstellen** final festlegen (Devnet-Bestätigung 09.11.2026:
      `5` — technisch gebunden an die Supply `10^14`, siehe
      `config.token.decimalsNote`; frühere Vorschlagszahl 9 gilt nicht).
- [ ] **Verteilung** final festlegen (Bestätigung 09.11.2026: 81/10/5/4 —
      community/liquidity/founder/marketing), vor dem Mainnet-Mint.
- [ ] **Admin-Vollmachten**: beide entziehen oder Freeze behalten?
      (siehe `AUTHORITIES.md`).
- [ ] **Metadaten-URI**: GitHub Pages (provisorisch) gegen
      IPFS/Arweave (dauerhaft) entscheiden (siehe
      `METADATEN-SPEICHERUNG.md`).

## 2. Technische Vorbereitungen

- [ ] **Budget-Rahmen: 50 EUR** (SOL-Preis 77 EUR/SOL, Stand 09.11.2026
      = ca. 0,65 SOL). Die gesamte On-Chain-Kostenkette muss in diesen
      Rahmen passen:
      - On-Chain-Launch (Mint + Metadaten + 4x ATA + 4x Emissions-
        Transaktionen): ca. **0,030 SOL** (~2,30 EUR)
      - Raydium-CLMM-Pool (Rent + Fees; siehe
        `create-raydium-pool.ts`): ca. **0,010 SOL** (~0,77 EUR)
      - **Initial-Liquidität: 0,5 SOL** (~38,50 EUR) — die quote-seitige
        SOL-Liquidität im Pool (plus SIN-seitig emittierte Tokens);
        `config.dex.initialLiquiditySol` wird für das Budget von 5 auf
        0,5 SOL umgestellt (oder per `SIN_INITIAL_LIQ=0.5` bei
        Dry-Run-Läufen überschrieben)
      - Puffer für Priority-Fees/Unerwartetes: ca. **0,11 SOL**
        (~8,50 EUR)
      - Summe: ~0,65 SOL ≈ **50 EUR** — kein darüberhinausgehendes
        Budget vorgesehen. Der Wallet-Payer benötigt diese Summe
        vorab als SALDO (zuzüglich der 0,5 SOL Liquidität, die im
        Pool bindet, also insgesamt ~0,65 SOL im Payer-Konto).
      - Keine Kurs-/Profit-Aussage: die 0,5 SOL Liquidität bedeutet
        KEINE Wertbindung an einem festen Kurs — sie ist der
        quote-seitige SOL-Anteil des ersten Pools.

- [x] Distributions-Skript: **implementiert** — `distribute.ts`
      emittiert die Gesamtmenge exakt nach `config.token.distribution`
      (81/10/5/4) auf vier separate Emissions-ATAs (SPL-Standard,
      keine Emissions-Programme). Planungslogik in
      `lib/distribution.ts` (exakt, ohne Gleitkomma-Reste),
      offline- + Localnet-Tests in `tests/distribute.test.ts`
      (10/10 ok inkl. E2E). Die **Ausfuhrung** auf Mainnet bleibt
      offen (Reihenfolge unten + neue Emissions-Tresore):
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

- [ ] Mint-Adresse + Emissions-Signaturen im öffentlichen
      Ergebnis-Protokoll dokumentieren (explizit
      `MAINNET` gelabelt, nicht „DEVNET/TESTTOKEN").
- [ ] Explorer-Links zum Mint + zur Erzeugungs-Transaktion
      veröffentlichen.
- [ ] Falls Vollmachten entzogen: Signaturen beider
      `SetAuthority`-Transaktionen protokollieren (beweisbarer
      Zustand `mintAuthority = (none)`).

## Was in diesem Prototyp NICHT enthalten ist

- Kein Mainnet-Start, kein Sale, keine Liquidität, kein Realgeld.
- Keine Token-2022-Extensionen (Fee, Hook, Freeze-Beschränkung
  jenseits der Standard-SPL).
- Keine versprochenen Listings, keine Partnerschaften, keine
  „geprüft von"-Angaben.
