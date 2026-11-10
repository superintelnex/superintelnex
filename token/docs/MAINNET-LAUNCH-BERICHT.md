# MAINNET-LAUNCH — Ergebnis-Protokoll SuperIntelNex (SIN)

Stand: 09.11.2026 · Netz: **SOLANA MAINNET (MAINNET-LAUNCH)**
Offizielles Launch-Protokoll des SuperIntelNex-Tokens (SIN) auf
Solana mainnet-beta. Alle Signaturen unten sind **on-chain
bestätigt** (getSignaturesForAddress / getSignatureStatuses,
finalized).

## Mint (Token + On-Chain-Metadaten)

| Feld | Wert |
|---|---|
| Mint-Adresse | `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z` |
| Name / Symbol | SuperIntelNex / SIN |
| Decimals | 5 |
| Total Supply | 100.000.000.000.000 (10^14) = 10^19 smallest units |
| Metadaten-URI | https://raw.githubusercontent.com/superintelnex/superintelnex/main/token/metadata/superintelnex-token.json |
| isMutable | false (On-Chain fixiert) |
| Metadaten-PDA | `3UVHFDS3WXofjanwA3U5ND255YfkALnvQ5wyyc5qrWPY` |
| Metadaten-Update-Authority | `(none)` (Metaplex TM v2 entzieht sie bei `isMutable:false`) |

**Explorer (MAINNET-BETA):**
- Mint: https://explorer.solana.com/address/A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z?cluster=mainnet-beta
- Metadaten-PDA: https://explorer.solana.com/address/3UVHFDS3WXofjanwA3U5ND255YfkALnvQ5wyyc5qrWPY?cluster=mainnet-beta
- ATA Community/Founder/Marketing: https://explorer.solana.com/address/C4pr3GCk85dwBysH4p1fzruT6RzFseoW4ryPeEjufBkC?cluster=mainnet-beta
- ATA Liquidity: https://explorer.solana.com/address/FD1WzT526vwyBbuq7p6RN6PizStW8sEoZaGrm5u7xqSW?cluster=mainnet-beta
- ATA Admin: https://explorer.solana.com/address/CP1h13eq5n7hB4bQdvP5Zb8nazXj3tmZyQKPszPnqoVX?cluster=mainnet-beta

## Signierte Transaktionen (alle MAINNET)

| Schritt | Zeit (UTC) | Signatur | Explorer |
|---|---|---|---|
| 1. create-mint (Mint + ATA + Metadaten) | 2026-11-09T22:07:58Z | `2J5z9P4Apu4oDbTBZg6NvX5McL7x6fsGE2Kyq7jyeb2XeB44hzKvXbJhdZbYqfFwHcD494BD7ovagD1Anz8GWw4n` | https://explorer.solana.com/tx/2J5z9P4Apu4oDbTBZg6NvX5McL7x6fsGE2Kyq7jyeb2XeB44hzKvXbJhdZbYqfFwHcD494BD7ovagD1Anz8GWw4n?cluster=mainnet-beta |
| 2a. Emission community (81 %, 81.000.000.000.000 SIN) | 2026-11-09T22:09:49Z | `75NFP9CnH3V6A7X23CgEEBXMN3bn2E1uXBmVCiieS6mjqw9tzQi7RqZD2rDwMWAkk9iXWHS35TgLJofBicgFJz1` | https://explorer.solana.com/tx/75NFP9CnH3V6A7X23CgEEBXMN3bn2E1uXBmVCiieS6mjqw9tzQi7RqZD2rDwMWAkk9iXWHS35TgLJofBicgFJz1?cluster=mainnet-beta |
| 2b. Emission liquidity (10 %, 10.000.000.000.000 SIN) | 2026-11-09T22:09:50Z | `5KqN3KeFrRqch11Z7LWzMnNxhdHW5w2o3fL65RBwrXUpzgjivYG1V2rdLcnHuWhbtwcVcDvpEK9t8pYki1Sanwhb` | https://explorer.solana.com/tx/5KqN3KeFrRqch11Z7LWzMnNxhdHW5w2o3fL65RBwrXUpzgjivYG1V2rdLcnHuWhbtwcVcDvpEK9t8pYki1Sanwhb?cluster=mainnet-beta |
| 2c. Emission founder (5 %, 5.000.000.000.000 SIN) | 2026-11-09T22:09:51Z | `CZgWrgG9oNsC9Q6aMpfPS771EiDNrFwCA1v3fJS9yTGfmYFFS7Y8NaoqxCMdmds8kRNeSFokchwnP7qd7EotE4F` | https://explorer.solana.com/tx/CZgWrgG9oNsC9Q6aMpfPS771EiDNrFwCA1v3fJS9yTGfmYFFS7Y8NaoqxCMdmds8kRNeSFokchwnP7qd7EotE4F?cluster=mainnet-beta |
| 2d. Emission marketing (4 %, 4.000.000.000.000 SIN) | 2026-11-09T22:09:52Z | `2w64JnQJFsGTLty9b5F3NG5eGy8g8tXpmrtpLDGsw71f9FjmDmnWpJKaa7K3FFAMT8Gibn6ocFd5BYGJM8c6W5gk` | https://explorer.solana.com/tx/2w64JnQJFsGTLty9b5F3NG5eGy8g8tXpmrtpLDGsw71f9FjmDmnWpJKaa7K3FFAMT8Gibn6ocFd5BYGJM8c6W5gk?cluster=mainnet-beta |
| 3a. Mint-Vollmacht entzogen (SetAuthority → (none)) | 2026-11-09T23:38:55Z (Slot 467504907, finalized) | `2w7dM443eFGMpR7JbpUhvVKB643QYc8KjZ8qhotLA1GTLV3cmKtiqThYFV4xYWA9E625aGvanr8tTpPC9gPWKVJY` | https://explorer.solana.com/tx/2w7dM443eFGMpR7JbpUhvVKB643QYc8KjZ8qhotLA1GTLV3cmKtiqThYFV4xYWA9E625aGvanr8tTpPC9gPWKVJY?cluster=mainnet-beta |
| 3b. Freeze-Vollmacht entzogen (SetAuthority → (none)) | 2026-11-09T23:38:56Z (Slot 467504911, finalized) | `2qn9jSPUqEEcacFj6hkH1jFkxYXDk6Pj9o1WozpCH6k6TQf3ggxbLKcRdTKJCHT3DGa3XVa9RYGnSssr5xVi1Wzt` | https://explorer.solana.com/tx/2qn9jSPUqEEcacFj6hkH1jFkxYXDk6Pj9o1WozpCH6k6TQf3ggxbLKcRdTKJCHT3DGa3XVa9RYGnSssr5xVi1Wzt?cluster=mainnet-beta |

