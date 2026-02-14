
/**
 * @aro-context-marker
 * AI READABILITY NOTE: This file is monitored for AI-Readability.
 */

/**
 * @aro-context-marker
 * AI READABILITY NOTE: This file is monitored for AI-Readability.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: MCP Server in TypeScript.
 * Provides tools for AI models to self-audit and optimize context.
 */

const SRC_PATH = __dirname;

const server = new Server(
  {
    name: "aro-ai-readability",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

// --- Resources ---
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "aro://current-metrics",
      name: "ARO AI-Readability Metrics",
      description: "The latest analysis results and AI debt report.",
      mimeType: "application/json",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "aro://current-metrics") {
    const contextPath = path.join(process.cwd(), ".agent_context_pro.json");
    if (!fs.existsSync(contextPath)) {
      throw new Error("No analysis data found. Run analyze_readability first.");
    }
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: fs.readFileSync(contextPath, "utf8"),
        },
      ],
    };
  }
  throw new Error("Resource not found");
});

// --- Tools ---
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_readability",
      description:
        "Performs a deep audit of the codebase to calculate AI-Readiness score and Hallucination Tax.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "optimize_readability",
      description:
        "Automatically applies AI-SEO markers and generates missing configurations to improve AI context retention.",
      inputSchema: {
        type: "object",
        properties: {
          applyFixes: {
            type: "boolean",
            description: "Whether to apply automated fixes.",
            default: true,
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  try {
    if (name === "analyze_readability") {
      execSync(`node ${path.join(SRC_PATH, "core.js")}`);
      const contextPath = path.join(process.cwd(), ".agent_context_pro.json");
      const data = JSON.parse(fs.readFileSync(contextPath, "utf8"));

      return {
        content: [
          {
            type: "text",
            text: `Analysis complete.\nScore: ${data.score}/100\nFramework: ${data.framework}\nBlind Spots: ${data.blindSpots.join(", ")}`,
          },
        ],
      };
    }

    if (name === "optimize_readability") {
      execSync(`node ${path.join(SRC_PATH, "refactor.js")}`);
      execSync(`node ${path.join(SRC_PATH, "core.js")}`);
      const contextPath = path.join(process.cwd(), ".agent_context_pro.json");
      const data = JSON.parse(fs.readFileSync(contextPath, "utf8"));

      return {
        content: [
          {
            type: "text",
            text: `Optimizations applied successfully.\nNew AI-Readiness Score: ${data.score}/100`,
          },
        ],
      };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        { type: "text", text: `Error executing ARO tool: ${error.message}` },
      ],
    };
  }
});

// --- Start Server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ARO MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting ARO MCP server:", error);
  process.exit(1);
});
