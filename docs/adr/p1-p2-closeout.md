# Saucia v2 — Phase 1 and Phase 2 Execution Plan
---

## Phase 1 — Boundary enforcement

Goal:
- Enforce architecture boundaries in code via tooling, not by convention.
- Keep the client and server aligned with FSD + Clean Architecture rules.
- Prevent forbidden cross-layer imports and deep module access.
- Make the architecture gate required in CI.

### P1.1 — Root ESLint + Steiger + CI enforcement
Status: Partial / not fully enforced

Files and modules involved:
- To update:
  - `eslint.config.js`
  - `apps/customer-web/eslint.config.js`
  - `apps/server/eslint.config.js`
  - `steiger.config.mjs`
  - `.github/workflows/CI.yaml`
  - `package.json`
  - `turbo.json` (if needed)
- To create:
  - none required at this stage if config is already present

Subtasks:
- Ensure a root-level shared ESLint config is the source of truth.
- Keep app-specific lint overrides limited to client/server-specific rules.
- Ensure Steiger enforces FSD rules for `apps/customer-web/src`.
- Ensure `pnpm arch` runs dependency-cruiser + Steiger.
- Ensure CI runs the architecture gate before verify/build jobs.
- Make the architecture gate required in branch protection on `main`.

Validation:
- `pnpm install --frozen-lockfile`
- `pnpm arch`
- `pnpm lint -- --max-warnings=0`
- CI required checks: `architecture`, `verify`
- Branch protection on `main` must require passing checks before merge

Notes:
- Current evidence shows the root config and CI wiring exist.
- Steiger and lint still require strict enforcement at error level.
- Merge protection is not yet proven required on `main`.

---

### P1.2 — Module public API enforcement
Status: Partial / verification required

Files and modules involved:
- To update:
  - `.dependency-cruiser.cjs`
  - `apps/server/src/modules/*/index.ts`
- To create:
  - `apps/server/src/modules/identity/index.ts`
  - `apps/server/src/modules/notification/index.ts`
  - `apps/server/src/modules/payment/index.ts`
  - any other server module index file still missing

Subtasks:
- Ensure every server module exposes exactly one public API surface via `index.ts`.
- Reject imports to private server module internals from outside the module.
- Allow composition and public module imports only through the module barrel.
- Keep adapter wiring at the composition boundary.

Validation:
- `pnpm arch`
- Intentional negative probe:
  - import a module internal file from another module
  - expected result: rule fails
- Intentional positive probe:
  - import through `index.ts`
  - expected result: rule passes

Notes:
- This rule is the core of decision 14.
- The rule must be proven with real probes, not only by config presence.

---

### P1.3 — Server domain purity
Status: Partial / verification required

Files and modules involved:
- To update:
  - `.dependency-cruiser.cjs`
  - `apps/server/src/modules/*/domain`
  - `apps/server/src/kernel`
- To create:
  - no new files required unless probe helpers are temporarily needed

Subtasks:
- Ensure server `domain` only imports:
  - `@saucia/domain`
  - the server kernel
- Prevent server domain from importing:
  - `composition`
  - `platform`
  - `delivery-shared`
  - other module internals
  - other workspace packages beyond `@saucia/domain`
- Keep infrastructure adapters outside the domain.

Validation:
- `pnpm arch`
- Positive check:
  - `import '@saucia/domain'` inside a server domain file
  - expected result: allowed
- Negative check:
  - import from `apps/server/src/modules/.../application`
  - expected result: blocked
- Negative check:
  - import from `apps/server/src/platform/...`
  - expected result: blocked

Notes:
- This is the “decision 15” rule.
- The allow-list must be explicitly verified, not assumed.

---

### Cross-phase validation for Phase 1
Required checks:
- `pnpm install --frozen-lockfile`
- `pnpm arch`
- `pnpm lint -- --max-warnings=0`
- `pnpm type-check`
- `pnpm test`
- CI must pass on PR and push to `main`

