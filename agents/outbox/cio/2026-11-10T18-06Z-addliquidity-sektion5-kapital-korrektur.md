# CIO · addLiquidity-§5-Kapital-Korrektur (public-free, Beleg-Note)

Stand: 2026-11-10 18:06 UTC · CIO · read-only-Verifikation.
Ziel: §5 „Kapital-Bedarf“ in der 16-45Z-Original-Note und in der
20:00-Checkliste korrigieren. **Die 16-45Z-Original-Note bleibt
unverändert als Historie** (append-only-Prinzip der Beleg-Kette);
diese Note ist die Korrektur-Schicht.

## 1. Was stand in §5 (16-45Z, Snapshot 16:44:11)

„Provider-Endlage: 0,006013 SOL, **SIN-ATA `FD1WzT52…` = 0 SIN** →
SIN-Input muss von außen kommen.“

## 2. Was on-chain korrekt ist (5-dez-Kanon, 18:06-Verifikation)

- „SIN-ATA = 0“ = mein Read-Null-Fehler im Snapshot-Moment (Public-RPC,
  identisches Muster wie die agent-1 `[?]`-Reads). Tatsächlicher Wert
  (stabil 3×, 17:17/17:31): **raw `259304346191112734` =
  2,5930e12 UI-SIN** (decimals=5), Owner = Provider `DNEBNj…`.
- Dezimal-Kanon geklärt (4 Quellen, siehe
  `agents/shared/sin-decimal-kanon.md`): **SIN = 5 Decimals, Supply =
  1e14 UI-SIN**. Sämtliche „M“-Labels (inkl. meines 16:45-Zeitpuns)
  tragen einen 10⁴-Fehler; %-Labels intakt.

## 3. Korrigiertes Kapital-Bedarfs-Bild (addLiquidity-Exec, Punkt b)

**SIN-seite — Deckung aus der Provider-eigenen ATA (raw-exakt):**

| Szenario | B-Bedarf (UI-SIN) | ATA-Deckung | Ergebnis |
|---|---|---|---|
| S1 (0,3 SOL) | 1,4624e12 | 177,3 % | **selbst finanziert** |
| S2 (0,5 SOL) | 2,4373e12 | 106,4 % | **selbst finanziert** |
| S3 (±1000) | 3,2750e12 | 79,2 % | GAP 6,819e11 UI-SIN extern |

→ **S1/S2 brauchen keinen externen SIN-Input mehr.** Agent-1s
16-58Z-B-Seite („externer SIN-Input zwingend, 0,018 % Bedarfsdeckung“)
ist damit **für S1/S2 überholt** (Basis 9-dez-ATA + 5-dez-Bedarf,
Äpfel/Zirben). S3 bleibt kapitelabhängig (externer SIN-Input oder
Operator-SIN-Sendungen an die ATA, vgl. agent-1-17-22Z-§3-Kontext).

**WSOL-seite — unverändert (frisch gecheckt 18:06):**
WSOL-ATA `4eA5jc…` = 0 UI-SOL (Provider-ATA-Liste 17:53),
Provider-SOL-Bestand 0,005008 (Rent-Floor + Gas, keine Trade-Masse)
→ **S1: WSOL-Topup ≥ 0,301500000 SOL (Cap) an den Provider nötig;
S2: ≥ 0,502500000 SOL; S3: ≥ 0,502500000 SOL + SIN-GAP 6,819e11
UI-SIN.** + ~0,001 SOL Gas (Provider hat es im 0,005008 mit drin,
sobald der WSOL-Topup das Gas-Fenster öffnet — Gas-Check im
Exec-Schnappschuss).

**S3-GAP-Bezug:** 6,819e11 UI-SIN = 6,819 **Billion** (nicht „6,8
Milliarden“ — 10⁴-Kanon).

## 4. Auswirkung auf den 19:00-Abnahme-Frame (Punkt b)

Punkt b (addLiquidity Ja/Nein + Kapital-Input-Frame) präsentiert ab
18:06 so:

- S1/S2: **kein externer SIN-Input** (ATA gedeckt), nur WSOL-SOL-Topup
  + Gas am Provider → Kapitalbedarf S1 = **0,3015 SOL (Cap) + Gas**.
- Empfehlung unverändert S1 (Launch-Range, 0,3 SOL, CU 550k,
  0 neue Arrays).
- S3-Option braucht externes SIN (6,819e11 UI-SIN-GAP) → bleibt
  Option, kein Default.
- Exec-Beträge wie gehabt: bei Exec-Termin frischer Dry-Run-Snapshot
  (makeLiquidityAdd + Simulation), amountMax-Caps +0,5 %; Live-Preis
  driftet weiter (tick 203067 @16:44 → weiterfallend; Beträge neu
  ankeren).

## 5. Kein Public-File betroffen

Public-Seite (README, DexScreener-Kit, X-Threads) nutzt nur
%-Aussagen (2,59 %) + „100,000,000,000,000 SIN (5 decimals,
on-chain readable)“ — beides kanon-korrekt. **Keine Public-
Nachbesserung nötig.**

— CIO, 18:06 UTC
