# MORGEN-HANDOVER 10.11.2026 · Pool-Launch — LIVE (Erfolgsbericht)

Stand: **CLMM-Pool SIN/WSOL ist LIVE und finalisiert.** Beide
Mainnet-Transaktionen bestätigt (err: null), On-Chain-Verifikation
abgeschlossen, kein ausstehender Top-up. Die fruehere
0,765662-SOL-Top-up-Entscheidung (0,5-SOL-Plan) ist obsolet —
der Provider reichte aus.

## 1) Was on-chain steht (finalisiert, verifiziert)

| Was | Wert |
|---|---|
| Pool-PDA (CLMM, A=WSOL, B=SIN) | `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM` |
| TX1 createPool | `NNkrfqxBnFpsfQToiMEiKpBWKi6RXnLYmcEnyK8dhHxPn3cZuqhQeuqHaeMLN6LnB2yeHDLDR6oPnKt3QJ3Zggr` (10.11. 02:56 UTC) |
| TX2 openPositionV2 | `3AU3rfAFUjLAgDa3yZUgVzjAoD5PGL6Y47WZKxsrr8TSBpgLrQvBovRqj7zaGmzTF2VjqidMjM9y3oDxMYrLka1Z` (10.11. 07:18 UTC, Slot 467633557, err: null) |
| Position-NFT-Mint | `5pa8Wtzaaqr5DB16VDvcjJ9SrTxLqEKmHGDhDaxstyUX` |
| Liquidity (u128) | `20031261577933` |
| sqrtPriceX64 | `1065023265662834340099552` (= P0, unveraendert) |
| Ticks | 179280 … 259280 (start 219280, tickSpacing 10) |
| Vault WSOL (A) | `299984271` raw = 0,299984271 SOL |
| Vault SIN (B) | `999999999999963893` raw = 9.999.999,999963893 SIN |
| Provider nach TX2 | 0,095740 SOL; WSOL-ATA-Rest `15729` raw; SIN-ATA-Rest `36107` raw |

Die Provider-Reste bestaetigen die Depot-Arithmetik 1:1:
WSOL 300000000 − 299984271 = 15729; SIN 1e18 − 999999999999963893 = 36107.

## 2) Keine offene Entscheidung mehr

- **Kein Top-up noetig:** Bedarf 0,415457 SOL (Rest-Rent + 0,3 SOL
  Liquiditaet + Fees/Puffer 0,000105), Provider hielt 0,520944 SOL
  (inkl. kleiner Provider-Top-up 0,0158 SOL, Journal-Schritt
  `clmm.providerTopup`, 02:56 UTC). Die fruehere 0,215662-SOL-
  Top-up-Note (galt fuer den 0,5-SOL-Plan) entfaellt damit.
- **Revoke erledigt:** Mint- + Freeze-Vollmacht entzogen
  (Journal `revoke-mint-authority` / `revoke-freeze-authority`,
  09.11. 23:38 UTC) — Supply final, die LP-Position arbeitet
  unabhaengig davon weiter (Position-NFT + Ticks + Vault).
- **Idempotenz:** Journal-Eintrag `clmm.openPosition` +
  `result/POOL-ADDRESS.txt` als Retry-Schutz; ein zweites
  createPool ist ausgeschlossen (Pool-PDA existiert on-chain;
  Resume-Modus `SIN_RESUME_TX2=1` fuehrt TX1 ueber).

## 3) Root-Cause des Nacht-Bugs (kurz)

- Noch in der fruehen Nacht: PDA-Ordnung `token_mint_0 <
  token_mint_1` (Byte-Order) → mintA=WSOL, mintB=SIN; Ticks +174170…
  +254170 waren auf die falsche Mint-Reihenfolge gerechnet — korrekt
  179280…259280. TX1 lief danach sauber (Sim 51.771 CU → live OK).
- Heute Morgen: TX2-Feher „insufficient funds" (SPL-Token Custom 1) =
  fehlende **`SyncNative`-Instruction** in der WSOL-Wrap-Sequenz. Die
  in TX2 frisch angelegte WSOL-ATA (ATA-Create + System-Transfer)
  hatte on-chain `Token-Amount = 0` — erst `SyncNative` (SPL-Standard:
  create → transfer → **sync**) hebt die Lamports in den Token-Bestand.
  Fix in `launch-clmm-pool.ts` (`buildTx2`), Sim danach sauber:
  162.927 CU (Limit 1.000.000) bei der Send-Routine.

## 4) Budget-Abgleich (50-EUR-Kasten, 77 EUR/SOL)

- Mint + Metadaten + 4x ATA + Emission: ca. 0,030 SOL (~2,30 EUR)
- CLMM-Pool (Rent + 0,3 SOL Liquiditaet + Fees/Puffer): 0,415457 SOL
  (~32,00 EUR)
- Provider-Top-up: 0,0158 SOL (~1,20 EUR)
- **Summe ca. 0,461 SOL ≈ 35,5 EUR — innerhalb des 50-EUR-Rahmens.**

Keine Kurs-/Profit-Aussage: 0,3 SOL Liquiditaet = quote-seitiger
SOL-Anteil des ersten Pools, keine Wertbindung.

## 5) Links (vollstaendig in `result/POOL-ADDRESS.txt`)

- Raydium-Pool: https://app.raydium.io/pools/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM
- TX1: https://explorer.solana.com/tx/NNkrfqxBnFpsfQToiMEiKpBWKi6RXnLYmcEnyK8dhHxPn3cZuqhQeuqHaeMLN6LnB2yeHDLDR6oPnKt3QJ3Zggr
- TX2: https://explorer.solana.com/tx/3AU3rfAFUjLAgDa3yZUgVzjAoD5PGL6Y47WZKxsrr8TSBpgLrQvBovRqj7zaGmzTF2VjqidMjM9y3oDxMYrLka1Z

## 6) Ehrliche Notes + offene Nebensache

- Kein echtes Selbst-Aufwachen ueber den System-Schlaf (keine
  Self-Wake-Funktion); die 20s/1min-Background-Timer liefen als
  Proxy. Deshalb: On-Chain-Abschluss und dieser Bericht wurden in der
  Session fertig (TX2 07:18 UTC, wenige Minuten nach der 07:00-Note).
- Offene Nebensache (nicht kritisch, nicht blockierend):
  Metadaten-URI zeigt auf die GitHub-raw-URL der main-Branche
  (HTTP 200 verifiziert); der dauerhafte Spiegel (IPFS/Arweave) ist
  der post-Launch-Plan, siehe `METADATEN-SPEICHERUNG.md`.
