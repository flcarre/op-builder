# 🤖 Crafted SaaS AI System

**Model Context Protocol (MCP) integration for Crafted SaaS projects**

This system provides AI agents with deep context about your project architecture, enabling intelligent code generation, validation, and assistance.

---

## 📋 Table of Contents

- [What is This?](#what-is-this)
- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [MCP Servers](#mcp-servers)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [FAQ](#faq)

---

## What is This?

The Crafted AI System is a **complete MCP server infrastructure** that gives AI assistants (Claude, GPT, etc.) deep understanding of your Crafted SaaS project.

### Key Components

1. **Context Manager** - Loads 150-200K tokens of project context
2. **15+ MCP Servers** - Standard tools (filesystem, git, github) + Crafted-specific tools
3. **Orchestrator** *(Phase 3)* - Workflow engine for multi-step tasks
4. **Specialized Agents** *(Phase 4)* - Architect, Developer, Tester, Reviewer

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Assistant                           │
│                    (Claude, GPT, etc.)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MCP Protocol
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Servers Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Crafted Context  │  Filesystem  │  Git  │  GitHub         │
│  Supabase │ shadcn │ Chrome DevTools │ Sequential Thinking │
│  Rules Validator │ Architecture Guard │ TypeScript │ Vitest│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Your Crafted Project                     │
│          (apps/, packages/, .craftedrc.json, ...)           │
└─────────────────────────────────────────────────────────────┘
```

### Context Flow

1. **Context Manager** scans your project on first load (<10s)
2. **Cache** stores context for instant access (<1s on subsequent loads)
3. **File Watcher** detects changes and refreshes cache automatically
4. **MCP Tools** expose context to AI with structured queries

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Crafted SaaS project (created with `crafted clone`)

### 1. Build the Context Manager

```bash
cd .ai/context
pnpm install
pnpm build
```

### 2. Configure Claude Code

The Context Manager MCP is automatically configured when you run `crafted install-mcp` in your project.

Verify it's installed:

```bash
cat .vscode/settings.json
```

You should see:

```json
{
  "claude.mcpServers": {
    "crafted-context": {
      "command": "node",
      "args": [
        "/absolute/path/to/your-project/.ai/context/dist/mcp-server.js"
      ]
    }
  }
}
```

### 3. Reload VS Code

```
Cmd+Shift+P → "Developer: Reload Window"
```

### 4. Test MCP Access

In Claude Code, try:

```
/mcp crafted-context get_context_summary
```

You should see a summary of your project!

---

## MCP Servers

### ✅ Active Servers (Phase 1 & 2)

#### 🏆 Crafted Context Manager
**Purpose**: Loads and caches full project context (150-200K tokens)

**Tools**:
- `get_full_context` - Get complete project with all files
- `search_in_context` - Search for files or content patterns
- `get_architecture_info` - Get architecture (level, platform, packages)
- `get_file_content` - Get specific file content
- `get_context_summary` - Get project summary

**Resources**:
- `crafted://context/full` - Full context JSON
- `crafted://context/summary` - Markdown summary
- `crafted://context/architecture` - Architecture JSON

**Cache**: First load <10s, cached <1s

---

#### 📁 Filesystem
**Purpose**: Secure file operations

**Tools**: `read_file`, `write_file`, `list_directory`, `move_file`, `search_files`

**Package**: `@modelcontextprotocol/server-filesystem`

---

#### 🌿 Git
**Purpose**: Git repository operations

**Tools**: `git_status`, `git_diff`, `git_log`, `git_show`, `git_blame`

**Package**: `@modelcontextprotocol/server-git`

---

#### 🐙 GitHub
**Purpose**: GitHub API operations

**Tools**: `create_issue`, `create_pr`, `search_repos`, `get_file_contents`

**Package**: `@modelcontextprotocol/server-github`

**Requirements**: `GITHUB_TOKEN` environment variable

---

#### 🧠 Sequential Thinking
**Purpose**: Structured problem-solving

**Tools**: `think_step_by_step`

**Package**: `@modelcontextprotocol/server-sequential-thinking`

---

#### ☁️ Supabase
**Purpose**: Database and auth operations

**Tools**: `query_database`, `create_table`, `manage_auth`, `upload_file`

**Package**: `@supabase/mcp-server-supabase`

**Requirements**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

#### 🎨 shadcn/ui
**Purpose**: Component browsing and installation

**Tools**: `search_components`, `install_component`, `list_registries`

**Package**: `@shadcn/mcp`

---

#### 🌐 Chrome DevTools
**Purpose**: Browser automation and debugging

**Tools**: `navigate`, `screenshot`, `execute_script`, `get_performance`

**Package**: `chrome-devtools-mcp`

---

### 🚧 Coming Soon (Phase 2 - Custom MCP Servers)

#### 🛠️ Crafted CLI
**Tools**: `crafted_add_router`, `crafted_add_page`, `crafted_add_component`

#### ✅ Rules Validator
**Tools**: `validate_code`, `check_architecture`, `check_test_coverage`

**Rules by Level**:
- **Rapid**: Max 100 lines/function, duplication OK if <3 times
- **Balanced**: Max 50 lines/function, 70% coverage, max 3 params
- **Crafted**: Max 20 lines/function, 100% domain coverage, max 2 params

#### 🏗️ Architecture Guard
**Tools**: `check_dependencies`, `check_layer_boundaries`, `generate_dependency_graph`

**Validates**:
- Domain layer has ZERO external dependencies (Crafted level)
- Services don't import from API layer (Balanced+)
- No circular dependencies

#### 📘 TypeScript
**Tools**: `check_types`, `compile`, `generate_types`

#### 🧪 Vitest
**Tools**: `run_tests`, `check_coverage`, `run_specific_test`

---

## Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
# GitHub (for github MCP)
GITHUB_TOKEN=ghp_your_token_here

# Supabase (for supabase MCP)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Customizing MCP Config

Edit `.mcp/config.json` to:

- Enable/disable specific servers (`"disabled": true/false`)
- Change command paths
- Add environment variables
- Configure server-specific options

---

## Troubleshooting

### Context Manager not loading

**Problem**: `/mcp crafted-context` shows "server not found"

**Solutions**:
1. Rebuild context manager: `cd .ai/context && pnpm build`
2. Check path in `.vscode/settings.json` is absolute
3. Reload VS Code window

---

### MCP shows "No servers configured"

**Problem**: `/mcp` returns empty list

**Solutions**:
1. Verify `.vscode/settings.json` exists
2. Check `claude.mcpServers` key is present
3. Reload VS Code window
4. Run `/doctor` in Claude Code

---

### Context loading is slow (>10s)

**Problem**: First context load takes too long

**Solutions**:
1. Check project size (exclude large files)
2. Verify `.gitignore` excludes `node_modules`, `dist`, `.next`
3. Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`

---

### Cache not working

**Problem**: Context reloads from scratch every time

**Solutions**:
1. Check `.ai/.cache/` directory exists
2. Verify write permissions
3. Force refresh: `get_full_context` with `{"refresh": true}`

---

## Advanced Usage

### Custom MCP Servers

Create your own MCP server:

```typescript
// .ai/mcp-servers/custom/my-server/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: 'my-custom-server',
  version: '1.0.0',
}, {
  capabilities: { tools: {} },
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: 'my_tool',
      description: 'Does something awesome',
      inputSchema: { /* ... */ },
    }],
  };
});

