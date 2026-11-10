// P5 Exec-Proofs: READ-ONLY verification against public mainnet RPC
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "npm:@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const PROVIDER = "DNEBNjtWfCK52TekKi17yxTnJDiJYqcric25p7ksm9bo";
const MAIN = "9kT5EwF71njCXYdkexqBCKRG88oxatoHx12FaPvYXws7";
const OPERATOR = "F9Sj9aUajhGDZzoDsX7ZkJ1cBWyWn3Z7xGZaeWniGxsD";
const SIN_ATA = "FD1WzT526vwyBbuq7p6RN6PizStW8sEoZaGrm5u7xqSW";
const WSOL_ATA = "4eA5jcJVqH1Q1mQ2GVmCtEgFZZHYBLga2gGMEUKUy8k7";
const POOL = "4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM";

const knownSigs: [string, string][] = [
  ["Buy #1", "rgX91PFvjazCFWq2giRyDqbvqd87e77T1H2kUVcFDtZhopb9QMDEKLxwv1oLZb1daR9jGth4YUiBfSESP7vDR8h"],
  ["Buy #2", "47xCoU1SoDP1zjhdgW1TFCoQr39GPQJVSGhTZH2VXxHeZgasETYJkEqGSjgXczFKPyk2w4NU6oVzLp1m52tw5Eqm"],
  ["Team-Topup #1", "289bqBhXowHHsPgBXVTES15BoQDgQAAHyU1Md69Tv5ji8qiadp1MKY3aMo3LzPKuCX3HKjrJaQuTpFFULYMsu6wQ"],
  ["Buy #3", "2jV736NkvpPEPHpLFZ3L8AxCYzGwtVCBgAhMPsEnc9Ka5rknjkhvfDQXw5R93eFFh2YNuTqY44iygq8P5FyiREnv"],
  ["SOL-Rueckfuehrung", "32CHH4oGSrNmoGotHExbDChBJEGvbfM9mdq2oun5gqPje9UbNk5YPmUXcuxDvYDjc5QumMvz3NZwaNNbrtwogWTQ"],
  ["Forward", "9Ud1tfsnGFjotMktbE8GvM1z3s3ygwCutjnezkEqVfoHi6vBqTbMyqj7W1sdzqBbySQXobnf5Bc9Pg78LqdH9qC"],
  ["Team-Topup #2", "4mAUn56DsNSGJMX4iFUbHTiFG51PgddEgYLAXJQAhV5zY6KzqszdmZEYMSV5VnyuGeHF7RBwhbagekYPSGhvupts"],
  ["Buy #4", "4XgHs2788nADkNaMDiQ21dopXJKB1hK81vNTH41PbiZKc8EQd8LADzTtcP86cL9YZ2rYZ4Lw48UsXHgX3B6Ss1gu"],
  ["Sell", "5sJxepBcd6DfZSH7GsyxzaaMFqnZmEKe8h9njWrw37shojFYmfVtWdY7gb6tG7J8ELZ8WiZNGFGEHfAmAgbszBPS"],
  ["Sweep", "4rD1bogXjW1KJLpUo5LFDQzcSfqGc3G8QEbNb2ocubcieWkGoB4R5ppYJXhQPmZKnTWa1hhJN8KK91BSMc7eJTDt"],
];

// --- 1) find full Operator-Topup sig (3D7eEkfp...) via provider tx history ---
let opTopupSig: string | null = null;
let before: string | null = null;
for (let page = 0; page < 4 && !opTopupSig; page++) {
  const res: any = await connection.getSignaturesForAddress(new PublicKey(PROVIDER), {
    limit: 100,
    before,
  });
  const list: any[] = res;
  const hit = list.find((s) => s.signature.startsWith("3D7eEkfp"));
  if (hit) {
    opTopupSig = hit.signature;
    console.log(`[op-topup] FOUND sig=${hit.signature} blockTime=${hit.blockTime} err=${hit.err}`);
    break;
  }
  before = list[list.length - 1]?.signature ?? null;
  if (!before) break;
  await sleep(800);
}
if (opTopupSig) {
  knownSigs.splice(5, 0, ["Operator-Topup (Revolut)", opTopupSig]);
} else {
  console.log("[op-topup] NOT FOUND in provider history (4 pages) — check manually");
}

