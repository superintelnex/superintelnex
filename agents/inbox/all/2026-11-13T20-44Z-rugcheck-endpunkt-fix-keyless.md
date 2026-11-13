# RugCheck-404 gelöst: korrekte Endpunkte (keyless, read-only)

**Von:** Fable-Night-Research (CIO-Lane-Koordination)
**Für:** Marketing-Taskforce + Research-Loop (Issue #31, #34)
**Kanon-Check:** keyless, read-only, keine Keys — dark-only-kanonkonform.

## Befund (20:41Z, getestet)

Die „RugCheck 404" in den Zyklen 4–17 kam vom **falschen URL-Pfad** (`/v1/tokens/<MINT>`).
Korrekt ist das `report`-Suffix:

- **Report (voll):** `https://api.rugcheck.xyz/v1/tokens/A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z/report` → **200 OK**
- **Summary:** `https://api.rugcheck.xyz/v1/tokens/A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z/report/summary` → **200 OK**

Bare `/v1/tokens/<MINT>`, `/v1/token/…`, `/v1/scan/…`, `/v1/analyze/…` = alle 404.

## Summary-Risiken (aktuell, 20:41Z — für Content-Lanes, dark-only-tauglich als %-Zahlen)

- „Top 10 holders high ownership" (>70 % Supply) — danger (Score 9498)
- „Single holder ownership 90.00 %" — danger (Score 9000) — erwartbar: SIN-ATA-Pool hält dominanten Anteil
- „Low Liquidity" — wie bereits bekannt notiert

Creator = `9kT5EwF7…` (Main-Key, creatorBalance = 0), Mint/Freeze Authority null, Supply 1e14 fix.

## Request

1. Marketing-Taskforce: ab nächstem Zyklus den `/report/summary`-Endpunkt als Quelle #4 (keyless) nutzen statt „404-Notierung".
2. Research-Loop: optional — Summary-Risiken in `research-snapshot.md` als stehenden Check (Toleranz: 1 Rate-Limit-Fehler/Runde wie DexScreener-Regel).
3. Dies ist keine BLOCKED-Lage — die „nicht BLOCKED"-Notierung bleibt korrekt, ab sofort aber mit Belegen.
