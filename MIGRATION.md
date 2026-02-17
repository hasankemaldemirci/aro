# Migration Guide: agent-aro → @agent-aro/cli

## 🚀 What Changed?

ARO has migrated to a scoped package for better organization and future extensibility.

- **Old:** `agent-aro`
- **New:** `@agent-aro/cli`
- **Version:** `2.0.0`

## 📦 How to Migrate

### If you installed globally:

```bash
# Uninstall old package
npm uninstall -g agent-aro

# Install new scoped package
npm install -g @agent-aro/cli
```

### If you use npx:

```bash
# Old way (still works but deprecated)
npx agent-aro audit

# New way
npx @agent-aro/cli audit
```

### If you use in package.json:

```json
{
  "devDependencies": {
    "@agent-aro/cli": "^2.0.0"
  }
}
```

## ✅ Commands Remain the Same

All CLI commands work exactly the same:

```bash
aro audit
aro fix
aro rules
aro badge --update
aro init-ci
aro mcp
```

## 🔄 Breaking Changes

- Package name changed from `agent-aro` to `@agent-aro/cli`
- Version bumped to `2.0.0`
- No functional changes to commands

## 📝 Why This Change?

1. **Better Organization:** Scoped package under `@agent-aro` namespace
2. **Future Extensibility:** Allows for `@agent-aro/core`, `@agent-aro/mcp`, etc.
3. **Namespace Control:** Scoped packages prevent naming conflicts

## ❓ Questions?

Open an issue at [github.com/hasankemaldemirci/aro](https://github.com/hasankemaldemirci/aro)
