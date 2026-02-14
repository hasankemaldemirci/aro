import { execSync } from "child_process";
import fs from "fs";
import path from "path";

describe("ARO CLI E2E", () => {
  const testDir = path.join(__dirname, "e2e-dummy-project");
  const aroBin = path.join(__dirname, "../dist/bin/aro.js");

  beforeAll(() => {
    // Setup dummy project
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

    fs.writeFileSync(
      path.join(testDir, "package.json"),
      JSON.stringify({
        name: "e2e-test-project",
        version: "1.0.0",
        dependencies: { express: "^4.17.1" },
      }),
    );

    fs.writeFileSync(
      path.join(testDir, "README.md"),
      "# Test Project\nThis is a test project for ARO E2E. It needs to be long enough to pass some size checks if necessary.".repeat(
        10,
      ),
    );

    const srcDir = path.join(testDir, "src");
    if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);
    fs.writeFileSync(
      path.join(srcDir, "app.js"),
      "console.log('hello world');",
    );
  });

  afterAll(() => {
    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should run "aro audit" and generate reports', () => {
    // Ensure build exists
    if (!fs.existsSync(aroBin)) {
      execSync("npm run build", { cwd: path.join(__dirname, "..") });
    }

    // Execution
    const output = execSync(`node ${aroBin} audit`, {
      cwd: testDir,
    }).toString();

    // Verifications (Updated strings to match new Branding and modular output)
    expect(output).toContain("ARO");
    expect(output).toContain("Framework");
    expect(output).toContain("Node.js (Express)");
    expect(output).toContain("Quality Score");
    expect(output).toContain("Financial Analyzer");
    expect(output).toContain("ANNUAL DEBT"); // Updated from "TOTAL ANNUAL AI DEBT"

    // Check if artifact was created
    const contextFilePath = path.join(testDir, ".agent_context_pro.json");
    expect(fs.existsSync(contextFilePath)).toBe(true);

    const contextData = JSON.parse(fs.readFileSync(contextFilePath, "utf8"));
    expect(contextData.projectName).toBe("e2e-test-project");
    expect(contextData.framework).toBe("Node.js (Express)");
  });
});
