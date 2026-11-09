# SuperIntelNex — Solana-Token-Prototyp (token/)

Erzeugungs-, Test- und Verifikationsumgebung fuer einen SPL-Standardtoken
(SPL Token Program, `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`) mit
Metaplex-Token-Metadaten (`metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`).
**Standard-SPL-Token, kein eigenes Programm, keine Token-2022-Extensionen,
keine versteckten Gebuehren, keine Sperr- oder Blacklist-Logik.**

Wichtig: Alle Parameter in `config/token.json` (Kuerzel, Gesamtmenge,
Verteilung, Vollmachten) sind **Vorschlaege, die der Betreiber noch nicht
bestaetigt hat**. Sie sind als solche markiert und durfen nicht als
Endentscheid kommuniziert werden. Es ist kein Mainnet-Start, kein Verkauf
und keine Anlageempfehlung.

## Layout

| Pfad | Zweck |
|---|---|
| `config/token.json` | Zentrale Konfiguration (Netz, Token-Parameter, Vollmachten, Metadaten) — alles mit Status `NOT-FINAL` |
| `scripts/lib/common.ts` | Gemeinsame Bausteine: Konfig, RPC, Wallets, Signatur-Protokoll, Metadaten-PDA |
| `scripts/create-mint.ts` | Mint + ATA + Metaplex-Metadaten anlegen (ein Transaktion) |
| `scripts/mint-initial.ts` | Gesamtmenge emittieren (an eine Admin-ATA — einweg-Testlauf) |
| `scripts/distribute.ts` | Vierstufige Emission (81/10/5/4) auf 4 separate Emissions-ATAs (SPL-Standard, keine Emissions-Programme; Vesting bleibt Planpunkt) |
| `scripts/lib/distribution.ts` | Reine Emissions-Planung (exakte Anteil-Berechnung ohne Gleitkomma-Reste) + Instruktionen pro Anteil |
| `scripts/transfer-test.ts` | ATA anlegen + Checked-Transfer 1.234 an Test-Wallet |
| `scripts/transfer-to-holder.ts` | SIN-Menge von Admin-ATA an die Empfaenger-Wallet uebertragen (SIN_TRANSFER_SIN) |
| `scripts/fund-holder.ts` | Test-SOL von Admin-Wallet an eine Ziel-Adresse (NUR localnet/devnet; im Mainnet Abbruch) |
| `scripts/bind-to-wallet.ts` | SIN an eine FREI GEWAHLTE Wallet-Adresse (ATA-Owner) binden — Default Dry-Run, sendet erst mit `--send`; Mainnet verlangt `SIN_MAINNET_OK=1`. Nimmt nur den oeffentlichen Pubkey |
| `scripts/revoke-authorities.ts` | Mint-/Freeze-Vollmacht entziehen (einweg) + Admin-Wallet sperren |
| `scripts/verify.ts` | Decimals, Supply, Vollmachten, On-Chain-Metadaten gegen Konfig pruefen |
| `scripts/devnet-prefund.ts` | Devnet-Vorbereitung OHNE Transaktion: zeigt einweg-Admin-Pubkey + Test-SOL-Saldo, exakte Laufbefehle (nur Leseabfrage, kein Signieren) |
| `scripts/prepare-for-review.ts` | Lokaler Pruefdurchlauf (Burn/Freeze/Thaw/Transfer) fuer Wallet-Inspektion |
| `scripts/create-raydium-pool.ts` | Raydium-CLMM-Pool-PLANNER, DRY-RUN (sendet nichts): Bestaetigung der Mint + Pool-PDA-Rechnung + Account-/Kostenplan. Ein eigentlicher CLMM-Launch ist hier bewusst NICHT implementiert (SIN_DEX_SEND fehlt) |
| `scripts/lib/raydium-clmm.ts` | Raydium-CLMM-PDA-Mathematik + Account-/Kosten-Planung. Die Seeds und Endianheit sind 1:1 mit dem offiziellen Raydium-SDK uebereinstimmend (6 PDA × 2 Netze byte-genau verifiziert, 09.11.2026). Reine Logik, kein RPC |
| `tests/config.test.ts` | Offline: Konfiguration ist gueltig und konsistent |
| `tests/distribute.test.ts` | Offline: Emissions-Planung (exakte Anteile, unguelle Verteilungen abgelehnt) + optin Localnet: vierstufige Emission gegen Test-Validator |
| `tests/integration.test.ts` | Optin: Kompletter Token-Lebenszyklus gegen lokalen Test-Validator |
| `tests/authorities.test.ts` | Optin: Vollmachten-Entzug (Mint/Freeze) — danach werden Emission/Freeze On-Chain abgelehnt |
| `metadata/` | Off-Chain-Metadaten-JSON + (siehe `docs/METADATEN-SPEICHERUNG.md`) |
| `assets/` | Logo-PNGs (800 px, 512 px) fuer die Metadaten |
| `docs/FRAGENLISTE.md` | Kurze Fragenliste mit begruendeten Vorschlaegen (Kuerzel, Menge, Dezimalstellen, Policy, Verteilung, Vollmachten, URI, Devnet-Start) — Vorschlaege, nicht Endentscheid |
| `docs/DEVNET-TESTTOKEN-BERICHT.md` | Ergebnis-Protokoll des Devnet-Laufs (09.11.2026): Mint, Signaturen, Explorer-Links, Sicherheitslage |
| `docs/MAINNET-LAUNCH-RUNBOOK.md` | Launch-Runbook fuer Mainnet: Wallet-Vorbereitung (Mainnet-Keys werden NICHT auto-erzeugt), Sinfolge, Vorab-Checkliste, Labeln |
| `docs/EXCHANGE-HOSTING.md` | DEX- vs. CEX-Listing: Raydium-Pool-Setup (was wir vorbereitet haben) + CEX-Antragsprozess (was DRETT-Prozess ist und kein Code) |
| `docs/` | Runbook, Vollmachts-Doku, Test-Doku, Mainnet-Checkliste |
| `wallets/` | EINWEG-Test-Wallets (base58-JSON) — **gitignoriert**, niemals Tresor |
| `result/` | Ergebnis-Protokoll (Mint-Adresse, Signaturen) — **gitignoriert** |

