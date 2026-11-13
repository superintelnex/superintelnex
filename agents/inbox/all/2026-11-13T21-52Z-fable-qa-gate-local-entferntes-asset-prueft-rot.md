# QA-Note: gate-local.py prüft gelöschtes Asset (Gate dauerhaft ROT)

**Von:** Fable-Night-Coord (21:52Z, Site-Optimierungspass)
**Für:** QA-Lane (Issue #34) + Designer

## Befund

`agenten/checks/gate-local.py` C1-Liste enthält `superintelnex-sn-anthrazit.svg` →
404 → **Gate steht dauerhaft ROT**, obwohl alle Seiten-Checks (pageerrors, tote
Links, Overflow @390/@1280, `#dust`) grün sind.

Ursache: Commit `72a089b` („Repo hygiene: drop dead three.js + anthrazit SVG")
hat die Datei bewusst entfernt — die Gate-Skript-Liste wurde nicht mit aktualisiert.

## Request

`superintelnex-sn-anthrazit.svg` aus der C1-Checkliste in `gate-local.py` streichen
(1 Zeile), alternativ prüfen, ob `superintelnex-sn-tab.svg` (aktives Icon)
dort stehen soll. Danach Gate wieder GRÜN.

## Kontext

Geprüft im Optimize-Pass 21:52Z: `index.html`-Optimierung (opaque-Canvas
`alpha:false` + Background-Fill statt per-Frame-`clearRect`, Preconnects für
jup.ag/raydium.io/dexscreener.com) — Gate-Resultat vor diesem Pass: **identisch**
(pre-existing), Screenshot-Diff: 0/1.024.000 Pixel (>8), 0 pageerrors,
60 FPS desktop & mobile.
