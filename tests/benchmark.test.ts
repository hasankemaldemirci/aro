/**
 * @aro-context-marker
 * AI READABILITY NOTE: Tests for the ARO Benchmark module.
 */

import fs from "fs";
import path from "path";
import os from "os";
import { buildContext, runRound } from "../src/benchmark";

describe("ARO Benchmark", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aro-bench-"));
    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify({
        name: "test-project",
        description: "A test project",
        scripts: { test: "jest", start: "node index.js" },
        dependencies: { express: "^4.0.0" },
      }),
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("buildContext", () => {
    test("should read README content when it exists", () => {
      fs.writeFileSync(path.join(tempDir, "README.md"), "# My Project\nA great tool.");
      const ctx = buildContext(tempDir, false);
      expect(ctx.readmeContent).toContain("My Project");
    });

    test("should return empty string when README is missing", () => {
      const ctx = buildContext(tempDir, false);
      expect(ctx.readmeContent).toBe("");
    });

    test("should parse package.json correctly", () => {
      const ctx = buildContext(tempDir, false);
      expect(ctx.packageJson.name).toBe("test-project");
    });

    test("should include context files content when flag is true", () => {
      fs.writeFileSync(path.join(tempDir, "AGENTS.md"), "Always write tests.\nAvoid using any.");
      const ctx = buildContext(tempDir, true);
      expect(ctx.contextFilesContent).toContain("Always write tests");
    });

    test("should not include context files content when flag is false", () => {
      fs.writeFileSync(path.join(tempDir, "AGENTS.md"), "Always write tests.");
      const ctx = buildContext(tempDir, false);
      expect(ctx.contextFilesContent).toBe("");
    });
  });

  describe("runRound", () => {
    test("should return array of 8 booleans", () => {
      const results = runRound(tempDir, false);
      expect(results).toHaveLength(8);
      results.forEach((r) => expect(typeof r).toBe("boolean"));
    });

    test("tech stack question should be true when package.json has dependencies", () => {
      const results = runRound(tempDir, false);
      expect(results[3]).toBe(true); // "What is the tech stack?"
    });

    test("after score should be >= before score", () => {
      fs.writeFileSync(
        path.join(tempDir, "AGENTS.md"),
        "Always follow conventions.\nAvoid using any type.",
      );
      fs.writeFileSync(
        path.join(tempDir, "CLAUDE.md"),
        "Git workflow: create branch, commit, push.",
      );
      const before = runRound(tempDir, false).filter(Boolean).length;
      const after = runRound(tempDir, true).filter(Boolean).length;
      expect(after).toBeGreaterThanOrEqual(before);
    });
  });

  describe("discoverability checks", () => {
    test("installation question should be true when README has install instructions", () => {
      fs.writeFileSync(
        path.join(tempDir, "README.md"),
        "# Project\n\n## Installation\nnpm install my-project",
      );
      const results = runRound(tempDir, false);
      expect(results[1]).toBe(true); // "How do I install it?"
    });

    test("conventions question should be false before context files", () => {
      fs.writeFileSync(path.join(tempDir, "README.md"), "# Project\nA simple tool.");
      const results = runRound(tempDir, false);
      expect(results[4]).toBe(false); // "What are the coding conventions?"
    });

    test("conventions question should be true after context files with 'always' keyword", () => {
      fs.writeFileSync(path.join(tempDir, "AGENTS.md"), "Always follow best practices.");
      const results = runRound(tempDir, true);
      expect(results[4]).toBe(true);
    });

    test("avoid question should be false before and true after context files", () => {
      fs.writeFileSync(path.join(tempDir, "AGENTS.md"), "Avoid using eval(). Never use any.");
      const before = runRound(tempDir, false)[5];
      const after = runRound(tempDir, true)[5];
      expect(before).toBe(false);
      expect(after).toBe(true);
    });

    test("git workflow question should be true after CLAUDE.md with commit info", () => {
      fs.writeFileSync(
        path.join(tempDir, "CLAUDE.md"),
        "Create a branch, commit your changes, push and open a pull request.",
      );
      const results = runRound(tempDir, true);
      expect(results[7]).toBe(true); // "What is the git/commit workflow?"
    });

    test("test question should be true when package.json has test script", () => {
      const results = runRound(tempDir, false);
      expect(results[6]).toBe(true); // "How do I run the tests?"
    });
  });
});
