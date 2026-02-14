import fs from "fs";
import path from "path";
import { Branding } from "./constants";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: CI/CD Initializer for ARO.
 * Sets up GitHub Actions workflows to automate readability audits.
 */

const GITHUB_WORKFLOW_YAML = `name: ARO Audit

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Run ARO Audit
        run: npx @hasankemaldemirci/aro audit --threshold=80
`;

export function run(): void {
  const projectPath = process.cwd();
  const workflowDir = path.join(projectPath, ".github", "workflows");
  const workflowPath = path.join(workflowDir, "aro.yml");

  console.log(Branding.border(""));
  console.log(Branding.cyan.bold("🤖 ARO CI/CD Initializer"));
  console.log(Branding.border(""));

  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  if (fs.existsSync(workflowPath)) {
    console.log(
      Branding.warning(
        "⚠️  GitHub Action already exists at .github/workflows/aro.yml",
      ),
    );
    return;
  }

  try {
    fs.writeFileSync(workflowPath, GITHUB_WORKFLOW_YAML);
    console.log(
      Branding.success("\n✅ Created GitHub Action: ") +
        Branding.white(".github/workflows/aro.yml"),
    );
    console.log(
      Branding.gray(
        "\nYour project will now be automatically audited on every push.",
      ),
    );
  } catch (e: any) {
    console.log(Branding.error(`\n❌ Failed to create workflow: ${e.message}`));
  }
  console.log(Branding.border(""));
}

if (require.main === module) {
  run();
}
