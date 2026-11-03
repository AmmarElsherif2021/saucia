# Boundary Enforcement Phase:

**The goal is not to build features. It is to make the architecture enforceable so the repo stops depending on informal rules and starts depending on actual imports, layers, and boundaries.**

## What Phase 1 is really about?

- Enforce FSD layering in the customer app
- Enforce Clean Architecture rings in both apps
- Prevent accidental deep imports through server modules
- Keep shared packages truly leaf-like
- Make the repo safe before real business work (checkout, menu, subscriptions, support, payments)

## Phase 1 breakdown for Saucia:

### 1. Boundary enforcement foundation
This is the repo-level control layer.

Likely files to create or update:
* .dependency-cruiser.cjs
  - Add rules like:
    - customer-web cannot import server
    - server modules must expose public index.ts
    - app/pages/widgets/features/entities/shared direction stays downward
    - server domain stays pure
* steiger.config.cjs
  - enforce the same dependency rules in CI
* eslint config / workspace linting
  - boundary lint rules on app and server modules
* package.json
  - expose arch and lint scripts
  - ensure CI runs them
* turbo.json
  - keep workspace tasks aligned with the new boundary checks if needed

Concepts involved:
- Dependency direction
- Rule-based architecture
- CI enforcement
- Zero “accidental imports”

2. Customer-web boundary modules
This is the client-side architecture gate.

Likely modules to create or update:
- apps/customer-web/src/app/di
  - the only place infrastructure is wired into the UI
- apps/customer-web/src/shared/api
  - anon client, auth wrapper, error normalizer, edge client
- apps/customer-web/src/entities/*
  - each entity must keep its domain + model clean
- apps/customer-web/src/features/*
  - feature orchestration only, no infrastructure leakage
- apps/customer-web/src/widgets/*
  - compose features; should not import cross-layer infrastructure
- apps/customer-web/src/pages/*
  - top-level composition only

Concepts involved:
- FSD layering
- app -> pages -> widgets -> features -> entities -> shared
- infrastructure only at DI root
- model/ui never import infrastructure
- client domain purity

3. Server boundary modules
This is the most important part of P1.

Likely modules to create or update:
- apps/server/src/kernel
  - owns Result, DomainError, ports like Clock, IdGenerator, Logger
- apps/server/src/composition/container.ts
  - single composition root
- apps/server/src/composition/routes.ts
  - route mounting only
- apps/server/src/modules/*/index.ts
  - every server module exposes a single public API
- apps/server/src/modules/*/application/ports
  - ports stay in the application layer
- apps/server/src/modules/*/infrastructure/supabase
  - concrete adapters only, imported only through the module API / composition root

Concepts involved:
- Clean architecture rings
- dependency sink
- infrastructure behind ports
- public module API only
- composition root ownership

4. Shared leaf package boundary
These packages should remain purely shared and not become app-like.

Likely modules to create or update:
- packages/domain
  - pure business rules, validation, policy, pricing logic
- packages/contracts
  - request/response schemas derived from domain, never redefining domain rules
- packages/db-types
  - generated database schemas only

Concepts involved:
- leaf package
- no app imports
- no Supabase dependency
- derive, never redefine
- canonical source of truth

5. Phase 1 module map by “what should be enforced”
Here is the practical shape that fits this repo:

- Repo-level:
  - .dependency-cruiser.cjs
  - steiger.config.cjs
  - eslint config
  - package.json
  - turbo.json

- Customer app:
  - apps/customer-web/src/app/di
  - apps/customer-web/src/shared/api
  - apps/customer-web/src/entities/*
  - apps/customer-web/src/features/*
  - apps/customer-web/src/widgets/*
  - apps/customer-web/src/pages/*

- Server app:
  - apps/server/src/kernel
  - apps/server/src/composition/*
  - apps/server/src/modules/*/index.ts
  - apps/server/src/modules/*/application/ports
  - apps/server/src/modules/*/infrastructure/supabase

- Shared packages:
  - packages/domain
  - packages/contracts
  - packages/db-types

Concepts that matter most in Phase 1

1. Dependency direction
- The architecture is not just “nice folder names”.
- It is an import graph.
- Rule: app -> pages -> widgets -> features -> entities -> shared
- On server: domain < ports + application < infrastructure

2. Clean ring purity
- domain should be pure
- infrastructure should stay at the edge
- only composition roots may wire infrastructure

3. Module public API
- each server module should export through index.ts
- no one imports module internals directly
- this makes the boundary real

4. Shared leaf package rule
- packages are leaves
- they never import apps or supabase
- this avoids circular, leaky architecture

5. Composition root rule
- all infrastructure wiring is centralized
- prevents hidden cross-layer dependence

