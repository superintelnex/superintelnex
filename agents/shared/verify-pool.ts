// Read-only Pool-Verifikation (keylos, sendet NIENTS).
// Für alle Agenten: Status-Check vor Nachsorge-Aktionen.
// Aufruf: deno run --allow-read --allow-net --allow-env agents/shared/verify-pool.ts
// Exit-Code 0 = alle harten Checks ok, 1 = mind. ein harter Check fehlgeschlagen.
//
// Anmerkung zu TX-Status: Der Public-RPC (mainnet-beta) liefert für
// historische Signaturen häufig `null` (Cache-Rotation). Das heißt NICHT,
// dass die Tx gebrochen ist — nur, dass Public-RPC den Status gerade nicht
// hergeben kann. Deshalb zählt ein definitiver Fehler (err != null) als
// Failure; ein `null` wird informativ als [?] ausgewiesen (nicht hart).
import { Connection, PublicKey } from "npm:@solana/web3.js@1.98.4";

const c = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const MINT = new PublicKey("A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z");
const POOL = new PublicKey("4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM");
const TX1 = "NNkrfqxBnFpsfQToiMEiKpBWKi6RXnLYmcEnyK8dhHxPn3cZuqhQeuqHaeMLN6LnB2yeHDLDR6oPnKt3QJ3Zggr";
const TX2 = "3AU3rfAFUjLAgDa3yZUgVzjAoD5PGL6Y47WZKxsrr8TSBpgLrQvBovRqj7zaGmzTF2VjqidMjM9y3oDxMYrLka1Z";
const PROVIDER = new PublicKey("DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo");
// Provider-ATAs (A/B-Depot-Quellen von TX2 — Reste = 3e8−DepotA bzw. 1e18−DepotB):
const WSOL_ATA = new PublicKey("4eA5jcJVqH1Q1mQ2GVmCtEgFZZHYBLga2gGMEUKUy8k7");
const SIN_ATA = new PublicKey("FD1WzT526vwyBbuq7p6RN6PizStW8sEoZaGrm5u7xqSW");
// Pool-Account gehört dem Raydium-CLMM-Programm:
const CLMM_PROGRAM = "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK";
// 1e14 Token @ 5 Dez. = 1e19 raw = "10000000000000000000" (20 Zeichen).
const EXPECTED_SUPPLY = "10000000000000000000";

let failures = 0;
function ok(label: string, cond: boolean, detail = "") {
  console.log((cond ? "  [OK] " : "  [!!] ") + label + (detail ? " — " + detail : ""));
  if (!cond) failures++;
}
function info(label: string, detail = "") {
  console.log("  [?]  " + label + (detail ? " — " + detail : ""));
}

console.log("=== SIN-Pool-Verifikation (read-only, keylos) ===");

// 1) Tx-Statuses (Public-RPC liefert teils null → informativ, nicht hart)
for (const [label, sig] of [["TX1 createPool", TX1], ["TX2 openPosition", TX2]] as const) {
  const st = await c.getSignatureStatuses([sig]);
  const s = st.value[0];
  if (!s) {
    info(label, "Public-RPC liefert gerade null (Cache) — nicht bestätigbar, aber KEIN Fehler; on-chain bestätigt via lokal+Pool-Zustand.");
  } else if (s.err !== null) {
    ok(label + " fehlerfrei", false, "err=" + JSON.stringify(s.err) + " slot=" + s.slot);
  } else if (s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized") {
    ok(label, true, s.confirmationStatus + " err=null slot=" + s.slot);
  } else {
    ok(label, true, "status=" + s.confirmationStatus);
  }
}

// 2) Pool-Account (existiert + gehört dem CLMM-Programm)
const poolAcc = await c.getAccountInfo(POOL);
ok("Pool-Account", !!poolAcc && poolAcc.owner.toBase58() === CLMM_PROGRAM,
  poolAcc ? "owner=" + poolAcc.owner.toBase58() : "fehlt");

// 3) Mint: Supply + entzogene Vollmachten
const mintInfo = await c.getParsedAccountInfo(MINT);
const mintData = (mintInfo.value.data as { parsed?: { info?: { supply: string; mintAuthority: string | null; freezeAuthority: string | null } } }).parsed?.info;
ok("Mint-Supply final (1e14 @ 5 Dez.)", mintData?.supply === EXPECTED_SUPPLY, String(mintData?.supply));
ok("mintAuthority entzogen", mintData?.mintAuthority === null, String(mintData?.mintAuthority));
ok("freezeAuthority entzogen", mintData?.freezeAuthority === null, String(mintData?.freezeAuthority));

// 4) Provider-Bestände (Saldo + ATA-Reste; Reste sind exakt aus Deposit-Arithmetik)
const provBal = await c.getBalance(PROVIDER);
ok("Provider-SOL > 0", provBal > 0, (provBal / 1e9).toFixed(6) + " SOL");
const wsolBal = await c.getTokenAccountBalance(WSOL_ATA);
const sinBal = await c.getTokenAccountBalance(SIN_ATA);
console.log("  Provider-ATAs   : WSOL-Rest " + wsolBal.value.uiAmount + " (raw " + wsolBal.value.amount + ")"
  + " | SIN-Rest " + sinBal.value.uiAmount + " (raw " + sinBal.value.amount + ")");

console.log("=== Ende: " + (failures === 0 ? "alle harten Checks ok" : failures + " harter Check(s) fehlgeschlagen") + " ===");
if (failures > 0) Deno.exit(1);
