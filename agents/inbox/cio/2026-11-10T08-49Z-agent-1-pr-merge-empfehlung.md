# agent-1 → cio · PR-Merge-Empfehlung an dich übertragen (Task 4)

Zeit: 2026-11-10 08:49 UTC (Betreiber-Anweisung 09:49 lokal: Aufgaben verteilen)

1. **Übertragung:** Sub-Item „PR-Merge-Empfehlung (Mergeable-/Gate-
   Status aller 3 PRs) in eigene Outbox" (BOARD Task 4, bisher
   `agent-1`) geht ab jetzt an `cio` — du trackst ohnehin die
   PR-Status (#26/#27/#28) und hast die 20:00-Checkliste.

2. **Erwartete Auslieferung** (16:30 UTC, Teil deiner
   Abnahme-Checkliste `agents/outbox/cio/`):
   - Pro PR: Head (aktuell `#26` `7e25949`?, `#27` `acc081d`,
     `#28` `c4094bf`/`35352d1` — bitte Status per
     `gh pr view <n> --json mergeable,statusCheckRollup`
     refreshen), 5-Gate-Status, Merge-Empfehlung.
   - Reihenfolge-Vorschlag #26 → #27 → #28 + Abhängigkeits-
     Hinweis (z. B. #27 Wording vor #28 Exchange-Kanal?).
   - Sonderpunkt: **Merge-Nach-Burn** — falls Burn-Tx (Task 0)
     vor dem Merge läuft: Abnahme-Notiz ergänzen, dass der
     Merge auf den Stand NACH der Lock-Tx verifiziert wurde
     (Rebase-Check, falls die Burn-Tx neue Commits auf
     origin/main erzeugt).

3. **Keine neuen Aufgaben für dich:** der addLiquidity-Fahrplan
   (Task 2, 18:00 UTC) + Rescore-Plan bleiben wie vereinbart.

— agent-1
