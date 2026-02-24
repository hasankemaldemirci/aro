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
  CONTEXT_FILES,
} from "./constants";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Performance Optimized Utilities.
 * Using fast-glob for high-speed file discovery.
 */

export * from "./types";

import { scoreReadmeContent } from "./scoring";

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
    readmeQualityScore: 0,
    hasSrc: false,
    hasConfig: 0,
    largeFiles: 0,
    securityIssues: 0,
    hasAIMap: false,
    contextFiles: [],
    blindSpots: [],
  };

  const readmePath = path.join(projectPath, "README.md");
  if (fs.existsSync(readmePath)) {
    metrics.hasReadme = true;
    const readmeContent = fs.readFileSync(readmePath, "utf8");
    metrics.readmeSize = Buffer.byteLength(readmeContent, "utf8");
    metrics.readmeQualityScore = scoreReadmeContent(readmeContent);
    if (metrics.readmeQualityScore < 50) {
      metrics.blindSpots.push(
        `Low-quality README (Score: ${metrics.readmeQualityScore}/100) - Add installation steps, code examples, and usage sections for better AI context.`,
      );
    }
  } else {
    metrics.blindSpots.push(
      "Missing README.md - AI Agents lack project high-level context.",
    );
  }

  // AI Context Files (AGENTS.md, .cursorrules etc)
  CONTEXT_FILES.forEach((file) => {
    const filePath = path.join(projectPath, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      let fileScore = 50; // Base score for existence
      if (content.length > 500) fileScore += 20;
      if (
        content.toLowerCase().includes("rule") ||
        content.toLowerCase().includes("instruction")
      )
        fileScore += 15;
      if (
        content.toLowerCase().includes("avoid") ||
        content.toLowerCase().includes("always")
      )
        fileScore += 15;

      metrics.contextFiles.push({
        name: file,
        size: content.length,
        score: Math.min(fileScore, 100),
      });

      if (fileScore < 80) {
        metrics.blindSpots.push(
          `Low quality instructions in ${file} - Add more 'Always'/'Avoid' constraints to reduce agent confusion.`,
        );
      }
    }
  });

  if (metrics.contextFiles.length === 0) {
    metrics.blindSpots.push(
      "No dedicated Agent instructions (AGENTS.md, .cursorrules) found.",
    );
  }

  metrics.hasSrc =
    fs.existsSync(path.join(projectPath, "src")) ||
    fs.existsSync(path.join(projectPath, "app")) ||
    fs.existsSync(path.join(projectPath, "packages")) ||
    fs.existsSync(path.join(projectPath, "cli")) ||
    fs.existsSync(path.join(projectPath, "core"));

  if (!metrics.hasSrc)
    metrics.blindSpots.push(
      "Unstructured project root - Harder for AI to traverse efficiently.",
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
