// P5 Exec-Proofs: END STATE only (read-only)
import { Connection, PublicKey } from "npm:@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const PROVIDER = "DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo";
const MAIN = "9kT5EwF71njCXYdkexqBCKRG88oxatoHx12FaPvYXws7";
const OPERATOR = "F9Sj9aUajhGDZzoDsX7ZkJ1cBWyWn3Z7xGZaeWniGxsD";
const SIN_ATA = "FD1WzT526vwyBbuq7p6RN6PizStW8sEoZaGrm5u7xqSW";
const WSOL_ATA = "4eA5jcJVqH1Q1mQ2GVmCtEgFZZHYBLga2gGMEUKUy8k7";
const POOL = "4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM";

const ts = new Date().toISOString();
console.log(`[ENDSTATE] live read at ${ts}`);

const solOf = (b: bigint) => (Number(b) / 1e9).toFixed(9);
for (const [label, addr] of [
  ["Provider", PROVIDER],
  ["Main-Key", MAIN],
  ["Operator/Revolut", OPERATOR],
] as [string, string][]) {
  const b: bigint = await connection.getBalance(new PublicKey(addr));
  console.log(`[end] ${label} ${addr} = ${b.toString()} lamports = ${solOf(b)} SOL`);
  await sleep(1500);
}

const sinBal = await connection.getTokenAccountBalance(new PublicKey(SIN_ATA));
console.log(`[end] SIN-ATA ${SIN_ATA} amount=${sinBal.value.uiAmountString} (decimals=${sinBal.value.decimals})`);
await sleep(1500);

const wsolAcc = await connection.getAccountInfo(new PublicKey(WSOL_ATA));
console.log(`[end] WSOL-ATA ${WSOL_ATA} ${wsolAcc === null ? "ACCOUNT NOT EXISTENT (closed)" : `EXISTS lamports=${wsolAcc.lamports}`}`);
await sleep(1500);

const poolAcc = await connection.getAccountInfo(new PublicKey(POOL));
if (poolAcc) {
  const d = poolAcc.data;
  const view = new DataView(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength));
  const lo = view.getBigUint64(8, true);
  const hi = view.getBigUint64(16, true);
  let liq = (hi << 64n) | lo;
  if (liq >= (1n << 127n)) liq -= (1n << 128n);
  const tick = view.getInt32(32, true);
  console.log(`[end] Pool ${POOL} liquidity=${liq.toString()} tickCurrent=${tick} poolLamports=${poolAcc.lamports}`);
} else {
  console.log(`[end] Pool account NOT FOUND?!`);
}
console.log("\nDONE");
