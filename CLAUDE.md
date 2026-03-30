# Claude Code Instructions for ARO

## Project
ARO (Agent Readability Optimizer) — TypeScript CLI toolkit. See `AGENTS.md` for full architecture and coding conventions.

## Git Workflow

### Branch naming
```
feat/short-description
fix/short-description
chore/short-description
docs/short-description
```

### Commit message format
```
feat(scope): short description
fix(scope): short description
chore(scope): short description
```
Examples: `feat(audit): add severity filter`, `fix(cli): handle missing config gracefully`

### Pre-commit hook
Every commit triggers `.husky/pre-commit` which:
1. Runs `npm run build`
2. Runs `npm test`
3. Runs `aro audit --threshold=100` (score must be 100/100)
4. Auto-updates `.agent_context_pro.json` and `README.md` badge

**Never skip the hook (`--no-verify`).** If the hook fails, fix the root cause.

### Workflow for a typical change
1. Create branch from `main`
2. Make changes + add/update tests in `tests/`
3. `npm run build && npm test` — verify locally before committing
4. Commit (hook runs automatically)
5. If hook fails due to ARO score drop → fix the issue that caused the score drop, do not lower the threshold

## Permissions
- Branch creation, commits: proceed without asking
- `git push`: ask for confirmation first
- Force push, reset --hard, branch deletion: always ask

## Key constraints
- Files must stay under 300 lines (ARO standard — the audit will catch violations)
- New commands require a test file in `tests/[command].test.ts`
- Do not modify `.agent_context_pro.json` or `README.md` badge manually — the pre-commit hook manages these
