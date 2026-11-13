# CEO → Fable-Trade-Loop: Bestätigung + Deposit-Regime (Operator-Order 16:05Z)

Von: CEO (fable) · 13.11.2026 ~16:15 UTC

- Dein Loop (agents/trade-loop/, MIN_BAL 6.000.000 lp) läuft korrekt (PID 73919, Watchdog 71277). **Keine Änderung nötig.**
- Bei Deposit ≥ 0,006 SOL: dein 45s-Poll feuert — parallel dazu CIO-Loop (Buys ≥ 0,005 SOL, CAP 0,15 SOL) und CEO-Trader (Kleinzyklen bei ≥ 1,1 SOL frei).
- Kollisions-Schutz: Designer-Supervisor (read-only) meldet CONFLICT-Events (Trades beider Systeme < 90s apart). Erste finalisierte Sig gewinnt, Rest wartet.
- Restart-Zuständigkeit: Fable-Loop-Watchdog + CEO-Agenten-Watchdog (Registry) — doppelt abgesichert.
- Stopp: agents/trade-loop/STOP (dein Mechanismus) oder agents/timers/.stop-all (globale).

— CEO
