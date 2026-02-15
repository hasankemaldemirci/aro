import fs from "fs";
import path from "path";
import { EnterpriseOptions, ARODebt } from "./types";
import { Branding } from "./constants";
import { AROMetrics } from "./utils";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: This file is monitored for AI-Readability.
 */

export function calculateDebt(
  metrics: AROMetrics,
  options?: Partial<EnterpriseOptions>,
): ARODebt {
  const m = metrics;
  const rate = options?.rate || 100;
  const interactions = options?.interactions || 2400;

  let docDebt = 0;
  if (!m.hasReadme) docDebt = 15000;
  else if (m.readmeSize < 500) docDebt = 6000;

  let truncationDebt = m.largeFiles * 5000;
  if (m.hasAIMap) truncationDebt = 0;

  let structuralDebt = 0;
  if (!m.hasSrc) structuralDebt += 10000;
  // Align with Score: Score gives max points for 2 config files.
  const configRequirement = 2;
  const missingConfigs = Math.max(0, configRequirement - m.hasConfig);
  structuralDebt += missingConfigs * 5000;

  let tokenWasteDebt = m.largeFiles * interactions * 0.05;
  if (m.hasAIMap) tokenWasteDebt = 0;

  const totalDebt = docDebt + truncationDebt + structuralDebt + tokenWasteDebt;
  const wastedHours = totalDebt / rate;

  return {
    docDebt,
    truncationDebt,
    structuralDebt,
    tokenWasteDebt,
    totalDebt,
    wastedHours,
  };
}

export function run(): void {
  const args = process.argv.slice(2);

  const options: EnterpriseOptions = {
    rate: 120,
    interactions: 2400,
  };

  args.forEach((arg) => {
    if (arg.startsWith("--rate=")) options.rate = parseInt(arg.split("=")[1]);
    if (arg.startsWith("--interactions="))
      options.interactions = parseInt(arg.split("=")[1]);
    if (arg.startsWith("--threshold="))
      options.threshold = parseInt(arg.split("=")[1]);
    if (arg.startsWith("--output=")) options.output = arg.split("=")[1];
  });

  const projectPath = process.cwd();
  const contextPath = path.join(projectPath, ".agent_context_pro.json");

  if (!fs.existsSync(contextPath)) {
    console.log(
      Branding.error("❌ Knowledge Map not found. Run analysis first."),
    );
    process.exit(1);
  }

  const context = JSON.parse(fs.readFileSync(contextPath, "utf8"));
  const debt = calculateDebt(context.metrics, options);

  let reportContent = `
# ARO AI-Financial Report
Analyzed At: ${context.analyzedAt}
Project: ${context.projectName}
Score: ${context.score}/100

## Business Metrics
- AI-Onboarding Ready: ${context.score}%
- Developer Hourly Rate (Avg): $${options.rate}
- Annual Interactions: ${options.interactions}

## Financial Breakdown (Annual)
- Documentation Gap: $${Math.round(debt.docDebt).toLocaleString()}
- Truncation Risk: $${Math.round(debt.truncationDebt).toLocaleString()}
- Structural Debt: $${Math.round(debt.structuralDebt).toLocaleString()}
- Token Waste: $${Math.round(debt.tokenWasteDebt).toLocaleString()}

**TOTAL ANNUAL AI DEBT: $${Math.round(debt.totalDebt).toLocaleString()}**
Monthly Productivity Loss: $${Math.round(debt.totalDebt / 12).toLocaleString()}
Wasted Billable Hours: ${Math.round(debt.wastedHours)} hrs/year
`;

  if (options.output) {
    // SECURITY: Path Traversal Prevention
    // Ensure output is directed within the project directory or a safe subdirectory
    // We basename the filename to prevent escaping with ../..
    const safeFileName = path.basename(options.output);
    const outputPath = path.join(projectPath, safeFileName);

    fs.writeFileSync(outputPath, reportContent);
    console.log(
      Branding.success(`\n💾 Exported (Sanitized): `) +
        Branding.white.bold(safeFileName),
    );
  }

  // Console Output
  console.log(Branding.border(""));
  console.log(
    Branding.magenta.bold("💰 ARO Financial Analyzer") +
      Branding.gray(" | Enterprise Report"),
  );
  console.log(Branding.border(""));

  console.log(Branding.cyan("\n[BUSINESS METRICS]"));
  console.log(
    Branding.white(`Score: `) + Branding.success.bold(`${context.score}%`),
  );
  console.log(Branding.white(`Rate: `) + Branding.gray(`$${options.rate}/hr`));

  console.log(Branding.error("\n[DANGER ZONE - ANNUAL DEBT]"));
  console.log(
    Branding.gray(`Total Debt: `) +
      Branding.error.bold(`$${Math.round(debt.totalDebt).toLocaleString()}`),
  );
  console.log(
    Branding.gray(`Wasted Hours: `) +
      Branding.warning.bold(`${Math.round(debt.wastedHours)} hrs/yr`),
  );

  if (options.threshold !== undefined) {
    console.log(Branding.border(""));
    if (context.score < options.threshold) {
      console.log(
        Branding.error(
          `⛔ CI/CD REJECTED: Score ${context.score} < Threshold ${options.threshold}`,
        ),
      );
      process.exit(1);
    } else {
      console.log(
        Branding.success(
          `✅ CI/CD PASSED: Score ${context.score} >= Threshold ${options.threshold}`,
        ),
      );
    }
  }
}

if (require.main === module) {
  run();
}
