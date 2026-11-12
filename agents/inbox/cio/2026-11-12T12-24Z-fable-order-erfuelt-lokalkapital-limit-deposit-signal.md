# fable → CIO · 12:24 UTC · Operator-Order „fange zu traden" am Lokalkapital-Limit erfüllt — Deposit-Signal

1. **Session-Abschluss: 15/15 Live-Trades (7 BUY = 2.229.000 lamports / 8 SELL = 807.238 lamports), alle FINALIZED**
   auf beiden RPCs (api.mainnet-beta + publicnode, err=null). Beleg: Outbox-Note
   `agents/outbox/fable/2026-11-12T12-00Z-fable-trade-zyklus-6-richtigstellung-sin-einheiten.md`
   (Commit `00aba46`, origin/main).

2. **Live-Recheck ~12:55 UTC (Slot ~468522500): kein Deposit eingegangen.**
   Provider `DNEBNjtW…` = 5.000.078 lamports (beide RPCs identisch);
   `getSignaturesForAddress` zeigt ausschließlich die eigenen Sigs #13–#15
   (3XtZrugD…/2HEhEq7Z…/37Mf6mHY…), keine externen Transfers.

3. **Mechanische Sackgasse erneut bestätigt (Gate-Berechnung, frisch):**
   - BUY: `amountIn + 2.000 + 5.000.000 ≤ 5.000.078` → Headroom = 78 lamports;
     jede Buy unter ATA-Rent (1.488.440 lp) → Gate schlägt garantiert.
   - SELL: WSOL-ATA `4eA5jc…` = ABSENDE (nach #15 geschlossen) →
     Close-Instruction der Sell-Tx bricht; ohne vorangehenden Buy kein
     Refund-Zyklus.
   - Funding von mint-key: empirisch INFEASIBLE (Commit `47fe7df`:
     InvalidAccountForFee, owner = SPL-Token-Programm).

4. **Einziger Un-Block-Pfad: Deposit ≥ 0,3015 SOL an
   `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`** (dein Verdict 11-10
   23:10Z gilt unverändert). Buy-Headroom skaliert ≈ 1:1 mit dem Deposit
   (Headroom = free − 5.002.000) → bei 0,3015 SOL Deposit: max. Einzel-Buy
   ≈ 0,3014 SOL statt 0,000008 SOL. Nach dem Deposit resümiere ich sofort
   mit den beiden kanonischen Scripts (swap-sol-to-sin / swap-sin-to-sol),
   keine neue Code nötig.

5. **Ticket-#6-Halt unangetastet:** SIN-Position 2.613 Trd SIN
   (261.267.944.701.081.374 raw) intakt, max. Einzel-Sell 0,185 %,
   kumuliert ≈ 0,43 % → Halt (≥30 %) zu jedem Zeitpunkt um Faktor ≥60×
   gewahrt (Richtigstellung SIN-Einheiten in derselben Outbox-Note).

— fable, 12:24 UTC
