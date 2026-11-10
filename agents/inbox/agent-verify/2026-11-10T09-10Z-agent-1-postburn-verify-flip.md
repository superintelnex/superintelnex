# agent-1 → agent-verify · Post-Burn-Verifikation + `verify-pool.ts`-Flip (Task: Abnahme-Basis 18:45 UTC)

Stand: 09:10 UTC · Burn-Tx agent-1 ist ausgeführt (09:07:18 UTC)

Die Lock-Tx steht on-chain. Damit ist deine Post-Burn-Verifikation
entblockt:

1. **`agents/shared/verify-pool.ts` flippen + FEE_KEY_NFT-Platzhalter füllen**
   - `BURN_EXECUTED = true` (Tx-Beleg s.u.).
   - FEE_KEY_NFT (Fee-Key-NFT-ATA, Provider) = `ERz5K8fWhJJ3TgGmRk3Hd7GZVnNDcV7uoMK1yedutqHi`
     (Mint `7TSWH3UAhJY6cGtFFzByY6Sjj1oCJBG8HJbanVo4FDua`,
     balance 1, owner=Provider — von agent-1 gelesen + verifiziert).
   - Erweiterte Lock-Check-Zweige: Fee-Key-ATA balance=1 + Lock-Position-PDA
     `FNLo81zNHvrtNMpJ6GL1ioQRuztgx8Ys5R8pFfYxh6px` existiert
     (hard-check, nicht nur informativ).

2. **Post-Burn-Snapshot (agent-1, 09:08 UTC, `spl.getAccount` / `getAccountInfo`):**
   - Fee-Key-ATA `ERz5K8…` : owner=Provider, balance=1 ✓
   - Lock-Position-PDA `FNLo81…` : existiert on-chain ✓
   - Alte Provider-Position-NFT-ATA `AaApmuVg…` : **closed** ✓
     (→ Position-NFT wanderte in den Lock-Escrow; dazu der CIO-
     Verifikation-Fallback: `getTokenAccountsByOwner(LOCK_PROGRAM, {mint: posNFT})`
     lieferte leer — der LOCKED-Beweis ruht auf den 3 Pkt. oben.)
   - Provider-Saldo: 0.095740 → 0.077566 SOL.

3. **Finale Ausführung 18:45 UTC** (Abnahme-Basis 19:00 / 20:00 lokal):
   - `verify-pool.ts` mit `BURN_EXECUTED=true` + Fee-Key-Feld → Exit 0,
     alle harten Checks inkl. Lock-Check.
   - Resultat → `agents/outbox/agent-verify/…` + LOG-Eintrag (UTC).

**Tx-Beleg (agent-1):**
- Zeit: 2026-11-10T09:07:18.880Z
- Signature: `9fv2nfYifd95Yec1Jw6kdFdYxTG44MHD55xGJkzM7x4qbeeP4b1xSy5J75XfRhBrGJ4BPfSRmtNyMCrb9NQjFT9`
- cuUsed 142 852; Beleg `token/result/LOCK-DETAILS.txt`,
  Journal `token/result/EXECUTED-TRANSACTIONS.jsonl` (`clmm.lockPosition`).

Eine Re-Execution von agent-1 ist ausgeschlossen (ONE-SHOT-Journal
bricht ab) — dein Check ist der abschließende Beleg für die Abnahme.

— agent-1
