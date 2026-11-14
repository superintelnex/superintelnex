# Agent Keep-Awake & Continuous Loop Protocol

Leitfaden und Prompt-Vorlage, um KI-Agenten daran zu hindern, nach einem Durchlauf in den Ruhemodus zu verfallen.

---

## 1. Wie das Wachhalten technisch funktioniert

Standardmäßig beenden LLM-Agenten ihre Ausführung, sobald keine Tools mehr aufgerufen werden, und warten passiv auf eine Nutzereingabe. 

Um einen **kontinuierlichen Wachmodus** zu erzwingen, nutzt der Agent eine rekursive Timer-Kette über das `schedule`-Tool:
1. In jedem Durchlauf führt der Agent seine Überwachungs-, Research- oder Trading-Aufgaben aus.
2. **Vor dem Beenden des Turns** ruft der Agent zwingend das `schedule`-Tool mit einem Intervall von 20–30 Sekunden auf (`DurationSeconds: 20`).
3. Nach Ablauf der 20 Sekunden sendet das System dem Agenten eine automatische High-Priority-Wakeup-Nachricht.
4. Der Agent erwacht, prüft den Status, arbeitet anstehende Aufgaben ab und schaltet **erneut** den nächsten 20-Sekunden-Timer scharf.

---

## 2. Der Universelle Prompt für andere Agenten (Copy & Paste)

Diesen Prompt kannst du 1:1 an jeden Agenten (im Chat oder als System-Prompt) übergeben:

```text
WICHTIGE ANWEISUNG: Du darfst NIEMALS in den Ruhemodus gehen oder passiv auf mich warten, da ich nicht am Platz bin.

Halte dich strikt an folgende Wachhalte-Regel:
1. Führe in jedem Durchlauf deine Aufgaben (Überwachung, Code-Verbesserung, Research, Trading-Prüfung) aus.
2. Beende deinen Turn NIEMALS ohne das `schedule`-Tool aufzurufen!
3. Setze am Ende jedes einzelnen Durchlaufs zwingend einen Timer:
   `schedule(DurationSeconds=20, Prompt="Fortlaufender Wach-Loop: Prüfe Aufgaben, Daemons und Markt. Kein Ruhemodus.")`
4. Sobald der Timer abläuft und dich aufweckt, wiederholst du diesen Zyklus: Aufgabe prüfen -> nächsten 20s-Timer setzen -> Turn beenden.
5. Bleibe so lange kontinuierlich aktiv und im Einsatz, bis ich dir im Chat ausdrücklich "Stop" schreibe.
```

---

## 3. macOS Hardware-Wachhalte-Schutz

Damit das Betriebssystem im Hintergrund nicht einfriert:
- **Ladekabel anschließen** (verhindert Clamshell-Deep-Sleep).
- **Caffeinate aktiv halten:**
  ```sh
  caffeinate -s -i -d &
  ```
- **Launchd-Timer:** Zeitstempel für geordnete Stopps erst auf das gewünschte Schichtende (z. B. 18:00 Uhr) terminieren.
