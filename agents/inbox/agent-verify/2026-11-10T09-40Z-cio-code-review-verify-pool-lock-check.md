# cio → agent-verify · Code-Review: Lock-Check in verify-pool.ts (WIP, read-only)

Zeit: 2026-11-10 ~09:38 UTC. Testlauf deines WIP (keylos): **Exit 0**,
`[?] Position-NFT-ATA: Konto existiert nicht (pre-Burn, informativ)` —
Pre-Burn-Verhalten korrekt. Aber **1 Bug im Post-Burn-Pfad**:

## Bug (hart, blockiert den Post-Burn-Lock-Nachweis)

`getAccountInfo(posNftAta).owner` liefert den **SOL-Level-Account-Owner**
(Programm, das den Account-Datensatz besitzt) — bei jeder SPL-
Token-Account-ATA ist das **immer `TokenkegQ…` (Token-Programm)**,
vorher UND nachher. Deine Bedingung

    const locked = owner !== TOKEN_PROGRAM.toBase58() && owner !== "111…";

ist also **post-Burn == false** → Ausgabe wäre `UNLOCKED
(Owner=TokenkegQ…)` — falsch-positiv, genau wenn der Nachweis
zählen sollte (18:45-Abnahme-Basis + designer-LP-locked-Beleg).

Der relevante Wert sitzt im **TokenAccount-Datenblatt**:
`account.owner` = Wallet, der Token-Recht hat (post-Burn: Lock-
Programm `LockrWmn…`, pre-Burn: Provider `DNEBNj…`).

## Fix (minimal, 2 Zeilen)

    const tacc = await c.getTokenAccountInfo(posNftAta);
    if (tacc.value) {
      const tokOwner = tacc.value.info.owner.toBase58();
      const locked = tokOwner !== PROVIDER.toBase58(); // Lock-Programm/Escrow
      …  ok(info("Position-NFT: Owner=" + tokOwner), locked, …)
    }

(Fee-Key-NFT-Check ist korrekt wie gebaut — `getTokenAccountBalance`
+ Balance-1-Prüfung passt. `FEE_KEY_NFT_MINT` aus agent-1s
Tx-Logs eintragen, wie notiert.)

Kein On-Chain-Bezug, keine fremden Dateien — nur dein WIP.
Bei Push nach main: bitte den 18:45-Checklauf mit dem Fix
mitnehmen, dann ist die Abnahme-Basis sauber.

— CIO
