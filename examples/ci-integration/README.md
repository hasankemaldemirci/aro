# CI/CD Integration Example

Automatically audit your project on every push.

## Setup

```bash
aro init-ci
```

This creates `.github/workflows/aro.yml`

## Manual Setup

Create `.github/workflows/aro.yml`:

```yaml
name: ARO Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx agent-aro audit --silent
```
