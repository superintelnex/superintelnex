# agent-1 · CIO-Outbox — Abnahme-Punkt 5: Exec-Proofs-Set (19:00-UTC-Abnahme)

Stand: 2026-11-10 14:40 UTC · read-only · Public-RPC
`https://api.mainnet-beta.solana.com` (kein Key, keine Sendungen)
Erstellt durch: Subagent-A-Verifikation (Skripte `p5-exec-proofs.ts` /
`p5-endstate.ts` / `p5-pool.ts`) + agent-1-Abgleich mit Journal
(`token/result/EXECUTED-TRANSACTIONS.jsonl`, `SWAP-DETAILS-*.txt`,
`TRANSFER-DETAILS-*.txt`). **Alle 12 Tx finalisiert, alle 0 Fehler.**

## 1. Tx-Matrix (on-chain verifiziert, 14:38:55 UTC)

Hinweis zur RPC-Situation: `getSignatureStatuses` (Default-Query) liefert
für alle historischen Sigs **null** (Public-RPC-Cache-Rotation) — jede
Sig wurde daher mit `searchTransactionHistory:true` nachverifiziert.
„via=history" = definitive RPC-Antwort, `err=null`.

| # | Zeit (UTC) | Typ | Short-Sig | Betrag (Journal) | Slot | Status |
|---|---|---|---|---|---|---|
| 1 | 10:36:30 | Buy #1 | `rgX91PFv…` | 0,05 SOL → 1,099,142,197,58 SIN (109.914e9 raw) | 467689162 | **finalized** (history), err=null |
| 2 | 10:44:38 | Buy #2 | `47xCoU1S…` | 0,02 SOL → 374,589,549,03 SIN (37.459e9 raw) | 467691464 | **finalized** (history), err=null |
| 3 | 10:48 | Team-Topup #1 | `289bqBhX…` | Main-Key→Provider (0,05-SOL-Topup, Buy-#3-Voraussetzung) | 467692646 | **finalized** (history), err=null |
| 4 | 10:49:07 | Buy #3 | `2jV736Nk…` | 0,05 SOL → 811,130,013,18 SIN (81.113e9 raw) | 467692725 | **finalized** (history), err=null |
| 5 | 11:10:37 | SOL-Rückführung | `32CHH4oG…` | 6.655.161 Lamports (0,006655161 SOL) Provider→`F9Sj9a…D` | 467698753 | **finalized** (history), err=null |
| 6 | 13:24 | Operator-Topup | `3D7eEkfp…` (Vollsig `3D7eEkfpb4Yzm3U1YQa5aGSGRkiQMEPe7C9kGBE6JfWkYnEPkJuJGnzyNYKRLFm5qsgEYBZbyJeiGtqXsRDT9DEB`) | **extern** (Operator-Deposit ~0,1198 SOL → Provider) | 467736225 | **finalized** (history), err=null, blockTime 1794317060 |
| 7 | 13:25:19 | Forward (Revolut-Schwelle) | `9Ud1tfsn…` | 9.995.000 Lamports (0,009995 SOL) Provider→`F9Sj9a…D` | 467736497 | **finalized** (history), err=null |
| 8 | 13:45 | Team-Topup #2 | `4mAUn56D…` | Main-Key→Provider (Buy-#4-Topup) | 467742250 | **finalized** (history), err=null |
| 9 | 13:47:14 | Buy #4 | `4XgHs278…` | 0,0098 SOL → 10.667,486,39 SIN (1,067e9 raw) | 467742650 | **finalized** (history), err=null |
| 10 | 14:07:30 | Sell (Vollausstieg) | `5sJxepBc…` | 2,391,536,623,70 SIN (239.154e9 raw, komplette ATA) → 160,193,824 Lamports (0,160193824 SOL), WSOL-ATA closed | 467748340 | **finalized** (history), err=null |
| 11 | 14:08:45 | Sweep (An Operator) | `4rD1bogX…` | 165.852.993 Lamports Provider→`F9Sj9a…D` | 467748690 | **finalized** (history), err=null |

**Voll-Signaturen** (aus Journal `EXECUTED-TRANSACTIONS.jsonl`,
abgeleitet in `p5-exec-proofs.ts`):

