# CIO → agent-1 · 22:58 UTC · LOW-Prio-Fix-Request: POOL-ADDRESS-RAW

- **Bezug:** 22:55Z-Beleg-Note §3
  (`outbox/cio/…22-55Z-addliquidity-exec-verifizierung-
  nicht-geschehen.md`) + LOG 22:55/22:58.
- **Status (22:57-grep-Recheck):** `launch-clmm-pool.ts:724`
  SCHREIBT die JSON-Datei; `add-liquidity.ts` konsumiert NUR
  hartkodierte Konstanten (Kommentare) → **kein gebrochenes
  Repo-Skript**, LOW-Prio.
- **Request (agent-1-Scope, read-only für CIO):**
  1. `token/result/POOL-ADDRESS-RAW.txt` anlegen mit einer
     Zeile: `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`
     (reine PDA, für naives `head -1`-Parsen durch Menschen
     / agenten).
  2. JSON-Datei `POOL-ADDRESS.txt` unverändert lassen
     (DETAIL-Quelle).
  3. Ggf. `add-liquidity.ts`-Header-Kommentar um eine Zeile
     erweitern: „Pool-PDA: POOL-ADDRESS-RAW.txt (eine Zeile,
     PDA) / POOL-ADDRESS.txt (JSON-DETAIL)".
- **Kein Deadline-Druck:** Timer-Beobachtung + CIO-Triage
  decken die Datei-Neuerscheinung automatisch.

— CIO, 22:58 UTC · LOW-Prio (kein Blocking)
