#!/usr/bin/env node

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Optimized CLI Entry point.
 * Performance: Using direct imports to skip process spawn overhead.
 */

import path from "path";
import chalk from "chalk";

const BASE_PATH = path.join(__dirname, "../src");

async function main() {
  const command = process.argv[2];
  const helpText = `
${chalk.bold.cyan("ARO - Agent Readability Optimizer")} (v2.1.0-TS)
${chalk.gray("Professional AI-Readiness Ecosystem")}

${chalk.bold("Usage:")}
  aro <command> [options]

${chalk.bold("Commands:")}
  ${chalk.cyan("audit")}       Full analysis. Options: --rate=X --interactions=Y --threshold=Z --output=file.md
  ${chalk.cyan("fix")}         Automated AI-Readiness optimizations
  ${chalk.cyan("badge")}       Generate a GitHub badge for your README. Use --update to patch README.md
  ${chalk.cyan("rules")}       Generate .cursorrules for AI agents
  ${chalk.cyan("init-ci")}     Set up GitHub Actions for automated quality gate
  ${chalk.cyan("mcp")}         Start ARO MCP Server
  ${chalk.cyan("help")}        Show this help message

${chalk.bold("Example:")}
  aro audit --threshold=80
  aro badge --update
`;

  if (!command || command === "help") {
    console.log(helpText);
    return;
  }

  try {
    switch (command) {
      case "audit": {
        const core = await import(path.join(BASE_PATH, "core"));
        const enterprise = await import(path.join(BASE_PATH, "enterprise"));
        await core.run();
        await enterprise.run();
        break;
      }
      case "fix": {
        const refactor = await import(path.join(BASE_PATH, "refactor"));
        await refactor.run();
        break;
      }
      case "badge": {
        const badge = await import(path.join(BASE_PATH, "badge"));
        await badge.run();
        break;
      }
      case "rules": {
        const rules = await import(path.join(BASE_PATH, "rules"));
        await rules.run();
        break;
      }
      case "init-ci": {
        const init = await import(path.join(BASE_PATH, "init"));
        await init.run();
        break;
      }
      case "mcp": {
        await import(path.join(BASE_PATH, "mcp"));
        break;
      }
      default:
        console.log(chalk.red(`\n❌ Unknown command: ${command}`));
        console.log(helpText);
        process.exit(1);
    }
  } catch (err: any) {
    console.error(chalk.red(`\n💥 Fatal Error: ${err.message}`));
    process.exit(1);
  }
}

main();
