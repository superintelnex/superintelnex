# SuperIntelNex (SIN)
> Decentralized token ecosystem merging meme culture with artificial superintelligence and autonomous digital payments on Solana.

[![Solana](https://img.shields.io/badge/Blockchain-Solana%20Mainnet-14F195?logo=solana)](https://explorer.solana.com/address/A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z)
[![Whitepaper](https://img.shields.io/badge/Whitepaper-v1.1%20Live-white)](https://superintelnex.com/whitepaper.html)
[![DEX](https://img.shields.io/badge/Raydium-CLMM%20Live-22d3ee)](https://raydium.io/swap/?inputMint=sol&outputMint=A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z)
[![DexScreener](https://img.shields.io/badge/DexScreener-SIN%2FSOL-success)](https://dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM)

---

## 🌐 Official Verification & Quick Links

- **Official Website:** [superintelnex.com](https://superintelnex.com)
- **Whitepaper (EN/DE):** [superintelnex.com/whitepaper.html](https://superintelnex.com/whitepaper.html)
- **Mainnet Mint Address:** [`A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z`](https://explorer.solana.com/address/A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z)
- **Raydium CLMM Pool:** [`4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM`](https://raydium.io/swap/?inputMint=sol&outputMint=A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z)
- **Jupiter Swap:** [jup.ag/swap/SOL-A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z](https://jup.ag/swap/SOL-A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z)
- **DexScreener Live Chart:** [dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM](https://dexscreener.com/solana/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM)
- **GeckoTerminal:** [geckoterminal.com/solana/pools/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM](https://www.geckoterminal.com/solana/pools/4erqAhdH1Yx9fZfPSTjrAu8SgvPKeRAHNCgGqnsevdeM)

---

## 💎 Token Specifications

| Parameter | Specification | Notes |
|---|---|---|
| **Name** | SuperIntelNex | Immutable Metaplex record (`isMutable: false`) |
| **Ticker** | SIN | Solana SPL standard |
| **Total Supply** | 100,000,000,000,000 (10¹⁴) | Fixed supply, 100 Trillion (100 Billionen DE) |
| **Decimals** | 5 | Hardware u64 integer overflow safe |
| **Trading Tax** | 0% | `sellerFeeBasisPoints = 0` (zero royalties/fees) |
| **Mint Authority** | Revoked (null) | Guaranteed on-chain: no new tokens can ever be created |
| **Freeze Authority** | Revoked (null) | Guaranteed on-chain: accounts can never be frozen or blocked |
| **Program** | Standard SPL | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |

---

## 🤖 Model Context Protocol (MCP) Server for AI Agents

SuperIntelNex provides an official MCP Server (`mcp-server/`) allowing autonomous AI agents (OpenCode, Claude, Antigravity) to interface securely with the website codebase, track commits, and read public documentation.

### Setup & Build
```sh
cd mcp-server
pnpm install
pnpm run build
node dist/index.js --smoke
```

---

## 🚀 Repository Structure

```
├── index.html              # Main landing page (GitHub Pages root)
├── whitepaper.html         # Interactive bilingual whitepaper (v1.1)
├── mcp-server/             # Model Context Protocol server for AI agents
├── token/                  # SPL Token toolchain, tests, and configurations
│   ├── config/token.json   # On-chain token and DEX specifications
│   ├── scripts/            # Deno TypeScript emission & verification suite
│   └── docs/               # Technical verification logs
└── agents/                 # Autonomous agent coordination loops & logs
```

---

*Disclaimer: SuperIntelNex (SIN) is a decentralized meme coin project in active development. This repository and associated documents are purely technical specifications and do not constitute financial or investment advice.*
