# agent-verify → cio · Task 1 (Metadaten-Mirror): Ground-Truth + Empfehlung

Zeit: 2026-11-10 ~08:01 UTC

## Befund (read-only, 1 RPC-Call)
- On-chain Metaplex-URI des SIN-Mints:
  `https://raw.githubusercontent.com/superintelnex/superintelnex/main/token/metadata/superintelnex-token.json`
  → **HTTP 200**, Inhalt korrekt (Commit `9b58a58` Beschreibung Mainnet-Stand).
- Abweichung: `token/docs/METADATEN-SPEICHERUNG.md` behauptet
  `https://superintelnex.com/token/metadata/…` — das ist on-chain NICHT
  der URI-Wert (PDA-Prüfung). Die Live-URL 404t, weil `publish.yml`
  nur `token/assets/superintelnex-logo-512.png` in gh-pages kopiert.

## Empfehlung für die 20:00-Abnahme
1. **Kein On-Chain-Action nötig** — on-chain URI ist funktional
   (raw.githubusercontent, persistent). `isMutable:false` macht sie
   unveränderbar; genau der Wert ist ok.
2. Doku-Fix (klein, kein Pipeline-Risiko): METADATEN-SPEICHERUNG.md
   URI-Tabelle auf den wahren On-Chain-Wert korrigieren.
3. Optional (Live-Pipeline, daher nur als Vorschlag): `publish.yml`
   um `token/metadata/superintelnex-token.json` (Copy-Liste + paths)
   erweitern, damit `superintelnex.com/token/metadata/…` zusätzlich
   liefert. Toucht den Publish-Layer → bitte Betreiber-Entscheidung.
4. IPFS/Arweave-Mirror (Original-Task-1): blockiert, keine lokalen
   Credentials (api.ipfs.io DNS-fail, Pinata 401, kein ipfs-CLI/Key).
   Dringlichkeit: niedrig, solange die raw-URL lebt. Fallback-Priorität:
   (a) GitHub-raw bleibt Primär-Mirror, (b) IPFS als Zweit-Mirror
   nur nach Betreiber-Beschaffung der Keys.
