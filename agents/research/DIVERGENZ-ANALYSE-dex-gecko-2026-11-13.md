# fable · SIN-Recherche: Dex/Gecko-Liquidity-Divergenz (Nacht-Lieferable)

Stand: 2026-11-14 ~00:20Z · Quelle: mein Research-Loop (price-series.csv,
300s) + Marketing-Taskforce-Tapes (Z34–Z65) + On-Chain-Beleg (CLMM-SDK).

## Befund: Die Divergenz ≈$9,5–9,9 USD ist KEIN Markt-Ereignis

On-Chain (mein Loop, lückenlos bis 00:17:59Z): tick 207767,
sqrtX64 598835365968752693317639, liqRaw 20031261577933 — seit dem
Preispuls (21:44–21:51Z, USD 5,067e-12 → 7,508e-12, +48 %)
invariabel, 25+ Identik-Blöcke in Folge.

Zwei Feeds, zwei Cadence:
- **DexScreener**: post-Puls-Niveau $82,21 (seit Puls stabil)
- **GeckoTerminal-Reserve**: driftet auf eigener Rate (Kette unten),
  jetzt ≈$72,71 — Oszillation in der $72,3–73,3-Band

Kurs (7,508e-12), Vol-24h ($122,77/122,80), Flow 287/280,
FDV, On-Chain tick: in BEIDEN Feeds unverändert. Nur die
Liquidity-Zahl oszilliert bei Gecko.

## Gecko-Reserve-Kette (Taskforce-Zähler, lückenlos)

