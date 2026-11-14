// Automated On-Chain & Market Health Test Suite for SuperIntelNex ($SIN)
// Runs read-only checks against Solana Mainnet, Raydium CLMM and Jupiter DEX.
// Aufruf: deno test -A token/tests/market-health.test.ts

import { assertEquals, assert } from "jsr:@std/assert@1.0.8";

const POOL_ID = "4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM";
const TOKEN_MINT = "A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z";
const WSOL_MINT = "So11111111111111111111111111111111111111112";
const PROVIDER_SIN_ATA = "FD1WzT526vwyBbuq7p6RN6PizStW8sEoZaGrm5u7xqSW";
const MIN_HOLDING_UI = 780_000_000_000; // 30% of ~2.6 Trillion initial baseline

Deno.test("Market Health: DexScreener Pair Health & Metrics", async () => {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${POOL_ID}`);
  assertEquals(res.status, 200, "DexScreener API must return HTTP 200");
  
  const data = await res.json();
  assert(data.pairs && data.pairs.length > 0, "Pair data must exist");
  
  const pair = data.pairs[0];
  assertEquals(pair.baseToken.address, TOKEN_MINT, "Base token must match SIN mint");
  assertEquals(pair.quoteToken.address, WSOL_MINT, "Quote token must match WSOL mint");
  assert(pair.txns.h24.buys > 0, "Buys in 24h must be greater than 0");
  assert(pair.txns.h24.sells > 0, "Sells in 24h must be greater than 0");
  assert(pair.liquidity.usd > 0, "Liquidity in USD must be positive");
});

Deno.test("Market Health: Jupiter SOL -> SIN Buy Quote Availability", async () => {
  const url = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${WSOL_MINT}&outputMint=${TOKEN_MINT}&amount=1000000&slippageBps=1000`;
  const res = await fetch(url);
  assertEquals(res.status, 200, "Jupiter Quote API must return HTTP 200");
  
  const data = await res.json();
  assert(data.outAmount && BigInt(data.outAmount) > 0n, "Jupiter must return positive outAmount for SOL->SIN");
  assert(data.routePlan && data.routePlan.length > 0, "Route plan must be present");
  assertEquals(data.routePlan[0].swapInfo.ammKey, POOL_ID, "Route must pass through Raydium CLMM pool");
});

Deno.test("Market Health: Jupiter SIN -> SOL Sell Quote Availability", async () => {
  const url = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${TOKEN_MINT}&outputMint=${WSOL_MINT}&amount=100000000000&slippageBps=1000`;
  const res = await fetch(url);
  assertEquals(res.status, 200, "Jupiter Quote API must return HTTP 200");
  
  const data = await res.json();
  assert(data.outAmount && BigInt(data.outAmount) > 0n, "Jupiter must return positive outAmount for SIN->SOL");
  assert(data.routePlan && data.routePlan.length > 0, "Route plan must be present");
  assertEquals(data.routePlan[0].swapInfo.ammKey, POOL_ID, "Route must pass through Raydium CLMM pool");
});

Deno.test("Market Health: Raydium CLMM Pool Range & Tick Coverage", async () => {
  const proc = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "agents/research/pool-state.ts"],
    stdout: "piped",
    stderr: "piped",
  });
  const output = await proc.output();
  assertEquals(output.code, 0, "pool-state.ts execution must exit with code 0");
  
  const text = new TextDecoder().decode(output.stdout);
  const match = text.match(/\{"ok":true.*\}/);
  assert(match, "Output must contain valid JSON result");
  
  const result = JSON.parse(match[0]);
  assert(result.ok === true, "CLMM pool query must succeed");
  assert(result.tickCurrent >= 179280 && result.tickCurrent <= 259280, "Current tick must be within active LP range [179280, 259280]");
  assert(BigInt(result.liquidity) > 0n, "CLMM pool liquidity must be greater than zero");
});

Deno.test("Market Health: Solana Mainnet Mint Invariant & Revoked Authorities", async () => {
  const res = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getAccountInfo",
      params: [TOKEN_MINT, { encoding: "jsonParsed" }],
    }),
  });
  assertEquals(res.status, 200, "Solana Mainnet RPC must return HTTP 200");
  
  const data = await res.json();
  assert(data.result && data.result.value, "Mint account info must exist on mainnet");
  
  const info = data.result.value.data.parsed.info;
  assertEquals(info.decimals, 5, "SIN decimals must equal exactly 5");
  assertEquals(info.supply, "10000000000000000000", "SIN supply must equal exactly 10^14 tokens with 5 decimals (10^19 raw units)");
  assertEquals(info.mintAuthority, null, "Mint authority must be permanently revoked (null)");
  assertEquals(info.freezeAuthority, null, "Freeze authority must be permanently revoked (null)");
  assertEquals(info.isInitialized, true, "Mint must be initialized");
  assertEquals(data.result.value.owner, "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", "Owner must be standard SPL Token program");
});

Deno.test("Market Health: Provider Holding Invariant (Ticket #6 >= 30% Intact)", async () => {
  const res = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountBalance",
      params: [PROVIDER_SIN_ATA],
    }),
  });
  assertEquals(res.status, 200, "Solana Mainnet RPC must return HTTP 200");
  
  const data = await res.json();
  assert(data.result && data.result.value, "Token balance data must exist");
  
  const uiAmount = data.result.value.uiAmount;
  assert(uiAmount >= MIN_HOLDING_UI, `Holding invariant violated: current=${uiAmount} < min=${MIN_HOLDING_UI}`);
  assert(uiAmount > 2_500_000_000_000, "Current holding must be ~97.6% intact (> 2.5 Trillion SIN)");
});
