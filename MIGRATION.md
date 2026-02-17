# Migration Guide: agent-aro → @agent-aro/cli

## 🚀 What Changed?

ARO has migrated to a scoped package for better organization and future extensibility.

- **Old:** `agent-aro`
- **New:** `@agent-aro/cli`
- **Latest Version:** `2.1.0`

## 📦 How to Migrate

### If you installed globally

```bash
# Uninstall old package
npm uninstall -g agent-aro

# Install new scoped package
npm install -g @agent-aro/cli
```

### If you use npx

```bash
# Old way (still works but deprecated)
npx agent-aro audit

# New way
npx @agent-aro/cli audit
```

### If you use in package.json

```json
{
  "devDependencies": {
    "@agent-aro/cli": "^2.1.0"
  }
}
```

## ✅ Commands

All CLI commands work exactly the same:

```bash
aro audit
aro refactor          # New in v2.1.0
aro refactor --apply  # Agentic mode (new in v2.1.0)
aro rules
aro badge --update
aro init-ci
aro mcp
```

## 🔄 Breaking Changes

### v2.1.0

- **Removed:** `aro fix` command (replaced by `aro refactor`)
- **Added:** `aro refactor` with optional `--apply` flag for agentic mode
- **Added:** Context file analysis (AGENTS.md, .cursorrules scoring)

### v2.0.0

- Package name changed from `agent-aro` to `@agent-aro/cli`
- No functional changes to commands

## 📝 Why These Changes

1. **Better Organization:** Scoped package under `@agent-aro` namespace
2. **Future Extensibility:** Allows for `@agent-aro/core`, `@agent-aro/mcp`, etc.
3. **Namespace Control:** Scoped packages prevent naming conflicts
4. **Agentic First:** v2.1.0 focuses on AI-driven automation with `--apply` flags

## ❓ Questions

Open an issue at [github.com/hasankemaldemirci/aro](https://github.com/hasankemaldemirci/aro)
