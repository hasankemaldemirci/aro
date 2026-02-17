# ARO: Agent Readability Optimizer

> "SEO for your code, optimized for AI Agents."

[![ARO Score][aro-badge]][aro-url]
[![NPM Version][npm-badge]][npm-url]
[![CI/CD Status][audit-badge]][audit-url]
[![MCP Status][mcp-badge]][mcp-url]

ARO is a CLI toolkit designed to optimize your codebase for
AI agents (Cursor, Windsurf, Devin). It eliminates the Hallucination Tax
and ensures your code is understood by AI "instantly".

## ⚡ Quick Start

Analyze any project instantly without installation:

```bash
npx @agent-aro/cli audit
# or if installed globally
aro audit
```

## 📦 Installation

For frequent use, install ARO globally:

```bash
npm install -g @agent-aro/cli
```

## 🛠️ Usage

### Audit & Analysis

Deeply analyze your project structure and calculate AI financial debt.

```bash
aro audit          # Standard audit
aro audit --silent # Output only the score (for CI/CD)
```

### AI-SEO Patching

Automatically inject context markers into complex files to help AI navigate faster.

```bash
aro fix
```

### Rule Generation

Generate optimized configuration files for specific AI editors.

```bash
aro rules          # Generates .cursorrules, .windsurfrules, etc.
```

### Badge Generation

Generate an ARO Score badge and automatically patch your README.md.

```bash
aro badge --update
```

### CI/CD Automation

Initialize a GitHub Action to automatically audit your project on every push/PR.

```bash
aro init-ci
```

### MCP Server

Enable live integration so AI Agents can query your project structure directly.

```bash
aro mcp            # Starts the MCP server
```

> **💡 Tip:** All commands work with `npx @agent-aro/cli` if you haven't installed globally.
>
> **🔌 Local LLMs:** ARO's MCP server works with local LLMs like Ollama and LM Studio. See [examples/mcp-local-llm](./examples/mcp-local-llm) for setup instructions.

## Key Features

- **🎯 Real-time ARO Score**: Get a deterministic 0-100 rating of your code's AI-readiness.
- **🗺️ AI World Map**: Automatically generates `AI-CONSTITUTION.md` for context compensation.
- **🛠️ Elite Auto-Refactor**: Reach 100/100 score automatically via otonomous patching.
- **💰 Financial Analyzer**: Calculate the annual "AI-Debt" in USD and wasted developer hours.
- **🛰️ MCP Server**: Native integration for AI Agents to query your structure directly.
- **🛡️ Security Gate**: Integrated security checks for keys and dangerous functions.

## Scoring Calculation

The score (0-100) is based on AI-Agent understanding efficiency:

1. **README Quality (30%)**: Documentation depth and clarity.
2. **Directory Structure (20%)**: Adherence to standard patterns.
3. **Configuration (20%)**: Presence of essential rule files.
4. **Context Reconciliation (10%)**: Project Map availability (AI-CONSTITUTION.md).
5. **Modularity (20%)**: 300-line file limit enforcement.

---

## Contributing

We welcome all PRs! Check our [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

MIT (c) Hasan Kemal Demirci

[aro-badge]: https://img.shields.io/badge/ARO_Score-100%2F100-brightgreen
[aro-url]: https://github.com/hasankemaldemirci/aro
[npm-badge]: https://img.shields.io/npm/v/@agent-aro/cli?color=red
[npm-url]: https://www.npmjs.com/package/@agent-aro/cli
[audit-badge]: https://github.com/hasankemaldemirci/aro/actions/workflows/aro.yml/badge.svg
[audit-url]: https://github.com/hasankemaldemirci/aro/actions
[mcp-badge]: https://img.shields.io/badge/MCP-Compatible-orange
[mcp-url]: https://modelcontextprotocol.io/