## Distribution (On-Chain-Salda)

| Anteil | Owner (Pubkey) | ATA | Live-Saldo (geprüft per RPC) |
|---|---|---|---|
| community 81 % | `FXw41HCwrYKGYXx4x76N5oGDkcs5Jp9KBuZfgaCi32mL` | `C4pr3GCk…jufBkC` | 90.000.000.000.000 SIN (community + founder + marketing) |
| liquidity 10 % | `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo` | `FD1WzT52…u7xqSW` | 10.000.000.000.000 SIN |
| founder 5 % | `FXw41HCw…` (gemeinsames ATA mit community/marketing) | — | — |
| marketing 4 % | `FXw41HCw…` (gemeinsames ATA mit community/founder) | — | — |
| Admin-ATA | `CP1h13eq5n7hB4bQdvP5Zb8nazXj3tmZyQKPszPnqoVX` | — | 0 SIN (vollständig verteilt) |

Summe: 100.000.000.000.000 SIN = 100 % der Gesamtmenge —
**Distribution zu 100 % abgeschlossen, keine Rest-Anteile**.

## Endzustand (On-Chain, geprüft per RPC im finality-Status)

- decimals = 5 ✅ · supply = 10^19 smallest units = 100 Billion SIN ✅
- mintAuthority = **(none)** · freezeAuthority = **(none)** —
  unwiderruflich entzogen, FINALIZED (Slots 467504907 / 467504911) ✅
- Metadaten On-Chain: Name/Symbol/URI exakt wie konfiguriert,
  isMutable=false, updateAuthority=(none) ✅
- Metadaten-URI live erreichbar (HTTP 200, incl. Image-Asset HTTP 200) ✅
- **FIXED-NO-FURTHER-ISSUANCE ist damit on-chain erfüllt: Niemand
  kann mehr SIN emittieren, keine Konten mehr sperrbar.**

## Sicherheitslage

- Signier-Key des Emissions-Admins (`token/wallets/main.json`,
  gitignoriert) wurde nach dem Entzug **lokal archiviert**
  (`main.json.archiviert`) — lokal reversibel, on-chain ist der
  Zustand irreversibel final.
- Alle Signaturen erfolgten ausschließlich mit dem lokal
  hinterlegten Key des Betreibers. Keine Seed-Phrase eines
  Drittanbieters, keine Schlüssel im Repo.
- On-Chain-Proof: die beiden `SetAuthority`-Transaktionen oben
  belegen den Zustand `mintAuthority = (none)`
  (beweisbar per Explorer-Links).

## Offene Restarbeiten (kein Mint-/Supply-Änderung mehr möglich)

- DEX-Pool (Raydium CLMM, SIN/WSOL): **LIVE (10.11.2026)** —
  Pool `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`
  (TX1 `NNkrfq…` + TX2 `3AU3rf…` finalisiert), Liquidität
  0,3 SOL, Budget 50 EUR
  eingehalten (Summe ~0,461 SOL ≈ 35,5 EUR). Details:
  `MORNING-HANDOVER-POOL.md` (Erfolgsbericht) +
  `MAINNET-LAUNCH-RUNBOOK.md` (Stand 04/04).
- Vesting (founder 5 % / marketing 4 %) als Folgeschritt nach
  Emission (im Emissions-Skript bewusst nicht enthalten).
- Rechtslage/Audit für den Startmarkt (siehe `MAINNET-CHECKLISTE.md`,
  Abschnitt 4).
