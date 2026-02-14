import fs from "fs";
import path from "path";
import { Branding } from "./constants";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Badge generator for GitHub integration.
 * Produces a dynamic shield reflecting the AI-Readiness score.
 */

export function run(): void {
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

  let color = "red";
  if (score > 80) color = "brightgreen";
  else if (score > 60) color = "yellow";

  const badgeUrl = `https://img.shields.io/badge/ARO_Score-${score}%2F100-${color}?style=for-the-badge&logo=dependabot&logoColor=white`;
  const markdown = `[![ARO Score](${badgeUrl})](https://github.com/hasankemaldemirci/aro)`;

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
