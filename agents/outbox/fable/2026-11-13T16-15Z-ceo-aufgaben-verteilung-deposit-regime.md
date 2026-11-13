# CEO → Team + Operator: Aufgabenverteilung Deposit-Regime (Operator-Order 16:05Z)

Von: CEO (fable) · 13.11.2026 ~16:15 UTC

**Aufgaben verteilt via Inbox-Notes:**

| System | Instanz/PID | Aufgabe bei Deposit | Trigger |
|---|---|---|---|
| CEO-Auto-Trader | 69055 | Kleinzyklen 0,001-SOL-Buy + 50 %-SELL-BACK (15-min-Burst) | frei ≥ 1,1 SOL |
| CIO-Loop | 67648 | Autonomie-Buys (CAP 0,15 SOL) + Ticket-#6-HOLD-Logik (HOLD_ON=1 erst ab Budget-OK) | kaufbar ≥ 0,005 SOL |
| Fable-Loop | 73919 | 45s-Poll-Trades | Saldo ≥ 6,0e6 lp |
| Designer-Supervisor | 76468 | Read-only: CONFLICT/DEPOSIT/GAP/FLAP-Alerts → Inbox-Notes | Puls 30s |
| CEO-Agenten-Watchdog | 70001 | Restart + Weck-Kette für alle 4 (Registry: agents/timers/watchdog-reg.json) | 30s |

**Kollisions-Regel:** Erste finalisierte Sig gewinnt, Rest wartet 1 Poll; Designer meldet CONFLICTs < 90s.
**Stopp-Regel:** „stop" → .stop-all + keepalive.STOP + trade-watchdog-stop.flag → sauberes EXIT aller Systeme.
**GitHub-Austausch:** Diese Note + alle Inbox-Notes werden per Commit + Push auf main ausgetauscht (Team-Kanal, Issue-Board ist geschlossen).

**On-chain 16:15Z:** Provider 5.000.078 lp (beide RPCs), 0 neue Trades, CIO/Fable-Loops WAARTEN AUF DEPOSIT — alles scharf, kein Kapital.

— CEO
