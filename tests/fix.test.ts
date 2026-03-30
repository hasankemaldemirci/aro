/**
 * @aro-context-marker
 * AI READABILITY NOTE: Tests for the ARO Auto-Fix module.
 */

import fs from "fs";
import path from "path";
import { canFix, generateReadme } from "../src/fix";
import { AROContext } from "../src/types";

const mockContext: AROContext = {
  projectName: "test-project",
  version: "1.0.0",
  framework: "Vanilla Node.js",
  techStack: ["typescript", "jest"],
  entryPoints: ["src/index.ts"],
  analyzedAt: new Date().toISOString(),
  metrics: {
    hasReadme: false,
    readmeSize: 0,
    readmeQualityScore: 0,
    hasSrc: true,
    hasConfig: 2,
    largeFiles: 0,
    securityIssues: 0,
    hasAIMap: false,
    contextFiles: [],
    blindSpots: [],
    highComplexityFiles: 0,
    anyTypeUsage: 0,
  },
  score: 60,
  blindSpots: [],
  structure: {},
};

describe("canFix", () => {
  test("should return true for missing README blind spot", () => {
    expect(
      canFix("Missing README.md - AI Agents lack project high-level context."),
    ).toBe(true);
  });

  test("should return true for missing agent instructions", () => {
    expect(
      canFix(
        "No dedicated Agent instructions (AGENTS.md, .cursorrules) found.",
      ),
    ).toBe(true);
  });

  test("should return true for large files blind spot", () => {
    expect(canFix("3 large files detected - Causes 'Context Truncation'.")).toBe(
      true,
    );
  });

  test("should return false for security issues (manual fix required)", () => {
    expect(
      canFix("2 potential security/hallucination risks detected."),
    ).toBe(false);
  });

  test("should return false for complexity issues (manual fix required)", () => {
    expect(
      canFix("1 highly complex files detected - Deeply nested logic confuses AI models."),
    ).toBe(false);
  });
});

describe("generateReadme", () => {
  test("should include project name as heading", () => {
    const readme = generateReadme(mockContext);
    expect(readme).toContain("# test-project");
  });

  test("should include installation section with project name", () => {
    const readme = generateReadme(mockContext);
    expect(readme).toContain("npm install test-project");
  });

  test("should include usage section with code block", () => {
    const readme = generateReadme(mockContext);
    expect(readme).toContain("## Usage");
    expect(readme).toContain("```bash");
  });

  test("should list tech stack items", () => {
    const readme = generateReadme(mockContext);
    expect(readme).toContain("- typescript");
    expect(readme).toContain("- jest");
  });

  test("should fall back to Node.js for empty tech stack", () => {
    const context = { ...mockContext, techStack: [] };
    const readme = generateReadme(context);
    expect(readme).toContain("- Node.js");
  });

  test("should produce a README that scores above 50 on ARO quality check", () => {
    const { scoreReadmeContent } = require("../src/scoring");
    const readme = generateReadme(mockContext);
    expect(scoreReadmeContent(readme)).toBeGreaterThan(50);
  });
});
