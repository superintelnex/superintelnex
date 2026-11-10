# Fragenliste: Festlegungen für den SuperIntelNex-Token

**Stand: BESTÄTIGT am 09.11.2026, auf Mainnet ausgeführt (09.11.2026,
22:07–23:38 UTC).** Der Betreiber hat die freie Auswahl übertragen und
100 Billion (10^14) Gesamtmenge vorgegeben. Die Werte stehen unter
`"_status"` in `token/config/token.json`. Der MAINNET-LAUNCH ist
abgeschlossen: Mint `A4WSPbHP…`, Emission 81/10/5/4, beide Vollmachten
entzogen + finalized (Protokoll: `MAINNET-LAUNCH-BERICHT.md`).

> **Hinweis (technische Bindung):** 100 Billion = 10^14 passt mit den
> üblichen 9 Dezimalstellen (SOL-Standard) **nicht** in die u64-Supply
> der SPL-Programme (10^14 × 10^9 = 10^23 > 1.84·10^19 max). Deshalb:
> **5 Nachkommastellen** — das ist das technische Maximum, bei dem
> 10^14 integer bleibt (1 SIN = 100.000 kleinste Einheiten). Der
> Konfig-Test prüft das automatisch (`config.test.ts`, u64-Guard).

## Q1 — Token-Kürzel (Symbol)

| | |
|---|---|
| **Bestätigt** | `SIN` |
| **Begründung** | Kurz, aus dem Namen (Sup**I**ntel**N**ex) abgeleitet, 3 Zeichen — gut lesbar in Wallets und im Explorer. |

## Q2 — Gesamtmenge (Total Supply)

| | |
|---|---|
| **Bestätigt** | **100.000.000.000.000** (100 Billion = 10^14, deutsche Zählung) |
| **Begründung** | Vom Betreiber vorgegeben (09.11.2026). |

## Q3 — Nachkommastellen (Decimals)

| | |
|---|---|
| **Bestätigt** | **5** |
| **Begründung** | Technisch gebunden an Q2: u64-Supply-Obergrenze erlaubt 10^14 maximal mit 5 Dezimalstellen (Raw-Supply = 10^19, ~54 % der Obergrenze). Mit 9 Dezimalstellen (SOL-Standard) würde 10^14 nicht in den Supply-Wert passen. |

## Q4 — Ausgabe-Policy (fest vs. weitere Emissionen)

| | |
|---|---|
| **Bestätigt** | **Feste Menge, keine weiteren Emissionen** (`FIXED-NO-FURTHER-ISSUANCE`) |
| **Begründung** | Maximale Integrität für die Community; zusammen mit dem Entzug der Mint-Vollmacht (Q6) wird die Supply endgültig fixiert. |

## Q5 — Verteilung (Community / Liquidity / Gründer / Marketing)

| | |
|---|---|
| **Bestätigt** | **81 % Community · 10 % Liquidität · 5 % Gründer · 4 % Marketing** (Bestätigung 09.11.2026, Commit `c5d48e1`; die frühere Planung 55 % Community / 20 % Gründer / 15 % Entwicklung / 10 % Liquidität ist überholt) |
| **Status** | **Auf Mainnet ausgeführt am 09.11.2026 22:09 UTC** — `distribute.ts` emittierte die vier Anteile auf getrennte Emissions-ATAs (Signaturen + Saldo-Protokoll in `MAINNET-LAUNCH-BERICHT.md`). Vesting (Gründer 5 % / Marketing 4 %) als Folgeschritt nach der Emission: offen, siehe Q6-Anhang. |

## Q6 — Verwaltungsrechte (Mint-/Freeze-Vollmacht)

| | |
|---|---|
| **Bestätigt** | **Beide Vollmachten nach Emission unwiderruflich entziehen** (`revokeMintAuthority: true`, `revokeFreezeAuthority: true`) |
| **Status (Mainnet)** | **Am 09.11.2026 23:38 UTC ausgeführt + finalized** — On-Chain: `mintAuthority = (none)`, `freezeAuthority = (none)` (Slots 467504907 / 467504911). Signaturen + Beweis: `MAINNET-LAUNCH-BERICHT.md`. |
| **Begründung** | Maximale Transparenz: im Explorer sichtbar `mintAuthority = (none)`, `freezeAuthority = (none)`. Kein verstecktes Recht zum Einziehen fremder Token (SPL hat ohnehin keine Blacklist-Logik; Freeze wäre die einzige Sperrmöglichkeit). |

### Mint & Freeze im Detail (Begründung für Q6)

- **Mint-Vollmacht (erzeugt Token):** Wer sie hat, kann neue Token „aus dem
  Nichts" schaffen und die Gesamtmenge erhöhen. **Entzug** → Supply endgültig
  fix, niemand kann mehr minten. **Beibehaltung** → flexible Reserve, aber
  dauerhaftes Vertrauensrisiko: kompromittierter Schlüssel = unbegrenzte
  Emission.
