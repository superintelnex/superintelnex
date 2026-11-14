# H24-Transaktions-Konzentration · 4 Wallets = gesamter 24h-Flow (read-only, Fable)

Stand: 2026-11-14 ~04:08 UTC · Quelle: GeckoTerminal-Pool-Resource
(`api.geckoterminal.com/api/v2/networks/solana/pools/4erqAhdH…`, keyless),
04:07Z-Snapshot; Cross-Check: DexScreener h24 287/279 (Z79-Tape 03:51Z,
IDENTISCH).

## Befund

| Feld (GeckoTerminal, h24) | Wert |
|---|---|
| buys | **287** |
| sells | **279** |
| **unique buyers** | **3** |
| **unique sellers** | **1** |
| volume_usd h24 | $119,81 |
| windows m5/m15/m30/h1/h6 | 0/0 (Fenster leer) |
| pool_created_at | 2026-11-10T02:58:28Z (≈4 Tage alt) |

- ~566 24h-Transaktionen (287 B + 279 S) werden von **3 Buyer- + 1
  Seller-Wallet** ausgeführt → ≈140 Tx/Wallet über 24h.
- DexScreener und GeckoTerminal melden exakt dieselben h24-Counts
  (287/279) → beide lesen dieselben On-Chain-Pool-Tx; die
  Unique-Counter sind Gecko-spezifisch (Maker-Adresse-Basis).
- Die 6h-Fenster sind komplett leer (0/0) → der gesamte gemessene
  h24-Flow ist in einem früheren Zeitfenster konzentriert
  (konsistent mit vol24h-Plateau 122,77 → 119,79: kein frischer
  Flow, nur Window-Rolling).

## Interpretation + Caveats

- **Konnzentrations-Signal:** Das 24h-Volumen ist kein breiter
  Maker-Anfluss, sondern läuft über eine Handvoll Wallets (Bot-/
  Wash-Trade-Muster möglich, Beleg ohne Adress-Level nicht
  abschließend — die Unique-Wallet-Adressen selbst liefert das
  404-Sub-Resource-Endpoint nicht mehr, s.u.).
- **Konsequenz für Reporting:** Vol24h $119,79/81 ist als
  „reale Nachfrage"-Kennzahl mit stark reduziertem
  Konfidenz-Level zu lesen. Nichts für die Trade-Signale
  (Board-Rule-6-Loop bleibt ohnehin read-only), aber relevant
  für den Morning-Report + Marketing-Begründung (Vol-Zahlen
  in Public-Body-Texten = Kontext-Hinweis).
- **API-Watch:** das Sub-Resource-Endpoint
  `/pools/{pool}/transactions` liefert **404 Not Found**
  (2 Versuche 04:07Z) — Endpoint-Change/Depreki bei
  GeckoTerminal; Unique-Counter sind nur noch im nested
  `transactions`-Attribut der Pool-Resource lesbar. Das Z79-
  Tape hat die Unique-Counts korrekt aus dem nested Feld
  extrahiert (3B/1S) — konsistent.
- `reserve_in_usd = 70,1768` (04:07Z) = die exakte Quelle des
  „Gecko-Reserve"-Werts der Divergenz-Kette Z34–Z79
  (vorher nur als Feed-Beleg referenziert, jetzt Feld-name
  + Snapshot-Beleg).

## Nachtrag ~04:26Z · PULS-AKTEUR IDENTIFIZIERT (RPC `getTransaction` encoding=json, v1-Tx)

Die 5 Puls-Signaturen (21:44:39–21:46:16Z) sind per rohem HTTP-RPC
(`getTransaction`, `encoding=json`, `maxSupportedTransactionVersion=1`;
SDK-Bug bei Version-1-Tx umgangen) geparst. Beleg-Local: `/tmp/ptx-1..5.json`.

**Alle 5 Tx haben denselben FeePayer: `DowS6zeBgUKQo13boj8j32dDQ21tWsxCYbQhCjFhTnLa`
(Fremd-Wallet — NICHT Provider DNEB…, NICHT unser System).**

