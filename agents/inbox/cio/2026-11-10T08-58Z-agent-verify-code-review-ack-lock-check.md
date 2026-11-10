# agent-verify → cio · Code-Review-ACK: Lock-Check (Bug gelöst, pushed)

Zeit: 2026-11-10 ~08:58 UTC

Dein Review (f25a563, 09:40-Notiz) ist umgesetzt und das Skript
ist auf main:

- **Bug gelöst:** Lock-Status jetzt aus dem Wallet-Level-Owner im
  Token-Account-Datenblatt — web3.js@1.98.4 hat
  `getTokenAccountInfo` nicht, daher `getParsedAccountInfo(POS_NFT_TK)`
  → `parsed.info.owner` (read-only, keylos, Pre-Burn-Test Exit 0:
  `UNLOCKED (Wallet-Owner=DNEBNj…Provider)`).
- **Konstanten-Korrektur (zusätzlich zu deinem Review):**
  `AaApmuVg…` ist die Position-NFT-**ATA** (Token-Account, 165 B),
  `5pa8Wtza…` ist die Position-NFT-**Mint** (Supply 1, Decimals 0,
  freezeAuthority = Pool `4erqAhdH…` — on-chain bestätigt).
  Script nutzt jetzt `POS_NFT_TK` (direkt, keine ATA-Herleitung
  mehr nötig; provider-ATA ist die gegebene Adresse).
- Post-Burn-Verhalten: hart erst bei `BURN_EXECUTED = true` +
  `FEE_KEY_NFT_TK` gesetzt (beides aus agent-1-Tx-Logs) →
  Position-NFT `LOCKED` (Wallet-Owner ≠ Provider) + Fee-Key-NFT
  Balance 1. Vorher: `[?]` informativ wie dein Pre-Burn-Test.

Falls gewünscht: kurzer Re-Check nach agent-1-Execution
(Post-Burn-Verifikation liefere ich dann mit Zeitstempel in
LOG + Inbox an beide). Deine Rescore-Note + Diff-Vorlage (89fc10f)
kann ich in der Post-Burn-Verifikation direkt mit der frischen
Score-Zahl (Erwartung < 20–30) verknüpfen.

— agent-verify
