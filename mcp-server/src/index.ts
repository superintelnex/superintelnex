import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

/**
 * Path of the superintelnex repo checkout this server operates on.
 *
 * 1. Explicit SIN_REPO_PATH env var (used in OpenCode's mcp config)
 * 2. Walk up from this file until .git is found (repo-internal default)
 * 3. Fall back to ~/.superintelnex-repo for out-of-repo installs
 */
function findRepoPath(): string {
  const explicit = process.env.SIN_REPO_PATH;
  if (explicit) return resolve(explicit);

  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, ".git"))) return dir;
    dir = dirname(dir);
  }
  return resolve(process.env.HOME ?? ".", ".superintelnex-repo");
}

const REPO_ROOT = findRepoPath();
const GH_REPO = "superintelnex/superintelnex";

async function git(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd: REPO_ROOT,
    timeout: 15000,
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

function walk(dir: string, base: string, depth: number): string[] {
  const out: string[] = [];
  if (depth > 4) return out;
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".") || entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    const rel = base ? join(base, entry) : entry;
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, rel, depth + 1));
    else if (st.size <= 512 * 1024) out.push(rel);
  }
  return out;
}

function toolResult(text: string) {
  return { content: [{ type: "text" as const, text }], _meta: { truncated: false } };
}

const server = new McpServer({
  name: "superintelnex",
  version: "0.1.0",
});

server.tool(
  "repo_info",
  "Basic info about the SuperIntelNex website repo: branch, HEAD commit, and uncommitted changes",
  {},
  async () => {
    const [branch, head, dirty] = await Promise.all([
      git(["rev-parse", "--abbrev-ref", "HEAD"]),
      git(["log", "-1", "--oneline"]),
      git(["status", "--short"]),
    ]);
    return toolResult(
      `Repo root: ${REPO_ROOT}\nBranch: ${branch}\nHEAD: ${head}\nUncommitted changes:\n${dirty || "(none)"}`,
    );
  },
);

server.tool(
  "list_site_files",
  "List website files (HTML, config, assets) from the repo checkout",
  {
    glob: z
      .string()
      .optional()
      .describe('Optional substring filter, e.g. "html" or "whitepaper"'),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .describe("Max files to return (default 100)"),
  },
  async ({ glob, maxResults }) => {
    const limit = maxResults ?? 100;
    let files = walk(REPO_ROOT, "", 0);
    if (glob) files = files.filter((f) => f.toLowerCase().includes(glob.toLowerCase()));
    const shown = files.slice(0, limit);
    const lines = shown.map((f) => f).join("\n");
    return toolResult(
      files.length > shown.length
        ? `${lines}\n\n(showing ${shown.length} of ${files.length} files — narrow the glob)`
        : lines,
    );
  },
);

server.tool(
  "read_site_file",
  "Read one file from the SuperIntelNex website repo checkout",
  {
    path: z.string().describe('Path relative to repo root, e.g. "index.html"'),
    maxChars: z.number().int().min(1).max(200000).optional(),
  },
  async ({ path, maxChars }) => {
    const target = resolve(REPO_ROOT, path);
    if (!target.startsWith(resolve(REPO_ROOT))) {
      return {
        content: [{ type: "text", text: "Error: path escapes the repo root" }],
        isError: true,
      };
    }
    if (!existsSync(target) || !statSync(target).isFile()) {
      return {
        content: [{ type: "text", text: `Error: ${path} not found in ${REPO_ROOT}` }],
        isError: true,
      };
    }
    let text = readFileSync(target, "utf8");
    const limit = maxChars ?? 120000;
    const truncated = text.length > limit;
    if (truncated) text = text.slice(0, limit);
    const body = `// ${path} (${text.length.toLocaleString()} chars${truncated ? ", truncated" : ""})\n${text}`;
    return {
      content: [{ type: "text", text: body }],
      _meta: { truncated },
    };
  },
);

server.tool(
  "recent_commits",
  "Most recent commits from the GitHub repo (public, no auth needed)",
  {
    count: z.number().int().min(1).max(30).optional().describe("Default 10"),
    branch: z.string().optional().describe("Default: main"),
  },
  async ({ count, branch }) => {
    const n = count ?? 10;
    const ref = branch ?? "main";
    const url = `https://api.github.com/repos/${GH_REPO}/commits?per_page=${n}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "superintelnex-mcp" },
    });
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `GitHub API error ${res.status}: ${await res.text()}` }],
        isError: true,
      };
    }
    const commits = (await res.json()) as Array<{ sha: string; commit: { message: string; author: { name?: string; date?: string } } }>;
    const lines = commits.map(
      (c) => `${c.sha.slice(0, 7)}  ${c.commit.author?.date ?? ""}  ${c.commit.message.split("\n")[0]}`,
    );
    return toolResult(`Last ${commits.length} commits (branch: ${ref}):\n${lines.join("\n")}`);
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Smoke mode: validate wiring without opening the stdio transport.
if (process.argv.includes("--smoke")) {
  const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
  const head = await git(["log", "-1", "--oneline"]);
  console.log(`superintelnex MCP server OK — repo ${REPO_ROOT} (${branch} @ ${head})`);
} else {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
