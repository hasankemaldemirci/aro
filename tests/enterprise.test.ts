import { calculateDebt } from "../src/enterprise";
import { AROMetrics } from "../src/utils";

describe("ARO Enterprise Analytics", () => {
  test("should calculate $0 debt for a perfect project", () => {
    const metrics: AROMetrics = {
      hasReadme: true,
      readmeSize: 1000,
      hasSrc: true,
      hasConfig: 4,
      largeFiles: 0,
      securityIssues: 0,
      blindSpots: [],
    };
    const debt = calculateDebt(metrics);
    expect(debt.totalDebt).toBe(0);
    expect(debt.docDebt).toBe(0);
    expect(debt.truncationDebt).toBe(0);
    expect(debt.structuralDebt).toBe(0);
  });

  test("should calculate maximum debt for a missing documentation", () => {
    const metrics: AROMetrics = {
      hasReadme: false,
      readmeSize: 0,
      hasSrc: true,
      hasConfig: 4,
      largeFiles: 0,
      securityIssues: 0,
      blindSpots: [],
    };
    const debt = calculateDebt(metrics);
    expect(debt.docDebt).toBe(15000);
    expect(debt.totalDebt).toBe(15000);
  });

  test("should scale truncation debt with large files", () => {
    const metrics: AROMetrics = {
      hasReadme: true,
      readmeSize: 1000,
      hasSrc: true,
      hasConfig: 4,
      largeFiles: 3,
      securityIssues: 0,
      blindSpots: [],
    };
    const debt = calculateDebt(metrics);
    expect(debt.truncationDebt).toBe(15000); // 3 * 5000
  });

  test("should calculate structural debt for flat projects", () => {
    const metrics: AROMetrics = {
      hasReadme: true,
      readmeSize: 1000,
      hasSrc: false,
      hasConfig: 0,
      largeFiles: 0,
      securityIssues: 0,
      blindSpots: [],
    };
    const debt = calculateDebt(metrics);
    expect(debt.structuralDebt).toBe(20000); // 10000 (no src) + (2 * 5000) (missing 2 configs)
  });

  test("should handle partial configurations", () => {
    const metrics: AROMetrics = {
      hasReadme: true,
      readmeSize: 1000,
      hasSrc: true,
      hasConfig: 2,
      largeFiles: 0,
      securityIssues: 0,
      blindSpots: [],
    };
    const debt = calculateDebt(metrics);
    expect(debt.structuralDebt).toBe(0); // Target met with 2 configs
  });
});