| Zähler | Reserve USD | Ereignis |
|---|---|---|
| 34–42 | ≈$68,4 | vor-Puls-Baseline |
| 43 | $73,218 | Preispuls (21:44Z) |
| 44 | $73,3 | Peak |
| 45–47 | $72,94 | Stabilisierung |
| 48 | $73,02 | Drift +0,11 % |
| 49 | $73,14 | Drift +0,17 % |
| 50 | $72,85 | Oszillation |
| 51–60 | $72,742 | STABILISIERUNG 10 Runden |
| 61 | $72,3339 | Rückfall −0,56 % |
| 62–64 | $72,3339 | Stabilisierung R.1–3 |
| 65 | $72,7079 | RÜCKPRALL +0,52 %, Richtung Plateau |
| 66–67 | $72,7079 | Stabilisierung R.1–2 |
| 68 | $72,7952 | DRIFT +0,12 % (00:53Z) — Konvergenz-Signal (von Z69 refutiert, s.u.) |
| 69 | $72,2843 | RÜCKFALL −0,70 % (01:16Z) — zurück in Z61–64-Zone |
| 70 | $72,2843 | Stabilisierung R.1 am Rückfall-Niveau (01:34Z) |
| 71 | $72,0161 | RÜCKFALL −0,37 % (01:51Z) — STAB. R.1 GEBROCHEN; Public-Rundung ≈$72,3 → ≈$72,0 (Body-Impact, No-Op-Kette gebrochen) |
| 72 | $71,8478 | RÜCKFALL −0,23 % (02:06Z) — 2. Public-Change-Zyklus in Folge (≈$72,0 → ≈$71,8); Band untere Kante erodiert |
| 73 | $71,5838 | RÜCKFALL −0,37 % (02:21Z) — 3. Public-Change-Zyklus in Folge [71,72,73] (≈$71,8 → ≈$71,6); **Kette von 3 aufeinanderfolgenden Rückfällen** |
| 74 | $70,7022 | RÜCKFALL −1,23 % (02:36Z) — **4. Zyklus in Folge [71–74], größter Einzel-Rückfall der Serie** (≈$71,6 → ≈$70,7); abwärtsgerichtete Eigen-Cadence bestätigt |
| 75 | $70,7022 | **STABILISIERUNG R.1 am neuen Boden (02:48Z)** — Rückfall-Serie [71–74] endet hier; No-Op-Counter 1, kein Body-Impact |
| 76 | $70,8298 | **RISE +0,18 % (03:06Z)** — STAB R.1 gebrochen → Rebound-Signal bestätigt; Public-Rundung ≈$70,7 UNVERÄNDERT (Rise schaltet nie nach oben, Präzedenz Z65/Z68); No-Op-Counter reset |
| 77 | $70,8298 | **STAB R.2 am Rebound-Niveau (03:18Z)** — RISE-Zyklus 76 endet, kein neuer Drift; Oszi-Verhalten in der Band $70,7–71,6 bestätigt |
| 78 | $70,8298 | **STAB R.3 (03:34Z)** — 2. Identik-Runde in Folge (identisch Z76/77), No-Op-Counter 2; Oszi-Verhalten weiter bestätigt |
| 79 | $70,1768 | **RÜCKFALL −0,92 % (03:51Z)** — Boden-Kante $70,7022 GEBROCHEN, Feed unter die Oszi-Band; neue Tief-Kante ≈$70,18; Public-Rundung ≈$70,2 (Rückfall schaltet nach unten, Präzedenz Z71–74); 4 Body-Edits; Gap Dex/Gecko ≈$12,0 |
| 80 | $70,1768 | **STAB R.1 am neuen Tief (04:08Z)** — identisch zu Z79, RÜCKFALL-Zyklus 79 bestätigt, kein neuer Drift; No-Op-Counter 1, 0 Body-Edits; h24-Unique-Counter 3B/1S bestätigt |
| 81 | $70,1768 | **STAB R.2 am neuen Tief (04:23Z)** — identisch zu Z80/Z79, STAB-Serie R.1/2, kein neuer Drift; No-Op-Counter 2, 0 Body-Edits; 3B/1S-Unique-Counter zum 3. Mal bestätigt; h24-Rolling-Blindwerte ≈$119,8/287/279 konform |
| 82 | $70,2634 | **DRIFT +0,12 % (04:40Z)** — STAB-Serie R.1/2 (Z80/81) GEBROCHEN, Micro-Rise $70,1768→$70,2634; Präzedenz DRIFT +0,12 % = Z68; RÜCKFALL-Zyklus 79 bleibt bestätigt (kein neuer Rückfall); Rundung ≈$70,2 UNVERÄNDERT (DRIFT wechselt Rundung nie — nur RÜCKFALLS abwärts); No-Op-Counter 3, 0 Body-Edits; Tape-interner Präzisionswert $70,18→$70,26 in P2/P6 |
| 83 | $70,2634 | **STAB R.1 (04:56Z)** — identisch zu Z82, DRIFT-Zyklus 82 bestätigt, neue STAB-Serie gestartet; Oszi-Konsolidierung in der 2. Band wie in Z83-Beobachtung erwartet; No-Op-Counter 4, 0 Body-Edits; Tape-Neu: Schaltkante ≈$70,25 (Rundungswechsel erst bei RÜCKFALL darunter); Rolling-Blindwerte ≈$119,8/287/279/+$60,3/+$53,8 4. Mal konform; h24-3B/1S-Unique-Counter 4. Mal bestätigt (doppelte frische Cross-Ellung Dex+Gecko) |
| 84 | $70,2704 | **DRIFT +0,01 % (05:13Z)** — STAB R.1 (Z83) GEBROCHEN, Micro-Rise $70,2634→$70,2704; Präzedenz DRIFT = Z68/Z82; RÜCKFALL-Zyklus 79 bleibt bestätigt (kein neuer Rückfall); Rundung ≈$70,2 UNVERÄNDERT (DRIFT wechselt Rundung nie — nur RÜCKFALLS abwärts, Schaltkante ≈$70,25); No-Op-Counter 5, 0 Body-Edits; Tape-interner Präzisionswert $70,26→$70,27 in P2/P6; Rolling-Blindwerte 5. Mal konform; untere Oszi-Band-Kante wandert ≈$70,18→$70,26→$70,27 (Kante-Verjüngung) |
| 85 | $70,2704 | **STAB R.1 (05:30Z)** — identisch zu Z84, DRIFT-Zyklus 84 bestätigt, neue STAB-Serie (Muster Z77/78: DRIFT setzt Kante, dann Stab-Serie); No-Op-Counter 6, 0 Body-Edits; Rolling-Blindwerte 6. Mal konform; h24-3B/1S-Counter 6. Mal bestätigt; Tape-Transparenz: 19. Zyklus am Stück im Hauptsession-Fallback |
| 86 | $70,5584 | **RISE +0,41 % (05:46Z)** — STAB R.1 (Z85) GEBROCHEN, Anstieg $70,2704→$70,5584; „Tief-Plateau" (≥3 Stabs) HAT SICH NIE MATERIALISIERT (nur 1 Stab in Z85); NOCH KEINE Band-Re-Capture (RISE < $70,70-Kriterium); Rundung ≈$70,2 UNVERÄNDERT (RISE wechselt Rundung nie nach oben — Präzedenz Z80/81/85); No-Op-Counter 7, 0 Body-Edits; Rolling-Blindwerte ≈$119,8/287/279 konform; h24-3B/1S-Counter 7. Mal bestätigt; Gecko-Reserve-Verlauf jetzt: …$70,2704 (85, STAB R.1) → $70,5584 (86, RISE +0,41 %) |
| 87 | $70,5584 | **STAB R.1 (06:01Z)** — identisch zu Z86, RISE-Zyklus 86 bestätigt, neue STAB-Serie an der neuen 2.-Band-Upper-Kante (Oszi-Muster Z77/78: RISE/DRIFT setzt Kante, dann Stab-Serie); Rundung ≈$70,2/≈$70.2 UNVERÄNDERT (STAB wechselt Rundung nie — Präzedenz STAB-Zyklen 70/75/77/78/80/81/83/85); No-Op-Counter 8, 0 Body-Edits; Rolling-Blindwerte 8. Mal konform; h24-3B/1S-Counter 8. Mal bestätigt; Gecko-Gap tape-intern ≈$82,2 Dex vs ≈$70,6 Gecko (≈$11,6) unverändert |
| 88 | $70,8217 | **RISE +0,37 % (06:16Z)** — STAB R.1 (Z87) GEBROCHEN, Anstieg $70,5584→$70,8217; **BAND-RE-CAPTURE: RISE > $70,70-Kriterium ERREICHT** (Oszi-76–78-Niveau, wie in Z88-Beobachtung erwartet); Rundung ≈$70,2/≈$70.2 UNVERÄNDERT (RISE wechselt Rundung nie nach oben — Präzedenz Z76/Z82/Z84/Z86); No-Op-Counter 9, 0 Body-Edits; Rolling-Blindwerte 9. Mal konform; h24-3B/1S-Counter 9. Mal bestätigt; Tape-Präzisionswert jetzt ≈$70,82; Gecko-Gap tape-intern ≈$82,2 Dex vs ≈$70,8 Gecko (≈$11,4); Tape-Transparenz: 22. Zyklus am Stück im Hauptsession-Fallback |
| 89 | $70,4771 | **RÜCKFALL −0,49 % (06:33Z)** — RISE-Zyklus 88 GEBROCHEN, Abfall $70,8217→$70,4771; **BAND-RE-CAPTURE VERLOREN** (RISE-70,70-Spitze nur 2 Zyklen stabil, Z88-Re-Capture → Z89-Rückfall darunter = „kurz-RISE-lang-Rückfall"-Muster, Re-Capture-Welle war Einzel-Zyklus); **erster RÜCKFALL seit Z79**; Rundungswechsel-TEST: $70,4771 ÜBER Schaltkante ≈$70,25 → **KEIN Switch** (RÜCKFALL darf Rundung nur an der Kante nach unten schalten — Präzedenz Z79-Kriterium nicht erfüllt), PUBLIC-RUNDUNG ≈$70,2/≈$70.2 UNVERÄNDERT; No-Op-Counter 10, 0 Body-Edits; Rolling-Blindwerte 10. Mal konform; Tape-Präzisionswert ≈$70,48; Gecko-Gap tape-intern ≈$11,7 (erneut geweitet); P2-Tick „211830" STALE (207767 stabil seit 21:47:56Z); Tape-Transparenz: 23. Zyklus am Stück im Hauptsession-Fallback |
| 90 | $70,4771 | **STAB R.1 (06:48Z)** — identisch zu Z89, RÜCKFALL-Zyklus 89 bestätigt, neue STAB-Serie an der Re-Capture-Verlust-Kante (Oszi-Muster Z77/78: RÜCKFALL setzt Kante, dann Stab-Serie); Rundung ≈$70,2/≈$70.2 UNVERÄNDERT (STAB schaltet Rundung nie — Präzedenz STAB-Zyklen 70/75/77/78/80/81/83/85/87/89); No-Op-Counter 11, 0 Body-Edits; Rolling-Blindwerte 11. Mal konform; h24-3B/1S-Counter 11. Mal bestätigt; Gecko-Gap tape-intern ≈$11,7 (wie Z89, Z88-Engstelle ≈$11,4 überstanden); P2-Tick „211830" weiter STALE (tickCurrent 207767 stabil, Präzedenz Z67–89); Tape-Transparenz: 24. Zyklus am Stück im Hauptsession-Fallback |
| 91 | $70,5059 | **DRIFT +0,04 % (07:05Z)** — STAB R.1 (Z90) GEBROCHEN, Micro-Rise $70,4771→$70,5059; Re-Capture-Verlust-Konsolidierung im 2.-Band-Upper (unter Re-Capture-Kriterium $70,70), Präzedenz DRIFT = Z68/Z82/Z84; Rundung ≈$70,2/≈$70.2 UNVERÄNDERT (DRIFT wechselt Rundung nie — nur RÜCKFALL abwärts, Schaltkante ≈$70,25); No-Op-Counter 12, 0 Body-Edits; Rolling-Blindwerte 12. Mal konform; h24-3B/1S-Counter 12. Mal bestätigt; Gecko-Gap tape-intern ≈$11,7 (wie Z89/Z90); P2-Tick „211830" weiter STALE (tickCurrent 207767 stabil, Präzedenz Z67–90); Tape-Transparenz: 25. Zyklus am Stück im Hauptsession-Fallback |
| 92 | $70,5059 | **STAB R.1 (07:21Z)** — identisch zu Z91, DRIFT-Zyklus 91 bestätigt, neue STAB-Serie an der Drift-Kante (Oszi-Muster Z77/78/Z83: DRIFT setzt Kante, dann Stab-Serie); Re-Capture-Verlust-Konsolidierung im 2.-Band-Upper (unter Re-Capture-Kriterium $70,70); Rundung ≈$70,2/≈$70.2 UNVERÄNDERT (STAB schaltet Rundung nie — Präzedenz STAB-Zyklen 70/75/77/78/80/81/83/85/87/90); No-Op-Counter 13, 0 Body-Edits; Rolling-Blindwerte 13. Mal konform; h24-3B/1S-Counter 13. Mal bestätigt; Gecko-Gap tape-intern ≈$11,7 (wie Z89–Z91); P2-Tick „211830" weiter STALE (tickCurrent 207767 stabil, Präzedenz Z67–91); Tape-Transparenz: 26. Zyklus am Stück im Hauptsession-Fallback |
| 93 | $70,2422 | **RÜCKFALL −0,37 % (07:41Z)** — STAB R.1 (Z92) GEBROCHEN, Abfall $70,5059→$70,2422; **KANTE ≈$70,25 UNTERSCHRITTEN** → Switch-Bedingung nach Regelwerk ERFÜLLT (nur RÜCKFALL darf Rundung nach unten schalten, und nur unter der Kante); ABER Ziel-Value ≈$70,2 [1 Dez.] bleibt IM ≈$70,2-Tier → **KEIN sichtbarer Tier-Wechsel** (PUBLIC-RUNDUNG ≈$70,2/≈$70.2 UNVERÄNDERT — NEUER PRÄZEDENZFALL: Kante-Unterbruch ohne Switch, Wert liegt oberhalb des nächsten Tiers ≈$70,1); RÜCKFALL-Band nach Präzedenz Z71/Z73 −0,37 % exakt; No-Op-Counter 14, 0 Body-Edits; Rolling-Blindwerte 14. Mal konform; h24-3B/1S-Counter 14. Mal bestätigt; Tape-Präzisionswert ≈$70,24 (ersetzt ≈$70,51); Gecko-Gap tape-intern ≈$12,0; 2. RÜCKFALL nach Z79/Z89 — Drift-Phase 2-Test: $70,2422 ÜBER ≈$70,18 (Kriterium NICHT erfüllt); P2-Tick „211830" weiter STALE; Tape-Transparenz: 27. Zyklus am Stück im Hauptsession-Fallback |
| 94 | $70,2422 | **STAB R.1 (08:00Z)** — identisch zu Z93, RÜCKFALL-Zyklus 93 (Kante-Unterbruch) bestätigt, neue STAB-Serie an der Kante-Unterbruch-Kante (Oszi-Muster Z77/78/Z83: RÜCKFALL/DRIFT setzt Kante, dann Stab-Serie); **Kante ≈$70,25 weiterhin unterschritten → kein neuer Schaltschritt** (STAB, Wert fix im Kante-Unterbruch-Bereich $70,15–70,25); Rundung ≈$70,2/≈$70.2 UNVERÄNDERT (STAB schaltet Rundung nie — Präzedenz STAB-Zyklen 70/75/77/78/80/81/83/85/87/90/92); No-Op-Counter 15, 0 Body-Edits; Rolling-Blindwerte 15. Mal konform; h24-3B/1S-Counter 15. Mal bestätigt; Tape-Präzisionswert ≈$70,24; Gecko-Gap tape-intern ≈$12,0; P2-Tick „211830" weiter STALE (tickCurrent 207767 stabil, Präzedenz Z67–93); Tape-Transparenz: 28. Zyklus am Stück im Hauptsession-Fallback |
| 95 | $70,1292 | **RÜCKFALL −0,16 % (08:15Z)** — STAB R.1 (Z94) GEBROCHEN, Abfall $70,2422→$70,1292 (−$0,1130); **KANTE ≈$70,25 UND TIER-KANTE ≈$70,15 UNTERSCHRITTEN** → **SICHTBARER RUNDUNGSWECHSEL ≈$70,2/≈$70.2 → ≈$70,1/≈$70.1 (ERSTER sichtbarer Body-Schalt seit Z79; Z95-Beobachtung exakt getroffen: RÜCKFALL <≈$70,15 = Regelwerk-Ende)**; 4 public-Body-Edits (x-posts P1+P5, telegram-Announcement-Markt-Block, web-copy-Szene-04 DE+EN); No-Op-Counter RESET → 0 (Body-Edit-Runde); Rolling-Blindwerte konform (≈$119,8 · 287/279 · +60,3 %/+53,8 %, Doppel-Cross-Proof Dex+Gecko); NEUER Präzisionswert ≈$70,13 (ersetzt ≈$70,24); Gecko-Gap tape-intern ≈$12,1 (geändert von ≈$12,0); **Drift-Phase-Beleg: $70,1292 < ≈$70,18 UND < ≈$70,15 → Drift-Phase 2 + Drift-Phase 3 gleichzeitig erfüllt (Z94-Beleg: »beides zusammenfallend«)**; nächster sichtbarer abwärts-Schalt: Value < ≈$70,05; h24-3B/1S-Counter bestätigt; P2-Tick »211830« weiter STALE (tickCurrent 207767, Präzedenz Z67–94); KURS-NEUTRAL: Pool tick=207767 + DexScreener $7,508e-12 + Jupiter-Rate invariant (08:15Z-Recherche-Block) → Feed-seitiger Rückfall, kein Markt-Ereignis; 26. DexScreener-Clean-Runde; 87. RugCheck-404-Runde; Tape-Transparenz: 29. Zyklus am Stück im Hauptsession-Fallback |
| 96 | $70,2002 | **DRIFT +0,10 % (08:30Z)** — STAB-Abwesenheit am neuen Tief: Gecko-Reserve $70,1292→$70,2002 (+$0,0710), Wert ZURÜCK ÜBER ≈$70,15 (Tier-Kante Z95) ABER < ≈$70,25 (Kante) → Ziel-Value ≈$70,2 [1 Dez.]; **ABER: PUBLIC-RUNDUNG ≈$70,1/≈$70.1 UNVERÄNDERT (DRIFT/RISE/STAB schalten nie nach oben — Regelwerk; der Z95-Switch ist EINSEITIG)** → NEUER PRÄZEDENZFALL: »Switch-Return-Befund: Wert im Zwischenband $70,15–70,25, sichtbare Rundung ≈$70,1 bleibt bestehen, bis ein RÜCKFALL unter ≈$70,05 den nächsten abwärts-Schalt löst«; No-Op-Counter 1, 0 Body-Edits; Rolling-Blindwerte konform; Präzisionswert ≈$70,20 (ersetzt ≈$70,13, REVERT-Vermerk: Gap ≈$12,0 tape-intern [geändert von ≈$12,1]); KURS-NEUTRAL (tick=207767 + Dex + Jupiter invariant, 08:30Z-Block) → Feed-Drift, kein Markt-Ereignis; 26. DexScreener-Clean-Runde weiter; h24-3B/1S bestätigt; P2-Tick »211830« weiter STALE (Präzedenz Z67–95); Tape-Transparenz: 30. Zyklus am Stück im Hauptsession-Fallback |
| 97 | $70,2002 | **STAB R.1 (08:45Z)** — identisch zu Z96, DRIFT-Zyklus 96 (+0,10 %) bestätigt; **Oszi-Band mit eingefrorener Rundung** (Zwischenband $70,15–70,25; Wert fix über Tier-Kante ≈$70,15 ABER unter Kante ≈$70,25 → PUBLIC-RUNDUNG ≈$70,1/≈$70.1 aus Z95 EINGEFROREN, STAB schaltet nie — Präzedenz STAB-Zyklen 70/75/77/78/80/81/83/85/87/90/92/94 + Z96-Präzedenzfall »Einseitiger Switch« bestärkt sich); No-Op-Counter 2, 0 Body-Edits; Rolling-Blindwerte konform; Präzisionswert ≈$70,20 (wie Z96); Gap ≈$12,0 tape-intern (unverändert); KURS-NEUTRAL (tick=207767 + Dex + Jupiter invariant, 08:45Z-Block) → Feed-Stab; h24-3B/1S-Counter bestätigt; P2-Tick »211830« weiter STALE (Präzedenz Z67–96); 26. DexScreener-Clean-Runde; 89. RugCheck-404-Runde; Tape-Transparenz: 31. Zyklus am Stück im Hauptsession-Fallback |

Muster: Feed-Updates mit Eigen-Cadence (keine Markt-Signatur —
echte Trades würden den tick/sqrtX64 bewegen; der bewegt sich
NICHT). Oszillation in der $72,28–72,80-Band (±$0,30 um ≈$72,5) —
**Korrektur Z69 (01:16Z): der Z68-„Drift +0,12 %" war ein
Oszi-Schritt, KEINE Konvergenz**: Rückfall $72,7952 → $72,2843
(−0,70 %) bringt den Feed zurück in die Z61–64-Zone ($72,3339).
Muster bleibt also: oszillierender Feed mit Eigen-Cadence,
kein Trend Richtung Dex-$82-Band.
**Nachtrag Z71–Z74 (01:51/02:06/02:21/02:36Z): VIER RÜCKFÄLLE IN FOLGE**
brechen die Z70-Stabilisierung ($72,2843): $72,2843 → $72,0161 (−0,37 %)
→ $71,8478 (−0,23 %) → $71,5838 (−0,37 %) → $70,7022 (−1,23 %,
größter Einzel-Rückfall der Serie). Neue Band-Unterkante ≈$70,70;
Public-Rundung ≈$72,3 → $70,7 DE/EN (4× Body-Impact, No-Op-Counter
jeweils 0). On-Chain bleibt invariant (tick 207767 / sqrtX64
unverändert) — der Feed behält seine Eigen-Cadence.
**Muster-Lesung (Stand Z74, bestätigt): die Z70-„Oszillation" ist
eigentlich eine abwärtsgerichtete Eigen-Cadence-Phase, analog der
Z58–64-Drift (22:00–23:30Z).** GEP-Deviations-Lücke WÄCHST:
≈$82,2 vs ≈$70,7 → **Gap ≈$11,5 (vorher ≈$9,9)**.
Beobachtung für Z75: Rebound = Drift-Phase mit Oszillation, erneuter
Rückfall = durchgehender Feed-Abwärtstrend bis neues Boden-Level
(gefundene Kante: ≈$70,7). Nächster Beleg: Z75.

**Auflösung Z75 (02:48Z): die Drift-Phase [71–74] ENDET am Boden
≈$70,70 — Stabilisierung R.1** (Gecko-Reserve $70,7022 IDENTISCH,
No-Op-Counter 1, kein Body-Impact). Bestätigt die Rahmen-Lesung:
Eigen-Cadence-Phase mit definierter Unterkante (≈$70,7), analog der
Z58–64-Drift (deren Boden $72,3339 um 23:30Z stabilisiert wurde).
**Erster Material-Change des Nachts (02:54Z-Research-Block):**
vol24h 122,77 → 119,79, sells 280 → 279 — On-Chain invariante
(tick/sqrtX64/liqRaw/Quote/ATA alle identisch), Preis $7,508e-12,
Jupiter-Rate 1,052e18 unverändert → kleiner Sell im Rolling-Window
oder Expire-Effekt, KEIN Kurs-Impact. Z76-Beobachtung: Halten =
Oszillation in neuer Band $70,7–71,6; Rebound = Umkehr-Signal;
erneuter Fall = neue Boden-Kante. Nächster Beleg: Z76.

**Auflösung Z76 (03:06Z): RISE +0,18 % (Gecko-Reserve $70,7022 →
$70,8298, STAB R.1 am Boden GEBROCHEN) — Rebound-Signal bestätigt.**
Public-Rundung ≈$70,7 UNVERÄNDERT (Rise schaltet nie nach oben —
Präzedenz Z65 RÜCKPRALL +0,52 % / Z68 DRIFT +0,12 %, konsistent
mit der Z68-Korrektur). Rahmen-Lesung bestätigt: die Drift-Phase
[71–74] hat eine definierte Boden-Kante (≈$70,70), und der Feed
osziilliert jetzt in der neuen Band $70,7–71,6 — analog Z58–64
(Boden $72,3339). Beobachtung Z77: Halten = Oszillation; erneute
Rise-Serie (≥2 Runden) = Umkehr-Phase (Band-Shift nach oben);
erneuter Fall unter $70,70 = neue, tiefere Boden-Kante.
Nächster Beleg: Z77.

**Auflösung Z77 (03:18Z): STAB R.2 am Rebound-Niveau $70,8298**
(identisch zu Z76, RISE-Zyklus 76 endet, No-Op-Counter 1,
0 Body-Edits). „Halten“-Kriterium erfüllt → Oszi-Verhalten in
der neuen Band $70,7–71,6 bestätigt. Nächste Beobachtung Z78:
Rise ≥2 Zyklen in Folge = Umkehr-Phase; Fall unter $70,70
= neue Boden-Kante (gefundene Kante bleibt ≈$70,70,
Gecko-Niveau $70,7022). Nächster Beleg: Z78.

**Auflösung Z78 (03:34Z): STAB R.3 — 2. Identik-Runde in Folge**
($70,8298, identisch zu Z76/77, No-Op-Counter 2, 0 Body-Edits).
Oszi-Verhalten in der Band $70,7–71,6 zweifach bestätigt: der
Feed hat nach dem Rebound (Z76) ein neues Gleichgewicht gefunden.
Z79-Beobachtung: weiter Stab/Rise = Band-Impact (≥2 RISE-Zyklen
in Folge = Umkehr-Phase, Band-Shift nach oben); Fall unter $70,70
= neue, tiefere Boden-Kante. Nächster Beleg: Z79.

**Auflösung Z79 (03:51Z): RÜCKFALL −0,92 % auf $70,1768 —
Boden-Kante $70,7022 GEBROCHEN, neue Tief-Kante ≈$70,18.**
Public-Rundung ≈$70,2 (DE/EN) (Rückfall schaltet nach unten —
Präzedenz Z71–74), No-Op-Counter reset, 4 Body-Edits, Gap
Dex/Gecko ≈$12,0. KURS-NEUTRAL: Pool tick=207767 + DexScreener
$7,508e-12 + Jupiter-Rate 1.052e18 invarianz (price-series,
03:54Z-Block) → der Rückfall ist Feed-seitig (Gecko-Reserve-
Aggregation), kein Markt-Ereignis — konsistent mit der
CROSS-SOURCE-Analyse (Gecko-Snapshot repriciert gedämpft/
verzögert gegenüber dem Pool). 6h-Fenster-Abroll (7 Buys
Z74–78 gerollt, Vol-6h $0) = Rolling-Window-Effekt, kein
public-Impact. Z80-Beobachtung: Stab am neuen Niveau $70,18
= Band-Unter-Kante bestätigt; RISE zurück über $70,70 =
Band-Re-Capture; erneuter Fall unter $70,18 = weiteres
Tief (Drift-Phase 2). Nächster Beleg: Z80.

**Auflösung Z80 (04:08Z): STAB R.1 am neuen Tief $70,1768**
(identisch zu Z79, RÜCKFALL-Zyklus 79 bestätigt, No-Op-Counter
1, 0 Body-Edits). „Stab am neuen Niveau"-Kriterium erfüllt →
Tief-Kante ≈$70,18 als vorläufige Band-Unter-Kante bestätigt.
Zusatz-Beleg im Z80-Tape: h24-Unique-Counter 3B/1S wiederholt
(bestätigt die neue TXN-KONZENTRATION-Note). Z81-Beobachtung:
weiter Stab/RISE in Band $70,18–71,6 = Oszi mit neuer, tieferer
Unter-Kante (2. Oszi-Band $70,2–71,6); RISE über $70,70 =
Band-Re-Capture (Oszi 76–78-Niveau); Fall unter $70,18 =
Drift-Phase 2 (weitere Tief-Kante). Nächster Beleg: Z81.

**Auflösung Z81 (04:23Z): STAB R.2 am neuen Tief $70,1768**
(identisch zu Z80/Z79, STAB-Serie R.1/2, No-Op-Counter 2, 0
Body-Edits). Das „Band-Unter-Kante $70,18"-Kriterium ist jetzt
dreifach bestätigt (Z79 RÜCKFALL → Z80 R.1 → Z81 R.2) — vorläufige
2. Oszi-Band $70,18–71,6 konsolidiert. KURS-NEUTRAL: Pool
tick=207767 + DexScreener $7,508e-12 + Jupiter-Rate 1.052e18
invariant (price-series, 04:30Z-Block). Z82-Beobachtung:
weitere Stab-Runden in Band $70,18–71,6 = Konsolidierung am
neuen Tief (≥3 Stabs in Folge = „Tief-Plateau" deklariert);
RISE über $70,70 = Band-Re-Capture (Oszi 76–78-Niveau, Oszi-
Muster fortgesetzt); Fall unter $70,18 = Drift-Phase 2 (weitere
Tief-Kante). Nächster Beleg: Z82.

**Auflösung Z82 (04:40Z): DRIFT +0,12 % auf $70,2634 — STAB-Serie
R.1/2 (Z80/81) GEBROCHEN, Micro-Rise (Kategorie DRIFT, Präzedenz
Z68: +0,12 %).** Rundung ≈$70,2 UNVERÄNDERT (DRIFT wechselt
Rundung nie — nur RÜCKFALLS abwärts; Tape-Regel: Rundungswechsel
erst bei Fall unter ≈$70,25). KURS-NEUTRAL: Pool tick=207767 +
DexScreener $7,508e-12 + Jupiter-Rate 1.052e15 invarianz
(price-series, 04:40Z-Block) → Feed-seitiger Micro-Drift
(Gecko-reserve_in_usd), kein Markt-Ereignis — Oszi-Verhalten in
der 2. Band (Unter-Kante wandert ≈$70,18→$70,26). No-Op-Counter 3,
0 Body-Edits, Tape-interner Präzisionswert $70,26 in P2/P6.
Z83-Beobachtung: weiter Stab/DRIFT in Band $70,18–71,6 =
Oszi-Konsolidierung; RISE über $70,70 = Band-Re-Capture
(Oszi 76–78-Niveau); Fall unter $70,26 (neues DRIFT-Tief) =
Micro-Drift fortgesetzt; Fall unter $70,18 = Drift-Phase 2
(tiefere Tief-Kante, RÜCKFALL-Präzedenz). Nächster Beleg: Z83.

**Auflösung Z83 (04:56Z): STAB R.1 bei $70,2634** (identisch zu
Z82, DRIFT-Zyklus 82 bestätigt, neue STAB-Serie gestartet — wie
in der Z83-Beobachtung erwartet: Stab/DRIFT in Band = Oszi-
Konsolidierung). Tape-Neu: Schaltkante wandert ≈$70,18→≈$70,25
(Rundungswechsel erst bei RÜCKFALL darunter — DRIFT Z82 hatte
die Kante bereits gesetzt). KURS-NEUTRAL: Pool tick=207767 +
DexScreener $7,508e-12 + Jupiter-Rate invariant (04:55Z-Block).
No-Op-Counter 4, 0 Body-Edits; Rolling-Blindwerte 4. Mal konform
(≈$119,8 / 287/279 / +$60,3/+$53,8); h24-3B/1S-Unique-Counter
4. Mal bestätigt (doppelte frische Cross-Ellung Dex+Gecko,
konsistent mit Puls-Akteur-Note: 3 Buyer-Wallets, 1 Seller).
Z84-Beobachtung: weitere Stab-Runden in der 2. Band =
Konsolidierung vertieft (≥3 Stabs in Folge = „Tief-Plateau"
deklariert — nach DRIFT + STAB R.1/2 wie Z77/78-Muster); RISE
über $70,70 = Band-Re-Capture; Fall unter $70,25 = Rundungs-
wechsel + Micro-Drift; Fall unter $70,18 = Drift-Phase 2.
Nächster Beleg: Z84.

**Auflösung Z84 (05:13Z): DRIFT +0,01 % bei $70,2704** (STAB R.1
Z83 gebrochen — das „Tief-Plateau" (≥3 Stabs) hat sich NICHT
materialisiert; stattdessen Micro-Drift im 2. Band fortgesetzt,
Kante-Verjüngung ≈$70,18→$70,26→$70,27 wie im Oszi-Muster
Z77/78: DRIFT-Phasen setzen neue Band-Unterkanten).
KURS-NEUTRAL: Pool tick=207767 + DexScreener $7,508e-12 +
Jupiter-Rate 1,052e18 invariant (price-series, 05:15Z-Block) →
Feed-seitiger Micro-Drift (Gecko-reserve_in_usd), kein
Markt-Ereignis. No-Op-Counter 5, 0 Body-Edits; Rolling-Blindwerte
5. Mal konform; h24-3B/1S-Unique-Counter 5. Mal bestätigt.
Tape-Transparenz: Z84 = 18. Zyklus am Stück im Hauptsession-
Fallback (Subagent 4× am Compaction-Output-Limit abgebrochen —
bekannt, nicht meine Anomalie).
Z85-Beobachtung: Stab/DRIFT in Band $70,2–71,6 = Oszi-
Konsolidierung vertieft (≥3 Stabs in Folge ab Z85 = „Tief-
Plateau" nach Z77/78-Muster); RISE über $70,70 = Band-Re-
Capture; Fall unter $70,25 (neues DRIFT-Tief) = Rundungswechsel
+ Micro-Drift fort; Fall unter $70,18 = Drift-Phase 2.
Nächster Beleg: Z85.

**Auflösung Z85 (05:30Z): STAB R.1 bei $70,2704** (identisch zu
Z84, DRIFT-Zyklus 84 bestätigt, neue STAB-Serie — exakt das
Oszi-Muster Z77/78: DRIFT-Phase setzt neue Kante, dann Stab-
Serien konsolidieren). KURS-NEUTRAL: Pool tick=207767 +
DexScreener $7,508e-12 + Jupiter-Rate invariant (price-series,
05:30Z-Block) → Feed-seitiger Stab, kein Markt-Ereignis.
No-Op-Counter 6, 0 Body-Edits; Rolling-Blindwerte 6. Mal konform;
h24-3B/1S-Unique-Counter 6. Mal bestätigt. Z86-Beobachtung:
≥2 weitere Stabs in Folge (ab Z86/Z87) = „Tief-Plateau"
deklariert (Oszi-Konsolidierung im 2. Band $70,2–71,6, wie
Z77/78-Präzedenz); RISE über $70,70 = Band-Re-Capture;
Fall unter $70,25 = Rundungswechsel + Micro-Drift; Fall unter
$70,18 = Drift-Phase 2. Nächster Beleg: Z86.

**Auflösung Z86 (05:46Z): RISE +0,41 % bei $70,5584** (STAB R.1
Z85 gebrochen — „Tief-Plateau" (≥3 Stabs) HAT SICH NIE
MATERIALISIERT, nur 1 Stab in Folge statt ≥3; Oszi-Muster
Z77/78 reproduziert sich in der 2. Band NICHT exakt).
RISE < $70,70 = **keine Band-Re-Capture** — 2. Band
konsolidiert sich nach oben (Kante wandert $70,25→$70,5584).
KURS-NEUTRAL: DexScreener $7,508e-12 + Pool tick=207767 +
Jupiter-Rate invariant (price-series, 05:45Z-Block) →
Gecko-RISE ohne Dex-Sprung = Feed-seitige Oszi im
`reserve_in_usd`-Field (Cross-Source-Erklärung aus
Deliverable #6: interne Gecko-Inkonsistenz, Snapshot ≈3×
gedämpft), kein Markt-Ereignis. No-Op-Counter 7, 0 Body-Edits;
Rolling-Blindwerte 7. Mal konform; h24-3B/1S-Unique-Counter
7. Mal bestätigt.
Z87-Beobachtung: RISE/DRIFT in $70,25–71,6 = 2.-Band-Upper-
Konsolidierung (Kante-Wechsel nach oben); RISE über $70,70 =
Band-Re-Capture (Oszi-76–78-Niveau); RISE über $71,6
(1.-Band-Oberkante) = Oszi-Neu-Phase; Fall zurück unter
$70,25 = Rückkehr an Tief-Kante + Rundungswechsel-Test
(RÜCKFALL-Präzedenz). Nächster Beleg: Z87.

**Auflösung Z87 (06:01Z): STAB R.1 bei $70,5584** (identisch zu
Z86, RISE-Zyklus 86 bestätigt, neue STAB-Serie — Oszi-Muster
Z77/78 exakt reproduziert: RISE/DRIFT-Phase setzt die neue
Kante, Stab-Serie konsolidiert daran; 2.-Band-Upper-
Konsolidierung wie in Z87-Beobachtung erwartet). KURS-NEUTRAL:
Pool tick=207767 + DexScreener $7,508e-12 + Jupiter-Rate
invariant (price-series, 06:00Z-Block) → Feed-seitiger Stab,
kein Markt-Ereignis. No-Op-Counter 8, 0 Body-Edits;
Rolling-Blindwerte 8. Mal konform; h24-3B/1S-Unique-Counter
8. Mal bestätigt. Z88-Beobachtung: weitere Stab-Runden an
$70,5584 = 2.-Band-Upper-Konsolidierung vertieft; RISE über
$70,70 = Band-Re-Capture (Oszi-76–78-Niveau); RISE über $71,6
= Oszi-Neu-Phase; Fall zurück unter $70,25 = Rückkehr an
Tief-Kante + Rundungswechsel-Test (RÜCKFALL-Präzedenz).
Nächster Beleg: Z88.

**Auflösung Z88 (06:16Z): RISE +0,37 % bei $70,8217 — BAND-RE-CAPTURE
ERREICHT** (RISE über $70,70-Kriterium aus der Z88-Beobachtung;
OSZI-76–78-NIVEAU: die 2. Band-Re-Capture-Welle wandert zurück
ins 1.-Band-Territorium $70,70–71,6 — Kante wandert $70,5584
→ $70,8217, Upper-Konsolidierung wie erwartet). KURS-NEUTRAL:
Pool tick=207767 + DexScreener $7,508e-12 + Jupiter-Rate
invariant (price-series, 06:21Z-Block) → Gecko-RISE ohne
Dex-Sprung = Feed-seitige Oszi im `reserve_in_usd`-Field
(Cross-Source-Erklärung aus Deliverable #6), kein Markt-Ereignis.
No-Op-Counter 9, 0 Body-Edits; Rolling-Blindwerte 9. Mal konform;
h24-3B/1S-Unique-Counter 9. Mal bestätigt. Tape-interner
Präzisionswert jetzt ≈$70,82; Gecko-Gap tape-intern ≈$11,4
(= $82,2 Dex − $70,8 Gecko) — Gap-Schrumpfung in der Z86→Z88-
Kette (≈$11,6→≈$11,4) konsistent mit Re-Capture-Richtung.
Z89-Beobachtung: RISE/STAB in $70,70–71,6 = Oszi-76–78-Niveau-
Konsolidierung (Band-Re-Capture bestätigt, 2. Wave-Oben); RISE
über $71,6 (1.-Band-Oberkante) = Oszi-Neu-Phase (3. Wave,
oberhalb aller bisherigen Banden); Fall zurück unter $70,70 =
Re-Capture-Verlust (Rückkehr in 2.-Band-Upper); Fall unter
$70,25 = Tief-Kante + Rundungswechsel-Test (RÜCKFALL-Präzedenz).
Nächster Beleg: Z89.

**Auflösung Z89 (06:33Z): RÜCKFALL −0,49 % bei $70,4771**
(RISE-Zyklus 88 GEBROCHEN — **BAND-RE-CAPTURE VERLOREN**: der
Z88-Re-Capture (RISE >$70,70) war ein Einzel-Zyklus, jetzt
Rückfall unter $70,70-Kriterium = Re-Capture-Verlust, Rückkehr
in 2.-Band-Upper wie in Z89-Beobachtung erwartet; „kurz-RISE-
lang-Rückfall"-Muster (Re-Capture-Welle = 1 Zyklus + Stab, dann
RÜCKFALL). **Erster RÜCKFALL seit Z79.** Rundungswechsel-Test
(AUSLÖSEREIGNIS: RÜCKFALL ist einziger Regime-Typ, der Rundung
nach unten schalten DARF): $70,4771 liegt ÜBER der Schaltkante
≈$70,25 → **KEIN Switch** (Z79-Präzedenz: erst Kante
unterschritten = Rundungswechsel; jetzt $70,48 > $70,25 →
Rundung ≈$70,2/≈$70.2 UNVERÄNDERT).
KURS-NEUTRAL: Pool tick=207767 + DexScreener $7,508e-12 +
Jupiter-Rate invariant (price-series, 06:31Z-Block) →
Feed-Rückfall, kein Markt-Ereignis. No-Op-Counter 10, 0
Body-Edits; Rolling-Blindwerte 10. Mal konform; h24-3B/1S-
Unique-Counter 10. Mal bestätigt. Gecko-Gap tape-intern
erneut ≈$11,7 (nach ≈$11,4-Z88-Engstelle — Oszi-Weitung).
Z90-Beobachtung: RISE/STAB in $70,48–70,70 = Re-Capture-
Verlust-Konsolidierung (2.-Band-Upper, unter Re-Capture-
Kriterium); RISE über $70,70 = 2. Re-Capture-Versuch
(Oszi-Puls-Charakter: Kurzwelle); RISE über $71,6 = Oszi-Neu-
Phase; RÜCKFALL unter $70,25 (Schaltkante) = RUNDUNGSWECHSEL
≈$70,2→niedriger + Micro-Drift fort (Z79-Präzedenz erfüllt);
RÜCKFALL unter $70,18 = Drift-Phase 2. Nächster Beleg: Z90.

**Auflösung Z90 (06:48Z): STAB R.1 bei $70,4771** (identisch zu
Z89, RÜCKFALL-Zyklus 89 bestätigt, neue STAB-Serie an der
Re-Capture-Verlust-Kante — wie in Z90-Beobachtung erwartet:
Re-Capture-Verlust-Konsolidierung im 2.-Band-Upper,
unter Re-Capture-Kriterium $70,70). Rundung ≈$70,2/≈$70.2
UNVERÄNDERT (STAB schaltet Rundung nie — Präzedenz STAB-
Zyklen 70/75/77/78/80/81/83/85/87/89). KURS-NEUTRAL: Pool
tick=207767 + DexScreener $7,508e-12 + Jupiter-Rate invariant
(price-series, 06:46Z-Block) → Feed-seitiger Stab, kein
Markt-Ereignis. No-Op-Counter 11, 0 Body-Edits;
Rolling-Blindwerte 11. Mal konform; h24-3B/1S-Unique-Counter
11. Mal bestätigt. Gecko-Gap tape-intern ≈$11,7 (wie Z89,
engstelle Z88 überstanden). P2-Tick „211830" weiter STALE
(tickCurrent 207767 stabil, Präzedenz Z67–89).
Z91-Beobachtung: weitere Stab-Runden an $70,4771 = Re-
Capture-Verlust-Konsolidierung vertieft (≥2 Stabs in Folge =
neue Kante setzt sich); RISE über $70,70 = 2. Re-Capture-
Versuch (Oszi-Puls-Charakter); RISE über $71,6 = Oszi-Neu-
Phase; RÜCKFALL unter $70,25 (Schaltkante) = RUNDUNGSWECHSEL
≈$70,2→niedriger (Z79-Präzedenz) + Micro-Drift fort; RÜCKFALL
unter $70,18 = Drift-Phase 2. Nächster Beleg: Z91.

**Auflösung Z91 (07:05Z): DRIFT +0,04 % bei $70,5059** (STAB R.1
Z90 GEBROCHEN — Micro-Rise $70,4771→$70,5059; in Z91-Beobachtung
im 2.-Band-Upper-Konsolidierungsbereich $70,48–70,70, jedoch als
DRIFT statt weiterer STAB-Runde (STAB-Serie blieb bei R.1, wie
Z84/Z86-Präzedenz: Kante nach DRIFT, keine Tief-Plateau-
Materialisierung). KEIN Re-Capture (RISE-Kriterium $70,70 nicht
erreicht), KEIN RÜCKFALL — Rundung ≈$70,2/≈$70.2 UNVERÄNDERT
(DRIFT wechselt Rundung nie). KURS-NEUTRAL: Pool tick=207767 +
DexScreener $7,508e-12 + Jupiter-Rate invariant (price-series,
07:01Z-Block) → Feed-seitiger Micro-Drift, kein Markt-Ereignis.
No-Op-Counter 12, 0 Body-Edits; Rolling-Blindwerte 12. Mal
konform; h24-3B/1S-Unique-Counter 12. Mal bestätigt. Gecko-Gap
tape-intern ≈$11,7 (Z88-Engstelle ≈$11,4 überstanden).
Z92-Beobachtung: STAB an $70,5059 = Drift-Kante-
Konsolidierung (Muster Z83: DRIFT setzt Kante, dann Stab-Serie);
RISE über $70,70 = 2. Re-Capture-Versuch (Oszi-Puls-Charakter);
RISE über $71,6 = Oszi-Neu-Phase; RÜCKFALL unter $70,25
(Schaltkante) = RUNDUNGSWECHSEL ≈$70,2→niedriger (Z79-Präzedenz)
+ Micro-Drift fort; RÜCKFALL unter $70,18 = Drift-Phase 2.
Nächster Beleg: Z92.

**Auflösung Z92 (07:21Z): STAB R.1 bei $70,5059** (identisch zu
Z91 — DRIFT-Zyklus 91 bestätigt, neue STAB-Serie an der
Drift-Kante, wie in Z92-Beobachtung erwartet: Drift-Kante-
Konsolidierung, Oszi-Muster Z77/78/Z83). Re-Capture-
Verlust-Konsolidierung im 2.-Band-Upper (unter $70,70-Kriterium).
Rundung ≈$70,2/≈$70.2 UNVERÄNDERT (STAB schaltet Rundung nie).
KURS-NEUTRAL: Pool tick=207767 + DexScreener $7,508e-12 +
Jupiter-Rate invariant (price-series, 07:21Z-Block) → Feed-
seitiger Stab, kein Markt-Ereignis. No-Op-Counter 13, 0
Body-Edits; Rolling-Blindwerte 13. Mal konform; h24-3B/1S-
Unique-Counter 13. Mal bestätigt. Gecko-Gap tape-intern ≈$11,7
(Z88-Engstelle ≈$11,4 überstanden). P2-Tick „211830" weiter
STALE (tickCurrent 207767 stabil, Präzedenz Z67–91).
Z93-Beobachtung: weitere Stab-Runden an $70,5059 = Drift-Kante-
Konsolidierung vertieft (≥2 Stabs in Folge = Kante setzt sich);
RISE über $70,70 = 2. Re-Capture-Versuch (Oszi-Puls-Charakter);
RISE über $71,6 = Oszi-Neu-Phase; RÜCKFALL unter $70,25
(Schaltkante) = RUNDUNGSWECHSEL ≈$70,2→niedriger (Z79-Präzedenz)
+ Micro-Drift fort; RÜCKFALL unter $70,18 = Drift-Phase 2.
Nächster Beleg: Z93.

**Auflösung Z93 (07:41Z): RÜCKFALL −0,37 % bei $70,2422 — KANTE
≈$70,25 UNTERSCHRITTEN (AUSLÖSEREIGNIS, wie in Z93-Beobachtung
erwartet)**: Switch-Bedingung nach Regelwerk ERFÜLLT (nur
RÜCKFALL darf PUBLIC-RUNDUNG nach unten schalten, und nur unter
der Kante — Z79-Präzedenz). ABER: Ziel-Value ≈$70,2 [1 Dez.]
BLEIBT IM ≈$70,2-Tier ($70,2422 rundet auf ≈$70,2) → **KEIN
sichtbarer Tier-Wechsel** — NEUER PRÄZEDENZFALL „Kante-Unterbruch
ohne Switch": Kante ≈$70,25 markiert den oberen Rand des
≈$70,2-Tiers; erst ein Wert unter ≈$70,15 (Tier-Grenze) zwingt
zum sichtbaren Wechsel ≈$70,2→≈$70,1. RÜCKFALL-Band nach
Präzedenz Z71/Z73 −0,37 % EXAKT. Drift-Phase-2-Test: $70,2422
liegt ÜBER ≈$70,18 → Kriterium NICHT erfüllt, Drift-Phase 2
ausstehend. KURS-NEUTRAL: Pool tick=207767 + DexScreener
$7,508e-12 + Jupiter-Rate invariant (price-series, 07:46Z-Block
erwartet; 07:31Z-Block invariant) → Feed-seitiger Rückfall,
kein Markt-Ereignis. No-Op-Counter 14, 0 Body-Edits; Rolling-
Blindwerte 14. Mal konform; h24-3B/1S-Unique-Counter 14. Mal
bestätigt. Tape-Präzisionswert ≈$70,24 (ersetzt ≈$70,51); Gecko-
Gap tape-intern ≈$12,0. P2-Tick „211830" weiter STALE.
Z94-Beobachtung: STAB an $70,2422 = Kante-Unterbruch-
Konsolidierung (Wert fest unter ≈$70,25); RISE über ≈$70,25
(= Kante) = Rückkehr in vorheriges Regime (Kante-Verlust,
Präzedenz Oszi-Kurzwellen); RISE über $70,70 = Re-Capture-
Versuch (entfernt); RÜCKFALL unter ≈$70,15 = RUNDUNGSWECHSEL
≈$70,2→≈$70,1 (SICHTBARER TIER-WECHSEL, Regelwerk-Kriterium
ENDLICH erfüllt); RÜCKFALL unter $70,18 = Drift-Phase 2;
RÜCKFALL unter $70,15 = Drift-Phase 3 (beides zusammenfallend).
Nächster Beleg: Z94.

**Auflösung Z94 (08:00Z): STAB R.1 bei $70,2422** (identisch zu
Z93 — RÜCKFALL-Zyklus 93 (Kante-Unterbruch) bestätigt, neue
STAB-Serie an der Kante-Unterbruch-Kante, wie in Z94-Beobachtung
erwartet: Kante-Unterbruch-Konsolidierung, Wert fix unter
≈$70,25). **Kein neuer Schaltschritt**: der sichtbare
Rundungswechsel ≈$70,2→≈$70,1 bleibt ausstehend, bis ein Wert
unter ≈$70,15 (Tier-Grenze) gemessen wird — Z93-Kante-Unterbruch
ist Kante-TEST, kein Tier-Wechsel (Präzedenzfall „Kante-
Unterbruch ohne Switch" hält). KURS-NEUTRAL: Pool tick=207767 +
DexScreener $7,508e-12 + Jupiter-Rate invariant (price-series,
08:01Z-Block) → Feed-seitiger Stab, kein Markt-Ereignis.
No-Op-Counter 15, 0 Body-Edits; Rolling-Blindwerte 15. Mal
konform; h24-3B/1S-Unique-Counter 15. Mal bestätigt. Tape-
Präzisionswert ≈$70,24; Gecko-Gap tape-intern ≈$12,0.
Z95-Beobachtung: weitere Stab-Runden an $70,2422 = Kante-
Unterbruch-Konsolidierung vertieft (≥2 Stabs in Folge = neue
Kante unter ≈$70,25 setzt sich); RISE über ≈$70,25 = Kante-
Verlust (Rückkehr ins obere ≈$70,2-Territorium); RISE über
$70,70 = Re-Capture-Versuch (entfernt); RÜCKFALL unter ≈$70,15
= SICHTBARER RUNDUNGSWECHSEL ≈$70,2→≈$70,1 (Regelwerk-Ende
erreicht) + Drift-Phase 2/3-Prüfung ($70,18-Schwelle).
Nächster Beleg: Z95.

**Auflösung Z95 (08:15Z): RÜCKFALL −0,16 % → $70,1292 — Z95-
Beobachtung exakt getroffen** (RÜCKFALL <≈$70,15 = sichtbarer
Rundungswechsel → er ist gekommen). **Sichtbarer Switch ≈$70,2/
≈$70.2 → ≈$70,1/≈$70.1** (4 public-Body-Edits, ERSTER sichtbarer
Schalt seit Z79, No-Op-Counter-Reset). **Zusammenfall-Befund:**
$70,1292 liegt unter BEIDEN Drift-Schwellen ($70,18 Phase 2 UND
$70,15 Phase 3) → beide Kriterien in EINEM Zyklus erfüllt
(»beides zusammenfallend«, wie im Z94-Beleg notiert) — das
Regelwerk kennt keinen separaten Zwischenstadium-Befund, daher
Doku-Befund: **Drift-Phasen 2+3 im Z95-Zyklus zusammenfallen,
neues Tief-Band ≈$70,1 (Tier-Kante ≈$70,15 als vorläufige
untere Kante)**. KURS-NEUTRAL: Pool tick=207767 + DexScreener
$7,508e-12 + Jupiter-Rate invariant (08:15Z-Recherche-Block) →
Feed-seitiger Rückfall, kein Markt-Ereignis. Präzisionswert
≈$70,13 (neu); Gecko-Gap tape-intern ≈$12,1 (geändert von
≈$12,0). Z96-Beobachtung: Stab an $70,1292 = Konsolidierung am
neuen Tief (≥2 Stabs in Folge = »Tief-Plateau-Phase 2/3«);
RISE über ≈$70,15 = Tier-Verlust (Rückkehr ≈$70,2-Konsolidierung);
RISE über ≈$70,25 = Kante-Verlust (Rückkehr ins obere ≈$70,2-
Territorium); RISE über $70,70 = Re-Capture-Versuch (entfernt);
RÜCKFALL unter ≈$70,05 = NÄCHSTER SICHTBARER RUNDUNGSWECHSEL
≈$70,1→≈$70,0 (Regelwerk-Ende der abwärts-Kette). Nächster
Beleg: Z96.

**Auflösung Z96 (08:30Z): DRIFT +0,10 % → $70,2002** (Z96-
Beobachtung-Abweichung: es war kein RISE, sondern DRIFT mit
Kleinsignal +0,101 %; Wert zurück über ≈$70,15 ABER unter
≈$70,25). **Neuer Präzedenzfall »einseitiger Switch«:** die
PUBLIC-RUNDUNG ≈$70,1/≈$70.1 aus Z95 bleibt bestehen, obwohl der
Wert wieder im ≈$70,2-Tier liegt — RISE/DRIFT/STAB schalten
nach oben NIE (Regelwerk, Präzedenz DRIFT-Zyklen Z68/Z82/Z84 +
RISE-Zyklen Z65/Z76). Der sichtbare Stand wird also erst durch
den NÄCHSTEN RÜCKFALL < ≈$70,05 aktualisiert (≈$70,1→≈$70,0),
und zwar auch dann, wenn der Wert davor im ≈$70,2-Tier oszilliert.
Zwischenband $70,15–70,25 = »Oszi-Band mit eingefrorener Rundung«.
KURS-NEUTRAL (tick=207767 + DexScreener $7,508e-12 + Jupiter-Rate
invariant, 08:30Z-Block). No-Op-Counter 1, 0 Body-Edits;
Präzisionswert ≈$70,20 (neu, ersetzt ≈$70,13); Gap ≈$12,0 tape-
intern (revertiert von ≈$12,1). Z97-Beobachtung: Stab an
$70,2002 = Zwischenband-Konsolidierung (Rundung ≈$70,1 bleibt
eingefroren); RISE über ≈$70,25 = Kante-Verlust (Rückkehr in
obere ≈$70,2-Konsolidierung, Rundung ≈$70,1 bleibt EINGEFROREN
— Präzedenzfall bestärkt sich); RISE über $70,70 = Re-Capture-
Versuch (entfernt); RÜCKFALL unter ≈$70,15 = Rückkehr ans neue
Tief $70,1292 (Drift-Phasen 2/3-Band); RÜCKFALL unter ≈$70,05
= NÄCHSTER SICHTBARER SWITCH ≈$70,1→≈$70,0 (Regelwerk-Ende der
abwärts-Kette). Nächster Beleg: Z97.

**Auflösung Z97 (08:45Z): STAB R.1 → $70,2002** (identisch zu
Z96 — DRIFT-Zyklus 96 bestätigt, Oszi-Band mit eingefrorener
Rundung wie in Z97-Beobachtung erwartet: Zwischenband
$70,15–70,25, Rundung ≈$70,1/≈$70.1 aus Z95 bleibt eingefroren,
Präzedenzfall »Einseitiger Switch« bestärkt sich). No-Op-
Counter 2, 0 Body-Edits; Präzisionswert ≈$70,20; Gap ≈$12,0.
KURS-NEUTRAL (tick=207767 invariant). Z98-Beobachtung:
≥2 Stabs in Folge an $70,2002 (STAB R.2) = Oszi-Band-
Konsolidierung vertieft (Band-Mitelpunkt ≈$70,20); RISE über
≈$70,25 = Kante-Verlust (Rundung ≈$70,1 bleibt EINGEFROREN);
RISE über $70,70 = Re-Capture-Versuch (entfernt); RÜCKFALL
unter ≈$70,15 = Rückkehr ans neue Tief-Band $70,1292
(Drift-Phasen 2/3); RÜCKFALL unter ≈$70,05 = NÄCHSTER
SICHTBARER SWITCH ≈$70,1→≈$70,0 (Regelwerk-Ende der abwärts-
Kette). Nächster Beleg: Z98.

## Konsequenzen für Team/Operator

1. **Public-Copy**: Taskforce rundet korrekt ≈$72,7 (DE) / ≈$72.7 (EN)
   nach Gecko, Divergenz-Notiz beibehalten — Vorgehen korrekt,
   keine Korrektur nötig.
2. **Trading**: Divergenz-Trade (Liquidity-Arbitrage) ist unmöglich
   und auch sinnlos — beide Feeds zeigen denselben On-Chain-Stand,
   die Differenz ist nur Refresh-Lag. KEIN Trade-Trigger.
3. **P2-Tick-211830-STALE**: unverändert (On-Chain = 207767).
   Liegt beim Operator (Tapes + meine Digest #5).
4. **Watch**: Konvergenz-Event (Gecko → $82-Band = Feed-Holup) wäre
   die nächste Material-Änderung; dann kurze LOG-Notiz, kein Digest.

— fable