Expected final state:
- zero forbidden imports
- no deep cross-module imports
- `server domain` stays pure
- `apps/customer-web` stays within FSD rules
- boundary norms are enforced by code, not verbal agreement

---

## Phase 2 — Order money path

Goal:
- Build and validate the checkout / order pipeline.
- Ensure totals are recomputed server-side and never trusted from the client.
- Establish the proper schema, migration, edge function integration, and tests.

### P2.1 — Server schema validation + client mapping
Status: Partial

Files and modules involved:
- To update:
  - `packages/contracts`
  - `apps/server/src/modules/order/...`
  - `apps/customer-web/src/shared/api`
  - `apps/customer-web/src/features/submit-order`
  - `apps/customer-web/src/entities/order`
- To create:
  - server validation helpers if not already created
  - client-side error mapping layer if missing

Subtasks:
- Validate `submitOrder.schema` on the server.
- Keep server validation and domain logic in sync.
- Map server error codes to client i18n keys.
- Keep client display logic separate from domain logic.

Validation:
- Server tests for invalid payloads
- Client tests for mapped error states
- `pnpm type-check`
- `pnpm test`

Notes:
- The order schema is part of the money path and must be validated before processing.

---

### P2.2 — `SubmitOrder` must recompute totals
Status: Partial

Files and modules involved:
- To update:
  - `apps/server/src/modules/order/application/use-cases/SubmitOrder.ts`
  - `apps/server/src/modules/order/application/ports/MealPriceReader.ts`
  - `apps/server/src/modules/order/domain`
  - `apps/server/src/modules/menu/...`
  - `apps/server/src/modules/order/infrastructure/...`
- To create:
  - `apps/server/src/modules/menu/infrastructure/supabase/MenuPriceReader.ts`
  - order repository/mapper if still missing

Subtasks:
- Make `SubmitOrder` read price data via `MealPriceReader`.
- Do not trust client-submitted totals.
- Recompute order totals from canonical meal pricing data.
- Verify line totals and order totals against domain rules.

Validation:
- domain and use-case tests
- check that client-provided totals are ignored
- end-to-end order submission test against local Supabase

Notes:
- This is the central business rule for Phase 2.

---

### P2.3 — Database migrations for order tables
Status: Open

Files and modules involved:
- To create/update:
  - `supabase/migrations/*.sql`
  - `packages/db-types/src/database.ts` regeneration
- To update:
  - `packages/db-types` after migrations are generated

Subtasks:
- Add `orders` table with checks and total checks.
- Add `order_meals` table.
- Add `order_items` table.
- Add `order_number` sequence or equivalent identity strategy.
- Ensure constraints and invariant checks reflect canonical order rules.

Validation:
- `supabase db reset`
- `supabase migration list`
- schema inspection checks
- `pnpm db:types`
- `pnpm type-check`

Notes:
- This is a hard dependency for downstream order logic and local checkout testing.

---

### P2.4 — Edge function for order processing
Status: Partial

Files and modules involved:
- To update:
  - `apps/server/runtimes/supabase-edge/...`
  - `supabase/functions/order-processing/...`
  - `apps/server/src/composition/...`
- To create:
  - additional bundle or edge entry points if needed

Subtasks:
- Build a single bundle for edge deployment.
- Expose an entrypoint that delegates to the server runtime.
- Wire `SubmitOrder` / `UpdateOrderStatus` / related use cases into it.
- Ensure the runtime imports the bundle, not raw package source.

Validation:
- local edge function invocation
- `supabase functions serve`
- `curl` or equivalent call to edge entry
- expected result: 200 for local test path
- `npm`/`pnpm` build process passes

Notes:
- This is the “order-processing” runtime workstream.
- It depends on stable edge deployment and local Supabase runtime reliability.

---

### P2.5 — Client to edge flow
Status: Partial

