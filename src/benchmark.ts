/**
 * @aro-context-marker
 * AI READABILITY NOTE: Benchmark module — measures AI discoverability before/after ARO.
 * Runs 8 standard questions an AI agent would ask, with and without context files.
 * No API key required — uses heuristic checks on project files.
 */

import fs from "fs";
import path from "path";
import { Branding, CONTEXT_FILES } from "./constants";
import { BenchmarkCheckContext, BenchmarkResult } from "./types";
import { handleError } from "./core";

type CheckFn = (ctx: BenchmarkCheckContext) => boolean;

interface Question {
  label: string;
  check: CheckFn;
}

const QUESTIONS: Question[] = [
  {
    label: "What does this project do?",
    check: ({ readmeContent, packageJson }) =>
      readmeContent.length > 100 || (packageJson?.description?.length ?? 0) > 10,
  },
  {
    label: "How do I install it?",
    check: ({ readmeContent }) =>
      /install|npm\s+install|yarn\s+add|pnpm\s+add|kurulum/i.test(readmeContent),
  },
  {
    label: "How do I run it?",
    check: ({ readmeContent, packageJson }) => {
      const hasScript = ["start", "dev", "run"].some(
        (k) => k in (packageJson?.scripts ?? {}),
      );
      return hasScript || /usage|how to run|npm\s+run|npm\s+start|çalıştır/i.test(readmeContent);
    },
  },
  {
    label: "What is the tech stack?",
    check: ({ packageJson }) =>
      Object.keys({
        ...(packageJson?.dependencies ?? {}),
        ...(packageJson?.devDependencies ?? {}),
      }).length > 0,
  },
  {
    label: "What are the coding conventions?",
    check: ({ readmeContent, contextFilesContent, includeContextFiles }) =>
      includeContextFiles
        ? /always|convention|rule|style|instruction/i.test(contextFilesContent)
        : /convention|coding style|eslint|prettier|linting/i.test(readmeContent),
  },
  {
    label: "What should I avoid doing?",
    check: ({ readmeContent, contextFilesContent, includeContextFiles }) =>
      includeContextFiles
        ? /avoid|never|do not|don't/i.test(contextFilesContent)
        : /avoid|never|don't|do not/i.test(readmeContent),
  },
  {
    label: "How do I run the tests?",
    check: ({ readmeContent, packageJson }) =>
      !!(packageJson?.scripts?.test) ||
      /test|jest|vitest|testing/i.test(readmeContent),
  },
  {
    label: "What is the git/commit workflow?",
    check: ({ readmeContent, contextFilesContent, includeContextFiles }) =>
      includeContextFiles
        ? /commit|branch|workflow|git\s+push|pull request/i.test(contextFilesContent)
        : /git\s+commit|branch\s+naming|commit\s+message/i.test(readmeContent),
  },
];

export function buildContext(
  projectPath: string,
  includeContextFiles: boolean,
): BenchmarkCheckContext {
  let readmeContent = "";
  let packageJson: any = {};
  let contextFilesContent = "";

  try {
    const readmePath = path.join(projectPath, "README.md");
    if (fs.existsSync(readmePath)) {
      readmeContent = fs.readFileSync(readmePath, "utf8");
    }
  } catch (_) {}

  try {
    const pkgPath = path.join(projectPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      packageJson = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    }
  } catch (_) {}

  if (includeContextFiles) {
    CONTEXT_FILES.forEach((file) => {
      const filePath = path.join(projectPath, file);
      try {
        if (fs.existsSync(filePath)) {
          contextFilesContent += fs.readFileSync(filePath, "utf8") + "\n";
        }
      } catch (_) {}
    });
  }

  return { readmeContent, packageJson, contextFilesContent, includeContextFiles };
}

export function runRound(projectPath: string, includeContextFiles: boolean): boolean[] {
  const ctx = buildContext(projectPath, includeContextFiles);
  return QUESTIONS.map((q) => q.check(ctx));
}

function printResults(results: BenchmarkResult[]): void {
  const beforeScore = results.filter((r) => r.before).length;
  const afterScore = results.filter((r) => r.after).length;
  const total = results.length;
  const improvement = afterScore - beforeScore;

  console.log(Branding.white("\n📋 AI Agent Discoverability Questions:\n"));

  results.forEach((r) => {
    let symbol: string;
    if (r.after && !r.before) {
      symbol = Branding.warning("✨"); // gained via context files
    } else if (r.after) {
      symbol = Branding.success("✅");
    } else {
      symbol = Branding.error("❌");
    }
    console.log(`  ${symbol}  ${Branding.white(r.label)}`);
  });

  console.log(Branding.border(""));
  console.log(Branding.white("\n📊 Results:"));
  console.log(Branding.gray(`   Without context files: ${beforeScore}/${total}`));
  console.log(Branding.cyan(`   With context files:    ${afterScore}/${total}`));

  if (improvement > 0) {
    console.log(
      Branding.success(`\n   ✨ ${improvement} more question(s) answerable thanks to context files.`),
    );
  } else if (afterScore === total) {
    console.log(Branding.success(`\n   Perfect score — your project is fully discoverable.`));
  } else {
    console.log(
      Branding.warning(`\n   No context files found. Run 'aro audit --fix' to improve.`),
    );
  }

  console.log(Branding.border(""));
}

export function run(): void {
  const projectPath = process.cwd();
  const pkgPath = path.join(projectPath, "package.json");

  if (!fs.existsSync(pkgPath)) {
    handleError("package.json not found. Please run this in a Node.js project.");
  }

  console.log(Branding.border(""));
  console.log(Branding.cyan.bold("🧪 ARO Benchmark — AI Discoverability Test"));
  console.log(Branding.border(""));

  const before = runRound(projectPath, false);
  const after = runRound(projectPath, true);

  const results: BenchmarkResult[] = QUESTIONS.map((q, i) => ({
    label: q.label,
    before: before[i],
    after: after[i],
  }));

  printResults(results);
}

if (require.main === module) {
  run();
}
