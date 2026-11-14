# Read-only Trade-Plan — SIN/SOL (Raydium CLMM) · 2026-11-14 ~06:10 UTC

**Grenzen (Kanon):** Keine On-Chain-Tx aus diesem Dokument. Keine public-Copy-Änderungen (Taskforce-Zyklus macht das autonom). Keine Anlageberatung — reine Simulation auf Basis frischer keyless-Belege.

## 1. Frische Belege (06:10Z, keyless, 1 Call/Quelle)

| Quelle | Wert |
|---|---|
| DexScreener (HTTP 200) | Kurs **$7,508e-12** · Vol-24h **$119,79** · Vol-6h $0 [Fenster abgelaufen] · +60,32 % h24 · Liq **$82,21** · FDV $751 |
| GeckoTerminal (HTTP 200, teils null-Felder) | Preis **$7,4624e-12** · Reserves **$70,8217** · Vol-24h null [partial] · FDV $746,24 |
| On-Chain (night.jsonl bis 06:10:15Z) | tick **207767 stabil** (seit 21:47:56Z 13.11.), lückenlos, kein GAP/FLAP |

**NEUES MARKT-ERKENNUNGS-EREIGNIS (read-only notiert, NICHT public bearbeitet):**
Gecko-Reserve **$70,5584 (Zähler 87, 06:01Z) → $70,8217 (06:10Z) = +0,37 % RISE/DRIFT** (erste Bewegung nach der STAB-Serie; RÜCKFALL-Zyklus 79 bleibt bestätigt, kein neuer Rückfall). → Wird vom nächsten Taskforce-Zyklus (~06:24Z) in Content/Tape/Log überführt. Public-Rundung ≈$70,2/≈$70.2 (EN) = Zuständigkeit der Taskforce, nicht dieses Dokuments.

## 2. Marktfakten (Basis für Simulation)

- Pool: `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM` (Raydium CLMM, SIN/wSOL)
- Supply: 100,000,000,000,000 SIN (5 Dez., revokiert) → 1 SIN ≈ **$7,508e-12** (Dex) / $7,4624e-12 (Gecko)
- Gesamtliquidity: **$82,21 (Dex) / $70,82 (Gecko)** → Divergenz ≈$11,4 (bekannt, transparent)
- Vol-24h: **$119,79** · Flow 287/279 (nearly balanced) · +60,3 % h24 (Dex)
- 100 % LP locked · CG nicht gelisted · RugCheck 404-Dauerzustand (79+ Runden, bekannt, nicht blockierend)
- CLMM: tick 207767 seit 21:47:56Z (13.11.) fix → keine Kurvenbewegung seit ~8 h; P2-Tick-Verweis „211830" = STALE

## 3. Impact-Simulation (Buy/Sell, Größenstaffel)

CLMM konzentriert Liquidity um den aktiven Range — effektive In-Range-Liquidity L_eff ≤ $82.
Grobformel (erste Ordnung): **Impact ≈ Size / L_eff**. Range L_eff = $30–82 → Impact-Band:

| Order-Größe | SIN (bei $7,508e-12) | % Supply | Impact-Schätzung (Buy) |
|---|---|---|---|
| $1 | 1,33e11 | 0,13 % | **~1–3 %** (L_eff $82→$30) |
| $5 | 6,7e11 | 0,67 % | **~6–17 %** |
| $10 | 1,33e12 | 1,33 % | **~12–33 %** |
| $50 | 6,7e12 | 6,7 % | **~60–170 %** (nicht realisierbar) |

Sell-Symmetrie gilt spiegelbildlich. Dazu: Swap-Fee (Raydium CLMM typ. 0,25 %, pool-spezifisch verifizieren) + Network/Priority-Fee (~0,00001–0,0001 SOL, für $5+ vernachlässigbar, für $1 relevant) + Slippage-Deckel.

**Realistisch handhabbar: $1–10 je Tranche, gesamt $5–10** — darüber hinaus wird der Trade ein erheblicher Anteil der Tages-Volume ($119,79/24 h) und bewegt den Tick aus der 8-h-Stabilität (207767) → erzeugt selbst das GAP/FLAP, das der Nacht-Monitoring-Kanal eskalieren würde.

## 4. Ausführungs-Checkliste (falls Operator später real traded — JETZT NICHT)

1. **Tick-Read-Only-Verifikation vor Execution:** Solana-Explorer/Raydium: current tick = 207767? P2 „211830" bleibt STALE bis frischer Beleg (Operator-Verifikation, offener Punkt aus allen Zyklen 87+).
2. **Quote mit Aggregator (z. B. Jupiter):** echten Impact + Fee lesen; Slippage-Deckel: **$1–5 → 5 %**, darüber Quote-spezifisch.
3. **Sizing:** Tranchen $1–5, max. Gesamt-$10; Einzel-Blöcke ≥$50 vermeiden (Supply-Anteil >6 %).
4. **Timing:** außerhalb eigener Monitoring-Eskalations-Sensibilität notieren (Trade bewegt tick → night.jsonl-Signal).
5. **Regime-Check:** CIO-Trigger (Deposit ≥12e6) / Puffer-Fenster (11.005–12e6) unverändert = Fable-only, kein operatives Kapital bei CIO (Provider ~6,29–6,33e6) → realer Trade wäre Operator-Wallet-Manual, nicht CIO-Schiene.
6. **Post-Mortem:** Beleg-Snapshot (Quote, fill, tick-vor/nach) read-only an `agents/berichte/pool-snapshots/` anhängen (nur wenn Operator es freigibt — dark-only-Kanon).

## 5. Risiken

- **Haushöhe:** $82 Pool = jede $10-Tranche ≈ 12 %+ Impact; Early-Market-Charakter („thin early market" = konforme public-Wortung).
- **CLMM-Range:** außerhalb der aktiven Konzentration sinkt L_eff → Impact größer als Band-Unterkante.
- **Divergenz:** Dex ≈$82,2 vs Gecko ≈$70,8 = ≈$11,4 — Preis-Simulation zwischen den zwei Quellen je ±15 %.
- **Tick-Stabilität-Ende:** Trade selbst beendet die 207767-Plateau (8 h) → Monitoring-Signal + möglicher Eskalationspfad.
- **Score-Dauerzustand:** RugCheck 404 (leerer Score) — Sicherheits-Signale nur via 100 % LP-locked + revokierter Mint + Supply-Lesbarkeit.

## 6. Empfehlung (read-only, keine Anlageberatung)

- **Keine sofortige Ausführung** — CIO wartet, Puffer-Fenster nicht erreicht, tick-Plateau intakt.
- Falls Operator-Hand-Trade gewünscht: **$2–3 in 2 Trancen à $1–2** über Aggregator mit 5 %-Slippage, nach Tick-Verifikation (207767) und dokumentiert in `agents/berichte/`.
- Public-Copy bleibt untouched; das RISE-Event $70,8217 geht über den nächsten Taskforce-Zyklus (~06:24Z) ins Tape/Log.

*— Read-only Trade-Plan · Hauptsession · 2026-11-14 06:10 UTC · Keine Anlageberatung*
