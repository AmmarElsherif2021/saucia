# FSD and Clean rules: who enforces what

One rule, one owner. Each rule is enforced by exactly one tool.

| Rule | Owner | Config | Gate |
| :--- | :--- | :--- | :--- |
| Import direction between Clean rings (client and server) | dependency-cruiser | `.dependency-cruiser.cjs` | `pnpm arch` |
| Server kernel imports nothing from modules | dependency-cruiser (`server-kernel-imports-nothing`) | `.dependency-cruiser.cjs` | `pnpm arch` |
| Server domain imports only `@saucia/domain` and the kernel (`server-domain-pure`) | dependency-cruiser | `.dependency-cruiser.cjs` | `pnpm arch` |
| Module public surface through `index.ts` (`modules-public-api-only`) | dependency-cruiser | `.dependency-cruiser.cjs` | `pnpm arch` |
| FSD layer order (`app → pages → widgets → features → entities → shared`) | Steiger | `steiger.config.mjs` | `pnpm arch` |
| FSD slice public APIs through `index.ts` | Steiger | `steiger.config.mjs` | `pnpm arch` |
| Supabase service-role import restricted to platform and module infrastructure | ESLint (`no-restricted-imports`) | `apps/server/eslint.config.js` | `pnpm lint` |
| Per-file quality, React hooks, refresh | ESLint | root and `apps/customer-web/eslint.config.js` | `pnpm lint` (zero warnings) |

**Pinned tooling:** `steiger@0.5.0` with `@feature-sliced/steiger-plugin@0.8.2`.

**Removed:** `eslint-plugin-boundaries`, because dependency-cruiser already enforces the same import direction.

**Proof.** Each graph rule family was observed failing on a negative branch (PR #1). The domain case is recorded in P1.3.