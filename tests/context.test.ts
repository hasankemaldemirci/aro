import { analyzeMetrics } from "../src/utils";
import fs from "fs";
import path from "path";
import os from "os";

describe("Context File Analysis", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aro-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("should detect and score high-quality AGENTS.md", () => {
    const agentsContent = `# Agent Instructions

## Always
- Always validate input before processing
- Always use TypeScript strict mode

## Avoid
- Avoid using any type
- Avoid nested callbacks

## Rules
- Follow the single responsibility principle
- Write comprehensive tests
`;

    fs.writeFileSync(path.join(tempDir, "AGENTS.md"), agentsContent);
    fs.writeFileSync(path.join(tempDir, "README.md"), "# Test");

    const metrics = analyzeMetrics(tempDir, []);

    expect(metrics.contextFiles.length).toBe(1);
    expect(metrics.contextFiles[0].name).toBe("AGENTS.md");
    expect(metrics.contextFiles[0].score).toBeGreaterThanOrEqual(80);
  });

  test("should detect and score low-quality context file", () => {
    const lowQualityContent = `# Rules\nBe good.`;

    fs.writeFileSync(path.join(tempDir, ".cursorrules"), lowQualityContent);
    fs.writeFileSync(path.join(tempDir, "README.md"), "# Test");

    const metrics = analyzeMetrics(tempDir, []);

    expect(metrics.contextFiles.length).toBe(1);
    expect(metrics.contextFiles[0].name).toBe(".cursorrules");
    expect(metrics.contextFiles[0].score).toBeLessThan(80);
    expect(metrics.blindSpots.length).toBeGreaterThan(0);
    expect(
      metrics.blindSpots.some((s) => s.includes("Low quality instructions")),
    ).toBe(true);
  });

  test("should detect multiple context files", () => {
    fs.writeFileSync(
      path.join(tempDir, "AGENTS.md"),
      "# Always follow rules\n".repeat(30),
    );
    fs.writeFileSync(
      path.join(tempDir, "CONVENTIONS.md"),
      "# Avoid bad practices\n".repeat(30),
    );
    fs.writeFileSync(path.join(tempDir, "README.md"), "# Test");

    const metrics = analyzeMetrics(tempDir, []);

    expect(metrics.contextFiles.length).toBe(2);
    expect(metrics.contextFiles.map((f) => f.name)).toContain("AGENTS.md");
    expect(metrics.contextFiles.map((f) => f.name)).toContain("CONVENTIONS.md");
  });

  test("should add blind spot when no context files exist", () => {
    fs.writeFileSync(path.join(tempDir, "README.md"), "# Test");

    const metrics = analyzeMetrics(tempDir, []);

    expect(metrics.contextFiles.length).toBe(0);
    expect(metrics.blindSpots).toContain(
      "No dedicated Agent instructions (AGENTS.md, .cursorrules) found.",
    );
  });

  test("should score based on content length and keywords", () => {
    const shortContent = "# Rule: be nice";
    const longContent = `# Agent Instructions

${"Always follow best practices\n".repeat(20)}
${"Avoid anti-patterns\n".repeat(20)}
${"Rule: maintain code quality\n".repeat(10)}
`;

    fs.writeFileSync(path.join(tempDir, "short.md"), shortContent);
    fs.writeFileSync(path.join(tempDir, "AGENTS.md"), longContent);
    fs.writeFileSync(path.join(tempDir, "README.md"), "# Test");

    const metrics = analyzeMetrics(tempDir, []);

    const agentsFile = metrics.contextFiles.find((f) => f.name === "AGENTS.md");
    expect(agentsFile).toBeDefined();
    expect(agentsFile!.score).toBeGreaterThan(90);
  });
});
