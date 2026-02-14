
/**
 * @aro-context-marker
 * AI READABILITY NOTE: This file is monitored for AI-Readability.
 */

/**
 * @aro-context-marker
 * AI READABILITY NOTE: This file is monitored for AI-Readability.
 */
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
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(100);
    });

    test("should penalize for missing README", () => {
      const metrics = {
        hasReadme: false,
        readmeSize: 0,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 0,
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
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(85);
    });

    test("should penalize heavily for flat directory structure", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        hasSrc: false,
        hasConfig: 4,
        largeFiles: 0,
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(80);
    });

    test("should penalize for large files (truncation debt)", () => {
      const metrics = {
        hasReadme: true,
        readmeSize: 1000,
        hasSrc: true,
        hasConfig: 4,
        largeFiles: 5,
        blindSpots: [],
      };
      const score = calculateScore(metrics);
      expect(score).toBe(75);
    });

    test("should not go below 0", () => {
      const metrics = {
        hasReadme: false,
        readmeSize: 0,
        hasSrc: false,
        hasConfig: 0,
        largeFiles: 20,
        blindSpots: [],
      };
      expect(calculateScore(metrics)).toBe(0);
    });
  });
});