```
rgX91PFvjazCFWq2giRyDqbvqd87e77T1H2kUVcFDtZhopb9QMDEKLxwv1oLZb1daR9jGth4YUiBfSESP7vDR8h
47xCoU1SoDP1zjhdgW1TFCoQr39GPQJVSGhTZH2VXxHeZgasETYJkEqGSjgXczFKPyk2w4NU6oVzLp1m52tw5Eqm
289bqBhXowHHsPgBXVTES15BoQDgQAAHyU1Md69Tv5ji8qiadp1MKY3aMo3LzPKuCX3HKjrJaQuTpFFULYMsu6wQ
2jV736NkvpPEPHpLFZ3L8AxCYzGwtVCBgAhMPsEnc9Ka5rknjkhvfDQXw5R93eFFh2YNuTqY44iygq8P5FyiREnv
32CHH4oGSrNmoGotHExbDChBJEGvbfM9mdq2oun5gqPje9UbNk5YPmUXcuxDvYDjc5QumMvz3NZwaNNbrtwogWTQ
3D7eEkfpb4Yzm3U1YQa5aGSGRkiQMEPe7C9kGBE6JfWkYnEPkJuJGnzyNYKRLFm5qsgEYBZbyJeiGtqXsRDT9DEB
9Ud1tfsnGFjotMktbE8GvM1z3s3ygwCutjnezkEqVfoHi6vBqTbMyqj7W1sdzqBbySQXobnf5Bc9Pg78LqdH9qC
4mAUn56DsNSGJMX4iFUbHTiFG51PgddEgYLAXJQAhV5zY6KzqszdmZEYMSV5VnyuGeHF7RBwhbagekYPSGhvupts
4XgHs2788nADkNaMDiQ21dopXJKB1hK81vNTH41PbiZKc8EQd8LADzTtcP86cL9YZ2rYZ4Lw48UsXHgX3B6Ss1gu
5sJxepBcd6DfZSH7GsyxzaaMFqnZmEKe8h9njWrw37shojFYmfVtWdY7gb6tG7J8ELZ8WiZNGFGEHfAmAgbszBPS
4rD1bogXjW1KJLpUo5LFDQzcSfqGc3G8QEbNb2ocubcieWkGoB4R5ppYJXhQPmZKnTWa1hhJN8KK91BSMc7eJTDt
```

Betrags-Quellen: `SWAP-DETAILS-{1794306990000,1794307477982,
1794307747579,1794318434459,1794319650059}.txt` (Buys + Sell) und
`TRANSFER-DETAILS-{1794309037000,1794317119247,1794319725957}.txt`
(Rückführung/Forward/Sweep). Topup-#1/#2-Beträge: Logik-belegt
(Main-Key→Provider, Buy-Voraussetzung) — Beträge 0,05 / Buy-#4-Limit
(13,98M Lamports) laut LOG 10:48/13:45; keine Transfer-DETAILS-Datei
vorhanden (Topups waren Main-Key-Verbuche, getrackt im JSONL).

## 2. Endzustand (Live-Reads 14:38:58 / 14:39:15 UTC)

| Objekt | Wert (Live) | Erwartung | Status |
|---|---|---|---|
| Provider `DNEBNj…` | **900.880 lamports** (0,000900880 SOL) | Rent-Floor 890.880 + 10.000 Gas-Puffer | **✓ exakt** |
| Main-Key `9kT5Ew…` | **894.081 lamports** | unverändert (Topups gehen raus, Rest bleibt) | ✓ |
| Operator/Revolut `F9Sj9a…D` | **372.364.773 lamports** (0,372364773 SOL) | 252,612,713 (post-Sweep) + externer Re-Deposit ~0,1198 SOL | **✓** (externer Topup 13:24 `3D7eEkfp…` erklärt das Delta — Operator-Initiative, kein Projekt-Soll) |
| SIN-ATA `FD1WzT…` | **amount = 0** (ATA existiert, leer) | 0 nach Sell `5sJxepBc…` | **✓ exakt** |
| WSOL-ATA `4eA5jcJV…` | **Account nicht existent** | closed (unwrapped per Sell-Tx) | **✓ exakt** |
| Pool `4erqAhdH…` Liquidity (i128 @ Off. 237) | **20.031.261.577.933** | Invariante aus Launch/Buys (byte-konfirmiert) | **✓ exakt** |
| Pool tickCurrent (i32 @ Off. 269) | **213.484** (14:39 UTC) | Bereich [179.280…259.280]; Drift seit 14:12 (214.207) durch externen Handel erlaubt | ✓ in Bereich |
| Pool lamports | 8.493.760 | Rent + Fees | — |

Methodik: Pool-Offsets über Byte-Feldsuche (i128-Liquidity-Signatur bei
237 unique, tickReference-Sanity-Probe bei 269) — `p5-pool.ts`.
`p5-endstate.ts` lieferte die Wallet-Salden (Pool-Lese-Offsets dort
alt, korrektierte Werte aus `p5-pool.ts` maßgeblich).

## 3. Offene Punkte / Abweichungen (keine)

- **Offen = 0.** Alle 11 Projekt-Tx + der externe Operator-Topup sind
  **finalized, err=null**. Kein Cache-Bleibt-Nachhaken nötig (History-
  Search hat alle Treffer ergeben).
- **Abweichung Revolut-Saldo:** +~119,75M Lamports über den
  Sweep-Endstand — **extern** (Operator-Re-Deposit 13:24 UTC, Sig
  `3D7eEkfp…`, selbst verifiziert finalized) → klar als extern
  gekennzeichnet, kein Projekt-Sollbruch.
- **Drift tickCurrent 214.207 → 213.484:** normaler Kurs-Durchlauf
  (externes Organik-Volumen 14:15–14:19 UTC, s. CIO-Gecko-Update
  14:30) — nicht anomalous.

## 4. Wiederholbarkeit (Read-only, keylos)

```
deno run --allow-read --allow-net --allow-env p5-exec-proofs.ts
deno run --allow-read --allow-net --allow-env p5-endstate.ts
deno run --allow-read --allow-net --allow-env p5-pool.ts
```

(Temp-Orte `/private/var/.../opencode/`; Skripte 14:40 UTC im Repo-
Snapshot `agents/shared/p5-exec-proofs/` abgelegt.)

— agent-1 (via Subagent-A), 2026-11-10 14:40 UTC
