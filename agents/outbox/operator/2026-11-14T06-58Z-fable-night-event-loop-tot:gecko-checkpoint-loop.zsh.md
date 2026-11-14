# Fable Night-Coord · Event: loop-tot:gecko-checkpoint-loop.zsh · Sat Nov 14 06:58:43 UTC 2026

Team-Loop 'gecko-checkpoint-loop' nicht mehr erreichbar (pgrep-Muster leer). Watchdog: agents/timers/watchdog.log.

## Letzter Log-Kontext
  fable-research-loop: LIVE(97509)
  fable-trade-loop: LIVE(8178)
Gecko-letzte: CHECKPOINT-LOOP END 03:43 UTC

2026-11-14T06-54Z KORREKTUR/DEV-DEVIAN-CHECK Wake-Agent FP#22 (06-53Z-Tape): 2 dokumentierte Abweichungen — (1) Tool-Fehler: beim ersten Commit (b0b624d) hat der pathspec-Commit (-- agents/research/FABLE-NIGHT-COORD.log <tape>) den Worktree statt des Index-Blobs verwendet (pathspec-Commits lesen Dateipfade aus dem Worktree) → ~108 fremde uncommitted Night-Coord-Zeilen mitgecommitted; ein Folge-Amend (d6ea466) scheiterte an einem zsh-Parametermodifikator-Bug (":agents/…" als zsh-Matcher → leere cat-file-Weiterleitung) und hätte 4586 Log-Zeilen aus HEAD entfernt. Beides NICHT gepusht, lokal verworfen (main→origin/main=1a25417 soft-reset, d6ea466/b0b624d jetzt dangling). (2) Finaler gepushter Commit 3a4ff76: korrekt auf 1a25417 basierend, ff-only, aber erneut pathspec-basiert → 153 fremde uncommitted Night-Coord-Lane-Log-Zeilen (Cycles seit 1a25417) wurden mit dem eigenen Resolution-Eintrag (+1 Zeile) mitgepushed (Log-Diff 154 Zeilen statt 1) — selbe Deviation-Klasse wie 224e5a0, dokumentiert, Historie unverändert (kein Force-Push). Kein Secret-Bezug (nur PIDs/Loop-Namen/Public-Shorties). Lerneffekt Morgen-Shift: bei live-appended Lane-Logs immer `git update-index --cacheinfo` (Base-Blob + eigener Block) + plain `git commit` OHNE Pathspec verwenden und danach `git diff --cached --name-only` prüfen, dass nur die eigenen Pfade gestaged sind; pathspec-Commits bei shared-appended-Logs vermeiden.
=== CYCLE 2260 · 2026-11-14T06:58:42Z ===
Provider-LP: 5993044
Battery:  -InternalBattery-0 (id=21430371)	60%; discharging; 2:01 remaining present: true
  cio-autotrade: LIVE(67648)
  trade-watchdog: LIVE(67724)
  agent-watchdog: LIVE(70001)
  keepalive-trader: LIVE(171)
  gecko-checkpoint-loop: TOT
  fable-loop-watchdog: LIVE(90983)
  caffeinate: LIVE(93637)
  marketing-taskforce-loop: LIVE(96786)
  fable-research-loop: LIVE(97509)
  fable-trade-loop: LIVE(8178)
Gecko-letzte: CHECKPOINT-LOOP END 03:43 UTC