## Voraussetzungen

- **Deno** (>= 2.x): `~/.deno/bin/deno`. Keine Node/npm-Installation
  noetig — die `npm:`-Importe laedt Deno automatisch in den Cache.
- **Agave CLI** (Solana) nur fuer den lokalen Validator:
  `~/.local/share/solana/install/active_release/bin/solana-test-validator`

## Lokaler Test-Validator (Empfehlung)

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana-test-validator --reset --quiet --bind-address 127.0.0.1 \
  --rpc-port 8011 --faucet-port 8012 \
  --ledger ~/.sln-local/ledger \
  --url devnet \
  --clone-upgradeable-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
```

`--clone-upgradeable-program` (nicht `--clone`) kopiert Program-Account
**und** den Programdata-Account — ohne beides laufen die Metadaten-
Instructions nicht (Symptom: `UnsupportedProgramId` / `custom program
error: 0x5`). Details: `docs/DEVNET-RUNBOOK.md`.

## Befehlsreihenfolge (lokaler Lauf)

```bash
cd SuperIntelNex
deno test --allow-read --allow-env token/tests/config.test.ts   # offline
deno test --allow-all  token/tests/                             # localnet (integration + authorities)
deno run --allow-all token/scripts/create-mint.ts           # Mint + Metadaten
deno run --allow-all token/scripts/distribute.ts            # Vierstufige Emission (81/10/5/4)
# alternativ (einweg-Testlauf): deno run --allow-all token/scripts/mint-initial.ts  # Gesamtmenge an 1 ATA
deno run --allow-all token/scripts/transfer-test.ts        # 1.234 transferieren
deno run --allow-all token/scripts/verify.ts               # Abgleich
deno run --allow-all token/scripts/revoke-authorities.ts   # Vollmachten weg (einweg!)
```

Devnet: `SIN_NETWORK=devnet` + die Admin-Test-Wallet (`token/wallets/main.json`)
vorab ueber einen Faucet mit Test-SOL finanzieren (siehe Runbook).
Zur Pruefung der Finanzierung ohne jede Transaktion:
`deno run --allow-read --allow-write --allow-net --allow-env
token/scripts/devnet-prefund.ts` (zeigt Pubkey + Saldo + exakte Befehlsfolge).

## Test-Grundsaetze (aus dem Arbeitsauftrag)

- Nur Test-Wallets (`token/wallets/*.json`) — niemals das Haupt-Wallet.
- `result/MINT-ADDRESS.txt` und `result/EXECUTED-TRANSACTIONS.jsonl`
  dokumentieren **nur localnet-Laeufe als `LOCALNET-TEST`** und
  Devnet-Laeufe als `DEVNET-TESTTOKEN`.
- Keine Keys, Logs oder Status-Dateien committen (`.gitignore` ist
  entsprechend vorseziert).
- Keine Kurs-, Profit- oder Rechtsaussagen; alle offenen Parameter sind
  im Konfigblock `"_status": "NOT-FINAL"` markiert.