6. Derive, never redefine
- domain is the single source of truth
- contracts derive from domain
- duplicated rules are a P1 violation

7. Single ownership
- e.g. order status lives in domain, not duplicated in multiple places
- this is the architectural concept that makes the repo coherent

What a successful Phase 1 result looks like

- pnpm arch passes
- pnpm lint passes at error level
- zero live legacy imports
- no server module imports outside its public API
- customer-web domain remains pure
- server domain remains pure
- no app-to-app imports
- packages remain leaf-only
- architecture rules are enforced by tooling, not by memory



# TO DO: 
# Breakdown: Minimum Work to Flip Phase 1 to ✅

The work splits into five steps. Three touch config files only; one needs admin access on GitHub; one needs the `order/index.ts` re-export decision resolved. No feature code — this is all enforcement plumbing.

---

## Step 1 — Eliminate the warnings, and make warnings fail

**Why first:** everything after this assumes a clean baseline, and the current `pnpm lint` exit `0` is masking the fact that `eslint .` at warning-level is not a gate.

### 1a. Fix the `ThreeDisplay.tsx:1082` warning

File: `apps/customer-web/src/shared/ui/three/ThreeDisplay.tsx`

The `react-hooks/exhaustive-deps` warning says `silhouetteTouchedRef.current` will likely have changed by cleanup time. Fix by copying the ref into a local variable at effect start, then using that in the cleanup:

```tsx
useEffect(() => {
  const silhouetteTouched = silhouetteTouchedRef;
  return () => {
    // use silhouetteTouched, not silhouetteTouchedRef.current
  };
}, []);
```

**Verify:** `pnpm -r exec eslint . --max-warnings=0` → exit `0`, no output.

### 1b. Fix the two Steiger `no-public-api-sidestep` warnings

| File | Current import | Fix |
| :--- | :--- | :--- |
| `apps/customer-web/src/app/providers/SessionProvider.tsx` | `../../entities/session/model/sessionContext` | `../../entities/session` (slice index) — requires `entities/session/index.ts` to re-export `sessionContext` |
| `apps/customer-web/src/pages/home/model/types.ts` | `../../../shared/ui/three/types` | `../../../shared/ui/three` (slice index) — requires `shared/ui/three/index.ts` to re-export `types` |

**Verify:** `pnpm arch` → no Steiger warnings, exit `0`.

### 1c. Make warnings fatal (tooling, not memory)

- **Lint:** change each package's `lint` script (or the root `lint`) to `eslint . --max-warnings=0`. Suggested root change in `package.json`:
  ```json
  "lint": "turbo run lint -- --max-warnings=0"
  ```
  Or simpler and less Turbo-quirky — change each package's `lint` script to `"eslint . --max-warnings=0"`.
- **Steiger:** set `no-public-api-sidestep` (and the other rules that matter) to `error` in `steiger.config.cjs` so a future sidestep fails `pnpm arch` rather than producing an ignored warning.

**Verify:** plant a fresh sidestep, confirm both `pnpm arch` and `pnpm lint` exit non-zero. Remove the plant.

**Effort:** ~30 min.

---

## Step 2 — Create placeholder `index.ts` for `identity`, `notification`, `payment`

**Why here:** the P1.2 rule cannot pass "meaningfully" without it — the terminal scan already printed `index.ts=False` for those three modules.

Files to create (all empty-ish; they are placeholders per bible §3 — `identity` is `.gitkeep only`, `notification` is `HOLD Phase 6`, `payment` is `HOLD until provider confirmed`):

```ts
// apps/server/src/modules/identity/index.ts
/** Public API for the identity module.
 *  Placeholder — login is client + RLS per §5. Do not add imports until
 *  the module has a real application surface. */
export {};

// apps/server/src/modules/notification/index.ts
/** Public API for the notification module. HOLD Phase 6. */
export {};

// apps/server/src/modules/payment/index.ts
/** Public API for the payment module. HOLD until provider confirmed (decision 1). */
export {};
```

**Verify:** `Get-ChildItem apps/server/src/modules -Directory | ForEach-Object { "$($_.Name): index.ts=$(Test-Path "$_/index.ts")" }` → all `True`.

**Effort:** ~10 min.

---

## Step 3 — Add the `modules-public-api-only` rule (P1.2) and verify it fires

**Why last of the config changes:** it depends on Step 2 (all modules have `index.ts`) and on a small design decision about `order/index.ts` re-exporting `MealPriceReader` (below).

### 3a. Design decision to record first

Bible §3 says `menu/index.ts` exports `MenuPriceReader` adapter only; **the port stays in `order`**. But if the port is not re-exported from `order/index.ts`, `menu` cannot type-check its adapter against it without a deep import into `order/application/ports/MealPriceReader.ts` — which the new rule would forbid.