Files and modules involved:
- To update:
  - `apps/customer-web/src/features/submit-order`
  - `apps/customer-web/src/entities/order`
  - `apps/customer-web/src/shared/api`
  - `apps/customer-web/src/app/di`
  - `apps/customer-web/src/entities/order/infrastructure`
- To create:
  - thin API wrappers if still missing
  - order feature model layer if absent

Subtasks:
- Submit order from client feature.
- Route requests via `edgeClient` + `errorNormalizer`.
- Keep client totals display-only.
- Handle server-side validation failures cleanly.

Validation:
- UI-level order submission flow
- expected result: success path works
- expected result: invalid payload fails with mapped client errors
- `pnpm type-check`
- `pnpm test`

---

### P2.6 — Use-case tests with in-memory ports
Status: Partial

Files and modules involved:
- To update:
  - `apps/server/tests`
  - `apps/server/src/modules/order/tests`
  - `packages/domain` tests
- To create:
  - in-memory repository / port implementations
  - use-case tests for order and pricing flows

Subtasks:
- Test `SubmitOrder`
- Test status updates
- Test price and totals behavior
- Test repository + unit-of-work interactions

Validation:
- `pnpm test`
- targeted server test runs
- domain rule-level assertions

---

### P2.7 — Additive item line support and pricing rules
Status: Open

Files and modules involved:
- To update:
  - `packages/domain/pricing`
  - `apps/server/src/modules/order/domain`
  - `apps/server/src/modules/order/application`
  - `packages/contracts`
- To create:
  - `packages/domain/pricing/discountRules.ts`
  - pricing regression tests

Subtasks:
- Support `order_items` additive pattern.
- Implement `max_free_per_meal` rule.
- Ensure order total logic accounts for free or discounted additive lines.
- Keep domain logic centralized in shared packages.

Validation:
- pricing unit tests
- `pnpm test`
- use-case validation in checkout flows

---

### P2.8 — Legacy status/payment mapping
Status: Open

Files and modules involved:
- To update:
  - `docs/adr/saucia-project-bible.md`
  - migration notes / mapping docs
  - server status handling
- To create:
  - mapping documentation if not present

Subtasks:
- Confirm whether legacy statuses include `processing` / `shipped`.
- Map them to canonical values:
  - `pending`
  - `confirmed`
  - `preparing`
  - `out_for_delivery`
  - `delivered`
  - `cancelled`
- Confirm legal payment transitions and document them.

Validation:
- legacy-data review
- migration script validation
- domain logic tests for status transitions

---

### Cross-phase validation for Phase 2
Required checks:
- `pnpm type-check`
- `pnpm test`
- `pnpm arch`
- local Supabase:
  - `supabase start`
  - `supabase db reset`
  - functions serve / edge invocation
- end-to-end checkout flow:
  - order submission
  - total recomputation
  - server validation
  - success and rejection cases

Expected final state:
- client totals are display-only
- server recomputes totals
- order migrations exist and pass
- edge function path works
- checkout is green end-to-end against local Supabase

---

## Overall execution summary

Phase 1:
- Architecture enforcement
- Module API discipline
- Domain purity
- CI enforcement

Phase 2:
- Order validation
- Price recomputation
- Database support
- Edge function wiring
- Client-to-server integration
- Checkout validation

Current repo status:
- Phase 1 has tooling and CI configuration, but strict enforcement is not yet fully proven.
- Phase 2 is in progress; the flow is partly modeled, but not fully validated end-to-end.

---

## Immediate next actions
1. Finalize Phase 1 enforcement proof:
   - run and confirm failing probes for forbidden imports
   - run positive allow-list probes
   - convert warnings to errors where appropriate
   - enforce branch protection

2. Finish Phase 2 architecture and data path:
   - complete order migrations
   - complete `SubmitOrder` total recomputation
   - complete edge-function wiring
   - validate checkout end-to-end locally

