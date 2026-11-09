# Mainnet-Launch-Runbook (token/)

Stand: 09.11.2026 · **kein Mainnet-Lauf ausgeführt** — Vorlage +
Sicherheitsabnahme für den echten Start. Der Devnet-Lauf (09.11.2026)
ist abgeschlossen (DEVNET-TESTTOKEN-BERICHT.md); der Devnet-End-to-End-
Verlauf (Bindung an eine Wallet + DEX-Pool-Plan) lief am selben Tag
tatsächlich on-chain (DEVNET, Testwerte, kein echtes Geld).

## 0) Sicherheit — hart, nicht diskutierbar

- **Mainnet-Wallets werden NICHT auto-generiert.** `getWallet()`
  wirft im Mainnet-Modus (`MAINNET-LAUNCH`-Label), wenn
  `main.json` / `recipient.json` fehlen. Im Devnet-Lauf dagegen
  wurden einweg-Test-Wallets erzeugt — das ist im Mainnet absichtlich
  unmöglich: sonst minten wir das eigene Token an eine anonyme Adresse.
- **Jeder Mainnet-Lauf verlangt `SIN_MAINNET_OK=1`** (bewusste
  Bestätigung). Ohne: das Skript bricht ab, es wird nichts gesendet.
- **Keys niemals in Repo, Logs oder Screenshots.** `token/wallets/`
  und `token/result/` sind gitignoriert.
- **Reihenfolge ist einweg:**
  `create-mint` → `distribute` (4 Anteile) → `bind-to-wallet` →
  `verify` → `revoke-authorities` (Mint- + Freeze-Vollmacht entziehen;
  danach ist die Supply final, die Admin-Datei wird lokal gesperrt).

## 1) Wallet-Vorbereitung (vor dem ersten Lauf)

| Datei (gitignoriert) | Inhalt | Wer |
|---|---|---|
| `token/wallets/main.json` | **Emissions-Admin** (signiert Mint, Emission, ATA-Payer). Am besten ein frischer Key auf getrennter Maschine oder Hardware-Wallet. | Betreiber legt an |
| `token/wallets/recipient.json` | **Eigene Händler-Wallet** (Phantom/Solflare): nur der öffentliche Pubkey wird zum ATA-Owner; die Key-Datei bleibt lokal. | Betreiber kopiert SEINE Wallet-Datei dorthin — niemals in fremde Felder |
| `emission-<anteil>.json` (4×) | Die vier Emissions-Owner (community / liquidity / founder / marketing). „liquidity" = die Wallet, die später den DEX-Pool finanziert. | Betreiber legt an (Hardware empfohlen) |

Die Owner-Pubkeys der vier Anteile kommen aus
`config.token.distributionTargets` oder `SIN_DISTRIBUTION_TARGETS`
(Pubkeys, keine ATAs — die ATAs leiten sich im Skript ab).

## 2) Ablauf (Mainnet)

```bash
export PATH="$HOME/.deno/bin:$PATH"
cd SuperIntelNex

# 0) Offline-Checks (kein Netz):
deno test --allow-read --allow-env token/tests/config.test.ts
deno test --allow-read --allow-env token/tests/distribute.test.ts

# 1) Mint + Metadaten (1 Tx):
SIN_NETWORK=mainnet SIN_MAINNET_OK=1 deno run --allow-all token/scripts/create-mint.ts

# 2) Vierstufige Emission (4 Txs):
SIN_NETWORK=mainnet SIN_MAINNET_OK=1 deno run --allow-all token/scripts/distribute.ts

# 3) Eigene Wallet + weitere Halter binden (ATA anlegen + Transfer):
SIN_NETWORK=mainnet SIN_MAINNET_OK=1 deno run --allow-all \
  token/scripts/bind-to-wallet.ts --owner <DEINE_WALLET_PUBKEY> --send

# 4) Abgleich (Decimals, Supply, Vollmachten, Metadaten):
SIN_NETWORK=mainnet deno run --allow-all token/scripts/verify.ts

# 5) NUR nach 3)+4): Vollmachten entziehen (einweg!):
SIN_NETWORK=mainnet SIN_MAINNET_OK=1 deno run --allow-all token/scripts/revoke-authorities.ts
```

Danach: DEX-Pool (Raydium-UI „Launch Pool"; Dry-Run-Plan mit
`token/scripts/create-raydium-pool.ts`) und optional CEX-Antrag
(siehe `EXCHANGE-HOSTING.md`).

## 3) Vorab-Checkliste (Starttag, alles „ok"?)

- [ ] **Metadaten-URI:** content-addressed Speicher (IPFS/Arweave) oder
      stabile post-Merge-URL; `verify.ts` läuft lokal gegen die neue URI.
      (Aktuell steht noch die Devnet-Feature-Branche-Raw-URL in der
      Config — für Mainnet nicht tauglich!)
- [ ] `config.token.json` `_status` auf Mainnet-Bestätigung umgestellt,
      `distributionTargets` befüllt.
- [ ] `networks.mainnet` = `https://api.mainnet-beta.solana.com`
      (oder eigener RPC per `SIN_RPC`; der öffentliche RPC hat harte
      Rate-Limits — eigener Endpunkt wie Helius/QuickNode ist robuster).
- [ ] **Budget (aktuell vorgegeben: ~50 EUR-Rahmen):**
      Mint + 4 Emissionen + Bindungen ≈ 0,05–0,10 SOL an
      Fees + ATA-Rent; DEX-Pool: 0,5 SOL Initial-Liquidität
      (`dex.initialLiquiditySol`, Budget-Variante) + ~0,01 SOL
      Account-Rent. Summe ≈ 0,6–0,7 SOL — die exakte Untergrenze
      liefert `create-raydium-pool.ts` (Dry-Run).
- [ ] **Rechtslage** für den Startmarkt prüfen (DE/EU: MiCA/BaFIN).
      Kein Rechtsstand liegt in diesem Repo; keine Freigabe gegeben.
- [ ] Kein Kurs-/Gewinn-Versprechen auf Website, Whitepaper oder
      Socials; Risikohinweis bleibt sichtbar.

## 4) Labeln + Protokoll

- Mainnet-Ergebnisse laufen automatisch mit dem Label
  `MAINNET-LAUNCH` (networkLabel). Explorer-Links:
  `https://explorer.solana.com/address/<MINT>` (ohne `?cluster=`).
- `result/MINT-ADDRESS.txt` + `result/EXECUTED-TRANSACTIONS.jsonl`
  (gitignoriert) sind das Nachweisprotokoll. Für eine öffentliche
  Version: kopieren + säubern (keine Wallet-Keys), explizit
  „MAINNET" labeln — niemals „DEVNET-TESTTOKEN".

## 5) Was NICHT passiert (weder jetzt noch per Tooling)

- Kein automatischer DEX-Pool-Start (`SIN_DEX_SEND` fehlt
  absichtlich; hand-kompilierter CLMM-Launch würde SOL verbrennen —
  siehe `EXCHANGE-HOSTING.md`).
- Kein CEX-Listing (Drittanbieter-Prozess, kein Code).
- Kein Vesting im Emissions-Skript (offener Planpunkt, siehe
  MAINNET-CHECKLISTE.md).
- Keine Kurs-, Profit- oder Garantieaussagen.
