# ARO Agent Instructions

## Project Overview
ARO (Agent Readability Optimizer) is a CLI toolkit that analyzes codebases for AI agent readiness. It provides actionable insights, calculates AI-Debt, and offers intelligent refactoring suggestions.

## Core Principles

### Always
- Always prioritize developer experience and safety
- Always provide actionable, specific recommendations
- Always include unit tests for new features
- Always maintain backward compatibility
- Always use TypeScript strict mode
- Always validate user input before processing
- Always create backups before modifying files (--apply mode)

### Avoid
- Avoid auto-modifying files without explicit user consent (--apply flag)
- Avoid generic error messages - be specific about what went wrong
- Avoid breaking changes in patch/minor versions
- Avoid complex regex when simple string operations suffice
- Avoid nested callbacks - use async/await
- Avoid magic numbers - use named constants

## Architecture Rules

### File Organization
- Keep files under 300 lines when possible
- One class per file for better modularity
- Extract types/interfaces into separate .types.ts files
- Group related utilities into logical modules

### Testing
- Write unit tests for all new features
- Test both success and failure cases
- Use descriptive test names that explain intent
- Mock external dependencies (filesystem, network)

### Code Quality
- Use meaningful variable names (no single letters except loop counters)
- Add JSDoc comments for exported functions
- Include @aro-context-marker for AI-critical files
- Prefer composition over inheritance

## Command Design Philosophy

ARO follows an "analyze first, act second" approach:
- Default commands analyze and report (safe)
- Destructive actions require explicit flags (--apply, --update)
- Always show what will change before changing it

## Scoring Logic

ARO scores projects on 4 dimensions (100 points total):
1. **Documentation (25pts)**: README quality and completeness
2. **Structure (20pts)**: Organized directories and entry points
3. **File Size (30pts)**: Avoiding truncation with manageable file sizes
4. **AI Context (25pts)**: Quality of agent instruction files

## Common Patterns

### Adding New Commands
1. Create module in `src/[command].ts`
2. Export `run()` function
3. Add case to `bin/aro.ts` switch statement
4. Update help text
5. Add unit tests in `tests/[command].test.ts`

### File Analysis
- Use `fast-glob` for efficient file scanning
- Respect `.gitignore` and ARO ignore patterns
- Always provide progress feedback for long operations
- Cap results to prevent overwhelming output

## Error Handling
- Use descriptive error messages with context
- Suggest next steps when errors occur
- Exit with code 1 for failures, 0 for success
- Log errors to stderr, normal output to stdout
