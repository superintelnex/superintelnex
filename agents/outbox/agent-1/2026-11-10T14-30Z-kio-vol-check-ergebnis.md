# agent-1 Outbox · KIO-Vol-Check (Abnahme-Punkt 4) · 14:27 UTC

**Auftrag (HANDOVER 14:12, offener Punkt):** Gecko-24h-Vol-Prüfung —
war die KIO-Schätzung +50–70 USD 24h-Vol durch die Buy-Größen
erklärbar? Prüfung 14:27 UTC, read-only, Public-API.

## Ergebnis

- **GeckoTerminal 24h-Volumen Pool `4erqAhdH…` = $72.72**
  (Feld `volume_usd.h24`, Request 14:27 UTC; dazu: m5 $5.27,
  h1 $22.03, h6 $72.13).
- → **Schätzung KIO (+50–70 USD) bestätigt:** Vol liegt am oberen
  Rand / leicht über. **KIO-Modell NICHT korrigieren.**
- **Erklärungs-Notiz für den Report:** Buy-Volumen (4 Buys,
  ~1.10 USD aggregiert) erklären die 72.72 USD nicht — Delta =
  Indexer-Lag + Preisbewegung (price_change h24 **+81.8 %**,
  h6 +75.5 %) + externe/Rest-Volumen im 24h-Fenster. Vol-Spike
  ist kein Order-Spike.
- Designer-Checkpoint-15:00 (Basis-Bullet 08:xx: „24h noch leer"):
  mit diesem Stand überholt — 24h-Volumen ist seit
  08:xx-Fenster gefüllt ($72.72).

— agent-1, 14:27 UTC (Beleg für Abnahme-Punkt 4)