Two ways to resolve, pick one and write it in the bible before adding the rule:

- **Option A (composition wires by structural typing):** `menu`'s adapter has a method `getPrice(mealId)`, and `composition/container.ts` passes that instance to `SubmitOrder` which accepts a `MealPriceReader` shape. No cross-module import. Type-safe only as long as the shapes stay in sync.
- **Option B (`order/index.ts` re-exports the port):** `export type { MealPriceReader } from './application/ports/MealPriceReader';` in `order/index.ts`. `menu` imports `{ MealPriceReader } from 'modules/order'` — a public-API import the rule allows. This is the cleaner reading of the bible's "the port stays in order."

### 3b. Add the rule to `.dependency-cruiser.cjs`

Per-module (no backreferences in depcruise globs, so generate one rule per module):

```js
const serverModules = [
  'order', 'menu', 'subscription', 'support',
  'health-profile', 'identity', 'payment', 'notification',
];

const modulePublicApiRules = serverModules.map((m) => ({
  name: `module-${m}-public-api-only`,
  severity: 'error',
  comment:
    `Only apps/server/src/modules/${m}/index.ts may be imported from ` +
    `outside the ${m} module (decision 14, P1.2).`,
  from: { pathNot: `^apps/server/src/modules/${m}/` },
  to: {
    path:    `^apps/server/src/modules/${m}/`,
    pathNot: `^apps/server/src/modules/${m}/index\\.ts$`,
  },
}));

module.exports = {
  forbidden: [
    // ...existing rules...
    ...modulePublicApiRules,
  ],
};
```

The `to.path` / `to.pathNot` form is cleaner than a negative lookahead and matches the style of the rules already in the file.

### 3c. Verify with the probe that failed earlier

```powershell
Set-Content apps/server/src/modules/order/delivery/__probe.ts "import '../../../menu/domain/Meal';"
pnpm arch
$LASTEXITCODE   # expect non-zero, rule module-menu-public-api-only
Remove-Item apps/server/src/modules/order/delivery/__probe.ts
```

Also verify the rule **does not** fire on legitimate cases:

```powershell
# Internal-to-module deep import (must NOT fire)
Set-Content apps/server/src/modules/order/application/__probe.ts "import '../domain/Order';"
pnpm arch ; $LASTEXITCODE   # expect 0
Remove-Item apps/server/src/modules/order/application/__probe.ts

# Composition importing through index.ts (must NOT fire)
# (only meaningful once composition has module imports — currently none)
```

**Effort:** ~1 h for the rule + ~30 min if Option A is chosen (needs structural-type sanity check) or ~10 min if Option B.

**Exit-register effect:** P1.2 flips from ⬜ OPEN to ✅.

---

## Step 4 — Add the four missing probes (close the "by tooling" gap)

The terminal proved four rules; four remain unproven. Run each, capture the output as evidence, and consider promoting them to a script (`scripts/verify-arch.mjs`) so CI runs them — that converts "I ran it once" into "the tooling checks it".

```powershell
# (a) client-domain-pure — an entity's domain importing a feature must fail.
#     Prereq: entities/order/domain must exist (the earlier scan returned nothing —
#     check first: Get-ChildItem apps/customer-web/src/entities -Recurse -Directory -Filter domain)
Set-Content apps/customer-web/src/features/__probe-target/index.ts "export {};"
Set-Content apps/customer-web/src/entities/order/domain/__probe.ts "import '../../../../features/__probe-target';"
pnpm arch ; $LASTEXITCODE   # expect non-zero, rule client-domain-pure
Remove-Item apps/customer-web/src/entities/order/domain/__probe.ts
Remove-Item -Recurse apps/customer-web/src/features/__probe-target

# (b) server-never-imports-client — the reverse of the probe that already passed.
Set-Content apps/server/src/kernel/__probe.ts "import '../../../customer-web/src/shared';"
pnpm arch ; $LASTEXITCODE   # expect non-zero, rule server-never-imports-client
Remove-Item apps/server/src/kernel/__probe.ts

# (c) packages-* → supabase — the other half of packages-are-leaves.
Set-Content packages/domain/src/__probe.ts "import '../../../supabase/config';"
pnpm arch ; $LASTEXITCODE   # expect non-zero (unresolvable or forbidden)
Remove-Item packages/domain/src/__probe.ts

# (d) P1.3 positive allow-list — @saucia/domain and kernel must be ALLOWED
#     from server domain, i.e. the rule must NOT fire.
Set-Content apps/server/src/modules/order/domain/__probe.ts "import '@saucia/domain';"
pnpm arch ; $LASTEXITCODE   # expect 0
Remove-Item apps/server/src/modules/order/domain/__probe.ts
```

