import fs from "fs";
import path from "path";
import { Branding } from "./constants";
import { execSync } from "child_process";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Git Hooks Initializer for ARO.
 * Sets up Husky and a pre-commit hook to automate readability audits.
 */

export function run(): void {
  const projectPath = process.cwd();

  console.log(Branding.border(""));
  console.log(Branding.cyan.bold("🪝 ARO Git Hooks Initializer"));
  console.log(Branding.border(""));

  const pkgPath = path.join(projectPath, "package.json");
  if (!fs.existsSync(pkgPath)) {
    console.log(
      Branding.error(
        "❌ package.json not found. Run this in a Node.js project.",
      ),
    );
    process.exit(1);
  }

  try {
    console.log(Branding.gray("Setting up Husky..."));

    if (!fs.existsSync(path.join(projectPath, ".git"))) {
      console.log(
        Branding.warning("⚠️  Not a git repository. Run 'git init' first."),
      );
      return;
    }

    try {
      execSync("npx --yes husky init", { stdio: "ignore" });
    } catch (e: any) {
      console.log(
        Branding.warning(
          `⚠️  Husky init issue (might already be initialized): ${e.message}`,
        ),
      );
    }

    const preCommitPath = path.join(projectPath, ".husky", "pre-commit");

    // We add ARO audit to the pre-commit hook
    let hookContent = "npx @agent-aro/cli audit --silent\n";
    if (fs.existsSync(preCommitPath)) {
      const existing = fs.readFileSync(preCommitPath, "utf8");
      if (!existing.includes("@agent-aro/cli audit")) {
        hookContent = existing + "\n" + hookContent;
      } else {
        hookContent = existing;
      }
    }

    fs.writeFileSync(preCommitPath, hookContent, { mode: 0o755 });

    console.log(
      Branding.success("\n✅ Created Git pre-commit hook: ") +
        Branding.white(".husky/pre-commit"),
    );
    console.log(
      Branding.gray(
        "\nYour project will now be automatically audited on every commit.",
      ),
    );
  } catch (e: any) {
    console.log(Branding.error(`\n❌ Failed to setup git hooks: ${e.message}`));
  }
  console.log(Branding.border(""));
}

if (require.main === module) {
  run();
}
