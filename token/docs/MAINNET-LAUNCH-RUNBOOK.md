# Mainnet-Launch-Runbook (token/)

Stand: 10.11.2026 · **Mainnet-Lauf 01/04 TEILWEISE ausgefuehrt**:
Mint + vierstufige Emission LIVE auf Mainnet (Mint
`A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z`, siehe
`result/MINT-ADDRESS.txt` + `result/DISTRIBUTION.txt`). Offener
Rest: (a) CLMM-Pool Funding-Top-up + Send (Schritt 5 unten,
`launch-clmm-pool.ts`), (b) `revoke-authorities.ts` (Schritt 6).
Devnet-Vorlauf (09.11.2026) abgeschlossen (DEVNET-TESTTOKEN-BERICHT.md).
Alle Mainnet-Parameter gelten erst nach erneuter Bestaetigung
(siehe config/token.json `_status` — aktuell DRY-RUN-ONLY fuer den
DEX-Schritt).

## 0) Sicherheit — hart, nicht diskutierbar

- **Mainnet-Wallets werden NICHT auto-generiert.**
  `getWallet()` wirft im Mainnet, wenn `main.json` / `mint.json` / `recipient.json`
  fehlen (`MAINNET-LAUNCH`-Label). Der Devnet-Lauf hat das anders
  gemacht (einweg-Test-Wallets) — das ist am Mainnet absichtlich
  unmoeglich: sonst minten wir an eine anonyme Adresse.
- **Jeder Mainnet-Lauf verlangt `SIN_MAINNET_OK=1`** (bewusste
  Betaetigung). Ohne: Skript endet mit ABBRUCH, keine Transaktion.
- **Keys niemals in Repo/Logs/Screenshots.** `token/wallets/` +
  `token/result/` sind gitignoriert.
- **Reihenfolge ist einweg:**
  `create-mint` → `distribute` (4 Anteile) → `transfer-to-holder` /
  `bind-to-wallet` → `verify` → `launch-clmm-pool` (DEX live) →
  `revoke-authorities` (Mint- +
  Freeze-Vollmacht entziehen; danach ist die Supply final und die
  Admin-Wallet wird lokal gesperrt). Der CLMM-Pool muss vor der
  Entziehung live sein — d.h. die Liquiditaet (10%) muss im Pool
  liegen, bevor mint/freeze entzogen werden.

## 1) Wallet-Vorbereitung (vor dem ersten Lauf)

| Datei | Inhalt | Wer |
|---|---|---|
| `token/wallets/main.json` | **Emissions-Admin** (signiert Mint + Emission + ATA-Payer; traegt die mint/freeze-Vollmacht bis zur Entziehung in Schritt 2.5). Am besten Hardware-Wallet oder frischer Key auf getrennter Maschine. | Betreiber legt an |
| `token/wallets/mint.json` | **Mint-Keypaar** — der Mint-Account-Pubkey (nur der Mint-Account selbst; `create-mint.ts` laedt die Datei im Mainnet, Erzeugen ist dort untersagt). | Betreiber legt an (fresches Key-Paar) |
| `token/wallets/recipient.json` | **Eigene Haendler-Adresse** des Betreibers (Phantom/Solflare-Wallet; nur der oeffentliche Pubkey wird zum ATA-Owner; der Key liegt lokal, gitignoriert). | Betreiber kopiert seine Wallet-Keys dorthin (NIEMALS in ein fremdes Feld) |
| `emission-<anteil>.json` x4 | Die vier Emissions-Owner (community / liquidity / founder / marketing). Fuer "liquidity" die Wallet, die spaeter den DEX-Pool finanziert. | Betreiber legt an (Hardware-empfohlen) |

`SIN_DISTRIBUTION_TARGETS` / `config.token.distributionTargets`:
Owner-Pubkeys fuer die vier Anteile (nicht ATAs — die leiten sich ab).

## 2) Ablauf (Mainnet)

```bash
export PATH="$HOME/.deno/bin:$PATH"
cd SuperIntelNex

# 0) Offline-Checks (kein Netz):
deno test --allow-read --allow-env token/tests/

# 1) Mint + Metadaten (1 Tx):
SIN_NETWORK=mainnet SIN_MAINNET_OK=1 deno run --allow-all token/scripts/create-mint.ts

# 2) Vierstufige Emission (4 Txs):
SIN_NETWORK=mainnet SIN_MAINNET_OK=1 deno run --allow-all token/scripts/distribute.ts

# 3) Eigene Wallet + weitere Haendler binden:
SIN_NETWORK=mainnet SIN_MAINNET_OK=1 deno run --allow-all \
  token/scripts/bind-to-wallet.ts --owner <DEINE_WALLET_PUBKEY> --send
# (Standard-Menge 1000000 SIN; --amount fuer eine andere)

# 4) Abgleich:
SIN_NETWORK=mainnet deno run --allow-all token/scripts/verify.ts

# 5) DEX-CLMM-Pool Raydium (2 Txs), offizielle Raydium-SDK:
#    Dry-Run (read-only, nichts wird gesendet):
SIN_NETWORK=mainnet deno run --allow-read --allow-net --allow-env \
  token/scripts/launch-clmm-pool.ts
#    Senden (NUR nach explicitem Funding-OK + Bestaetigung):
SIN_NETWORK=mainnet SIN_DEX_SEND=1 SIN_MAINNET_OK=1 deno run \
  --allow-read --allow-net --allow-env --allow-write \
  token/scripts/launch-clmm-pool.ts

# 6) NUR nach 3)+4)+5) (Pool live): Vollmachten entziehen (einweg!):
SIN_NETWORK=mainnet SIN_MAINNET_OK=1 deno run --allow-all token/scripts/revoke-authorities.ts
```

