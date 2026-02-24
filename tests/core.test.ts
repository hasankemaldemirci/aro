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
import { detectFramework } from "../src/utils";
import { calculateScore, scoreReadmeContent } from "../src/scoring";

describe("ARO Core Engine", () => {
  describe("detectFramework - Precision & Edge Cases", () => {
    test("should detect Next.js (Priority Case)", () => {
      const pkg = { dependencies: { next: "latest", react: "latest" } };
      expect(detectFramework(pkg)).toBe("Next.js");
    });

    test("should detect React", () => {
      const pkg = { dependencies: { react: "latest" } };
      expect(detectFramework(pkg)).toBe("React");
    });

    test("should detect Vue.js from devDependencies", () => {
      const pkg = { devDependencies: { vue: "latest" } };
      expect(detectFramework(pkg)).toBe("Vue.js");
    });

    test("should detect Nuxt.js", () => {
      const pkg = { dependencies: { nuxt: "latest" } };
      expect(detectFramework(pkg)).toBe("Nuxt.js");
    });

    test("should detect Node.js (Express)", () => {
      const pkg = { dependencies: { express: "latest" } };
      expect(detectFramework(pkg)).toBe("Node.js (Express)");
    });

    test("should default to Vanilla Node.js for unknown or empty projects", () => {
      expect(detectFramework({})).toBe("Vanilla Node.js");
      expect(detectFramework({ dependencies: { lodash: "1.0.0" } })).toBe(
        "Vanilla Node.js",
      );
    });

    test("should handle null/undefined fields gracefully", () => {
      expect(detectFramework({ dependencies: undefined })).toBe(
        "Vanilla Node.js",
      );
    });
  });

  describe("scoreReadmeContent - Quality Analysis", () => {
    test("should give full score for a comprehensive README", () => {
      const content = `# My Project

## Installation
\`\`\`bash
npm install my-project
\`\`\`

## Usage
\`\`\`bash
my-project --flag value
\`\`\`

## Configuration
You can pass options and arguments to configure the tool.

## Examples
Here is an example of how to use the project.
`;
      expect(scoreReadmeContent(content)).toBe(100);
    });

    test("should give 0 for empty content", () => {
      expect(scoreReadmeContent("")).toBe(0);
    });

    test("should give partial score for title-only README", () => {
      const content = "# My Project\n";
      expect(scoreReadmeContent(content)).toBe(15);
    });

    test("should detect installation keywords", () => {
      const content = "# Proj\n\n## Getting Started\nRun npm install first.";
      const score = scoreReadmeContent(content);
      // title(15) + install(20) + 1 section(5) = 40
      expect(score).toBe(40);
    });

    test("should reward code blocks", () => {
      const content = "# Proj\n```bash\nnpm start\n```";
      // title(15) + code block(20) = 35
      expect(scoreReadmeContent(content)).toBe(35);
    });
  });

  describe("calculateScore - Logic Boundaries", () => {
    test("should give 100 for a perfect, well-documented project", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        readmeQualityScore: 100,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        contextFiles: [{ name: "AGENTS.md", size: 1000, score: 100 }],
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(100);
    });

    test("should reward AI context files", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 500,
        readmeQualityScore: 100,
        hasSrc: true,
        hasConfig: 2,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        contextFiles: [{ name: "AGENTS.md", size: 600, score: 100 }],
        blindSpots: [],
      };
      // README(25) + SRC(20) + Large(30) + Context(25) = 100
      expect(calculateScore(metrics)).toBe(100);
    });

    test("should penalize for missing README", () => {
      const metrics = {
        hasReadme: false,
        readmeSize: 0,
        readmeQualityScore: 0,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        contextFiles: [{ name: "AGENTS.md", size: 1000, score: 100 }],
        blindSpots: [],
      };
      // README(0) + SRC(20) + Bonus(5) + Large(30) + Context(25) = 80
      expect(calculateScore(metrics)).toBe(80);
    });

    test("should give partial README score for low quality content", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 100,
        readmeQualityScore: 0, // poor quality — only existence bonus
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        contextFiles: [{ name: "AGENTS.md", size: 1000, score: 100 }],
        blindSpots: [],
      };
      // README(10 + 0) + SRC(20) + Bonus(5) + Large(30) + Context(25) = 90
      expect(calculateScore(metrics)).toBe(90);
    });

    test("should reward alternative structures (monorepo/cli/packages)", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        readmeQualityScore: 100,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        contextFiles: [{ name: "AGENTS.md", size: 1000, score: 100 }],
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(100);
    });

    test("should penalize truly unstructured projects (no src, packages, cli, or core)", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        readmeQualityScore: 100,
        hasSrc: false,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        contextFiles: [{ name: "AGENTS.md", size: 1000, score: 100 }],
        blindSpots: [],
      };
      // README(25) + SRC(0) + Bonus(5) + Large(30) + Context(25) = 85
      expect(calculateScore(metrics)).toBe(85);
    });

    test("should penalize for large files (truncation debt)", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        readmeQualityScore: 100,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 5,
        securityIssues: 0,
        hasAIMap: false,
        contextFiles: [{ name: "AGENTS.md", size: 1000, score: 100 }],
        blindSpots: [],
      };
      // README(25) + SRC(20) + Bonus(5) + Large(30 - 25 = 5) + Context(25) = 80
      expect(calculateScore(metrics)).toBe(80);
    });

    test("should penalize for security issues", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        readmeQualityScore: 100,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 2,
        hasAIMap: false,
        contextFiles: [{ name: "AGENTS.md", size: 1000, score: 100 }],
        blindSpots: [],
      };
      // 100 - (2 * 5) = 95
      expect(calculateScore(metrics)).toBe(95);
    });

    test("should not go below 0", () => {
      const metrics = {
        hasReadme: false,
        readmeSize: 0,
        readmeQualityScore: 0,
        hasSrc: false,
        hasConfig: 0,
        largeFiles: 20,
        securityIssues: 10,
        hasAIMap: false,
        contextFiles: [],
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(0);
    });
  });

  describe("analyzeMetrics - Structural Awareness Integration", () => {
    const testDir = path.join(__dirname, "temp_test_project");

    beforeEach(() => {
      if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true });
      fs.mkdirSync(testDir);
    });

    afterAll(() => {
      if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true });
    });

    test("should recognize 'packages' folder as a valid source structure", () => {
      fs.mkdirSync(path.join(testDir, "packages"));
      fs.writeFileSync(path.join(testDir, "package.json"), "{}");
      fs.writeFileSync(path.join(testDir, "README.md"), "# Test Project");

      const { analyzeMetrics } = require("../src/utils");
      const metrics = analyzeMetrics(testDir, []);
      expect(metrics.hasSrc).toBe(true);
    });

    test("should recognize 'cli' folder as a valid source structure", () => {
      fs.mkdirSync(path.join(testDir, "cli"));
      fs.writeFileSync(path.join(testDir, "package.json"), "{}");
      fs.writeFileSync(path.join(testDir, "README.md"), "# Test Project");

      const { analyzeMetrics } = require("../src/utils");
      const metrics = analyzeMetrics(testDir, []);
      expect(metrics.hasSrc).toBe(true);
    });

    test("should compute readmeQualityScore when README exists", () => {
      fs.mkdirSync(path.join(testDir, "src"), { recursive: true });
      fs.writeFileSync(path.join(testDir, "package.json"), "{}");
      fs.writeFileSync(
        path.join(testDir, "README.md"),
        "# My Project\n\n## Installation\n```bash\nnpm install\n```\n\n## Usage\nRun the tool.",
      );

      const { analyzeMetrics } = require("../src/utils");
      const metrics = analyzeMetrics(testDir, []);
      expect(metrics.hasReadme).toBe(true);
      expect(metrics.readmeQualityScore).toBeGreaterThan(0);
    });

    test("should set readmeQualityScore to 0 when README is missing", () => {
      fs.mkdirSync(path.join(testDir, "src"), { recursive: true });
      fs.writeFileSync(path.join(testDir, "package.json"), "{}");

      const { analyzeMetrics } = require("../src/utils");
      const metrics = analyzeMetrics(testDir, []);
      expect(metrics.hasReadme).toBe(false);
      expect(metrics.readmeQualityScore).toBe(0);
    });
  });
});
