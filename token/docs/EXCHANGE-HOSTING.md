# Börse „hosten" — DEX- vs. CEX-Listing (token/)

Stand: 09.11.2026 · **kein Pool erstellt, kein CEX-Antrag gestellt,
kein echtes Geld.** Das ist ein Fahrplan — keine Versprechen.

## „Börse" heißt bei Solana-Tokenen zwei ganz verschiedene Dinge

| | DEX (Raydium / Orca / Meteora, Jupiter) | CEX (MEXC, BitMart, Gate.io, …) |
|---|---|---|
| Wer entscheidet | **du selbst** (Pool anlegen) | die Börse (Antragsprozess) |
| Handelbar ab | ~1 Sekunde nach Pool-Setup | nach Prüfung, oft Wochen |
| Kosten | Initial-Liquidität (SOL) + Fees | Listing-Gebühr (oft 5-stellig USD), kein Anspruch |
| Delisting-Risiko | keiner (solange Liquidität da ist) | hoch, oft kurze Vorwarnzeit |

**„Auf einer Börse hosten" im eigentlichen Sinne (CEX) ist kein
Tech-Schritt, sondern ein Dritt-Anbieter-Prozess. Keine Börse
garantiert ein Listing; alle behalten das Recht auf Delisting.**

## Teil 1: DEX-Pool (das, was hier vorbereitet wurde)

- `scripts/create-raydium-pool.ts` — **Dry-Run-Planer** (sendet
  nichts): Existenzcheck des Mints auf dem Zielnetz, alle
  deterministischen Raydium-CLMM-Pool-PDAs, Account-Plan und
  Kostengrenzen.
- `scripts/lib/raydium-clmm.ts` — PDA-Mathematik, **byte-identisch
  mit dem offiziellen Raydium-SDK** verifiziert (6 Adressen ×
  Mainnet/Devnet; Seeds + Big-Endian-Kodierung aus dem SDK-Quellcode,
  09.11.2026). Ohne diese Grundvorraussetzung wäre jeder spätere
  manuelle Versuch ein SOL-Verbrenner.
- Echtes Pool-Setup läuft über **Raydium-UI → „Launch Pool"**
  (verifizierter Flow: `createPool` → `openPositionFromLiquidity` →
  Liquidität in). Ein hand-kompilierter CLI-Launch ist bewusst **nicht**
  implementiert (`SIN_DEX_SEND` fehlt absichtlich): ein fehlerhafter
  manueller Flow kostet echtes SOL.
- Voraussetzungen: SIN-Mint existiert im Zielnetz (Mainnet noch
  **nicht**), Liquiditäts-Wallet hat Initial-SOL + SIN, AmmConfig-Index
  0 (Raydium-Standard, auf Devnet vorhanden — on-chain geprüft).
- Nach dem Pool: der Token ist sofort auf Raydium, Orca und über den
  Jupiter-Aggregator handelbar. **Kein weiterer „Listing"-Schritt
  nötig** — der Pool *ist* das Listing.

**Budget-Fakt (09.11.2026):** Initial-Liquidität ist auf
**0,5 SOL** eingestellt (`dex.initialLiquiditySol`, 50-EUR-Rahmen).
Das ist ein sehr dünner Pool: wenig Tiefe, hohe Slippage — praktisch
nur zum Testen des Handelweges, nicht als ernsthafte Marktbekanntheit.

## Teil 2: CEX-Listing-Antrag (erst mit DEX-Volumen)

Abfolge, die jede Börse von einem Team erwartet:

1. **DEX-Liquidität live** mit messbarem Volumen (Börsen fragen an).
2. **Tresor-/Emissions-Adressen offlegen** (wer hält welchen
   Supply-Anteil?) — bei uns: die Emissions-Adressen aus
   `result/DISTRIBUTION.txt` (gitignoriert, säubern für die
   Veröffentlichung).
3. **KYC des Teams** (Rechtliches: Identität, Land, Steuerstatus).
   DE/EU: Rechtslage für den konkreten Markt (MiCA/BaFin) — kein
   Rechtsstand in diesem Repo, keine Freigabe.
4. **Listing-Formular** pro Börse: Kontakt, Token-Parameter
   (Mint, Supply, Decimals), Website/Whitepaper, Support-Kanal.
5. **Listing-Gebühr** erst nach schriftlichem Angebot zahlen;
   oft zusätzlich „Minimum Liquidity Deposit" bei der Börse.
6. **Delisting-Risiko einplanen**: vor einem CEX-Start eine zweite
   Börse und DEX-Abdeckung als Sicherheitsnetz haben.

**Kein Schritt davon ist ein Code-Schritt.** Dieses Repo kann den
CEX-Antrag nicht ersetzen; die Doku dient dem Abgleich am Starttag.
Keine „geprüft von"-Angaben, keine Kurs- oder Gewinnaussagen.
