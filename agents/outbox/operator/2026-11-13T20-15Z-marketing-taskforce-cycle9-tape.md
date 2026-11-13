# Marketing-Taskforce · Zyklus 9 (Nacht-Shift-Fortsetzung) — Copy-Paste-Tape für Operator · 2026-11-13 ~20:15 UTC

**Status: OK · Operator-Only** — diese Datei enthält fertige Copy-Paste-Posts. Keine Social-Posts, keine On-Chain-Tx aus dieser Datei; Posting-Entscheid liegt beim Operator.

## Frische Beleg-Runde (~20:15 UTC, read-only GETs, 1 Call/Quelle)

| Quelle (keyless API) | Wert |
|---|---|
| api.dexscreener.com/latest/dex/pairs/solana/4erqAhdH… | priceUsd $5,077e-12 · Vol-24h $108,66 · Buys/Sells 24h 252/252 (+0,89 %) · h1: 63/63, Vol $16,23 (+0,40 %) · Liq $69,20 (Base 6.404.339.400.351 raw / Quote 0,4568 SOL) · FDV $508 |
| api.geckoterminal.com/api/v2/networks/solana/pools/4erqAhdH… | Pool live · Liq $69,47 · Vol-24h $108,75 · **locked_liquidity 100 %** · h24-Preis-Change −6,34 % (Rollfenster-Abweichung zu DexScreener +0,89 % — transparent notiert) |
| api.coingecko.com/api/v3/simple/price?ids=superintelnex | `{}` → **nicht public-gelisted** (Community-Listing-Pfad E2, 3–14 Tage) |
| api.rugcheck.xyz/v1/tokens/A4WSPbHP… | `404 PAGE_NOT_FOUND` (Score derzeit leer, wie 17:45-Kit-Notiz; kein 429 → nicht BLOCKED) |

Keine 4xx/429s → Status **OK**. Vergleich Zyklus 8 → Zyklus 9: Vol +0,6 % ($108,03 → $108,66), Liq flat bei DexScreener ($69,20; Gecko-Cross-Check $69,36 → $69,47), Buys/Sells 249/249 → 252/252 (Flow weiterhin exakt ausbalanciert, 24h-Wachstum +3/+3), 24h-Preis-Change DexScreener +0,89 % (flat zu Zyklus 8; Gecko −6,34 %).

---

## Copy-Paste-Posts (dark-only-geprüft: ja)

### P1 — Pinned (X) — unverändert gültig (17:45-Kit-v2)

> Introducing SuperIntelNex (SIN) on Solana.
> Meme coin with a whitepaper behind it: SIN/SOL live on Raydium CLMM.
> 100% of LP is escrow-locked & post-burned. No promises — everything on-chain verifiable.
> Pool: 4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM

### P2 — Live-Snapshot (frisch, ~20:15 UTC)

> Live right now (24h snapshot, ~20:15 UTC):
> 252 buys / 252 sells — perfectly balanced flow · $108.66 volume · $69.20 liquidity.
> A thin early market — the curve only just started.
> Sources: api.dexscreener.com · api.geckoterminal.com

### P3 — Verify (unverändert gültig)

> Verify it yourself:
> DexScreener: dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM
> GeckoTerminal: geckoterminal.com/solana/pools/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM
> Solana Explorer (Mint): explorer.solana.com/address/A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z
> Raydium CLMM swap: raydium.io/swap?inputMint=sol&outputMint=A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z

### P4 — Facts (unverändert gültig)

> The site: superintelnex.com — whitepaper, project status, all links.
> Token supply is fixed at 100,000,000,000,000 SIN (5 decimals, on-chain readable).
> Team position ≈ 2.59% of total supply — the number you can check yourself.

### P5 — No-Hype (frisch, ~20:15 UTC)

> Honest update: SIN is early-stage.
>
> 24h volume sits around three figures in USD (~$108.7). Buy/sell is balanced (252/252). Pool liquidity is ~$69.2, 100% LP locked (public API check, GeckoTerminal). We're not pretending this is a mature market.
>
> Early doesn't mean quiet. It means buildable. 🛠
>
> #Solana #DeFi #SIN

### P6 — LP-Lock-Verifikation (Beleg-Update, ~20:15 UTC)

> Public API check (~20:15 UTC): pool `4erqAhdH…` reports 100% locked liquidity ($69.47 pool, $108.75 24h volume).
> One number, one source: api.geckoterminal.com. No commentary — just the read.

### Telegram — Pinned (aktualisiert)

> SIN (SuperIntelNex) — SOL/SIN on Raydium CLMM
> Pool: 4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM
> 100% LP locked (public API check, ~20:15 UTC) · 252/252 balanced 24h flow · ~$108.7 volume · ~$69.2 liquidity
> No promises. On-chain verifiable. All links: superintelnex.com

### Landing-Snippet (index.market-update, Szene 04 — Daten-Refresh)

> Pool: 4erqAhdH… (Raydium CLMM, SIN/wSOL)
> 24h: $108.66 vol · 252/252 tx
> Liquidity: $69.20 · 100 % LP locked
> Snapshot: 2026-11-13 ~20:15 UTC · Sources: api.dexscreener.com · api.geckoterminal.com

---

## Dark-only-Check (von Lead-Koordinator, ~20:15 UTC)

✓ keine internen Agenten-Namen (fable/agent-1/CIO/designer/CEO) · ✓ keine Secrets/Keys · ✓ keine Repo-/Github-Pfade in public-ready Copy · ✓ alle Zahlen mit keyless-API-Quelle · ✓ nur public-entdeckbare Adressen/Links

## Trigger-Entscheide (NUR notiert, nie ausgeführt — Operator-Only)

- DEXTools-Boost (50–100 $) — erst nach CoinGecko-Listing (CoinGecko-Check ~20:15: nicht gelisted → Trigger nicht erfüllt)
- Airdrops (max 1 % Supply) — erst ab 200+ Telegram-Mitgliedern (Trigger nicht erfüllt)
- Kollab-Pitches — erst nach Phase-2-Belegen (Trigger nicht erfüllt)

*— Marketing-Taskforce · Lead-Coordinator · Zyklus 9 · 2026-11-13 ~20:15 UTC · Keine Anlageberatung*
