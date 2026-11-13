# Web Copy Draft — SIN Market Update

> ENTWURF – Operator-Freigabe erforderlich. Keine Publikation ohne Express-Order.
>
> Ziel-Datei: `index.market-update.html` (Repo-Root). Datenbasis: research-snapshot.md (Nacht-Shift 2026-11-13).
> Passgenau zum bestehenden Seiten-Setup: bilinguale Basis (EN-Text + `data-de`-Attribut), 3 Szenen (Start / Vision / Status), Marktdaten-Aside.

## 1) Neue Szene: „SIN Market Update" (Szene 04, optional)

**Anschluss-Hinweis:** Seiten-Footer zeigt aktuell „01 / 03" — bei Szenen-Zusatz muss die Zähler-Logik im `<script>` angepasst werden (Operator/Dev). Entwurf bewusst schmal gehalten, damit die bestehende Seite unverändert bleibt, falls Szene 04 nicht eingeführt wird.

```html
<section class="scene" id="market" aria-labelledby="title-4" hidden>
  <p class="eyebrow" data-de="04 / SIN Market Update">04 / SIN market update</p>
  <h2 id="title-4" data-de="Der aktuelle Stand.">The current state.</h2>
  <p class="desc" data-de="Read-only-Marktdaten aus dem laufenden Research-Loop (300-Sekunden-Kadenz). Punktuelle Stände — keine Trendaussagen.">Read-only market data from our live research loop (300-second cadence). Point-in-time figures — no trend claims.</p>
  <dl class="market-stats" role="list">
    <div><dt data-de="24h Buys / Sells">24h buys / sells</dt><dd data-de="280 / 280 — ausbalanciert">280 / 280 — balanced flow</dd></div>
    <div><dt data-de="24h Volumen">24h volume</dt><dd data-de="≈ $113,8 (DexScreener; GeckoTerminal ≈ $113,7)">≈ $113.8 (DexScreener; GeckoTerminal ≈ $113.7)</dd></div>
    <div><dt data-de="Pool-Liquidity">Pool liquidity</dt><dd data-de="≈ $69,1 (Raydium CLMM, SIN/wSOL)">≈ $69.1 (Raydium CLMM, SIN/wSOL)</dd></div>
    <div><dt data-de="Preisänderung 24h">24h price change</dt><dd data-de="+0,69 % (DexScreener)">+0.69% (DexScreener)</dd></div>
  </dl>
  <p class="market-note" data-de="Stand: 13.11.2026, Nacht-Shift · Read-only-Quellen: DexScreener, Jupiter, Solana-RPC · Geringe Liquidität im SIN/SOL-Pool">As of 13 Nov 2026, night shift · Read-only sources: DexScreener, Jupiter, Solana RPC · Low liquidity in the SIN/SOL pool</p>
</section>
```

## 2) Aktualisierung bestehender Zeilen (Szene 01, Start)

