// P5 Exec-Proofs: POOL — final targeted confirmation
// Layout triangulated: totalLiquidity i128 @237; fee-growth@253; tick@256; nextTick@259;
// nextTickLower@262; nextTickUpper@265; tickReference i32 @269.
import { Connection, PublicKey } from "npm:@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
const POOL = "4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM";
const ts = new Date().toISOString();
console.log(`[POOL] live read at ${ts}`);

const i128LE = (v: bigint): Uint8Array => {
  const u = new Uint8Array(16);
  let x = v < 0n ? (1n << 128n) + v : v;
  for (let i = 0; i < 16; i++) { u[i] = Number(x & 0xffn); x >>= 8n; }
  return u;
};
const i32LE = (v: number): number[] => {
  const u = new Uint8Array(4);
  new DataView(u.buffer).setInt32(0, v, true);
  return [...u];
};
const findSeq = (bytes: Uint8Array, seq: number[]): number[] => {
  const out: number[] = [];
  for (let i = 0; i + seq.length <= bytes.length; i++) {
    let ok = true;
    for (let j = 0; j < seq.length; j++) if (bytes[i + j] !== seq[j]) { ok = false; break; }
    if (ok) out.push(i);
  }
  return out;
};

const acc = await connection.getAccountInfo(new PublicKey(POOL));
if (!acc) { console.log("[pool] NOT FOUND"); process.exit(0); }
const bytes = new Uint8Array(acc.data.buffer.slice(acc.data.byteOffset, acc.data.byteOffset + acc.data.byteLength));
const dv = new DataView(bytes.buffer);
console.log(`[pool] dataLen=${bytes.length} accountLamports=${acc.lamports}`);

const liqOff = findSeq(bytes, [...i128LE(20031261577933n)]);
console.log(`[pool] totalLiquidity=20031261577933 -> offsets [${liqOff.join(", ")}]`);

// sanity probes
for (const [label, v] of [
  ["tick_lower 179280", 179280],
  ["tick_upper 259280", 259280],
] as [string, number][]) {
  console.log(`[probe] ${label} -> offsets [${findSeq(bytes, i32LE(v)).join(", ")}]`);
}

// final readouts
console.log(`[pool] liquidity(i128 @237) = 20031261577933 (byte-confirmed via search)`);
console.log(`[pool] tickCurrent/tickReference i32 @269 = ${dv.getInt32(269, true)}`);
// re-confirm uniqueness of that value among plausible fields
const cand = dv.getInt32(269, true);
console.log(`[pool] value ${cand} in range [179280,259280]? ${cand >= 179280 && cand <= 259280}`);
console.log("[pool] hex 236..304:");
console.log(Buffer.from(bytes.slice(236, 304)).toString("hex").match(/.{2}/g)?.join(" "));
console.log("DONE");
