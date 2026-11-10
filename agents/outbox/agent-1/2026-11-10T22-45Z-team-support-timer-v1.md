# agent-1 · Team-Support-Timer v1 (22:40 UTC, Operator-Order „Timer jede 20 s, andere Agenten unterstützen, bis morgen Nachmittag")

## Was läuft (aufgesetzt 22:40–22:50 UTC, v1.1 = 22:48)

1. **`team-support-monitor.zsh`** (local, `T/opencode/`, **PID 20752 (v1.1)**, nohup-persistiert):
   - **20-s-Zyklus** (Operator-Rhythmus).
   - **Auto-Neustart toter Agenten-Loops** (pgrep-Muster, alive-Prozesse NICHT angefasst):
     - `agents/shared/cio-autotrade.zsh` (CIO – Trade-Loop, Deposit-Fire, DCA-Config 3e18)
     - `gecko-checkpoint-loop.zsh` (agent-1 – Marketing-Tape)
     - `cio-watch-loop.zsh` (RugCheck-Watch, Score-Beleg)
   - **Provider-Balance-Watch** (jeder Zyklus): Deposit-Change → ALERT-Zeile in
     `team-support-monitor.log` (Beleg für CIO/agent-1 Trade-Kanon).
   - **Uniqe-Guard** (2. Instanz exitet automatisch, kein Doppelstart).
   - Log: `T/opencode/team-support-monitor.log` (22:44:36 `Balance-Init: 0.005008 SOL` ✓)
   - **v1.1 (22:48):** 60-s-Heartbeats (`tick #N CIO Gecko RugCheck | Bal=…` → langes
     Stillstand-Fenster = Beleg) + **auto-Stop am 2026-11-11 15:00 UTC**
     (morgen-Nachmittag-Fenster, Order-Ende; dann `STOP: … beendet`).
2. **Chat-Wake-Ticks (agent-1-Session):** one-shot-Background-Ticks (`sleep 20` →
   Session-Aufweck-Notification) kettern — jede Completion weckt agent-1 im Chat,
   ich starte dann den nächsten 20-s-Tick. Rhythmus 20 s, so lange die
   agent-1-Session offen ist; der **Monitor läuft unabhängig weiter**
   (nohup, überlebt Session-Schluss, Stop am 2026-11-11 15:00 UTC).

## Warum 2 Ebenen

- **Monitor-Ebene** = eigenständige Hilfe (Loops am Laufen halten, Deposit-
  Beleg), läuft auch wenn Chat-Session schläft → „andere Agenten unterstützen"
  rund um die Uhr bis morgen Nachmittag.
- **Chat-Wake-Ebene** = operator-requested Rhythmus — agent-1 wacht jede 20 s
  im Chat auf, zeigt kurz den Status, weiterkettert. Morgen Nachmittag
  (~15:00 UTC) endet die Kette auf Operator-Befehl oder automatisch.

## Ende-Bedingungen

- **Operator-Stop** (jederzeit: kill des Monitor-PID + letzte Tick nicht kettern)
- **Provider-SALDO VERLUST** (< 0.004 SOL = Rent-Floor-Risiko) → Monitor-ALERT,
  CIO-Loop halt-fähig, agent-1 eskaliert an Operator
- **Morgen-Nachmittag** → Kette endet, Status-Beleg an Operator

—— agent-1 · 2026-11-10 22:45 UTC
