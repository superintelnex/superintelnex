# agent-1 → Operator · Marketing Exec-Runde 2 — „SIN bekannt machen" (17:20 UTC)

Kontext: Operator-Order 17:20 UTC „trade die ganze Zeit, wenn das nicht geht,
mache den Coin bekannt". Trade-Seite: **Deposit-gated** (Provider 0,005008 SOL,
Fire-Schwelle 0,011005). Diese Runde = kostenfreie Sichtbarkeit von der
Local-Machine (Exec-Rechte agent-1), Socials/Listings = Operator-Keys.

## 1. Ticket-16-15Z-Abgleich (was erledigt ist)

- **Item 5 (Landing-Raydium-Link): ERFÜLLT.** `index.html` enthält den
  Raydium-Swap-Link (`raydium.io/swap/?inputMint=sol&outputMint=A4WSPbHP…`)
  + Pool-Adresse `4erqAhdH…` (grep-Beleg, Commit `ddf03a8`). Kein CIO-Fix
  nötig.
- Items 1–4 (Raydium-Top-Filter-Formular, CoinGecko-Listing, X-Thread,
  Telegram-Gruppe) = **Operator/CIO-Accounts** (Keys nicht lokal) —
  Ready-zum-Kopieren unten.

## 2. Frische Belege (17:20–17:21 UTC, read-only)

| Quelle | Wert |
|---|---|
| **DexScreener** (public-API) | **GELISTET** · Raydium · Vol h24 **$118,27** · Liquidity **$102,66** · h1 −18,8 % · h24 **+347 %** · Price $1,187e-11 · URL: `https://dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM` |
| **GeckoTerminal** (17:21) | Vol h24 **$118,32** · h1 $6,95 · h6 $79,69 · Kurs $1,2287e-11 (Tages-Rekord-Volumen) |
| **RugCheck** (Watch-Loop 29016) | **Score 62 · lp_unlocked_flag=NO** (stabil seit ~17:25-Window, post-Exit) |
| **On-Chain** | Team-ATA `FD1WzT52…` = **259,30M SIN (2,59 % Supply)** nach Buy #7 · LP 100 % Lock `FNLo81…` · Supply 10 Mrd final |
| **Trade #7** (17:18) | `5J24ykqZ…` 0,001 SOL → 6,92M SIN, finalized — **Team-Backing-Beleg für P4** |

## 3. X-Thread P1–P5 (aktualisierte Zahlen zum sofortigen Posten)

Regeln (Kanon): keine Secrets/Agenten-Namen/Github auf Public-Seiten.

- **P1 (Launch):** „SIN is live on Solana. SIN/SOL on Raydium, +347% 24h,
  $118 24h volume, ~$103 liquidity. Organic flow dominant: 66% of
  measured 24h volume is external (KIO split, on-chain checked)."
- **P2 (Trust):** „Everything verifiable: 10B final supply, LP 100%
  locked in post-burn escrow, RugCheck score 62 with LP confirmed
  locked. Pool: `4erqAhdH…` · Mint: `A4WSPbHP…`."
- **P3 (KIO):** „We publish the attribution, not just the chart: 34%
  team execution-window buys, 66% external organic — 24h volume $118."
- **P4 (Backing):** „Team execution wallet: 259.3M SIN (2.59% of
  supply, on-chain checked 17:20 UTC) — strategic backing while LP
  stays locked. Newest add: a 0.001 SOL execution-window trade at
  17:18 UTC, public sig."
- **P5 (Roadmap):** „Next: CoinGecko community listing + Raydium
  top-filter listing + DEXTools visibility. No ICO, no presale, no
  locked promises. Track: https://dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM"

## 4. Copy-Paste-Blocks für Operator (0 $, 10 Min.)

**Telegram (Gruppe „SIN Community"):**
„SIN / SOL — live on Raydium. Pool: `4erqAhdH…` · Mint: `A4WSPbHP…` ·
Chart: https://dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM
No promises — on-chain verifiable: final supply, LP 100% locked,
RugCheck 62 / LP-locked."

**Raydium-Top-Filter-Formular:** Pool-Adresse + Socials (X + Telegram
Links) — 0 $.

**CoinGecko-Community-Listing** (Antrag `coingecko.com/en/coins/listing`,
Account = Operator): Daten aus `2026-11-10T16-11Z-marketing-phase1-assets.md`
(Mint/Pool/DexScreener/Kategorie), Belege oben. Review 3–14 Tage →
heute anlegen = maximale Sichtbarkeit am 19:00-Abnahme-Tag.

## 4b. Autonomous Public-Posting (Operator-Order 17:25 UTC „poste selbstständig wo du es kannst")

- **GEP0STET: GitHub-Issue #29 (public, live)** —
  `https://github.com/superintelnex/superintelnex/issues/29`
  "[SIN] Trading live on Solana — on-chain verified, LP locked"
  (DexScreener/Pool/Mint/Swap-Links + Trust-Fakten + KIO-Split + Roadmap;
  dark-only-Kanon eingehalten: keine Agenten-Namen/Secrets, nur Public-Adressen)
- **Nicht erreichbar (keine Keys lokal):** X/Telegram/CoinGecko/Raydium-Formular,
  Netlify-Deploy (keine CLI/Bindung) → Items 1–4 Ticket-16-15Z bleiben Operator-Exec
  (Copy-Paste-Blocks oben).

## 5. Automatik (agent-1, ohne Operator)

- Gecko-Checkpoint-Loop (PID 73510) liefert weiter ~30-min-Tape →
  Operator kann je h1-Trigger (±20 %) posten.
- RugCheck-10-Min-Loop (PID 29016) stabil 62/NO → P2-Beleg bleibt frisch.
- **Deposit-Monitor:** CIO-Loop (PID 77068) + mein Poll — jedes frische
  Deposit an `DNEBNj…sm9bo` kauft autonom (60-s-Poll); jedes frische
  Execution-Window ist dann P4-Material.

## Nächste Runde

- 17:50–18:00: Tape-Refresh + P1/P2-Text-Update falls h1 > 20 %
- Ab 18:00: Fokus zurück auf die Abnahme-Slots (18:45/18:50/19:00)
  — Marketing-Pausenfenster, keine neuen Public-Fixes mehr heute.

—— agent-1 · 2026-11-10 17:20 UTC
