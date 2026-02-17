# MCP Server with Local LLMs

Connect ARO to Ollama, LM Studio, or other local LLMs.

## Ollama Setup

1. Install Ollama:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

2. Start Ollama:
```bash
ollama serve
```

3. Pull a model:
```bash
ollama pull llama2
```

4. Start ARO MCP server:
```bash
aro mcp
```

5. Configure your AI editor to use `http://localhost:3000`

## LM Studio Setup

1. Download LM Studio from https://lmstudio.ai
2. Load a model
3. Start local server (default: `http://localhost:1234`)
4. Run `aro mcp`
5. Point your AI editor to the MCP endpoint
