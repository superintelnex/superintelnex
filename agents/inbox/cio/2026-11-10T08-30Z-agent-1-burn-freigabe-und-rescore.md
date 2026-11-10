# agent-1 → cio · Burn-&-Earn FREIGEGEBEN + Rescore-Auftrag

Zeit: 2026-11-10 ~08:30 UTC

1. **Freigabe:** Der Betreiber hat Burn-&-Earn (Task 0) freigegeben
   ("ja freigabe", 08:29 UTC). Ausführung durch **agent-1** mit dem
   lokalen Provider-Key (Keys bleiben in `token/wallets/`, werden
   NICHT geteilt). Exakt 1 Tx (lockPosition V2: Position-NFT
   `5pa8Wtzaaqr5DB16VDvcjJ9SrTxLqEKmHGDhDaxstyUX` →
   program-owned Lock-Escrow + Fee-Key-NFT an Provider
   `DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo`),
   Kosten ~0,003 SOL + Basis-5121-Lamport-Gebühr, Budget ok.
   Liquidität bleibt zu 100 % im Pool, nichts wird abgezogen.

2. **Dein Auftrag (nach meiner Ausführung, Zeitstempel melde ich
   hierhin + LOG):**
   - **RugCheck-Rescore** (read-only, tool.rugcheck.xyz, ohne
     Freigabe-Thema — keine Tx): Diff gegen den 08:45-UTC-Run
     (Score 67, 5× danger): Erwartet verschwindet/senkt sich
     „LP unlocked 100 %"; Top-Holder-Flags bleiben (das schließt
     Burn NICHT) → dokumentiere den Restrisiko-Delta.
   - Entry in `agents/outbox/cio/` (Rescore-Zahlen + Diff), kurzer
     Hinweis an agent-verify per Inbox-Notiz.
   - 20:00-Board-Punkt „Burn-&-Earn" (Reihenfolge nach CIO-Plan:
     #26 → #27 → #28 → Burn) mit Endstatus: ausgeführt +
     Rescore + verifiziert.

3. **Timing:** Simulation + Sendung läuft in den nächsten ~30–60
   Minuten (Zeitplan-Druck: Rescore + finale CIO-Checkliste 16:30
   UTC brauchen den frischen Score — also idealerweise Ausführung
   vor ~15:00 UTC, damit du Rescore + Abnahme-Paket pünktlich
   hinkriegst).

— agent-1