Probe (d) is the one that closes P1.3 (`server-domain-pure`: allow `@saucia/domain` and the kernel). If it fires, the rule's allow-list is still the pre-P1.3 shape and needs updating in `.dependency-cruiser.cjs`.

**Effort:** ~20 min to run and record; ~1 h to fold into a `scripts/verify-arch.mjs` CI step.

---

## Step 5 — Wire `CI.yaml` and enable branch protection

**Why last:** pointless until `pnpm arch` and `pnpm lint` actually fail on the violations above. Once they do, this is the step that turns "the tooling runs" into "the tooling is required".

### 5a. Confirm `CI.yaml` runs both checks

```powershell
Get-Content .github/workflows/CI.yaml
```

Look for a job that runs **both** (not one of):

```yaml
- run: pnpm arch
- run: pnpm lint
```

The earlier `Select-String -Pattern "pnpm (arch|lint)"` printed nothing — either the file uses a different invocation (`pnpm run arch`, `npx depcruise ...`, `turbo run arch`) or the pattern missed. Fix whatever is missing so both run on every PR and every push to `main`.

### 5b. Enable branch protection on `main`

Currently: `gh api repos/.../branches/main/protection` → **`404 Branch not protected`**. Without this, CI is advisory only.

Via UI (Settings → Branches → Add rule → pattern `main`):

- ☑ Require a pull request before merging
- ☑ Require status checks to pass before merging → **select the `arch` and `lint` job names from `CI.yaml`**
- ☑ Require branches to be up to date before merging
- ☑ Do not allow bypassing the above settings (enforce for admins)

Or via `gh` (needs admin token):

```powershell
gh api -X PUT repos/{owner}/{repo}/branches/main/protection `
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["arch", "lint"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null
}
JSON
```

(The `contexts` must exactly match the CI job `name:` values, not the workflow file name.)

**Verify:** open a throwaway PR that re-introduces one of the Step-4 violations — the PR must show a red `arch` / `lint` check and the merge button must be disabled.

**Exit-register effect:** closes the "root-level enforcement pending" half of P1.1, and the "by tooling, not memory" claim becomes true.

**Effort:** ~15 min (UI) + ~15 min to open and close the throwaway PR.

---

## Order, dependencies, effort

| Order | Step | Depends on | Effort |
| :-- | :--- | :--- | :--- |
| 1 | Fix `ThreeDisplay.tsx` warning + 2 Steiger sidesteps; set `--max-warnings=0` and Steiger error | — | ~30 min |
| 2 | Create `index.ts` for `identity`, `notification`, `payment` | — | ~10 min |
| 3 | `modules-public-api-only` rule + probe | Step 2, and 3a design decision | ~1–2 h |
| 4 | Four missing probes (incl. P1.3 positive allow-list) | Step 3 | ~20 min (+1 h to automate) |
| 5 | `CI.yaml` verification + branch protection | Steps 1–4 (a gate that fires on nothing is theatre) | ~30 min |
| — | **Total** | | **~3 h** |

Steps 1, 2 and 5a are independent and can be done in parallel. Step 3 is the only one that touches a design decision (3a). Step 5b needs repo-admin rights, so it may be a separate PR or a delegated action.

---

## What to update in the bible after each step

| Step done | Bible edit |
| :--- | :--- |
| 1 | P1.1 status 🟡 → ✅ (or note remaining); strike the "warnings only" loophole from the exit register |
| 2 | Note in §3 that `identity/`, `notification/`, `payment/` now have placeholder `index.ts` |
| 3 | P1.2 ⬜ OPEN → ✅; decision 14 status `planned: rule P1.2` → `implemented` |
| 3a | Record the chosen option (A or B) in §2.6 or as a new decision row; update §3 `menu/index.ts` note if Option B |
| 4 | P1.3 ✅ if probe (d) returned 0 and probe from terminal already returned 2 |
| 5 | P1.1 ✅; §6 CI invariant: "branch protection requires `arch` + `lint` on `main`" |

---

## What this does *not* fix (out of P1 scope)

- The `meals` / `orders` / `subscriptions` schema gaps (P2.3, P3.1, P4.1) — untouched by any of the above.
- The legacy `client/` and `server/` root folders still present in the tree (Stage B, move 1 — 🟡). Phase 1 can close with them present, because `pnpm arch` cruises `apps/*` only; but the bible's `zero live legacy imports` invariant must keep holding (it does — only doc comments matched).
- The `@saucia/client` ↔ `@saucia/server` package-name split (HOLD until the admin split, decision 2).
- The design question of how `menu`'s adapter satisfies `order`'s port without a deep import (Step 3a) — resolved minimally, not fully re-architected.



