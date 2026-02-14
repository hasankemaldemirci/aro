import fs from "fs";
import path from "path";
import { Branding } from "./constants";
import { AROContext } from "./types";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Rules generator for AI Agents (Cursor/Windsurf).
 * Creates a .cursorrules file based on the local project context.
 */

export function run(): void {
  const projectPath = process.cwd();
  const contextPath = path.join(projectPath, ".agent_context_pro.json");

  if (!fs.existsSync(contextPath)) {
    console.log(
      Branding.error("❌ Knowledge Map not found. Run 'aro audit' first."),
    );
    process.exit(1);
  }

  const data: AROContext = JSON.parse(fs.readFileSync(contextPath, "utf8"));

  const rulesContent = `
# ARO: AI Agent Constitutional Rules 🛰️
Version: ${data.version} | Framework: ${data.framework}

## Core Directives for the AI Agent
You are working in a codebase optimized by **ARO**. To maintain a 100/100 Readiness Score:

1. **Modular Consistency:** NEVER create or expand files beyond 300 lines. If logic grows, refactor into smaller sub-modules immediately.
2. **Context Retention:** Always refer to \`.agent_context_pro.json\` for the latest project structure and tech stack.
3. **Deep Context Awareness:**
   - Framework: ${data.framework}
   - Tech Stack: ${data.techStack.join(", ")}
   - Active Entry Points: ${data.entryPoints.join(", ")}

4. **SEO Markers:** Always include \`@aro-context-marker\` in the headers of complex or core files to ensure context mapping persistence.
5. **No Placeholders:** When generating code, provide complete, production-ready implementations.

## Refactoring Protocol
- Prioritize modularity over monolithic functions.
- Ensure all new features are reflected in the documentation.
- Maintain a clear directory hierarchy as defined in the structural audit.

---
*Optimized by ARO - "SEO for your code, optimized for AI Agents."*
`.trim();

  try {
    const rulesPath = path.join(projectPath, ".cursorrules");
    fs.writeFileSync(rulesPath, rulesContent);
    console.log(Branding.border(""));
    console.log(Branding.cyan.bold("👑 ARO AI-Constitution (Rules)"));
    console.log(Branding.border(""));
    console.log(
      Branding.success("\n✅ Created AI Rules: ") +
        Branding.white(".cursorrules"),
    );
    console.log(
      Branding.gray(
        "\nAI Agents (Cursor/Windsurf) will now follow your project standards automatically.",
      ),
    );
    console.log(Branding.border(""));
  } catch (e: any) {
    console.log(
      Branding.error(`\n❌ Failed to create .cursorrules: ${e.message}`),
    );
  }
}

if (require.main === module) {
  run();
}
