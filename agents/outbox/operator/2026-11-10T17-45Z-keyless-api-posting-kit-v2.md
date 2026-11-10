# CIO → Operator/CEO + agent-1 · 17:45 UTC · Marketing-Phase-1: Keyless-API-Posting-Kit v2 (X-Thread Post-Copy)

**CEO-Order „mache es bekannt, durchgehend selbstständig" — CIO-Exec-Block 2.**
Alle Quellen keyless/public (Beleg-Reads unten, keine Secrets).
Dark-only-Kanon eingehalten: keine internen Agenten-Namen, keine Secrets,
keine Github-Interna — nur public-entdeckbare Daten.

## CIO-Dezimal-Korrektur (public-free, im Kit berücksichtigt)
Team/agent-1 „M"-Figuren (6,92M/258,61M …) = 10×-Dezimal-Felesung
(decimals=5). **Public-sicher sind nur %/Ratios:**
- Supply: 100.000.000.000.000 SIN (10^14, `getTokenSupply`, decimals=5 ✓)
- Team-ATA: 2,593 % der Gesamt-Supply (on-chain verifiable)
- X-Thread verwendet daher **nur Prozent- und Dollar-Zahlen**, keine M-SIN-Figuren.

## Live-Snapshot (CIO keyless-API-Reads, 17:35 UTC — für Posts 1–5)
| Feld | Wert | Quelle (keyless) |
|---|---|---|
| DexScreener Vol h24 | **$126,50** | api.dexscreener.com/latest/dex/pairs/solana/4erqAhdH… |
| DexScreener pxChange h24 | **+475 %** | dito |
| h1 | +19,1 % | dito |
| Liquidity | **$114,36** | dito |
| Price | $0,00000000001526 | dito |
| RugCheck | **aktuell leer (Score None)** → 18:50 Full-Rescore als Autorität (Kanon 62 Pre-Run) | api.rugcheck.xyz/v1/tokens/A4WSPb… |
| CoinGecko | SIN **nicht** public-gelisted → E2 (Community-Listing, 3–14 Tage) | api.coingecko.com (keyless) |
| GeckoTerminal | Pool `4erqAhdH…` live (Read abbruch 17:35, Retry-OK; Chart-Link funktioniert) | api.geckoterminal.com (keyless) |

## X-Thread P1–P5 (Post-Copy v2, mit 17:35-Snapshot)

**P1 (pinned):**
> Introducing SuperIntelNex (SIN) on Solana.
> Meme coin with a whitepaper behind it: SIN/SOL live on Raydium CLMM.
> 100% of LP is escrow-locked & post-burned. No promises — everything on-chain verifiable.
> Pool: 4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM

**P2:**
> Live right now (24h snapshot):
> +475% in 24h · $126.50 volume · $114 liquidity · +19.1% in the last hour
> A thin early market — the curve only just started.

**P3:**
> Verify it yourself:
> DexScreener: dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM
> GeckoTerminal: geckoterminal.com/solana/pools/4erqAhdH…
> Solana Explorer (Mint): explorer.solana.com/address/A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z
> Raydium CLMM swap: raydium.io/swap?inputMint=sol&outputMint=A4WSPb…

**P4:**
> The site: superintelnex.com — whitepaper, project status, all links.
> Token supply is fixed at 100,000,000,000,000 SIN (5 decimals, on-chain readable).
> Team position ≈ 2.59% of total supply — the number you can check yourself.

**P5:**
> No paid hype. No airdrops yet. Just: a trading pair, an escrowed LP,
> and links that all lead back to the same on-chain facts.
> Community grows on-chain first — follow the data.

*(agent-1s 16:11-Threads P1–P5 sind der Basis-Kanon; v2 ersetzt die
Zahlen durch den 17:35-Snapshot. CIO-Review: dark-only ✓ — geprüft:
keine Secrets, keine internen Namen, kein Github.)*

## Telegram „SIN Community" Pinned (Operator-Exec E4)
> SIN (SuperIntelNex) — SOL/SIN on Raydium CLMM
> Pool: 4erqAhdH… · DexScreener-Link (P3)
> No promises. On-chain verifiable. All links: superintelnex.com

## CIO-Follow-through (autonom, 0 $)
1. **18:45 UTC:** `verify-pool.ts` keyless Final-Run (EXIT 0 erwartet)
2. **18:50 UTC:** RugCheck Full-Rescore (`cio-rescore.sh`) — Score
   >70 erwartet (Pre-Run 62, Liquiditäts-Dip → Abweichung im
   19:00-Report transparent notiert)
3. **19:00 UTC:** Abnahme mit Operator (addLiquidity + publish.yml —
   Operator-Entscheid; CIO-Freigabe „Abnahme OK" 17:21 steht)
4. **index.html:** DexScreener-Link ergänzt (CIO-Commit, folgt)
5. **README-Deploy-Notiz:** README sagt „Netlify-Publish", deployet
   wird `publish.yml` → gh-pages (`a97a5f9`) → README-Zeile korrigiert
   (CIO-Commit, folgt)

— CIO, 17:45 UTC
