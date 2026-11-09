# Börsen-Listing (DEX + CEX) — SuperIntelNex SIN (token/)

Stand: 09.11.2026 · **kein Pool erstellt, kein CEX-Antrag gestellt,
kein Realgeld.** Dies ist der Fahrplan — keine Versprechen.

## Was "eine Börse" bei Solana-Tokenen heisst

Es gibt zwei völlig verschiedene Dinge, die beide "Listing" heissen:

| | DEX (Raydium/Orca/Meteora) | CEX (MEXC, BitMart, Gate.io …) |
|---|---|---|
| Wer entscheidet | **du selbst** (Pool anlegen) | die Börse (Antragsprozess) |
| Wann handelbar | ab ~1 Sek. nach Pool-Setup | nach Prüfung, oft Wochen |
| Kosten | Initial-Liquidität (SOL) + Fees | Listings-Gebühr (z. T. 5-stellig USD), kein Anspruch auf Listing |
| Delisting-Risiko | keiner (solange Liquidität da ist) | hoch (einsame, kurze Vorwarnzeit) |

**"Hosting auf einer Börse" im eigentlichen Sinne (CEX) ist kein
Tech-Schritt, sondern ein Dritt-Anbieter-Prozess. Keine Börse garantiert
ein Listing; alle behalten das Recht auf Delisting.**

## DEX-Pool (was wir vorbereitet haben)

- `token/scripts/create-raydium-pool.ts` — Dry-Run-Planer (sendet
  nichts): zeigt Pool-PDAs, Account-Plan und Kostengrenzen.
- `token/scripts/lib/raydium-clmm.ts` — PDA-Mathematik, byte-identisch
  mit dem offiziellen Raydium-SDK (6 Adressen x 2 Netze verifiziert,
  09.11.2026). **Alle PDA-Seed-Strings + Endianheit aus SDK-Quellcode.**
- Echtes Pool-Setup laeuft über **raydium.io → "Launch Pool"**
  (verifizierter Flow: createPool → openPositionFromLiquidity →
  addLiquidity). Ein hand-kompilierter CLI-Launch ist bewusst
  nicht implementiert (`SIN_DEX_SEND` fehlt absichtlich) — ein
  fehlerhafter manueller Flow verbrennt SOL.
- Voraussetzungen: Token-Mint existiert auf dem Netz, Liquiditäts-
  Wallet hat Initial-Liquidität (SOL) + SIN, AmmConfig-Index 0/1/2
  (Raydium-Standard; Index 0 ist der übliche Einstieg).
- Nach dem Pool: Token ist ab sofort auf Raydium/Orca + via
  Jupiter-Aggregator handelbar. Kein weiterer "Listing"-Schritt.

## CEX-Listing-Antrag (Falls der DEX-Volumen-Nachweis da ist)

Reihenfolge, die jede Börse von einem Team wie uns erwartet:

1. **DEX-Liquidität live** mit messbarem Volumen (Börsen fragen an).
2. **Tresor-Adressen offlegen** (wer hält den Supply-Anteil?) —
   bei uns: Emissions-Adressen aus `result/DISTRIBUTION.txt`.
3. **KYC des Teams** (Realt-Identität, Land, Steuer-Status).
   In DE/EU: Rechtslage für den konkreten Markt prüfen (MiCA/
   BaFin) — kein Rechtsstand in diesem Repo, keine Freigabe.
4. **Listing-Formular** pro Börse (MEXC/BitMart/Gate.io/CoinEx):
   Kontakt, Token-Parameter, Website/Whitepaper, Socials, Support-Kanal.
5. **Listing-Gebühr** (nicht an alle Börsen gleichzeitig überweisen;
   erst nach schriftlichem Angebot) + oft ein "minimum liquidity
   deposit" auf der Börse.
6. **Delisting-Risiko** offlegen (vorher ein zweiter CEX-Launch und
   DEX-Abdeckung als Sicherheitsnetz).

**Keine dieser Schritte ist ein Code-Schritt. Das Repo kann keinen
CEX-Antrag ersetzen.** Die Doku dient dem Abgleich am Starttag,
nicht als "geprüft von"-Angabe.
