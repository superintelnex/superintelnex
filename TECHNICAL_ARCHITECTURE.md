# SuperIntelNex (SIN) — Technical Architecture

Technical architecture specification for **SuperIntelNex (SIN)** on the Solana blockchain.

---

## 1. Architectural Philosophy: Battle-Tested Minimalism

SuperIntelNex enforces a strict security premise: **Deploy zero unverified smart contracts.** 

In contrast to projects deploying complex, upgradeable Solidity/Rust contracts with custom logic, SIN relies exclusively on the native, formally audited core programs of Solana:

1. **SPL Token Program (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`):**
   - Handles token mint records, Associated Token Accounts (ATAs), and atomic balance transfers.
   - Operating on Solana since 2020 on the critical path of millions of daily transactions.
2. **Metaplex Token Metadata Program (`metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`):**
   - Permanently stores the token's name, symbol (SIN), and metadata pointer on-chain.
   - Hardcoded with `isMutable: false`, rendering metadata permanently immutable.

---

## 2. On-Chain Security Guarantees

- **No Custom Bytecode:** Eliminates reentrancy bugs, flash-loan vulnerabilities, and arbitrary execution traps.
- **No Token-2022 Extensions:** Zero dynamic transfer fees, zero transfer hooks, and zero protocol-level censorship mechanisms.
- **Revoked Authorities:**
  - `mintAuthority = null`: The total supply cannot be increased beyond 100,000,000,000,000 units.
  - `freezeAuthority = null`: No holder account can ever be frozen, blacklisted, or restricted.
- **Zero Royalties / Taxes:** `sellerFeeBasisPoints = 0`. Transfers and swaps incur solely standard Solana gas fees (~0.000005 SOL).

---

## 3. Liquidity Architecture: Raydium CLMM

SuperIntelNex operates on Raydium's **Concentrated Liquidity Market Maker (CLMM)** program (`CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK`):
- **Pool PDA:** `4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`
- **Pair:** SIN / Wrapped SOL (wSOL)
- **Tick Spacing:** 10 | **Fee Rate:** 0.01%
- **Concentrated Efficiency:** Capital is concentrated across active trading bands, maximizing liquidity depth for small and medium swaps.

---

## 4. Autonomous Agent & MCP Layer

To facilitate programmatic access for AI agents (OpenCode, Claude, Antigravity, custom LLM workers):
- **Model Context Protocol (MCP) Server (`mcp-server/`):**
  - Node.js + TypeScript stdio server implementing the official MCP SDK.
  - Provides real-time tool endpoints: `repo_info`, `list_site_files`, `read_site_file`, `recent_commits`.
- **Trading & Monitoring Daemon Architecture:**
  - Continuous background watchdog loops (`cio-autotrade.zsh`, `fable-trade-loop.sh`, `keepalive-trader.py`).
  - Strict separation of read-only analytics from signing execution roles.

---

*See [whitepaper.html](https://superintelnex.com/whitepaper.html) for full transaction signatures and explorer proof.*