- Zeile `market-note` (aktuell: „Solana · Low liquidity in the SIN/SOL pool") — bleibt korrekt, keine Änderung nötig.
- CTA-Span `SIN/SOL on Raydium` — korrekt, keine Änderung.

## 3) Footer-Disclaimer (Pflicht, falls Szene 04 eingebunden)

Der bestehende Footer-Note (`— Project in development, no investment advice`) deckt den Pflicht-Hinweis bereits ab. Zusätzlich empfohlen (optimal in Szene 04):

> `SuperIntelNex Team · No investment advice / Keine Anlageberatung`

## Anmerkungen für Operator

- **Werte sind starr** (13.11.2026 Nacht-Shift). Für eine live-updating Variante bräuchte man einen kleinen JS-Client-Side-Poll gegen die Public-APIs (DexScreener/Jupiter) — separat planen, nicht Teil dieses Entwurfs (kein Code in der Taskforce).
- Wortwahl konsistent mit bestehender Seite: „Im Aufbau", „Reiner Testwert", „keine Anlageberatung".
- Keine Pump-Sprache, keine Preissuggestion — nur die 4 Datenpunkte + Quellen-Nennung.
- Bei Freigabe: Dev-Operator passt Szenen-Nav + Zähler (01–04) im `<script>`-Block an (aktuell hart auf 3 Szenen).
- Dark-only-Remediation (Zyklus 10, ~20:15 UTC): Szene-04-Datenwerte + Footer-Signatur aktualisiert (256/256 per GeckoTerminal, Vol ≈ $109,5, Liq ≈ $69,3, +1,01 % DexScreener); „Legal P5 APPROVED"-Wortung aus Footer-Empfehlung entfernt → neutrale Signatur.
- Daten-Refresh (Zyklus 11, ~20:21 UTC): Szene-04-Datenwerte aktualisiert (262/262, Vol ≈ $110,6, Liq ≈ $69,1, +0,79 % DexScreener; Vol-Cross-Check Gecko ≈ $110,7) — dark-only-geprüft: ja.
- Daten-Refresh (Zyklus 12, ~20:24 UTC): Szene-04-Datenwerte aktualisiert (262/262 per GeckoTerminal — DexScreener meldete diese Runde keine Tx-Zahlen, transparent notiert; Vol ≈ $111,0 (Dex) / ≈ $110,7 (Gecko), Liq ≈ $69,1, +0,79 % DexScreener) — dark-only-geprüft: ja.
- Daten-Refresh (Zyklus 13, ~20:28 UTC): Szene-04-Datenwerte aktualisiert (269/269 bei beiden Quellen — DexScreener meldete diese Runde wieder vollständige Tx-Zahlen, Zyklus-12-Anomalie aufgelöst; Vol ≈ $111,9 (Dex) / ≈ $112,0 (Gecko), Liq ≈ $69,3, +0,97 % DexScreener / −6,27 % Gecko (Rollfenster-Abweichung transparent notiert)) — dark-only-geprüft: ja.
- Daten-Refresh (Zyklus 14, ~20:31 UTC): Szene-04-Datenwerte aktualisiert (273/273 bei beiden Quellen; Vol ≈ $112,6 (Dex) / ≈ $112,7 (Gecko), Liq ≈ $69,2 (Dex) / ≈ $69,3 (Gecko), +0,92 % DexScreener / −6,28 % Gecko (Rollfenster-Abweichung transparent notiert)) — dark-only-geprüft: ja.
- Daten-Refresh (Zyklus 15, ~20:35 UTC): Szene-04-Datenwerte aktualisiert (277/277 bei beiden Quellen; Vol ≈ $113,3 (Dex) / ≈ $113,4 (Gecko), Liq ≈ $69,1 (Dex) / ≈ $69,2 (Gecko), +0,69 % DexScreener / −6,34 % Gecko (Rollfenster-Abweichung transparent notiert)) — dark-only-geprüft: ja.
- Daten-Refresh (Zyklus 16, ~20:37 UTC): Szene-04-Datenwerte aktualisiert (280/280 per DexScreener, Gecko meldet 279/279 — 1-Tx-Rollfenster-Abweichung transparent notiert; Vol ≈ $113,8 (Dex) / ≈ $113,7 (Gecko), Liq ≈ $69,1 (Dex) / ≈ $69,1 (Gecko), +0,69 % DexScreener / −6,40 % Gecko (Rollfenster-Abweichung transparent notiert)) — dark-only-geprüft: ja.
- Daten-Refresh (Zyklus 19, Lead-Run, Beleg-Runde ~20:40 UTC / Content-Phase ~20:41 UTC): Szene-04-Datenwerte unverändert gegenüber Zyklus 18 (mein Beleg: 279/279 per GeckoTerminal — DexScreener `transactions: null` diese Runde, Anomalie wie Zyklus 10/12; paralleler Zyklus-18-Lauf meldete 280/280 per Gecko h24, m5 0/0 Stille im Flow → Public-Wert 280/280 bestätigt) · Vol ≈ $113,8 (Dex) / ≈ $113,9 (Gecko) · Liq ≈ $69,1 (Dex) / ≈ $69,1 (Gecko, 100 % LP locked) · +0,69 % DexScreener / −6,40 % Gecko (mein Beleg; Rollfenster-Drift transparent notiert) — kein Änderungsbedarf, dark-only-geprüft: ja.
- Daten-Refresh (Zyklus 18, ~20:41 UTC): Szene-04-Datenwerte unverändert gegenüber Zyklus 17 (280/280 per DexScreener; Gecko meldet 280/280 per h24 — Rollfenster-Abgleich, h6 280/279 · Vol ≈ $113,8 (Dex) / ≈ $113,9 (Gecko), Liq ≈ $69,1 (Dex) / ≈ $69,1 (Gecko), +0,69 % DexScreener / −6,64 % Gecko (Rollfenster-Drift transparent notiert)) — Stille im Flow, kein Änderungsbedarf, dark-only-geprüft: ja.
- Daten-Refresh (Zyklus 17, ~20:41 UTC): Szene-04-Datenwerte unverändert gegenüber Zyklus 16 (280/280 per DexScreener, Gecko meldet 279/279 — 1-Tx-Rollfenster-Abweichung transparent notiert; Vol ≈ $113,8 (Dex) / ≈ $113,7 (Gecko), Liq ≈ $69,1 (Dex) / ≈ $69,1 (Gecko), +0,69 % DexScreener / −6,40 % Gecko) — Stille im Flow, kein Änderungsbedarf, dark-only-geprüft: ja.

---
*SuperIntelNex Team · No investment advice · Keine Anlageberatung*
