# packages/

Shared leaf packages, consumed by `client/` and `server/`.

- **Leaves:** nothing here may import from `client/`, `server/`, `apps/` or `supabase/`.
- **Just-in-time:** each package's `exports` point at TS source, so there is no build step.
- Naming: `@saucia/<package>`.

| Package | Purpose |
|---|---|
| `domain/` | Pure business rules |
| `contracts/` | Wire shapes shared by client and server |
| `db-types/` | Generated database row types |
