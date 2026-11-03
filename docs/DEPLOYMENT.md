# Deployment

## Repository and CI
- Repository: `AmmarElsherif2021/saucia`, default branch `main`.
- Workflow: `.github/workflows/CI.yaml` (the only workflow).
- Node 22, pnpm 9.12.0 (`packageManager` in `package.json`).

## Required checks on `main`
Branch protection, configured 2026-11-03:

| Check | Job | Purpose |
| :--- | :--- | :--- |
| `architecture` | `pnpm arch` | dependency-cruiser and Steiger |
| `verify` | lint, type-check, test, build | needs `architecture` |
| `secret-scan` | Gitleaks | `.env` hygiene (P0.7) |
| `dependency-review` | pull requests only | blocks high-severity dependencies |

Settings: strict up-to-date checks on; administrators included; force pushes and deletions off; required approvals 0 (raise when a second reviewer exists).

Verify the settings:

```powershell
gh api repos/AmmarElsherif2021/saucia/branches/main/protection --jq '.required_status_checks.contexts'
```

## Notes
- A skipped required check counts as passing on GitHub. `verify` is skipped when `architecture` fails, so confirm `architecture` itself, not only `verify`.
- The Vercel deployment is outside the required checks; it still points at the legacy `client` root until P7.3 is complete.