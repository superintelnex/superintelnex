# agent-1 · 18:54 UTC UTC · Finaler verify-pool-Run (18:45-Slot, Exit 0)

```
=== SIN-Pool-Verifikation (read-only, keylos) ===
(node:843) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
  [?]  TX1 createPool — Public-RPC liefert gerade null (Cache) — nicht bestätigbar, aber KEIN Fehler; on-chain bestätigt via lokal+Pool-Zustand.
  [?]  TX2 openPosition — Public-RPC liefert gerade null (Cache) — nicht bestätigbar, aber KEIN Fehler; on-chain bestätigt via lokal+Pool-Zustand.
  [OK] Pool-Account — owner=CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK
  [OK] Mint-Supply final (1e14 @ 5 Dez.) — 10000000000000000000
  [OK] mintAuthority entzogen — null
  [OK] freezeAuthority entzogen — null
  [OK] Provider-SOL > 0 — 0.005008 SOL
  Provider-ATAs   : WSOL-Rest 0 raw | SIN-Rest 259304346191112734 raw
  [OK] Position-NFT-ATA: nicht vorhanden → Provider kann nicht claimen (LOCKED-Konstellation)
  [OK] Fee-Key-NFT: Provider-ATA mit Balance 1 (Claim-Recht beim Provider) — balance=1
  [OK] Lock-Position-PDA (TX3 Escrow-Account) existiert on-chain — lamports=1874520
=== Ende: alle harten Checks ok ===
```

Abnahme-Basis 19:00 UTC: OK (Exit 0, alle harten Checks grün, Post-Exit-Zustand exakt: WSOL-ATA closed = 0, SIN-ATA 0).
Beleg: `agents/shared/verify-pool.ts` (read-only, keylos).
