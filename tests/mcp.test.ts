import { spawn } from "child_process";
import path from "path";

describe("ARO MCP Server Integration", () => {
  const mcpPath = path.join(__dirname, "../dist/src/mcp.js");

  test("should start and respond to ListTools request over stdio", (done) => {
    // We run the compiled version
    const mcp = spawn("node", [mcpPath]);

    let output = "";
    mcp.stdout.on("data", (data) => {
      output += data.toString();
      try {
        // MCP is JSON-RPC. We are looking for the tools definition.
        if (
          output.includes("analyze_readability") &&
          output.includes("optimize_readability")
        ) {
          clearTimeout(timeout);
          mcp.kill();
          done();
        }
      } catch (e) {
        // Wait for more data
      }
    });

    mcp.stderr.on("data", (data) => {
      const msg = data.toString();
      // The server logs "ARO MCP Server running on stdio" to stderr
      if (msg.includes("ARO MCP Server running on stdio")) {
        // Send dummy ListTools request
        const listToolsRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {},
        };
        mcp.stdin.write(JSON.stringify(listToolsRequest) + "\n");
      }
    });

    mcp.on("error", (err) => {
      clearTimeout(timeout);
      done(err);
    });

    // Timeout safety
    const timeout = setTimeout(() => {
      if (mcp.killed) return;
      mcp.kill();
      done(
        new Error(
          "MCP Server response timeout or tools not found in output: " + output,
        ),
      );
    }, 5000);
  });

  test("should expose current-metrics resource", (done) => {
    const mcp = spawn("node", [mcpPath]);
    let output = "";

    mcp.stdout.on("data", (data) => {
      output += data.toString();
      if (output.includes("aro://current-metrics")) {
        clearTimeout(timeout);
        mcp.kill();
        done();
      }
    });

    mcp.stderr.on("data", (data) => {
      if (data.toString().includes("ARO MCP Server running on stdio")) {
        const listResourcesRequest = {
          jsonrpc: "2.0",
          id: 2,
          method: "resources/list",
          params: {},
        };
        mcp.stdin.write(JSON.stringify(listResourcesRequest) + "\n");
      }
    });

    const timeout = setTimeout(() => {
      if (mcp.killed) return;
      mcp.kill();
      done(new Error("MCP Server resource discovery failed"));
    }, 5000);
  });
});
