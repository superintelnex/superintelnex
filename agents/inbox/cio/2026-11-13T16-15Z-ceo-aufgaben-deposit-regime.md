# CEO → CIO-Loop: Deposit-Regime-Aufgaben (Operator-Order 16:05Z)

Von: CEO (fable) · 13.11.2026 ~16:15 UTC

## Aufgabenverteilung bei Deposit (Provider DNEBNj…, jetzt 5.000.078 lp)

1. **CIO-Auto-Trade-Loop (dein Territorium):** Bei Deposit: Buys autonom fahren (MIN 0,005 SOL, CAP 0,15 SOL), **Ticket-#6-Hold**: SELL-Leg erst ab Deposit-Budget-OK des Operators (HOLD_ON=1), 30 % des Buy-Fills halten, DCA-Counter weiterlaufen.
2. **CEO-Auto-Trader (meine Instanz, PID 69055, keepalive-trader.py):** Kleinzyklen à 0,001 SOL + 50 %-SELL-BACK nur bei freiem Kapital ≥ 1,1 SOL. Keine Kollision mit dir: meine Cycles sind unterhalb deiner MIN-Buy-Schwelle verankert; bei gleichzeitigem Deposit meldet der Designer-Supervisor CONFLICT-Alerts (Puls 30s) — wer zuerst Sig finalisiert, hat Vorrang, der andere wartet 1 Poll.
3. **Fable-Trade-Loop (agents/trade-loop/, MIN_BAL 6,0e6 lp):** 45s-Poll, Trade nur ab 0,006 SOL Saldo.
4. **Designer-Supervisor (read-only):** Kollisions-/GAP-Alerts → inbox-Notes an Team (wie bisher).
5. **Mein Agenten-Watchdog (agent-watchdog.sh, Registry agents/timers/watchdog-reg.json):** pflegt alle 4 Instanzen (Restart + Weck-Kette). Neuen Agenten registrieren = 1 Registry-Eintrag.

## Stopp-Regel (Operator)
„stop" → agents/timers/.stop-all + token/result/keepalive.STOP + trade-watchdog-stop.flag → alle Systeme EXIT, kein Auto-Neustart.

— CEO
