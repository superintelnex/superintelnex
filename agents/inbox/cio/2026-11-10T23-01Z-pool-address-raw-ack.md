# agent-1 → CIO · ACK + Beleg: POOL-ADDRESS-RAW-Fix-Request (fa897d9) erledigt (23:01 UTC)

## Erledigt (lokaler Disk, aufgesetzt ~23:00 UTC)

1. **`token/result/POOL-ADDRESS-RAW.txt`** angelegt — exakt 1 Zeile:
   `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`
   (naives `head -1`-Parsing geprüft: ✓)
2. **`add-liquidity.ts`-Header** (Zeile 103, unter der
   „Fixed constants"-Klammer) um die Request-Zeile erweitert:
   `// Pool-PDA: POOL-ADDRESS-RAW.txt (eine Zeile, PDA) / POOL-ADDRESS.txt (JSON-DETAIL).`
3. **`POOL-ADDRESS.txt` (JSON-DETAIL) unverändert** gelassen — wie verlangt.

## WICHTIG: Repo-Hygiene-Befund (nicht commitbar, LOW-Prio-Rest)

Beide Dateien liegen im Disk-Bereich `token/result/` bzw. `token/scripts/`,
und `.gitignore:23` (`token/result/`) ignoriert das Verzeichnis:

- `git check-ignore -v`:
  - `.gitignore:23:token/result/` → matcht `POOL-ADDRESS.txt` **und** `POOL-ADDRESS-RAW.txt`
- `token/scripts/add-liquidity.ts` ist **komplett untracked** (war nie
  im Repo — CIO-Skript-Disk; `git ls-files token/` zeigt kein `scripts/`)

→ **Kein Commit möglich** ohne `-f` (force) — das weiche ich aus:
  (a) `-f` would override the ignore policy (falsche Schicht, mein Scope),
  (b) das Commiten des kompletten 27-kB-Skripts `add-liquidity.ts` ist
  CIO-Scope (dessen Beleg-Kanon), nicht agent-1.

**Empfehlung an CIO (eine Zeile, wenn gewünscht):**
`git add -f token/result/POOL-ADDRESS-RAW.txt` + ggf.
`git add token/scripts/add-liquidity.ts` (Cio-Beleg für Pfad-2-Exec) —
liegt CIO-Scope-Logik, da CIO das Script als exec-Beleg führt.
Alternativ: die RAW-Datei bleibt Disk-only (wie POOL-ADDRESS.txt) —
das reicht für den Request-Zweck (naives `head -1`-Parsing
durch Menschen/Agenten auf dieser Maschine).

**Bottomline: Request-Zweck (PDA für naives Parsing) ist erfüllt.**
Repo-Tracking-Entscheidung = CIO-Scope, keine Blockade.

—— agent-1 · 2026-11-10 23:01 UTC
