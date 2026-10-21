# Saucia v2 — Project Bible

> **Revision:** 6 · **Snapshot:** 2026-10-21 · **Purpose:** the reference of record for structure, rules, sequencing and decisions.
>
> This revision is a **current-state document**. Completed tasks, resolved drift and superseded decisions are not restated; they live in git history (Revisions 1–5) and in `_legacy/`. If a task is not listed as open, it is done.

**Where things are:** `apps/customer-web/` (React), `apps/server/` (Clean core + edge bundle source), `packages/{domain,contracts,db-types}` (shared leaves), `supabase/` (migrations, seed, function entries), `docs/` (this file), `_legacy/` (quarantined v1).

---

## 0. Reading this document

| Mark | Meaning |
| :--- | :--- |
| ✅ DONE | Present in the tree; no action |
| 🟡 PARTIAL | Some evidence; the remainder is named |
| ⬜ OPEN | Not started |
| 🔍 VERIFY | Not provable from the tree (dashboard, history, secrets) |
| ⏸ HOLD | Deliberately not started |

- **Stage A** = Phases 0–6. **Stage B** = Phase 7 + section 3.
- Paths in this document are current (`apps/...`). Historical plan text and older docs may say `client/`/`server/`; read them as `apps/customer-web/`/`apps/server/`.
- A move or task may not start before its **gate** is true. Gates are listed where they apply.

**Verification baseline (2026-10-21):** `pnpm install --frozen-lockfile`, `pnpm type-check` (5 tasks), `pnpm test` (4 tasks, 76 tests), `pnpm arch` (0 violations, 1,634 modules) and `pnpm build` are green.

---

## 1. Current state

| Area | State |
| :--- | :--- |
| Workspace | pnpm + Turborepo; globs `apps/*`, `packages/*`; 6 projects |
| `apps/customer-web` | FSD × Clean skeleton; 3D landing ported (renderer `shared/ui/three`, composition `pages/home`); app bootstrap (`main.tsx`, routes, providers) still TODO |
| `apps/server` | Kernel complete (8 tests); order use cases, controller, repository and composition are TODO stubs |
| `packages/domain` | Money, order totals, order-status transitions, cart rules, phone validation, BMI/TDEE/nutrition — 46 tests |
| `packages/contracts` | Error codes, order-status schema, submit-order and subscription/enrollment schemas — 22 tests |
| `packages/db-types` | Generated row types |
| `supabase/` | Config + seed present; `migrations/` empty; function entry stubs exist, none wired |
| Stage B | **Move 1 landed**: `apps/customer-web` + `apps/server`. Moves 2–10 open (§3) |

**Hygiene invariants (keep these true):** 0 duplicate definitions, 0 live `legacy-*` imports, 0 unmarked empty directories, 0 byte-identical asset groups.

**Package names** remain `@saucia/client` and `@saucia/server` until the admin split; folder names are `apps/customer-web` and `apps/server`.

---

## 2. Rules that do not move

### 2.1 FSD layers (client)

Imports go **downward only**; slices in the same layer never import each other:

```
app -> pages -> widgets -> features -> entities -> shared
```

- Slices are imported only through their `index.ts`.
- Widgets may import features (e.g. `cart-summary` uses `update-cart-quantity`).
- Cross-entity references (order → meal) go through the `@x` public-API convention, or the logic moves up a layer.
- The rules above are the contract. Enforcement is incomplete: `apps/customer-web/eslint.config.js` covers React rules only; FSD boundary lint and Steiger are **P1.1**.

### 2.2 Clean rings (both apps)

```
domain <- ports + application <- infrastructure (implements ports)
                              <- model <- ui (use cases via DI, never infrastructure)
```

- `domain` imports only `@saucia/domain`.
- `ports`/`application` may import `domain`, `ports`, `@saucia/*`; never `infrastructure`, `model`, `ui`.
- `infrastructure` may import `ports`, `domain`, `@saucia/*`, `@saucia/db-types`.
- `model`/`ui` never import `infrastructure`.
- Only `apps/customer-web/src/app/di` and `apps/server/src/composition` may import infrastructure.

Enforced by `.dependency-cruiser.cjs` (run `pnpm arch`): `client-inner-rings-no-infra`, `client-infra-only-from-di`, `client-domain-pure`, `server-domain-pure`, `server-application-no-outer`, `server-delivery-no-infra`, `server-no-cross-module-internals`, `server-kernel-imports-nothing`, `packages-are-leaves`, `server-never-imports-client`, `client-never-imports-server`, `packages-kernel-*`.