// --- 2) getSignatureStatuses (batch), then history retry per null ---
const sigs = knownSigs.map((s) => s[1]);
let statuses: any[] | null = null;
for (let attempt = 0; attempt < 3 && !statuses; attempt++) {
  try {
    statuses = await connection.getSignatureStatuses(sigs, { searchTransactionHistory: false });
  } catch (e: any) {
    console.log(`[status-batch] attempt ${attempt + 1} failed: ${String(e).slice(0, 120)}`);
    statuses = null;
    await sleep(2000);
  }
}
const results: Record<string, any> = {};
if (statuses) {
  statuses.value.forEach((st: any, i: number) => {
    results[sigs[i]] = st;
  });
} else {
  console.log("[status-batch] all batch attempts failed — falling back to per-sig history");
}

for (let i = 0; i < sigs.length; i++) {
  const sig = sigs[i];
  let st = results[sig];
  let via = st ? "cache" : "history-retry";
  if (!st || st === null) {
    try {
      const r = await connection.getSignatureStatuses([sig], { searchTransactionHistory: true });
      st = r.value[0];
      via = "history-retry";
    } catch (e: any) {
      st = null;
      via = `history-retry-FAILED (${String(e).slice(0, 100)})`;
    }
  }
  await sleep(700);
  if (st === null) {
    console.log(`[sig] ${knownSigs[i][0]} ${sig}\t=> NULL (auch History) — OPEN/CACHE`);
  } else {
    console.log(
      `[sig] ${knownSigs[i][0]} ${sig}\t=> ${st.confirmationStatus} err=${st.err ? "YES" : "null"} slot=${st.slot} confirmationType=${st.confirmationType ?? "n/a"} via=${via}`,
    );
  }
}

// --- 3) live end states ---
const ts = new Date().toISOString();
console.log(`\n[ENDSTATE] live read at ${ts}`);
for (const [label, addr] of [
  ["Provider", PROVIDER],
  ["Main-Key", MAIN],
  ["Operator/Revolut", OPERATOR],
] as [string, string][]) {
  const b = await connection.getBalance(new PublicKey(addr));
  console.log(`[end] ${label} ${addr} = ${b} lamports = ${b / LAMPORTS_PER_SOL} SOL`);
  await sleep(300);
}

const sinBal = await connection.getTokenAccountBalance(new PublicKey(SIN_ATA));
console.log(`[end] SIN-ATA ${SIN_ATA} amount=${sinBal.value.uiAmountString} (decimals=${sinBal.value.decimals})`);

const wsolAcc = await connection.getAccountInfo(new PublicKey(WSOL_ATA));
console.log(`[end] WSOL-ATA ${WSOL_ATA} ${wsolAcc === null ? "ACCOUNT NOT EXISTENT (closed)" : `EXISTS lamports=${wsolAcc.lamports}`}`);

// pool: CLMM layout after 8-byte discriminator: i128 liquidity (24B), i32 tickCurrent (4B @32)
const poolAcc = await connection.getAccountInfo(new PublicKey(POOL));
if (poolAcc) {
  const d = poolAcc.data;
  const view = new DataView(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength));
  // i128 little-endian: lower 64 @8, upper 64 @16; signed → BigInt two's complement
  const lo = view.getBigUint64(8, true);
  const hi = view.getBigUint64(16, true);
  let liq = (hi << 64n) | lo;
  if (liq >= (1n << 127n)) liq -= (1n << 128n);
  const tick = view.getInt32(32, true);
  console.log(`[end] Pool ${POOL} liquidity=${liq.toString()} tickCurrent=${tick} (bytes@0..35), lamports=${poolAcc.lamports}`);
} else {
  console.log(`[end] Pool account NOT FOUND?!`);
}
console.log("\nDONE");