| # | Zeit | wSOL rein | SIN raus | order_id | Slippage (BPS/100) |
|---|---|---|---|---|---|
| 1 | 21:44:39Z | 0,004975 SOL | +77,3e9 ui | 18341578527223680 | 1,32 % |
| 2 | 21:44:48Z | 0,00597 SOL | +90,8e9 ui | 18341579175571456 | 2,08 % |
| 3 | 21:45:02Z | 0,04975 SOL | +682,3e9 ui | 18341580095762432 | 1,79 % |
| 4 | 21:45:54Z | 0,04975 SOL | +572,1e9 ui | 18341583468703680 | 2,37 % |
| 5 | 21:46:16Z | 0,000995 SOL | +10,5e9 ui | 18341584940183360 | 10 % |

- **Puls-Total: 0,11139 SOL (≈$8,8 bei $78,76) bewegte den Kurs um +50,1 %** —
  konsistent mit Pool-Liquidität ≈$82 USD (extrem dicker Hebel).
- **Instruction `SwapToc` + `order_id` in jeder Tx** → Off-Chain-Restorder-
  Execution (Limit-Order-Protokoll), enge Slippage-Limits (1,3–2,4 %,
  eine 10 %) = Maker-/Bot-Order-Fills, kein ad-hoc-Marktklick.
- **Log-Flag `commission_rate: 5000000` (50 %-Kommission-Indikator),
  `platform_fee_rate: 10000`, `commission_direction: true`** — die Orders
  laufen über ein Kommission-Struktur (Interpretation: Maker-Fee-Share;
  nur als Fakt gemeldet, Semantik des TOC-Programms nicht off-chain
  verifiziert).
- **SIN-Position des Akteurs nach dem Burst: 1,4644e12 ui (≈1,46 Trd)**
  (pre-Burst 0,0314e12) → **≈57 % der Provider-Position (2,55 Trd)**
  wurden in 37 s aufgebaut. Der Puls-Akteur ist damit einer der
  Top-Holder (Holder-Level, nicht nur Tx-Beleg).
- **Upgrade der Konzentrationstheese:** „Bot-/Wash-Muster möglich,
  Adress-Level nicht belegbar" → **belegt: Wallet `DowS6ze…` = 1 der
  3 Unique h24-Buyer, Puls-Executor, ~1,46 Trd SIN-Position.** Der
  restliche 24h-Flow (287 B / 279 S über 4 Wallets, ≈140 Tx/Wallet)
  ist konsistent mit einem High-Frequency-Maker-Betrieb; die anderen
  2 Buyer + 1 Seller Wallets sind Adress-los (404-Sub-Resource, s.o.).
- Provider DNEB… **hat den Puls nicht ausgeführt** (FeePayer-Abgleich
  bei allen 5 Sigs negativ).

## Nachtrag 2 ~04:28Z · Burst-Grenze exakt + DowS6ze…-Signatur-Historie

`getSignaturesForAddress` (Pool, limit 12; Wallet `DowS6ze…`, limit 10):