### 2.3 Server kernel (`apps/server/src/kernel`)

The dependency sink: `Result`, `DomainError`, and the ports `Clock` / `IdGenerator` / `Logger`.

- Every server layer may import it; it imports nothing from modules, composition, platform or delivery-shared.
- `Result` is the error channel: use cases return `Result<T, DomainError>`; delivery maps `code` to a transport response.
- `DomainError` carries `code`, a **fixed client-safe `message`** (`'Domain error'`), an `internalMessage` for logs, and optional `details`. No HTTP status, headers or response body. Never forward `internalMessage`.
- The client has **no `Result`**; it owns `AppError` only. `apps/server/src/kernel` is the single owner until `packages/kernel` has a second consumer.
- Entities/aggregates (`Order`, `Meal`, `Cart`) never live in the kernel; they belong to the app-local domain that owns their lifecycle.

### 2.4 Workspace boundaries

- `packages/*` are leaves: they never import `apps/` or `supabase/`.
- The two apps never import each other.
- `packages/kernel`, when it exists, may not import apps, `packages/domain`, `contracts` or `db-types`.
- Internal packages are **just-in-time**: `exports` point at TS source; no build step.

### 2.5 Ownership — "where does X go?"

| Concept | Home today |
| :--- | :--- |
| Money, order totals, cart rules, BMI/TDEE, phone validation, order-status transitions | `packages/domain` |
| Request/response schemas, error codes, status enums (derived from domain, never redefined) | `packages/contracts` |
| DB row types | `packages/db-types` (generated) |
| Ports, repositories, DTOs, mappers | Per app: `apps/customer-web/src/entities/*`, `apps/server/src/modules/*` |
| Server aggregates with invariants (`Order`) | `apps/server/src/modules/*/domain` |
| Client-only models (localStorage cart) | `apps/customer-web/src/entities/*/domain` |
| Theme tokens, Chakra theme, primitives | `apps/customer-web/src/shared/{theme,ui}` → `packages/ui` after the admin split |
| Translations (`dict.json`) | `apps/customer-web/src/shared/i18n` → `packages/i18n` after the admin split |
| Edge client, `errorNormalizer`, auth wrapper | `apps/customer-web/src/shared/api` → `packages/api-client` after the admin split |
| `Result`, `DomainError`, kernel ports | `apps/server/src/kernel` → `packages/kernel` on a second consumer |
| In-memory ports, contract-test harness | `apps/server/tests` → `packages/testing` after P2.6 |
| Chat transport | `apps/customer-web/src/entities/message/infrastructure` → `packages/realtime` after adapter + second consumer |
| Generic three.js renderer | `apps/customer-web/src/shared/ui/three` |
| Landing page composition (camera, scroll, segment config) | `apps/customer-web/src/pages/home` |

**Error messages** are client-only: the server returns codes; the client maps codes to `dict.json` keys.

### 2.6 Rejected / do not reopen

