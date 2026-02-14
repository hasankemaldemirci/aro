# ARO: Agent Readability Optimizer

> "SEO for your code, optimized for AI Agents."

[![ARO Score][aro-badge]][aro-url]
[![NPM Version][npm-badge]][npm-url]
[![CI/CD Status][audit-badge]][audit-url]
[![MCP Status][mcp-badge]][mcp-url]

ARO is a professional ecosystem designed to optimize your codebase for
AI agents (Cursor, Windsurf, Devin). It eliminates the Hallucination Tax
and ensures your code is understood by AI "instantly".

## ⚡ Quick Start

Analyze any project instantly without installation:

```bash
npx agent-aro audit
```

## 📦 Installation

For frequent use, install ARO globally:

```bash
npm install -g agent-aro
```

## 🛠️ Usage

### Audit & Analysis

Deeply analyze your project structure and calculate AI financial debt.

```bash
npx agent-aro audit          # Standard audit
npx agent-aro audit --silent # Output only the score (for CI/CD)
```

### AI-SEO Patching

Automatically inject context markers into complex files to help AI navigate faster.

```bash
npx agent-aro fix
```

### Rule Generation

Generate optimized configuration files for specific AI editors.

```bash
npx agent-aro rules          # Generates .cursorrules, .windsurfrules, etc.
```

### MCP Server

Enable live integration so AI Agents can query your project structure directly.

```bash
npx agent-aro mcp            # Starts the MCP server
```

## Key Features

- **Deep Context Mapping:** Maps tech-stack and entry points for AI traversal.
- **AI Financial Analysis:** Measures cost of documentation debt ($/hour).
- **Multi-Agent Support:** Generates rules for Cursor, Windsurf, and Devin.
- **Self-Healing:** Injects advisory markers into high-complexity files.
- **MCP Server:** Live integration for AI Agents to query your structure.

## Scoring Calculation

The score (0-100) is based on AI-Agent understanding efficiency:

1. README Quality (30%): Documentation depth and clarity.
2. Directory Structure (20%): Adherence to standard patterns.
3. Configuration (20%): Presence of essential rule files.
4. Modularity (30%): 300-line file limit enforcement.

---

## Contributing

We welcome all PRs! Check our [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

MIT (c) Hasan Kemal Demirci

[aro-badge]: https://img.shields.io/badge/ARO_Score-100%2F100-brightgreen
[aro-url]: https://github.com/hasankemaldemirci/aro
[npm-badge]: https://img.shields.io/npm/v/agent-aro?color=red
[npm-url]: https://www.npmjs.com/package/agent-aro
[audit-badge]: https://github.com/hasankemaldemirci/aro/actions/workflows/aro.yml/badge.svg
[audit-url]: https://github.com/hasankemaldemirci/aro/actions
[mcp-badge]: https://img.shields.io/badge/MCP-Compatible-orange
[mcp-url]: https://modelcontextprotocol.io/
