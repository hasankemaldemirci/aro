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
import { detectFramework, calculateScore } from "../src/utils";

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

  describe("calculateScore - Logic Boundaries", () => {
    test("should give 100 for a perfect, well-documented project", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(100);
    });

    test("should reward AI-Map compensation (+10 points)", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 500,
        hasSrc: true,
        hasConfig: 2,
        largeFiles: 2,
        securityIssues: 0,
        hasAIMap: true,
        blindSpots: [],
      };
      // Base: Readme(30) + Src(20) + Config(20) + LargeFiles(30 - 2*5 = 20) = 90
      // + AI-Map Compensation (10) = 100
      expect(calculateScore(metrics)).toBe(100);
    });

    test("should penalize for missing README", () => {
      const metrics = {
        hasReadme: false,
        readmeSize: 0,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(70);
    });

    test("should penalize for small README (<500 chars)", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 100,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(85);
    });

    test("should reward alternative structures (monorepo/cli/packages)", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        hasSrc: true, // This will be set by the new logic in analyzeMetrics
        hasConfig: 2,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        blindSpots: [],
      };
      // Should give 100 even if it's not a standard 'src' folder (since analyzeMetrics now marks it true)
      expect(calculateScore(metrics)).toBe(100);
    });

    test("should penalize truly unstructured projects (no src, packages, cli, or core)", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        hasSrc: false,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 0,
        hasAIMap: false,
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(80); // Missing structure penalty
    });

    test("should penalize for large files (truncation debt)", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 5,
        securityIssues: 0,
        hasAIMap: false,
        blindSpots: [],
      };
      const score = calculateScore(metrics);
      expect(score).toBe(75);
    });

    test("should penalize for security issues", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
        securityIssues: 2,
        hasAIMap: false,
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(90); // 100 - (2 * 5)
    });

    test("should not go below 0", () => {
      const metrics = {
        hasReadme: false,
        readmeSize: 0,
        hasSrc: false,
        hasConfig: 0,
        largeFiles: 20,
        securityIssues: 10,
        hasAIMap: false,
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
  });
});
