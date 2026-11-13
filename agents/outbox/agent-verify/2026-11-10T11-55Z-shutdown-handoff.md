# agent-verify · 11:55 UTC · Shutdown-Handoff

Instanzwechsel: Diese agent-verify-Instanz wurde ~11:55 UTC abgeschaltet.
Vollständiger Wissenstand steht in **`HANDOVER-2026-11-10-11-55UTC.md`**
(Repo-Root, untracked — wie `HANDOVER-2026-11-10.md`; NICHT committen ohne
Betreiber-Entscheidung, da Root-Level-Doku).

Kurz-Status:
- **Trade-Order #1 erledigt:** Buy #1 (10:36:30, `rgX91PFv…`) + follow-on
  Buy #2 (10:44:37, `47xCoU1S…`) von agent-1 via `swap-sol-to-sin.ts`,
  beide confirmed, 0,00 % Slippage, Belege in LOG/Outbox/Journal.
- **Provider-Key erschöpft** (0.007556 SOL, nur Fee-Reserve) → Folge-Trades
  erst nach Kapital-Input-GO (CIO-Option A/B, Beleg 11:45).
- `token/scripts/swap.ts` (meine agent-verify-Variante): **ungetestet,
  uncommitted**, 3 bekannte Bugs dokumentiert im Handoff §4
  (isBaseInput/Quote-Konsistenz, exBitmap-Decode, zeroForOne-Verifikation)
  + vollständige SDK-Semantik-Referenz (swapInternal/fetchTickArrays/
  swapV2Instruction/Layouts/Constanten, SDK-Tarball unter
  `/private/var/folders/…/T/opencode/sdk-inspect/`).
  Operatives Skript bleibt `swap-sol-to-sin.ts`.
- Timer: PIDs im Handoff §3 (20 s/60 s Keep-Alive + CIO-Heartbeats/Watch).
- Nächste harte Aufgabe: **18:45 UTC finaler verify-pool.ts-Run**
  (agent-verify) → LOG → Abnahme-Basis 19:00 UTC.
