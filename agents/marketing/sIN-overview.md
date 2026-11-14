# sIN Overview — SuperIntelNex (SIN)

> ENTWURF – Operator-Freigabe erforderlich. Keine Publikation ohne Express-Order.

## Was ist SIN?

SuperIntelNex (SIN) ist ein dezentraler Solana-Token an der Schnittstelle von Meme-Kultur, künstlicher Superintelligenz und autonomen digitalen Zahlungen (Positionierung laut `README.md`, `TOKENOMICS.md` und `whitepaper.html`). Das Projekt befindet sich in der aktiven Wachstumsphase — Pool-Launch auf Raydium CLMM am 2026-11-10, Whitepaper v1.1 live seit 2026-11-14.

## Token & Pool-Parameter

| Parameter | Wert |
|---|---|
| Chain | Solana Mainnet |
| Mint | `A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z` |
| Gesamtmenge | 100.000.000.000.000 SIN (10¹⁴) · Feste Supply |
| Dezimalstellen | 5 (u64-Hardware-Schutz) |
| Gebühren | 0 % (`sellerFeeBasisPoints = 0`) |
| Vollmachten | Unwiderruflich entzogen (`mint=null, freeze=null`) |
| DEX | Raydium CLMM (Concentrated-Liquidity Market Maker) |
| Pool | `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM` |
| Pool-Paar | SIN / wSOL |
| Tick-Arrays (live) | 178800, 259200 |
| Aktive Pool-Liquidity (raw) | 20.031.261.577.933 |
| Pool-Liquidity (USD, DexScreener) | ≈ $82.21 USD (100 % locked) |
| 24h-Volumen (DexScreener) | ≈ $119.79 USD (566 Txns: 287 Buys / 279 Sells) |
| 24h-Kursentwicklung | +60.32 % |

CLMM-Besonderheit: Die Liquidität ist in konzentrierten Tick-Bändern aktiv. Die lokale Swap-Simulation (`agents/research/pool-state.ts`) validiert Swaps direkt über die On-Chain-Tick-Arrays.

## Team- & Agenten-Setup

| Rolle | Funktion |
|---|---|
| CIO-Agent | Kapitalverwaltung, DCA-Orders, Überwachung der Trade-Schwelle |
| Fable-Agent (CEO) | Strategie, Research-Loops, Koordination, Event-Tapes |
| Designer-Agent | Marke, Whitepaper v1.1 Assets, Kommunikation |
| MCP-Server (`mcp-server/`) | Standardisierte Tool-Schnittstelle für externe KI-Agenten |

Research-Infrastruktur: `agents/research/pool-state.ts` (Deno, Read-Only), Research-Log `RESEARCH-SIN.log` im 300s-Takt.

## Legal-Status

- **Legal P5 = APPROVED** (internes Review-Stufenwerk, final bestanden)
- Ticket #6: Hold-Anforderung ≥ 30 % — aktuell ~97.6 % intakt (keine Verletzung)
- Positionierung gegenüber Publikum: **Keine Anlageberatung.** Alle Publikationen führen diesen Hinweis.

## Offizielle Links

- Website: https://superintelnex.com
- Whitepaper: https://superintelnex.com/whitepaper.html
- DexScreener: https://dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM

---
*SuperIntelNex Team · Legal P5 APPROVED · Keine Anlageberatung*
