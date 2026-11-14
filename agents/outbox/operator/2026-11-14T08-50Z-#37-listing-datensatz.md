# Issue #37 — Listing-Datensatz CoinGecko & CMC · 08:50 UTC

**ENTWURF — Operator-Freigabe + Einreichung durch Operator (Formulare/Accounts gehören nur ihm).**
Dark-only-geprüft: ja. Alle Felder on-chain/API-belegt, keyless. Keine Kurs-/Profit-/Garantieaussagen.

## A. Core Data (beides Listings identisch)

| Feld | Wert |
|---|---|
| Name | SuperIntelNex |
| Symbol | SIN |
| Decimal | 5 |
| Chain | Solana |
| Contract (Mint) | `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z` |
| Total Supply | 100,000,000,000,000 (100 Billionen) — FIXED, Mint Authority null |
| Freeze Authority | null (on-chain entzogen) |
| Tax | 0 % Buy / 0 % Sell |
| Category | DeFi / Meme (Community-Utility) |
| DEX Pair | Raydium CLMM: `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM` (SIN/WSOL) |
| LP Status | 100 % gelockt (Raydium-Lock-Programm `LockrWmn6K5twhz3y9w1dQERbmgSaRkfnTeTKbpofwE`) |
| Explorer-Links | DexScreener: https://dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM · GeckoTerminal: https://www.geckoterminal.com/solana/pools/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM |
| Website | https://superintelnex.com (Whitepaper: https://superintelnex.com/whitepaper.html) |

## B. Short Description (EN, ≤300 Zeichen)

> SuperIntelNex (SIN) is a fixed-supply Solana token with mint and freeze authorities permanently revoked on-chain. It runs on a Raydium CLMM pool with 100% of liquidity locked in the Raydium lock program. All market data is published read-only via public keyless APIs — no guarantees, verify independently. DYOR.

## C. Long Description (EN, CoinGecko/CMC)

> SuperIntelNex (SIN) is a fixed-supply (100 trillion units, 5 decimals; 10¹⁴) community token on Solana. At launch, both the mint and freeze authorities were permanently revoked on-chain, making the supply immutable and the token un-freezable by design. SIN trades on a Raydium CLMM concentrated-liquidity pool (SIN/wSOL); 100% of the pool's liquidity is locked in the Raydium lock program. The team maintains a read-only market-research cadence — public keyless APIs (DexScreener, GeckoTerminal, Jupiter) — and publishes its own market data (volume, balanced flow, slippage curves) alongside every update. No price targets, no profit guarantees; all figures are independently verifiable. This is not investment advice. DYOR.

## D. Socials (nachdem Operator sie anlegt → zurückmelden, dann dieses Ticket aktualisieren)

- X/Twitter: `[offen]` · Telegram: `[offen]` · Website: `superintelnex.com`
- Hinweis: CoinGecko-Community-Listing = DexTools-Boost-Trigger (Campaign-Pfad `2026-11-14-campaign-known.md`); Status-Tracking läuft im 15-Min-Takt (NUR notiert, nie automatisch ausgeführt).

## E. Einreichungs-Sequenz (Empfehlung)

1. **CoinGecko-Community-Listing** (Formular im Listing-Tool): Daten A + B + C + Socials (Website reicht für den Start).
2. **CoinMarketCap-Community-Submission** (community.coinmarketcap): gleiche Daten, DEX-Link + Website.
3. **DEX-Tracker-Comments** (P6-Listing-Blurb aus Morning-Kit, Zyklus 20): DexScreener/GeckoTerminal-Kommentarbereich.
4. After-Listing: DexTools-Boost-Freigabe + P7–P9-Posts (Slippage-Proof-Kit).

**Zeitenrahmen (realistisch): 3–14 Tage Community-Review. Keine Garantie auf Freigabe.**

## Grenzen
Read-only. Keine Keys/Secrets. Public-Copy ohne interne Namen/Repo-Pfade. Trigger NUR notiert.
