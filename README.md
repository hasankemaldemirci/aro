# 🛰️ ARO

### **Agent Readability Optimizer**

> "SEO for your code, optimized for AI Agents."

[![ARO Score](https://img.shields.io/badge/ARO_Score-100%2F100-brightgreen)](https://github.com/hasankemaldemirci/aro)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-orange)](https://modelcontextprotocol.io/)
[![Audit Status](https://github.com/hasankemaldemirci/aro/actions/workflows/aro.yml/badge.svg)](https://github.com/hasankemaldemirci/aro/actions)

## Vision 🚀

You wrote your code for humans; now optimize it for Artificial Intelligence. Eliminate the **Hallucination Tax**. ARO is a professional ecosystem designed to make your codebase more readable, cost-effective, and error-free for AI agents (Claude, GPT, Cursor, Devin, etc.).

### 🚀 Key Features (v2.1.0-TS)

- **Deep Context:** Automatically detects tech-stack and entry points.
- **Enterprise Report:** Calculates your AI debt in financial terms ($/hr).
- **CI/CD Integration:** Quality gate with `--threshold` flag for pipelines.
- **Self-Healing:** Detects high-complexity files and applies advisory markers.
- **GitHub Badge:** Generates a dynamic AI-Readiness score badge.
- **Rule Constitution:** Generates `.cursorrules` to govern AI behavior.

## Installation

```bash
npm install
npm run build
npm link # Activates the global 'aro' command from the compiled dist
```

## Quick Start

```bash
aro audit      # Deep AI-Readiness analysis & Financial Report
aro fix        # Applies AI-SEO markers and automatically optimizes structure
aro mcp        # Starts the MCP Server for direct integration with AI Agents
aro badge      # Generates the Markdown snippet for your GitHub badge
aro rules      # Generates .cursorrules based on project tech-stack
aro init-ci    # Sets up GitHub Actions for automated quality gate
```

## AI Agent Constitution (`.cursorrules`) 👑

The `aro rules` command generates a specific instruction set for AI agents. This ensures that when you use Cursor or Windsurf, the agent:

- Respects the 300-line file limit.
- Corrects its own hallucination risks.
- Remains aware of the specific technologies detected in your tech-stack.

## AI Financial Analysis

ARO calculates the hidden costs of poor code readability for AI:

- **Documentation Debt:** Time wasted by agents guessing intent.
- **Truncation Risk:** Cost of large files being cut off in LLM context windows.
- **Structural Debt:** Complexity that increases token consumption and errors.

## Project Structure

- `src/core.ts`: Analysis engine & framework detection
- `src/enterprise.ts`: Financial calculation logic
- `src/mcp.ts`: Model Context Protocol server
- `src/refactor.ts`: Automated AI-SEO optimization
- `src/badge.ts`: GitHub badge generation
- `src/init.ts`: CI/CD initialization
- `src/rules.ts`: AI-agent ruleset generation

## License

MIT