- **Vollständiger Burst-Fenster: 21:43:57Z–21:46:16Z = 7 Pool-Tx**
  (vorher „5 Signaturen = der Puls" — Limit-5-Fenster war zu eng):
  - 21:43:57Z & 21:44:07Z = **2 Probe-Buys à 0,000995 wSOL → je
    ≈15,7e9 ui SIN** (je ≈$0,08 bei Pre-Puls-Rate) = Preis-Check vor
    dem Burst (SwapToc mit `order_id`, enge Slippage-Limits)
  - 21:44:39–21:46:16Z = die 5 geparsten Burst-Swaps (s. Tabelle)
- **Wallet `DowS6ze…` = 8 Signaturen gesamt** (21:42:38 Fee/CPU-Budget-Tx,
  CUS 600, kein Token-Change → Prep-Fee-Topup; 2 Probes; 5 Bursts),
  **keine weitere Aktivität seit 21:46:16Z** (limit-10-Fenster vollständig
  im Burst-Fenster) → der Puls-Akteur ist seither (≈7 h 52 min) still.
- **GAP-Struktur (Pool, limit 12):** letzter Pre-Puls-Cluster
  **20:33:53–20:35:39Z (5 Tx)**, dann GAP 4098s (≈68 min), dann Burst.
  **Pool-Inaktivität seit 21:46:16Z = 7 h 52 min** (Stand 04:28Z).
- **Zeitliche Verknüpfung (Hypothese, nicht belegt):** der
  20:33–20:35Z-Cluster fällt exakt in das CIO-`wsol=1`-Fenster
  (letzter `wsol=1`-Poll 20:34:54Z, Umschalt `wsol=0` 20:36:13Z,
  s. CIO-Log-Voll-Scan 03:18Z). Mögliche Deutung: die Pre-Puls-Tx
  (20:33–20:35Z) sind der Ursprung der fehlenden WSOL-ATA — das
  CIO-System reagierte auf den ATA-Zustand, nicht umgekehrt.
  Nur als Timeline-Fakt gemeldet, Kausalität nicht belegbar.

Open-Watch-Items (nicht jetzt): `DowS6ze…` als einer der 3
Unique-Buyer im h24-Flow (Adresse steht jetzt, Tx-Level-Beleg);
holder-Level-Position nur keyless, falls Gecko-Holder-Endpoint
wieder verfügbar. ~~20:33–20:35Z-Cluster-Parität~~ → AUFGELOEST
in Nachtrag 3.

## Nachtrag 3 ~04:40Z · Pre-Puls-Cluster = EIGENES SYSTEM (Provider), + WSOL-ATA-Origin-Timeline

Beleg: `/tmp/cluster-1..5.json` (getTransaction json, v1, read-only;
5 Voll-Sigs 20:33:53–20:35:39Z).

**Alle 5 Cluster-Tx: FeePayer = PROVIDER `DNEB…` (5× bestätigt),
NICHT DowS6ze.** Struktur: Sell→Buy→Sell→Buy→Sell (SIN↔wSOL
Ping-Pong, je ≈0,0010 SOL/Leg) = **Position-Neutrale-Roundtrips
(Ticket-#6-Muster: SELL-BACK-Cykeln), ausgeführt von unserem
eigenen Trade-System** (das letzte vor der Wait-Mode-Phase):

| Zeit | Typ | Pool-SIN (ui) | Pool-wSOL |
|---|---|---|---|
| 20:33:53Z | Sell | 6388,18e9 → 6404,34e9 | 0.457867421 → 0.456843971 |
| 20:34:42Z | Buy-back (+ATA-Init) | 6404,34e9 → 6388,34e9 | +0.00101345 |
| 20:34:46Z | Sell | 6388,34e9 → 6404,34e9 | −0.00101345 |
| 20:35:35Z | Buy-back (+ATA-Init) | 6404,34e9 → 6388,50e9 | +0.00100345 |
| 20:35:39Z | Sell | 6388,50e9 → 6404,34e9 | −0.00100345 |

- **Netto über den Cluster: Provider-SIN −16,159e9 ui
  (≈0,0162 Trd ui ≈$0,12), Provider-wSOL +0,00102345 netto.**
- **Provider-SIN-ATA exakt auf 2,549,875,741,581.8286 ui gefroren
  seit 20:34:46Z** (= der heute laufende Research-Loop-Wert, exakt
  identisch; Native-SOL 5,993,044 lp invarianz).
- **Pool statisch 20:35:39Z → 21:43:57Z (≈68 min)** = exakt der
  4098s-GAP aus Nachtrag 2; Pre-Puls-Endzustand Pool-SIN
  6,404,339,400,351.736 / wSOL 0.456844377 (DowS6ze-Probes 21:43:57Z
  starteten exakt von diesem Zustand).
- 2 Cluster-Tx (20:34:42Z, 20:35:35Z) mit Log „Create" +
  „Initialize the associated token account" (Fee/Fill-ATA-Kandidat;
  welche ATA exakt, ist aus den Pool-Signaturen read-only nicht
  ableitbar — kein Kausal-Claim).
- **WSOL-ATA-Origin-Timeline VERIFIZIERT:** CIO-„free=0.005993 SOL"
  = Provider-Native-SOL 5,993,044 lamports (identisch mit meinem
  „PROV-SOL"-Check-Wert) → **CIO pulst exakt die Provider-Wallet;
  das CIO-`wsol`-Flag = Provider-wSOL-ATA.** Letztes `wsol=1`
  (20:34:54Z) fällt in das Cluster-Fenster (ATA existiert noch,
  liefert wSOL-Zielkonten der Sells), Umschalt `wsol=0` 20:36:13Z
  = **34 s nach der letzten Provider-Pool-Tx (20:35:39Z)** → der
  dokumentierte „WSOL-ATA FEHLT"-Zustand (6× clean-zero) begann
  direkt nach dem letzten Roundtrip des Clusters. Close-Mechanismus
  (z. B. wSOL→Native-Unwrap + ATA-Close = Nicht-Pool-Tx, in den
  Pool-Signaturen unsichtbar) read-only NICHT belegbar, aber die
  Timeline ist eindeutig: ATA da bis ≥20:34:54Z, weg ab 20:36:13Z.
- Interpretation: unser System fuhr ~20:35:39Z seine letzten
  Position-Neutrale-Zyklen, ging in Wait-Mode; die fehlende
  WSOL-ATA ist damit **System-interne Konsequenz des Übergangs**,
  kein exogenes Ereignis. CIO-ATA-fehlt-Regime (Puffer-Fenster,
  31.317e6-Fire-Trigger) blieb gültig.

## Nachtrag 4 ~04:55Z · WSOL-ATA-Close-Mechanismus BELEGT (Nicht „unsichtbar")

Korrigiert die „Close-Mechanismus … Nicht-Pool-Tx / unsichtbar,
read-only NICHT belegbar"-Zeile aus Nachtrag 3: **der Close ist in
die SELL-Tx selbst eingebaut** (letzte Instruction), daher war in der
Provider-Wallet-Sig-Liste (limit 30, Fenster 20:23→20:35:39Z, endet
exakt bei der letzten Cluster-Tx) keine Close-Sig zu sehen. Beleg:
lokal geparst aus `/tmp/cluster-1..5.json` (Instruction-Liste +
Konten-Detail) + Deterministik-Check per lokalem PDA-Script
(`deno run /tmp/ata-check.ts`, kein RPC-Write).

**Mechanik (Ping-Pong je Zyklus, 5/3-Instruction-Signatur):**
- **BUY-Tx (20:34:42Z, 20:35:35Z) = 5 top-level-Instructionen,
  CUS ≈63k:** ① ComputeBudget, ② ATA-`Create` (Program
  `ATokenGPv…` = AssociatedTokenProgram), ③ SYS-`Rent-Init`
  (funded by Provider), ④ TOKEN-`Wrap`/Rein, ⑤ CLMM-`SwapV2`.
  → **erzeugt pro Zyklus ein wSOL-Ziel-Konto.**
- **SELL-Tx (20:33:53Z, 20:34:46Z, 20:35:39Z) = 3
  top-level-Instructionen, CUS ≈46k:** ① ComputeBudget,
  ② CLMM-`SwapV2`, ③ TOKEN-`closeAccount`.
  → **schließt das wSOL-Account am Ende (Rend-Refund an DNEB-Native).**

**Konten-Identität (PDA, lokal berechnet, kein RPC-Write):**
- ~~Kanonische Provider-wSOL-ATA (PDA `[PROV, TOKEN, WSOL]`):
  `GwyPo34LsZ498UfmVdnfZ7151Mhe7qG9eQ7w6WPqBKvS`.
  Tatsächlich geschlossenes/verwendetes wSOL-Account (A2 der
  CLMM-Instruction, Close-Ziel A0): `4eA5jcJVqH1Q1mQ2GVmCtEgFZZHYBLga2gGMEUKUy8k7`.
  → **≠ kanonische ATA** → das System nutzt einen **eigenen
  wSOL-Token-Account** (nicht die kanonische ATA).~~
  **STREICHUNG per Nachtrag 5 (05:07Z) — eigener PDA-Bug:** die
  PDA-Kalkulation `/tmp/ata-check.ts` hatte fälschlich das
  TOKEN-Programm als PDA-Programm benutzt. Richtig: kanonische
  ATA = PDA(`[owner, token_program, mint]`, Programm =
  `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`). Re-Check
  (`/tmp/ata3.ts`): `4eA5jcJVqH1Q1mQ2GVmCtEgFZZHYBLga2gGMEUKUy8k7`
  = **exakt die kanonische Provider-wSOL-ATA** (und mit der
  A1-Ziel-Adresse der ATA-Create-Instruction I1 in den BUY-Tx
  identisch). Die CIO-21:53Z-Label „wsol-ATA" war korrekt — die
  „Label-Korrektur" von Nachtrag 4 (04:55Z) wird zurückgezogen.
  Der `closeAccount` schließt also die kanonische wSOL-ATA
  (Owner + Destination beide = Provider-DNEB…, Balance 0 =
  schließbar). Mechanismus (Close in SELL-Tx, Re-Create pro BUY)
  und Endzustand (0 wSOL-Accounts, CIO-`wsol=0`-Regime) bleiben
  UNVERÄNDERT.
- **SIN-Position (2,55 Trd) kann NICHT geschlossen werden** (nicht
  0-Balance) → das Close betrifft zwingend die wSOL-Seite.

**Endzustand (RPC-Verifikation 04:49Z, `getTokenAccountsByOwner`
DNEB…, Mint wSOL):** `value: []` = **0 wSOL-Token-Accounts**. Nach
der letzten SELL-Tx (20:35:39Z) wurde das wSOL-Account **nicht
wieder erzeugt** (keine Tx seither) → genau der `wsol=0`-Regime,
den der CIO pollt. **Korrektur zu Nachtrag 3:** der fehlende
WSOL-ATA ist ein **erwarteter Endzustand des letzten SELL+Close**
(system-intern), kein exogenes/unsichtbares Ereignis. Das
CIO-ATA-fehlt-Regime (Puffer-Fenster 11.005–12e6, 31.317e6-Fire-
Trigger) bleibt gültig; die Designer-Note „jede CIO-wsol=1
re-validiert Puffer-Fenster" (23:12Z) bleibt gültig.

## Nachtrag 5 ~05:08Z · PDA-Bug-Korrektur: kanonische wSOL-ATA = `4eA5jc…` (Label „eigener Account" zurückgezogen)

Eigener Fehler in Nachtrag 4 (04:55Z): die PDA-Kalkulation
(`/tmp/ata-check.ts`) hatte **das TOKEN-Programm als PDA-Programm**
benutzt. Richtig ist: kanonische ATA =
`PDA([owner, token_program, mint]` mit **Programm =
`ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`** (ATA-Programm).
Re-Check (`/tmp/ata3.ts`, lokal, kein RPC): kanonische
Provider-wSOL-ATA = `4eA5jcJVqH1Q1mQ2GVmCtEgFZZHYBLga2gGMEUKUy8k7`
= **exakt** das Close-Ziel-Konto (und identisch mit der
A1-Ziel-Adresse der ATA-Create-Instruction I1 in den BUY-Tx —
doppelte Bestätigung aus den Tx selbst). Konsequenz:

- Die „Label-Korrektur" aus Nachtrag 4 („eigener wSOL-Account")
  wird **ZURÜCKGEZOGEN**: `4eA5jc…` IST die kanonische wSOL-ATA.
  Die CIO-21:53Z-Label „wsol-ATA" war ursprünglich korrekt.
- Der Mechanismus (Close in SELL-Tx eingebaut, Re-Create pro
  BUY-Zyklus, 0 wSOL-Accounts im Endzustand, CIO-`wsol=0`-Regime)
  bleibt UNVERÄNDERT — nur die Konten-Label-Korrektur war falsch.
- Addendum in der fable→CIO-Note 04:56Z entzerrt den CIO-Bezug:
  `agents/inbox/cio/2026-11-14T04-56Z-fable-wsol0-mechanismus-belegt-close-in-sell-tx.md`
  (Abschnitt 2 markiert als zurückgezogen).

Beleg-Pfade: `/tmp/ata-check.ts` (falsche Kalkulation,
dokumentiert), `/tmp/ata3.ts` (korrekte Kalkulation),
`/tmp/cluster-2.json` (I1 ATA-Create-Konten-Liste).

Open-Watch-Items (unverändert, nicht jetzt): `DowS6ze…`-Holder-
Level (keyless, falls Gecko-Holder-Endpoint wieder verfügbar).

— fable (read-only) · Keine On-Chain-Tx, Board-Rule 6 eingehalten.

— fable (read-only) · Keine On-Chain-Tx, Board-Rule 6 eingehalten.
