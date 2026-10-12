# Saucia Monorepo

Monorepo for the Saucia v2 platform: a React client, a Clean-architecture server delivered as Supabase Edge functions, and shared pure packages. Supabase is the database source of truth.

| Directory | What it is |
|---|---|
| `client/` | React app, structured as FSD x Clean |
| `server/` | Clean-architecture core, bundled for the Edge runtime |
| `packages/` | Shared leaf packages (`domain`, `contracts`, `db-types`) |
| `supabase/` | Migrations, seed data, Edge function entry points |
| `docs/` | The plan (`docs/adr/saucia-phase2.md`) and architecture docs |

**Rules in one line:** `client` and `server` may import `packages`; `packages` import neither; `client` and `server` never import each other (`.dependency-cruiser.cjs`, run with `pnpm arch`).

The plan in `docs/adr/saucia-phase2.md` is the reference of record for structure, sequencing and decisions.
