# Mainnet-Launch-Runbook (token/)

Stand: 09.11.2026 · **kein Mainnet-Lauf ausgeführt** — Vorlage +
Sicherheits-Abnahme fuer den echten Start. Devnet-Lauf (09.11.2026)
abgeschlossen (DEVNET-TESTTOKEN-BERICHT.md). Alle Mainnet-Parameter
gelten erst nach erneuter Bestaetigung (siehe config/token.json
`_status`).

## 0) Sicherheit — hart, nicht diskutierbar

- **Mainnet-Wallets werden NICHT auto-generiert.**
  `getWallet()` wirft im Mainnet, wenn `main.json` / `recipient.json`
  fehlen (`MAINNET-LAUNCH`-Label). Der Devnet-Lauf hat das anders
  gemacht (einweg-Test-Wallets) — das ist am Mainnet absichtlich
  unmoeglich: sonst minten wir an eine anonyme Adresse.
- **Jeder Mainnet-Lauf verlangt `SIN_MAINNET_OK=1`** (bewusste
  Betaetigung). Ohne: Skript endet mit ABBRUCH, keine Transaktion.
- **Keys niemals in Repo/Logs/Screenshots.** `token/wallets/` +
  `token/result/` sind gitignoriert.
- **Reihenfolge ist einweg:**
  `create-mint` → `distribute` (4 Anteile) → `transfer-to-holder` /
  `bind-to-wallet` → `verify` → `revoke-authorities` (Mint- +
  Freeze-Vollmacht entziehen; danach ist die Supply final und die
  Admin-Wallet wird lokal gesperrt).

## 1) Wallet-Vorbereitung (vor dem ersten Lauf)

| Datei | Inhalt | Wer |
|---|---|---|
| `token/wallets/main.json` | **Emissions-Admin** (signiert Mint + Emission + ATA-Payer). Am besten Hardware-Wallet oder frischer Key auf getrennter Maschine. | Betreiber legt an |
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

# 5) NUR nach 3)+4): Vollmachten entziehen (einweg!):
SIN_NETWORK=mainnet SIN_MAINNET_OK=1 deno run --allow-all token/scripts/revoke-authorities.ts
```

Dann: DEX-Pool (raydium.io Launch Pool; Dry-Run-Plan:
`token/scripts/create-raydium-pool.ts`), CEX: `EXCHANGE-HOSTING.md`.

## 3) Vorab-Checkliste (Starttag, alle "ok"?)

- [ ] Metadaten-URI: content-addressed Speicher (IPFS/Arweave) ODER
      stabile post-Merge-URL; `verify.ts` laeuft lokal gegen die neue
      URI durch. (Aktuell: Raw-URL der Devnet-Feature-Branche — nicht
      fuer Mainnet taugen!)
- [ ] `config.token.json` `_status` erneuert (Mainnet-Bestaetigung),
      `distributionTargets` befuellt.
- [ ] `networks.mainnet` = "https://api.mainnet-beta.solana.com"
      (oder eigener RPC per `SIN_RPC`; der Oeffentliche Mainnet-RPC
      hat harte Rate-Limits — fuer die 5+ Txs reicht er, aber ein
      eigener Endpunkt (Helius/QuickNode) ist robust).
- [ ] Kosten: Mint ~0,002 SOL, Emission ~0,005–0,02 SOL (ATA + Fees),
      Pools: `create-raydium-pool.ts` liefert Untergrenzen
      (5 SOL Initial-Liquiditaet: konfigurierbar).
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
