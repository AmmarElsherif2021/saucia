# apps/server/

Clean-architecture core. Business logic lives here and is delivered through Supabase Edge functions.

- Source in `src/`; the edge deployment bundle is built from `runtimes/supabase-edge/` into `supabase/functions/_shared/server-bundle.mjs` (generated, gitignored).
- Imports `@saucia/*` packages; never imports `apps/customer-web/`.
- Dependency direction: `delivery -> application -> domain`; `infrastructure` implements application ports; only `src/composition` wires them together.
- Each module in `src/modules/` exposes a single `index.ts`. Other modules, the edge bundle and composition import only through it.

| Folder | Purpose |
|---|---|
| `src/kernel/` | `Result`, `DomainError`, ports `Clock`, `IdGenerator`, `Logger`. Imports nothing from modules |
| `src/modules/` | One bounded context per folder (`order`, `menu`, `subscription`, and later `payment`, `notification`, `identity`, `support`) |
| `src/delivery-shared/` | HTTP helpers shared by module delivery code |
| `src/platform/` | Vendor-free adapters named by port: `supabase/`, `email/`, `payment/` (decision 20) |
| `src/composition/` | The only place that wires adapters to use cases |
| `runtimes/` | Build targets (currently `supabase-edge`) |
| `tests/` | Cross-module contract tests. Per-module use-case tests live in `src/modules/*/tests/` |

## Commands (run from `apps/server/`)

```powershell
pnpm build:edge          # bundle to supabase/functions/_shared/server-bundle.mjs
pnpm type-check
pnpm test
```

From the repo root: `pnpm arch` checks the dependency rules for this app.

## Rules

- Server `domain` may import `@saucia/domain` and the kernel. Nothing else (decision 15).
- Adapters are named by port, not vendor. Vendor SDK code stays inside the adapter file (decision 20).
- A new module must expose its `index.ts` before any other file imports it (decision 14).