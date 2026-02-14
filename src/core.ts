/**
 * @aro-context-marker
 * AI READABILITY NOTE: This file is monitored for AI-Readability.
 */

/**
 * @aro-context-marker
 * AI READABILITY NOTE: This file is monitored for AI-Readability.
 */
import fs from "fs";
import path from "path";
import { AROContext } from "./types";
import { Branding } from "./constants";
import {
  loadIgnoreList,
  detectFramework,
  detectTechStack,
  findEntryPoints,
  analyzeMetrics,
  calculateScore,
  getRepoStructure,
} from "./utils";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Orchestration layer for ARO analysis.
 */

export async function run(): Promise<AROContext | void> {
  const isSilent = process.argv.includes("--silent");

  if (!isSilent) {
    console.log(Branding.border(""));
    console.log(Branding.cyan.bold("🛰️  ARO") + Branding.gray(" | v2.1.0-TS"));
    console.log(
      Branding.white('"SEO for your code, optimized for AI Agents."'),
    );
    console.log(Branding.border(""));
  }

  const projectPath = process.cwd();
  const pkgPath = path.join(projectPath, "package.json");

  if (!fs.existsSync(pkgPath)) {
    handleError(
      "package.json not found. Please run this in a Node.js project.",
    );
  }

  let pkg: any;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } catch (e: any) {
    handleError(`Failed to parse package.json: ${e.message}`);
  }

  const framework = detectFramework(pkg);
  const techStack = detectTechStack(pkg);
  const entryPoints = findEntryPoints(projectPath);

  if (!isSilent) {
    console.log(
      Branding.white(`\n🎯 Framework: `) + Branding.magenta.bold(framework),
    );
    console.log(
      Branding.gray(`🛠️  Tech Stack: `) + Branding.cyan(techStack.join(", ")),
    );
    console.log(Branding.gray(`📂 Scope: `) + Branding.white(projectPath));
  }

  const ignoreList = loadIgnoreList(projectPath);

  try {
    const metrics = analyzeMetrics(projectPath, ignoreList);
    const score = calculateScore(metrics);

    const contextMap: AROContext = {
      projectName: pkg.name || "Unknown",
      version: pkg.version || "0.0.1",
      framework,
      techStack,
      entryPoints,
      analyzedAt: new Date().toISOString(),
      metrics,
      score,
      blindSpots: metrics.blindSpots,
      structure: getRepoStructure(projectPath, 0, ignoreList),
    };

    const contextFilePath = path.join(projectPath, ".agent_context_pro.json");
    fs.writeFileSync(contextFilePath, JSON.stringify(contextMap, null, 2));

    if (!isSilent) {
      console.log(
        Branding.success(`\n✅ Knowledge Map: `) +
          Branding.white.bold(".agent_context_pro.json"),
      );
      displayScore(score);
    }

    return contextMap;
  } catch (e: any) {
    handleError(`Analysis failed: ${e.message}`);
  }
}

export function handleError(message: string): never {
  console.log(Branding.error(`\n❌ Error: ${message}`));
  process.exit(1);
}

export function displayScore(score: number): void {
  const color =
    score > 80
      ? Branding.success
      : score > 60
        ? Branding.warning
        : Branding.error;
  console.log(
    Branding.white(`📈 Quality Score: `) + color.bold(`${score}/100`),
  );

  if (score < 80) {
    console.log(
      Branding.warning(`\n⚠️  At Risk: High Hallucination Tax detected.`),
    );
  }
}

if (require.main === module) {
  run().catch((err) => {
    handleError(err.message);
  });
}