- HTTP status or response body on `DomainError`.
- Entities or business rules in the kernel or a shared package.
- Order-status rules duplicated in contracts; contracts derives from `@saucia/domain`.
- Shared repository adapters: client uses anon + RLS, server uses the service role; they legitimately differ.
- `packages/config`: client env (`import.meta.env`, `VITE_*`) and server env (`Deno.env`/`process.env`) are different models and stay app-local.
- Pre-creating `packages/mobile-*` before `apps/mobile` exists.
- `processing` / `shipped` order statuses (the canonical set is `pending`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`).
- Extracting a package on its first consumer or “while we’re in here”.

---

## 3. Stage B — target structure

**Status:** 🟡 IN PROGRESS. Move 1 landed; moves 2–10 open. Stage B remains a product decision, not a set of observed triggers.

**Target:** `apps/{customer-web,admin-dashboard,server}` (+ optional `mobile`); `packages/{domain,contracts,db-types,ui,i18n,api-client,kernel,testing}` (+ optional `realtime`, `mobile-*`). No app imports another app; every cross-app dependency goes through `@saucia/*`.

**Gates and order.**

```
rename -> apps/*        ✅ done; no prerequisite; rewrote every import path
admin split             ← after the rename; one-way door
packages/ui             ← after the admin split (two apps share a theme)
packages/i18n           ← same gate as ui
packages/api-client     ← after the admin split (both apps share the edge client)
packages/kernel         ← gate: a second app imports Result/DomainError/ports
packages/testing        ← gate: Phase 2 in-memory ports exist (P2.6)
packages/realtime       ← gate: settled adapter AND a second consumer
apps/mobile             ← gate: product greenlight; optional
packages/mobile-*       ← only after apps/mobile exists
shared adapters         ← never (see §2.6)
```

**The moves.**

| # | Move | Gate / rationale |
| :-- | :--- | :--- |
| 1 | `client/` → `apps/customer-web`, `server/` → `apps/server` | ✅ done 2026-10-21 (one-way door) |
| 2 | Split `apps/admin-dashboard` from customer-web | after move 1; one-way door. Admin has different auth (MFA/IP allowlist), cadence and owner. Move `pages/admin`, `features/admin-*`, `widgets/admin-*` and admin-only shared bits |
| 3 | `packages/ui` | after the split; two apps share theme/tokens/primitives |
| 4 | `packages/i18n` | same gate; two apps share `dict.json` |
| 5 | `packages/api-client` | after the split; same edge client + `errorNormalizer` + auth wrapper |
| 6 | `packages/kernel` | gate: a **second app** imports `Result`/`DomainError`/ports. Today only the server does |
| 7 | `packages/testing` | gate: P2.6 in-memory ports exist |
| 8 | `packages/realtime` | gate: settled chat adapter **and** a second consumer |
| 9 | `apps/mobile` | ⏸ hold until greenlit |
| 10 | `packages/mobile-{ui,native}` | ⏸ hold; only after move 9 |
| — | Shared repository adapters | never (§2.6) |

**One-way doors:** moves 1 (done) and 2. Land each as one commit with `pnpm install --frozen-lockfile && pnpm build && pnpm type-check && pnpm arch` green.

**Deployment.** Vercel sync is not a constraint. The project root must be switched from `client` to `apps/customer-web` in the dashboard (and “include files outside Root Directory” kept on so `@saucia/*` resolves); previews may lag. CI artifact path is `apps/customer-web/dist`. `supabase functions deploy` and the edge-bundle path are unaffected.

**Exit criterion.** `apps/` contains `customer-web`, `admin-dashboard`, `server` (+ `mobile` if greenlit); `packages/` contains `domain`, `contracts`, `db-types`, `ui`, `i18n`, `api-client`, and `kernel`/`testing` once their gates fire, plus optional `realtime`/`mobile-*`; no app imports another app; every cross-app dependency goes through `@saucia/*`; `pnpm arch` green.

---

## 4. Open work

### Phase 0 — hygiene

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P0.7 | Verify `.env` files are ignored and never committed; rotate if needed | 🔍 VERIFY | Not provable from the tree. `.env` files exist locally; check git history and rotate if ever committed |
| P0.8 | Run the Deno interop spike (§5) | ⬜ OPEN | `apps/server/runtimes/supabase-edge/` and `supabase/functions/_shared/` hold only `.gitkeep`; no bundler config, no deployed proof |

### Phase 1 — boundary enforcement

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P1.1 | Root ESLint boundary config + Steiger enforcement; `ci.yml` | 🟡 PARTIAL | `apps/customer-web/eslint.config.js`, `steiger.config.cjs` and `.github/workflows/CI.yaml` exist; no root `eslint.config.js`; `pnpm arch` runs dependency-cruiser only, not Steiger |

### Phase 2 — order submission (the money path)

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P2.1 | Validate `submitOrder.schema` on the server; map error codes to i18n keys on the client | 🟡 PARTIAL | Schemas and `ErrorCode` exist; no server validation, no client code→i18n mapping |
| P2.2 | `SubmitOrder` recomputes totals from `MealPriceReader`; never trusts client totals | 🟡 PARTIAL | Domain functions done; `SubmitOrder.ts` is a TODO and `apps/server/src/modules/menu` has no `MealPriceReader` implementation |
| P2.3 | DB trigger/constraint for totals invariants; RLS migrations | ⬜ OPEN | `supabase/migrations/` is empty |
| P2.4 | `order-processing` function via the bundle; port `process-order`, `manage-order`, `list-orders`, `track-last-order` | 🟡 PARTIAL | Stub entry only; gated on P0.8; legacy functions remain in `_legacy/edge-functions/` |
| P2.5 | `features/submit-order` + `entities/order` call the edge function via `edgeClient`/`errorNormalizer` | 🟡 PARTIAL | API modules and the client repo exist; `apps/customer-web/src/features/submit-order` is `index.ts` only; no `entities/order/model` |
| P2.6 | Domain tests, server use-case tests with in-memory ports, one contract test | 🟡 PARTIAL | 46 domain + 22 contract tests pass; no use-case tests with in-memory ports |

**Exit:** checkout works end to end against local Supabase; client totals are display-only.

### Phase 3 — menu and admin

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P3.1 | `modules/menu`; `MealPriceReader` backed by it | ⬜ OPEN | `apps/server/src/modules/menu/` holds only `.gitkeep`; seed data is in `supabase/seed/` |
| P3.2 | Admin features (`admin-create-meal`, `admin-update-order-status`) on server use cases | ⬜ OPEN | Placeholders only; no `admin-create-meal` folder |
| P3.3 | Keep admin lazy-loaded | ⬜ OPEN | Nothing to verify until the admin page exists |

### Phase 4 — subscriptions

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P4.1 | Port `subscription-orders` to `cron-jobs` (generation) + `subscription-mgmt` (enroll/pause/resume) | ⬜ OPEN | Function stubs exist; `apps/server/src/modules/subscription/` empty; legacy unported |
| P4.3 | `features/enroll-subscription`, `features/calculate-health-plan`, `widgets/subscription-dashboard` | ⬜ OPEN | Placeholders only |

### Phase 5 — support chat

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P5.1 | New `modules/support`; decide WebSocket function vs Supabase Realtime; client `entities/message`, `features/send-support-message` | ⬜ OPEN | No module, function or feature folder under `apps/` |
| P5.2 | Extract `packages/realtime` only on a second consumer | ⬜ OPEN | Gated by move 8 |

### Phase 6 — payments and notifications

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P6.1 | Name adapters by port (`PaymentGateway`, `Mailer`), not by vendor | ⬜ OPEN | `apps/server/src/platform/{stripe,email}` exist as empty folders; no port files |
| P6.2 | `payment-webhook` + `notifications` functions with their modules | 🟡 PARTIAL | `payment-webhook` stub only; no `notifications` function, no module logic |

### Phase 7 — Stage B

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P7.1 | Execute moves 2–10 under the gates in §3 | 🟡 PARTIAL | Move 1 done; admin split, `ui`, `i18n`, `api-client`, and gated `kernel`/`testing`/`realtime` remain |
| P7.2 | Hold `apps/mobile` / `packages/mobile-*` | ⏸ HOLD | By design |
| P7.3 | Vercel layout may lag | ⬜ OPEN | CI path updated; dashboard root still `client` → `apps/customer-web` |

**Exit register.**

| Gate | Criterion | State |
| :--- | :--- | :--- |
| Phase 0 | install/build/type-check pass; Vercel preview builds | 🟡 PARTIAL — local commands green; preview not re-run |
| Phase 1 | `pnpm arch` + `pnpm lint` green at `error`; zero new `legacy-*` imports | 🟡 PARTIAL — arch green (0 violations); legacy 0; lint/Steiger missing |
| Phase 2 | Checkout end-to-end against local Supabase | ⬜ NOT MET |
| Phases 3–6 | (No explicit exit line; per-task review) | ⬜ NOT STARTED |
| Stage B | §3 exit criterion | 🟡 IN PROGRESS — move 1 done |

> Legacy reference paths for each task remain in `_legacy/` and in git history (Revisions ≤ 5). They are intentionally not repeated here.

---

## 5. Edge functions and the Deno spike

Supabase favors fewer, “fatter” functions: one thin entry per function, delegating to the server bundle’s router. Legacy functions are quarantined at `_legacy/edge-functions/`.

| Legacy | New home | State |
| :--- | :--- | :--- |
| `process-order` / `manage-order` | `order-processing` → `SubmitOrder` / `UpdateOrderStatus` | 🟡 stubs; use cases exist, not wired |
| `list-orders` / `track-last-order` | `order-processing` → new `ListOrders` / `GetLastOrder` | ⬜ no use cases (both need server logic) |
| `order-delivery` | `order-processing` → delivery route | ⬜ confirm behaviour |
| `subscription-orders` | `cron-jobs` + `subscription-mgmt` | 🟡 stubs, no logic |
| `support-chat` / `support-websocket` | `support` module (+ WS entry) | ⬜ evaluate Realtime + RLS |
| `trial` | delete | ⬜ scratch |
| `auth-handlers` | do not create yet | ℹ️ stub folder exists; login can be client + RLS/trigger |
| `payment-webhook` / `notifications` | with their modules | 🟡 webhook stub; no notifications |

**To port:** `apps/server/runtimes/supabase-edge` builds one ESM bundle (tsup/esbuild) with domain, contracts and server composition inlined into `supabase/functions/_shared/`; entries import it. Deno breaks on extensionless relative imports, `workspace:*` links, and some outside-root imports — hence the bundle. The bundle is generated (gitignored) and built in `deploy.yml` and locally.

**Spike exit (P0.8):** one function importing `Money` from `@saucia/domain` deploys and runs. Fallback: `deno.json` import maps with explicit `.ts` extensions.

**Secrets:** `supabase secrets set`; never commit `.env` (P0.7).

---

## 6. Workspace invariants

- **Globs:** `apps/*`, `packages/*`; pnpm workspace, Turborepo tasks defined in `turbo.json`.
- **JIT packages:** `exports` point at source; no build step.
- **Turbo env:** `build` declares `VITE_*`; undeclared vars are hidden from builds and can poison the cache.
- **Root scripts:** `dev` filters `@saucia/client`; `arch` runs dependency-cruiser over `apps/customer-web/src apps/server/src packages`; `db:types` is the only writer of `packages/db-types/src/database.ts`.
- **CI:** `pnpm install --frozen-lockfile`, then lint, type-check, arch, test, build; build artifact `apps/customer-web/dist`. Secret scan and dependency review are separate jobs.
- **Vercel:** root `apps/customer-web`, include files outside root, `pnpm install --frozen-lockfile`. A second project for `apps/admin-dashboard` follows move 2.

---

## 7. Migration map — open items only

| Legacy | v2 home | State |
| :--- | :--- | :--- |
| `CartContext.jsx` | `apps/customer-web/src/entities/cart/model` (+ existing `LocalStorageCartRepository`) | 🟡 repository exists; no `model/` |
| `useOrders` | `apps/customer-web/src/entities/order/model` | ⬜ absent |
| `orderAPI.jsx` | `apps/customer-web/src/entities/order/infrastructure` + `apps/customer-web/src/features/submit-order` | 🟡 repo exists; feature empty |
| `ElementsContext` | TanStack Query hooks in each entity’s `model/` | ⬜ none yet (`QueryProvider` exists) |
| `server/database/*` | `supabase/migrations` | 🟡 seed moved; migrations empty |

Already done: `AuthContext` split (provider + `entities/session/model`), edge functions quarantined, `legacy-*` files removed from live layers.

---

## 8. Decisions (active)

| # | Decision | Status |
| :-- | :--- | :--- |
| 1 | Payment provider not confirmed; may be a placeholder | open until Phase 6 |
| 2 | Admin ships as `apps/admin-dashboard` after Phases 0–6; MFA/IP rules are part of the rationale | planned |
| 3 | `order-delivery` / `track-last-order` need server logic | decided |
| 4 | Chat transport behind an adapter for swappability | decided |
| 6 | Order-status values/transitions live in `@saucia/domain`; contracts derives the schema; server file re-exports | implemented |
| 7 | Subscription nutrition uses the ADR activity/goal vocabulary and v1 macro ratios | implemented in domain/contracts |
| 8 | Kernel stays server-local for Stage A; `DomainError` is HTTP-free and generic; `packages/kernel` deferred to a second consumer | implemented |
| 9 | Client has no `Result`; `apps/server/src/kernel/Result.ts` is the single owner | implemented |
| 10 | Session state in `entities/session/model`; `app/providers/SessionProvider` only mounts it | implemented |
| 11 | 3D landing: generic renderer in `shared/ui/three`, composition in `pages/home` | implemented |
| 12 | `DomainError.message` is fixed and client-safe; detail travels in `internalMessage` and is never forwarded | implemented; delivery mapping lands with P2 |
| 13 | Stage B move 1 landed; moves 2–10 follow §3 gates | in progress |

**Rejected:** HTTP status on `DomainError`; entities/rules in kernel; shared repository adapters; `packages/config`; hero Lottie `hero-*.json` and duplicate asset variants (deleted); `processing`/`shipped` statuses.

---

## 9. Open questions (answers)

1. **Payment provider:** Stripe is not confirmed; may be a placeholder. → Phase 6.
2. **Admin:** separate app after Phases 0–6 + rename; MFA/IP allowlist part of the rationale. → Phase 7 / move 2.
3. **Order delivery / track-last-order:** need server logic (not client RLS queries). → P2.4.
4. **Chat transport:** adapter for swappability; choose the implementation behind it. → Phase 5.

---

*Revisions 1–5 (2026-10-08 → 2026-10-21): workspace wiring; domain/contracts; server kernel; Phase 1 cleanup; Stage B gates; move 1. Detailed history is in git.*