DEX-Details (CLMM, Config-Index 0, tickSpacing 10, 1 bps Trade-Fee):

- **Pool-PDA (WSOL<SIN, PDA-Zwang der Program-Constraint
  `token_mint_0 < token_mint_1`): `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`**
  (nonexistent on-chain = One-Shot-frei; der alte Kandidat
  `8Buau2…` stammte aus der falschen Mint-Reihenfolge).
- Provider: `recipient.json` (`DNEBNjtW…`) haelt 0,55 SOL +
  10M-SIN-ATA (raw `1000000000000000000`).
- TX1 `createPool` (1 Instruktion; Payer zahlt Pool/Observation/ExBitmap/
  Vaults-Rent), TX2 [WSOL-ATA + wrapSol(0,5 SOL) + openPositionV2 mit
  Position-NFT, Metadaten, 2 TickArrays]. Ticks +174170…+254170
  (start +214170), L = `25854670474785`, initialPriceX64 =
  `824963474247118971758065`.
- **Funding-Bedarf: 0,765662 SOL** (Rent 0,265662 + 0,5 Liquiditaet +
  Fees/Puffer 0,000110; live per `getMinimumBalanceForRentExemption`).
  Vorhanden 0,55 → **Top-up 0,215662 SOL in `recipient.json`** —
  das ist die einzige ausstehende Entscheidung vor dem Senden
  (erhoeht die Program-Gesamtkosten um ~17 EUR, fuehrt also ~3 EUR
  ueber den 50-EUR-Kasten, bewusst offen gelegt; ~77 EUR/SOL).
- Ergebnisprotokoll: `result/POOL-ADDRESS.txt` (Pool-, Position-Block +
  beide Signaturen + Raydium/Explorer-Links), automatisch vom Skript
  geschrieben. CEX: `EXCHANGE-HOSTING.md`.

## 3) Vorab-Checkliste (Starttag, alle "ok"?)

- [ ] Metadaten-URI: content-addressed Speicher (IPFS/Arweave) ODER
      stabile post-Merge-URL; `verify.ts` laeuft lokal gegen die neue
      URI durch. (Aktuell: GitHub-raw der Main-Branche — post-Launch
      spiegelungspflichtig, Schritt 4 der Launch-Sequenz.)
- [x] `config.token.json` `_status` erneuert (Mainnet-Bestaetigung),
      `distributionTargets` befuellt. (Mint + Emission live, siehe Kopf.)
- [ ] `networks.mainnet` = "https://api.mainnet-beta.solana.com"
      (oder eigener RPC per `SIN_RPC`; der Oeffentliche Mainnet-RPC
      hat harte Rate-Limits — fuer die 5+ Txs reicht er, aber ein
      eigener Endpunkt (Helius/QuickNode) ist robust).
- [ ] Kosten: Mint ~0,002 SOL, Emission ~0,005–0,02 SOL (ATA + Fees),
      CLMM-Pool: `launch-clmm-pool.ts` liefert exakte on-chain
      Untergrenzen (aktuell 0,765662 SOL, davon 0,265662 Rent; Provider
      haelt 0,55 → Top-up 0,215662 SOL ≈ 17 EUR, dadurch laeuft das
      Programm insgesamt ~3 EUR ueber den 50-EUR-Kasten — bewusste
      Top-up-Entscheidung, siehe DEX-Details).
- [ ] Rechtslage Startmarkt (DE/EU: MiCA/BaFin) — kein Rechtsstand in
      diesem Repo; Pruefung extern.
- [ ] Kein Kurs-/Gewinn-Versprechen auf Website/Whitepaper.

## 4) Labeln + Protokoll

- Mainnet-Ergebnisse immer als `MAINNET-LAUNCH` (networkLabel
  liefert das automatisch); Explorer-Links:
  `https://explorer.solana.com/address/<MINT>` (ohne ?cluster=Query).
- `result/MINT-ADDRESS.txt` + `result/EXECUTED-TRANSACTIONS.jsonl`
  (gitignoriert) sind das Nachweis-Protokoll; fuer eine oeffentliche
  Version: kopieren + saeubern (keine Wallet-Keys), explizit
  "MAINNET" labeln — nie "DEVNET-TESTTOKEN".

## 5) Was NICHT passiert (weder jetzt noch per Tooling)

- Kein Auto-Launch des DEX-Pools (SIN_DEX_SEND fehlt absichtlich;
  siehe `EXCHANGE-HOSTING.md`).
- Kein CEX-Listing (Dritt-Prozess, nicht Code).
- Kein Vesting im Emissions-Skript (Planpunkt, siehe
  MAINNET-CHECKLISTE.md).
- Keine Kurs-, Profit- oder Garantieaussage.
