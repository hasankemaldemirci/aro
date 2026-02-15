import fs from "fs";
import path from "path";
import fg from "fast-glob";
import { AROMetrics } from "./types";
import {
  DEFAULT_IGNORES,
  CONFIG_FILES,
  TECH_KEYWORDS,
  SECURITY_KEYWORDS,
  DANGEROUS_FUNCS,
} from "./constants";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Performance Optimized Utilities.
 * Using fast-glob for high-speed file discovery.
 */

export * from "./types";

export function loadIgnoreList(projectPath: string): string[] {
  const ignorePath = path.join(projectPath, ".aroignore");
  if (fs.existsSync(ignorePath)) {
    const content = fs.readFileSync(ignorePath, "utf8");
    const userIgnores = content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    return [...DEFAULT_IGNORES, ...userIgnores];
  }
  return DEFAULT_IGNORES;
}

export function detectFramework(pkg: any): string {
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };
  if (allDeps["next"]) return "Next.js";
  if (allDeps["nuxt"]) return "Nuxt.js";
  if (allDeps["vue"]) return "Vue.js";
  if (allDeps["react"]) return "React";
  if (allDeps["express"]) return "Node.js (Express)";
  return "Vanilla Node.js";
}

export function detectTechStack(pkg: any): string[] {
  const stack: string[] = [];
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };
  Object.keys(allDeps).forEach((dep) => {
    if (TECH_KEYWORDS.some((k) => dep.toLowerCase().includes(k))) {
      stack.push(dep);
    }
  });
  return stack;
}

export function findEntryPoints(projectPath: string): string[] {
  const common = [
    "src/index.ts",
    "src/main.ts",
    "src/app.ts",
    "bin/aro.ts",
    "src/index.js",
    "server.js",
    "app.js",
    "index.js",
  ];
  return common.filter((file) => fs.existsSync(path.join(projectPath, file)));
}

export function analyzeMetrics(
  projectPath: string,
  ignoreList: string[],
): AROMetrics {
  const metrics: AROMetrics = {
    hasReadme: false,
    readmeSize: 0,
    hasSrc: false,
    hasConfig: 0,
    largeFiles: 0,
    securityIssues: 0,
    hasAIMap: false,
    blindSpots: [],
  };

  const readmePath = path.join(projectPath, "README.md");
  if (fs.existsSync(readmePath)) {
    metrics.hasReadme = true;
    metrics.readmeSize = fs.statSync(readmePath).size;
  } else {
    metrics.blindSpots.push(
      "Missing README.md - AI Agents lack project high-level context.",
    );
  }

  metrics.hasSrc =
    fs.existsSync(path.join(projectPath, "src")) ||
    fs.existsSync(path.join(projectPath, "app"));
  if (!metrics.hasSrc)
    metrics.blindSpots.push(
      "Flat directory structure - Harder for AI to navigate.",
    );

  metrics.hasAIMap = fs.existsSync(
    path.join(projectPath, "AI-CONSTITUTION.md"),
  );

  CONFIG_FILES.forEach((file) => {
    if (fs.existsSync(path.join(projectPath, file))) metrics.hasConfig++;
  });

  // PERFORMANCE: Use fast-glob for sub-directory scanning (parallelized)
  const files = fg.sync(["**/*.{js,ts,tsx,jsx}"], {
    cwd: projectPath,
    ignore: ignoreList.map((i) => `**/${i}/**`),
    absolute: true,
    deep: 3,
  });

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    // Size check
    if (lines.length > 300) {
      metrics.largeFiles++;
    }

    // Security check (Basic detection for AI-gen risks)
    SECURITY_KEYWORDS.forEach((key) => {
      if (content.includes(key + "=") || content.includes(key + ":")) {
        metrics.securityIssues++;
      }
    });

    DANGEROUS_FUNCS.forEach((func) => {
      if (content.includes(func)) {
        metrics.securityIssues++;
      }
    });
  });

  if (metrics.largeFiles > 0) {
    metrics.blindSpots.push(
      `${metrics.largeFiles} large files detected - Causes 'Context Truncation'.`,
    );
  }

  if (metrics.securityIssues > 0) {
    metrics.blindSpots.push(
      `${metrics.securityIssues} potential security/hallucination risks (hardcoded keys or dangerous functions) detected.`,
    );
  }

  return metrics;
}

export function calculateScore(metrics: AROMetrics): number {
  let score = 0;
  if (metrics.hasReadme) {
    score += 15;
    if (metrics.readmeSize >= 500) score += 15;
  }
  if (metrics.hasSrc) score += 20;
  score += Math.min(metrics.hasConfig * 10, 20);
  score += Math.max(30 - metrics.largeFiles * 5, 0);

  // Compensation: If file splitting isn't possible, an AI-Map provides context reconciliation
  if (metrics.hasAIMap) score += 10;

  // Security Penalty: -5 per issue, caps at 20
  score -= Math.min(metrics.securityIssues * 5, 20);

  return Math.max(0, Math.min(score, 100));
}

export function getRepoStructure(
  dir: string,
  depth: number,
  ignoreList: string[],
): any {
  if (depth > 2) return "...";
  const res: any = {};
  try {
    fs.readdirSync(dir).forEach((file) => {
      if (!ignoreList.some((ignore) => file === ignore)) {
        const full = path.join(dir, file);
        let stat;
        try {
          stat = fs.statSync(full);
        } catch (e) {
          return;
        }
        if (stat.isDirectory()) {
          res[file] = getRepoStructure(full, depth + 1, ignoreList);
        } else {
          res[file] = "file";
        }
      }
    });
  } catch (e) {}
  return res;
}
