import fs from "fs";
import path from "path";
import { Branding } from "./constants";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Badge generator for GitHub integration.
 * Supports --update flag to automatically patch README.md.
 */

export function run(): void {
  const args = process.argv.slice(2);
  const shouldUpdate = args.includes("--update");

  const projectPath = process.cwd();
  const contextPath = path.join(projectPath, ".agent_context_pro.json");

  if (!fs.existsSync(contextPath)) {
    console.log(
      Branding.error("❌ Knowledge Map not found. Run 'aro audit' first."),
    );
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(contextPath, "utf8"));
  const score = data.score;

  let color = "brightgreen";
  if (score < 60) color = "red";
  else if (score < 85) color = "yellow";

  // Using standard 'flat' style to match GitHub native badges exactly
  const badgeUrl = `https://img.shields.io/badge/ARO_Score-${score}%2F100-${color}`;
  const markdown = `[![ARO Score](${badgeUrl})](https://github.com/hasankemaldemirci/aro)`;

  if (shouldUpdate) {
    const readmePath = path.join(projectPath, "README.md");
    if (fs.existsSync(readmePath)) {
      let content = fs.readFileSync(readmePath, "utf8");
      const inlineRegex =
        /\[\!\[ARO Score\]\(https:\/\/img\.shields\.io\/badge\/ARO_Score-[^)]+\)\]\([^)]+\)/;
      const refRegex =
        /^\[aro-badge\]: https:\/\/img\.shields\.io\/badge\/ARO_Score-[^\n]+/m;

      if (inlineRegex.test(content)) {
        content = content.replace(inlineRegex, markdown);
        fs.writeFileSync(readmePath, content);
        console.log(Branding.success("✅ README.md updated (Inline Badge)."));
      } else if (refRegex.test(content)) {
        content = content.replace(refRegex, `[aro-badge]: ${badgeUrl}`);
        fs.writeFileSync(readmePath, content);
        console.log(
          Branding.success("✅ README.md updated (Reference Badge)."),
        );
      } else {
        console.log(
          Branding.warning(
            "⚠️  ARO Score badge not found in README.md. Skipping auto-update.",
          ),
        );
      }
    }
  }

  console.log(Branding.border(""));
  console.log(Branding.cyan.bold("🛡️  ARO Badge Generator"));
  console.log(Branding.border(""));
  console.log(
    Branding.white("\nUse the following snippet in your README.md:\n"),
  );
  console.log(Branding.magenta(markdown));
  console.log(Branding.border(""));
}

if (require.main === module) {
  run();
}
