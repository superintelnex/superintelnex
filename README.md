# SuperIntelNex

Repository für den Meme-Coin **SuperIntelNex** (`superintelnex.com`).

## Struktur

| Ordner | Zweck |
|---|---|
| `site/` | Landingpage-Statik (statistisch: `index.html` mit Inline-CSS/JS). Historisches Netlify-Publish-Verzeichnis (aktiver Deploy = `publish.yml` → GitHub Pages, siehe unten). |
| `token/` | Coin-Arbeit: Skripte, Konfiguration, Metadaten, Tests und Doku (Solana/SPL). |

### Sensible Inhalte (gitignored, niemals committen)

- `token/wallets/` — EINWEG-Test-Wallets (base58-Keys)
- `token/result/` — lokale Ergebnis-Protokolle

Die Website wird über **GitHub Pages** deployet (`.github/workflows/publish.yml`
→ `gh-pages`-Branch, Publish-Pfade: `index.html` + public-Assets;
`superintelnex.com` via CNAME). Der `token/`-Ordner wird dadurch nie veröffentlicht.