// Implement tool logic...
```

Add to `.mcp/config.json`:

```json
{
  "my-custom-server": {
    "command": "node",
    "args": ["${workspaceFolder}/.ai/mcp-servers/custom/my-server/dist/index.js"]
  }
}
```

---

### Workflow Orchestration (Phase 3)

Create workflows in `.ai/workflows/`:

```yaml
# feature-complete.yaml
name: Complete Feature Implementation
steps:
  - agent: architect
    prompt: "Design architecture for: {{feature_description}}"
    output: architecture

  - agent: developer
    prompt: "Implement: {{architecture}}"
    context: [crafted-context, filesystem, git]
    output: implementation

  - agent: tester
    prompt: "Write tests for: {{implementation}}"
    output: tests

  - agent: reviewer
    prompt: "Review: {{implementation}} and {{tests}}"
    on_fail: goto step 2
    output: approval
```

Run with: `crafted workflow run feature-complete --vars feature_description="User authentication"`

---

## Best Practices

### 1. Use Context Manager First

Always start by loading context:

```
/mcp crafted-context get_context_summary
```

This gives the AI understanding of your project structure.

### 2. Search Before Reading

Use `search_in_context` instead of reading many files:

```
/mcp crafted-context search_in_context {"query": "authentication", "type": "both"}
```

### 3. Validate Early

Use rules-validator before committing:

```
/mcp rules-validator validate_code {
  "code": "...",
  "filePath": "packages/api/src/routers/auth.ts"
}
```

### 4. Check Architecture

Use architecture-guard to prevent violations:

```
/mcp architecture-guard check_layer_boundaries
```

### 5. Refresh Strategically

Only refresh context when needed:

```
/mcp crafted-context get_full_context {"refresh": true}
```

---

## FAQ

### Q: How much memory does Context Manager use?

**A**: ~50-100MB for cache, plus ~200-400MB during initial load. Cached access uses minimal memory.

### Q: Can I use this with GitHub Copilot?

**A**: MCP is currently supported by Claude Code, Cline, and some other AI tools. GitHub Copilot doesn't support MCP yet.

### Q: Does this work with Cursor?

**A**: Yes! Configure MCP servers in Cursor's settings using the same `.mcp/config.json` format.

### Q: What if my project is > 200K tokens?

**A**: The loader automatically skips large files (>100KB) and stops at 200K total tokens. You can adjust limits in `loader.ts`.

### Q: Can I disable specific MCP servers?

**A**: Yes, set `"disabled": true` in `.mcp/config.json` for any server.

### Q: How do I update MCP servers?

**A**: Run `npx -y @modelcontextprotocol/server-name@latest` to update. Context manager requires rebuild: `cd .ai/context && pnpm build`.

---

## CLI Reference

### Context Manager

```bash
# Build context manager
cd .ai/context && pnpm build

# Install as MCP
crafted install-mcp

# Install all MCP servers
crafted install-mcp-all
```

### Workflows (Phase 3)

```bash
# List workflows
crafted workflow list

# Run workflow
crafted workflow run <name> --vars key=value

# Debug workflow
crafted workflow run <name> --debug
```

### Agents (Phase 4)

```bash
# Run specific agent
crafted agent run architect "Design user auth"
crafted agent run developer "Implement {{architecture}}"
crafted agent run tester "Test auth flow"
crafted agent run reviewer "Review PR #123"
```

---

## Support

- **Documentation**: https://docs.craftedsaas.com/ai-system
- **Issues**: https://github.com/crafted-saas/issues
- **Discord**: https://discord.gg/crafted-saas

---

**Built with ❤️ for the Crafted SaaS community**