- **Freeze-Vollmacht (sperrt/entsperrt Konten):** Wer sie hat, kann den
  Token-Account eines Halters `freeze`n (kein Transfer mehr möglich). Im
  Standard-SPL ist das die **einzige** Sperrmöglichkeit — es gibt **keine
  Blacklist**, **keine versteckten Gebühren**, **keine Verkaufsbeschränkung**
  im Programm. **Entzug** → kein Konto mehr sperrbar (höchste Freiheit für
  Halter). **Beibehaltung** → man kann versehentlich eingefrorene Konten
  auftauen und missbräuchliche Konten sperren; dafür bleibt eine permanente,
  einseitige Macht über fremde Wallets bestehen.
- **On-Chain-Metadaten (`isMutable: false`):** Name, Symbol, URI und Creators
  sind zum Anlegezeitpunkt **dauerhaft fixiert** — das Programm lehnt danach
  jede `Update`-Instruktion ab (Details: `METADATEN-SPEICHERUNG.md`). Eine
  Korrektur von Tippfehlern in der Metadaten ist **nicht** möglich; deshalb
  müssen Q1/Q2 und die off-Chain-URI vor dem `create-mint.ts`-Aufruf final sein.

## Q7 — Off-Chain-Metadaten-Speicher (URI)

| | |
|---|---|
| **Bestätigt (Devnet)** | GitHub Pages (`superintelnex.com/token/metadata/superintelnex-token.json`), **provisorisch** für den Testtoken |
| **Bestätigt (Mainnet)** | **Raw-URL des `main`-Branch** (`https://raw.githubusercontent.com/superintelnex/superintelnex/main/token/metadata/superintelnex-token.json`, Commit `08e71fc`) — am 09.11.2026 on-chain fixiert per `isMutable: false` (PDA `3UVHFDS3WXofjanwA3U5ND255YfkALnvQ5wyyc5qrWPY`, HTTP 200 live) |
| **Begründung** | Laufend und nachvollziehbar; die Mainnet-URI zeigt auf den `main`-Branch (stabile, versionierte Raw-URL). IPFS/Arweave-Pinning (content-addressed) bleibt **optional** für eine spätere Migration — `isMutable: false` macht die URI für diesen Mint unveränderlich. |
| **Für Mainnet (offen)** | Content-addressed Speicher (IPFS z. B. Pinata/Web3Storage, oder Arweave) als Migrationsoption, falls die URI dauerhaft auf einen Hash zeigen soll |

## Q8 — Devnet-Erstellung (jetzt ausführen?)

| | |
|---|---|
| **Status** | **Devnet-Lauf am 09.11.2026 abgeschlossen** — Devnet-Mint `CyEcfZw2…` erstellt, 1 Mio. SIN an die Empfänger-Test-Wallet übertragen, Vollmachten entzogen (Protokoll: `DEVNET-TESTTOKEN-BERICHT.md`). |
| **Mainnet-Launch** | **Am 09.11.2026 22:07–23:38 UTC abgeschlossen** — Mint `A4WSPbHP…` (10^19 @ 5 Dez.), Emission 81/10/5/4 zu 100 %, beide Vollmachten entzogen + finalized (Protokoll: `MAINNET-LAUNCH-BERICHT.md`). |
| **Früher Blocker (Devnet, gelöst)** | Die einweg-Admin-Test-Wallet brauchte **~0,5 Test-SOL** (öffentlicher Devnet-Airdrop HTTP 410). Gelöst über `faucet.solana.com` mit einem älteren GitHub-Konto des Betreibers (Signatur im Devnet-Bericht). |

## Q9 — Verwaltung der Metadaten-Update-Vollmacht

| | |
|---|---|
| **Bestätigt** | **Nach dem Devnet-Lauf ebenfalls entziehen** (einweg-Schritt, kein zusätzlicher Transaktions-Slot) |
| **Begründung** | Mit `isMutable: false` ist die Update-Vollmacht bereits nicht mehr relevant (keine Updates möglich); der Entzug macht den Zustand im Explorer sichtbar `updateAuthority = (none)` — maximale Transparenz. |

---

**Keine Seed-Phrase oder private Schlüssel werden in diesem Projekt
abgefragt. Alle Test-Wallets sind einweg-Test-Artefakte (`token/wallets/`,
gitignoriert), niemals das Tresor-Wallet. Keine Kurs-, Profit- oder
Rechtsaussagen. Alle Werte sind final für den DEVNET-Testtoken UND für
den MAINNET-LAUNCH (09.11.2026, abgeschlossen — siehe
`MAINNET-LAUNCH-BERICHT.md`).**
