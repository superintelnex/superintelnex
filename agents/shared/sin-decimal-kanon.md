# SIN-Dezimal-Kanon (verbindlich, on-chain verifiziert)

Stand: 2026-11-10 18:06 UTC · CIO · intern, public-free · Basis für alle
Agenten (inkl. agent-1 FillIn-Helper 18:53 + verify-pool).

## Kanon (4 unabhängige Quellen, eindeutiges Ergebnis)

| Quelle (Zeitpunkt) | Wert |
|---|---|
| `getTokenSupply` am SIN-Mint `A4WSPb…` (17:17 UTC, Public-RPC) | raw `10000000000000000000`, **decimals = 5** |
| `getAccountInfo` jsonParsed am Mint (17:17 UTC, confirmed) | `supply = 1e19 raw`, **decimals = 5**, isInitialized=true |
| `getTokenAccountBalance`/jsonParsed an jeder ATA (17:17 + 17:31 UTC, stabil) | API meldet **decimals = 5** |
| `token/config/token.json` (Betreiber-Kanon 09.11, main live) | `decimals: 5`, `totalSupply: 100000000000000` (1e14) + `decimalsNote`: u64-Obergrenze (1.84e19) erlaubt 1e14 UI-Tokens **maximal** mit 5 Dez. (raw-Supply = 1e19); mit 9 Dez. würde overflow → **5 Dez. technisch gebunden** |

**→ SIN hat 5 Decimals. Supply = 1e14 UI-SIN (100 Billion, deutsche Zählung).
Raw = UI-SIN × 100.000.**

## Die 10⁴-Fehlerquelle (Warum „M“-Labels alle 10⁴ zu klein)

18-stellige raw-Werte wurden in Memos/Checks durch **1e9** (SOL-Muster,
9 Dez.) statt 1e5 (5 Dez.) geteilt. Betroffen: alle absoluten „M“-Labels
(„258,61M“ „6,04M“ „6,92M“ „0,692M“ „3 Mrd“ „10-Mrd.-Supply“).
**%-Labels und Ratios sind UNBETROFFEN** (der Faktor kürzt sich) —
z. B. Team-ATA-Share 2,59 % Supply bleibt korrekt.

## Umrechnungstabelle (raw ↔ UI-SIN, 5 Dez.)

| Größe | raw | UI-SIN |
|---|---|---|
| Supply (100 Billion) | `10000000000000000000` (1e19) | `100000000000000` (1e14) |
| Team/Provider-ATA `FD1WzT52…` (18:06-Lesung) | `259304346191112734` | `2593043461911.12734` (≈2,593e12) |
| ATA-Anteil Supply | — | **2,593 %** |
| Pool SIN-Vault `4erqAhdH…` (Tx `5J24` pre, 17:17) | `370890646290686334` | `3708906462906.86334` (≈3,709e12) |
| Buy #7-Delta (Tx `5J24ykqZ…`) | `692030960693737` | `6920309606.93737` (≈6,92e9) |
| addLiquidity S1 B-Bedarf | `146239705598446461` | `1.4623971e12` |
| addLiquidity S2 B-Bedarf | `243732842664077435` | `2.4373284e12` |
| addLiquidity S3 B-Bedarf | `327498583876424442` | `3.2749858e12` |

## Funding-Kanon addLiquidity (SIN-seite, aus Provider-ATA `FD1WzT52…`)

| Szenario | B-Bedarf | ATA-Deckung | Ergebnis |
|---|---|---|---|
| S1 | 1,4624e12 UI-SIN | **177,3 %** | **selbst finanziert** (Headroom 1,131e12 UI-SIN) |
| S2 | 2,4373e12 UI-SIN | **106,4 %** | **selbst finanziert** (Headroom 1,557e11 UI-SIN) |
| S3 | 3,2750e12 UI-SIN | 79,2 % | GAP 6,819e11 UI-SIN → externer SIN-Input (oder Operator-SIN-Sendungen an die ATA) |

Externe SIN-Fixierung braucht **nur** die WSOL-seite (frisches SOL-Topup
→ WSOL-ATA `4eA5jc…` = 0 UI-SOL) + ~0,001 SOL Gas am Provider (S1/S2).

## DCA-Ziel-Kanon (Ticket #6, OPEN — Operator-Entscheidung 19:00)

- **Operator-Wortlaut** (15:49): „30 %-Supply-Hold = 3 Mrd SIN“ →
  DCA_TARGET raw `300000000000000` (3e14) = **3e9 UI-SIN** (wie Loop
  gesetzt).
- **Tatsächlicher Anteil** der on-chain-Supply (1e14 UI-SIN):
  **0,0030 %** — „3 Mrd“ stammt aus dem 10⁴-falschen „10-Mrd.-Supply“
  Frame. 30 % der **echten** Supply = **3e13 UI-SIN = raw
  `3000000000000000000000` (3e18)** — das übersteigt die gesamte
  ATA-Bestände-Welt um den Faktor 1000 und wäre ein DCA-Laufzeit-Jahr.
- **Bis Operator-Entscheidung (19:00):** Loop-Config unverändert
  (`HOLD_ON=0` = Buy-only, DCAF=0, Loop nicht feuert bei Provider
  0,005008 < Fire 0,011005 → Konfig aktuell inert).

## Belegkanon (read-only, keylos, Public-RPC + Repo)

- getTokenSupply/getAccountInfo/getTokenAccountBalance `A4WSPb…` /
  `FD1WzT52…` 17:17 + 17:31 UTC (3×, stabil); Tx `5J24ykqZ…`
  pre/postTokenBalances (17:17:32Z, Pool-Vault 3,709e12→3,702e12
  UI-SIN, ATA +6,92e9 UI-SIN).
- `token/config/token.json` (main, live).
- CIO-Recheck-ACK: `agents/inbox/agent-1/2026-11-10T18-06Z-cio-ack-
  sin-ata-recheck-dezimal-kanon.md`; §5-Korrektur:
  `agents/outbox/cio/2026-11-10T18-06Z-addliquidity-sektion5-kapital-
  korrektur.md`.
