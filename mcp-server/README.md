# SuperIntelNex MCP Server

Connects AI agents (e.g. [OpenCode](https://opencode.ai/)) to the SuperIntelNex website repo — list and read site files, check repo state, and fetch recent commits from GitHub.

## Setup

```sh
cd mcp-server
npm install
npm run build
```

Optionally point it at a specific checkout (defaults to the repo it lives in):

```sh
SIN_REPO_PATH=/path/to/superintelnex node mcp-server/dist/index.js
```

## Tools

| Tool | Description |
|---|---|
| `repo_info` | Branch, HEAD commit, uncommitted changes |
| `list_site_files` | List website files (filterable by substring) |
| `read_site_file` | Read one file from the checkout (sandboxed to repo root) |
| `recent_commits` | Last N commits from `main` via the public GitHub API |

## Use in OpenCode

Register the server in the project (or with `--global`) so OpenCode starts it automatically:

```sh
opencode mcp add superintelnex --env SIN_REPO_PATH=$(pwd) -- node /path/to/superintelnex/mcp-server/dist/index.js
opencode mcp list
```

Or in `opencode.json`:

```jsonc
{
  "mcp": {
    "servers": {
      "superintelnex": {
        "type": "local",
        "command": ["node", "mcp-server/dist/index.js"],
        "cwd": ".",
        "environment": { "SIN_REPO_PATH": "." }
      }
    }
  }
}
```

> `.` as `SIN_REPO_PATH` resolves against OpenCode's working directory (the project root), so no absolute paths are stored.

## Roadmap

- [ ] v0.2: pull/PR tools via GitHub API (needs `GITHUB_TOKEN`)
- [ ] v0.3: deploy hooks (e.g. trigger GitHub Pages build)
- [ ] Solana tools: SIN token price, Raydium CLMM pool state, LP escrow status (needs RPC endpoint)
