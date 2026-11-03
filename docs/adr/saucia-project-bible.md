# Saucia v2 — Project Bible

> **Revision:** 6 · **Snapshot:** 2026-11-03 · **Purpose:** Phase 1 closeout.
>


**Where things are:** canonical target structure is `apps/customer-web/` (React), `apps/server/` (Clean core + edge bundle source); `packages/{domain,contracts,db-types}` remain the shared leaves; `supabase/` holds migrations, seed and edge entries. The current repo tree still contains legacy root-level `client/` and `server/` folders, so this repository is in a mixed-state migration. Treat `apps/*` as the planning source of truth, but do not assume the legacy roots are deleted yet.

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
- Paths are current (`apps/...`). Older docs may still say `client/` or `server/`; read them as `apps/customer-web/` or `apps/server/` when the target structure is intended.
- The repository is mixed-state: both the target `apps/*` layout and legacy `client/` / `server/` roots are present in `main` today.
- A task may not start before its **gate** is true.
- **V1 is deployed by another owner.** Nothing in v2 may change the v1 deployment, `_legacy/`, or the remote Supabase project until the rollout is agreed.

**Current code evidence (2026-11-01):** the repo contains both `apps/customer-web/` + `apps/server/` and still contains legacy `client/` + `server/` directories. The migrated target structure is present, but the rename is not yet cleanly complete.

---

## 1. Current state

| Area | State |
| :--- | :--- |
| Workspace | pnpm + Turborepo; target layout under `apps/*`; legacy root `client/` and `server/` folders still present in the tree |
| `apps/customer-web` | FSD × Clean skeleton exists; landing page and app bootstrap are present; legacy root client still remains as a compatibility layer |
| `apps/server` | Server core and edge runtime scaffolding exist; `@saucia/domain`, `contracts` and `db-types` are wired; target server layout is visible but not all phase work is complete |
| `packages/domain` | Pure business rules and validation logic exist; order/cart/health rules are present |
| `packages/contracts` | Shared request/response and status schemas exist |
| `packages/db-types` | Generated DB row types and tooling exist |
| `supabase/` | Config, migrations and edge function entry points exist; migrations are not yet complete for the remaining phases |
| Local tooling | Docker Desktop (WSL 2), Supabase CLI and edge tooling are expected; local image pull reliability remains a deployment blocker |
| Stage B | **Migration is in progress**. Target paths exist, but legacy roots are still present in the current tree; do not mark move 1 as cleanly complete |

**Hygiene invariants (keep these true):** 0 duplicate definitions, 0 live `legacy-*` imports, 0 unmarked empty directories, 0 byte-identical asset groups.

**Package names** remain `@saucia/client` and `@saucia/server` until the admin split.

---

## 2. Rules that do not move

### 2.1 FSD layers (client)

Imports go **downward only**; slices in the same layer never import each other:

```
app -> pages -> widgets -> features -> entities -> shared
```

- Slices are imported only through their `index.ts`.
- Widgets may import features. Cross-entity references go through the `@x` convention, or the logic moves up a layer.
- Enforcement is incomplete: FSD boundary lint and Steiger are **P1.1**.

### 2.2 Clean rings (both apps)

```
domain <- ports + application <- infrastructure (implements ports)
                              <- model <- ui (use cases via DI, never infrastructure)
```

- **Server `domain`** imports `@saucia/domain` and the server kernel (`Result`, `DomainError`). Nothing else. The kernel imports nothing from modules.
- Client `domain` imports only `@saucia/domain`.
- `ports`/`application` may import `domain`, `ports`, `@saucia/*`, and the kernel; never `infrastructure`, `model`, `ui`.
- `infrastructure` may import `ports`, `domain`, `@saucia/*`, `@saucia/db-types`.
- `model`/`ui` never import `infrastructure`.
- Only `apps/customer-web/src/app/di` and `apps/server/src/composition` may import infrastructure.
- **Each server module exposes a single `index.ts`.** Other modules, the edge bundle and composition import only through it (decision 14). Infrastructure adapters are exported through `index.ts` and restricted to `composition/` by the `modules-public-api-only` rule.
- A new module must expose its `index.ts` before any other file imports it (decision 14 applies).

Enforced by `.dependency-cruiser.cjs` (run `pnpm arch`): `client-inner-rings-no-infra`, `client-infra-only-from-di`, `client-domain-pure`, `server-domain-pure` (allows `@saucia/domain` and the kernel; **P1.3 pending**), `server-application-no-outer`, `server-delivery-no-infra`, `server-no-cross-module-internals`, `server-kernel-imports-nothing`, `modules-public-api-only` (**planned, P1.2**), `packages-are-leaves`, `server-never-imports-client`, `client-never-imports-server`, `packages-kernel-*`.

`packages/domain` gains `pricing/`, `payment/` (Phase 6) and `subscription/consumptionRules.ts`. These stay free of I/O.

### 2.3 Server kernel (`apps/server/src/kernel`)

The dependency sink: `Result`, `DomainError`, and the ports `Clock` / `IdGenerator` / `Logger`.

- Every server layer may import it, including the domain. It imports nothing from modules, composition, platform or delivery-shared.
- `Result` is the error channel: use cases and domain methods return `Result<T, DomainError<Code>>`; delivery maps `code` to a transport response.
- `DomainError` carries `code`, a **fixed client-safe `message`** (`'Domain error'`), an `internalMessage` for logs, and optional `details`. No HTTP status, headers or response body. Never forward `internalMessage`.
- The client has **no `Result`**; it owns `AppError` only.
- Entities and aggregates (`Order`, `Meal`, `Cart`, `Subscription`) never live in the kernel.

### 2.4 Supabase access (path rules)

**Client**: anon key + RLS, read-only.
**Server**: service role, only via platform/supabase and module infrastructure/supabase.
**Writes of orders, money or status**: edge functions only.
**Schema, RLS and invariant triggers**: `supabase/migrations` only. `packages/contracts` never imports `packages/db-types`.

### 2.5 Workspace boundaries

- `packages/*` are leaves: they never import `apps/` or `supabase/`.
- The two apps never import each other.
- `packages/kernel`, when it exists, may not import apps, `packages/domain`, `contracts` or `db-types`.
- Internal packages are **just-in-time**: `exports` point at TS source; no build step.

### 2.6 Ownership: "where does X go?"

| Concept | Home today |
| :--- | :--- |
| Money, order totals, cart rules, BMI/TDEE, phone validation, order-status transitions | `packages/domain` |
| Discount and free-additive rules | `packages/domain/pricing` (P3.4) |
| Payment status rules | `packages/domain/payment` (P6.2) |
| Subscription consumption rules | `packages/domain/subscription/consumptionRules.ts` (P4.1) |
| Request/response schemas, error codes, status enums (derived from domain, never redefined) | `packages/contracts` |
| DB row types | `packages/db-types` (generated) |
| Ports, repositories, DTOs, mappers | Per app: `apps/customer-web/src/entities/*`, `apps/server/src/modules/*` |
| Server aggregates with invariants (`Order`, `Subscription`, `Meal`) | `apps/server/src/modules/*/domain` |
| Client-only models (localStorage cart) | `apps/customer-web/src/entities/*/domain` |
| Theme tokens, Chakra theme, primitives | `apps/customer-web/src/shared/{theme,ui}` → `packages/ui` after the admin split |
| Translations (`dict.json`) | `apps/customer-web/src/shared/i18n` → `packages/i18n` after the admin split |
| Edge client, `errorNormalizer`, auth wrapper | `apps/customer-web/src/shared/api` → `packages/api-client` after the admin split |
| `Result`, `DomainError`, kernel ports | `apps/server/src/kernel` → `packages/kernel` on a second consumer |
| In-memory ports, contract-test harness | `apps/server/tests` → `packages/testing` after P2.6 |
| Chat transport | `apps/customer-web/src/entities/message/infrastructure` → `packages/realtime` after adapter and second consumer |
| Generic three.js renderer | `apps/customer-web/src/shared/ui/three` |
| Landing page composition | `apps/customer-web/src/pages/home` |
| Supabase client factories | anon: `apps/customer-web/src/shared/api` → `packages/api-client`; service role: `apps/server/src/platform/supabase` |
| RLS policies, constraints, triggers | `supabase/migrations` |

**Error messages** are client-only: the server returns codes; the client maps codes to `dict.json` keys.

### 2.7 Rejected / do not reopen

- HTTP status or response body on `DomainError`.
- Entities or business rules in the kernel or a shared package.
- Order-status rules duplicated in contracts; contracts derives from `@saucia/domain`.
- Shared repository adapters: client uses anon + RLS, server uses the service role.
- `packages/config`: client and server env models differ and stay app-local.
- Pre-creating `packages/mobile-*` before `apps/mobile` exists.
- `processing` / `shipped` order statuses. The canonical set is `pending`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`. Legacy values are mapped in a documented step (P2.8).
- Extracting a package on its first consumer or "while we're in here".
- Client-side room checks as a security boundary for support chat (decision 18).
- Client-side writes to order, payment or status tables.
- Service-role key in any client-reachable ring.

---

## 3. Stage B: target structure

**Status:** 🟡 IN PROGRESS. The target `apps/*` structure is reflected in the tree, but the repository still contains root-level `client/` and `server/` folders. The migration is therefore not complete until the legacy roots are removed or deliberately retained as compatibility wrappers.

**Target:** `apps/{customer-web,admin-dashboard,server}` (+ optional `mobile`); `packages/{domain,contracts,db-types,ui,i18n,api-client,kernel,testing}` (+ optional `realtime`, `mobile-*`). No app imports another app.

**Gates and order.**

```
rename -> apps/*        🟡 mixed state: target paths exist; legacy root paths still present
admin split             ← after the rename; one-way door
packages/ui             ← after the admin split
packages/i18n           ← same gate as ui
packages/api-client     ← after the admin split
packages/kernel         ← gate: a second app imports Result/DomainError/ports
packages/testing        ← gate: P2.6 in-memory ports exist
packages/realtime       ← gate: settled adapter AND a second consumer
apps/mobile             ← gate: product greenlight; optional
packages/mobile-*       ← only after apps/mobile exists
shared adapters         ← never (see §2.6)
```

**The moves.**

| # | Move | Gate / rationale |
| :-- | :--- | :--- |
| 1 | `client/` → `apps/customer-web`, `server/` → `apps/server` | 🟡 partial: target paths exist, legacy roots still present |
| 2 | Split `apps/admin-dashboard` from customer-web | after move 1; one-way door |
| 3 | `packages/ui` | after move 2 |
| 4 | `packages/i18n` | same gate as move 3 |
| 5 | `packages/api-client` | after move 2 |
| 6 | `packages/kernel` | gate: a second app imports `Result`/`DomainError`/ports |
| 7 | `packages/testing` | gate: P2.6 in-memory ports exist |
| 8 | `packages/realtime` | gate: settled chat adapter and a second consumer |
| 9 | `apps/mobile` | ⏸ hold until greenlit |
| 10 | `packages/mobile-{ui,native}` | ⏸ hold; after move 9 |
| — | Shared repository adapters | never (§2.6) |

**One-way doors:** moves 1 and 2 remain gated by the repository state. Do not call move 1 complete while the legacy roots remain in `main`.

**Deployment.** The Vercel root must switch from `client` to `apps/customer-web` once the rename is final. Edge deploy is unaffected by Vercel.

**Exit criterion.** `apps/` contains `customer-web`, `admin-dashboard`, `server` (+ `mobile` if greenlit); `packages/` contains the listed shared packages once their gates fire; no app imports another app; `pnpm arch` green.

---

### Suggested structure

Flags: **[NEW]** create, **[EDIT]** change an existing file, **[RENAME]** move or rename, **[HOLD]** do not create until its gate opens. Unflagged items already exist and need no change. The phase in parentheses is the bible task that owns the item.

#### 1. Server: `apps/server/src`

```
src/
├── kernel/                                   (unchanged; imports nothing from modules)
├── composition/
│   ├── container.ts                          [EDIT] wires SubmitOrder, MenuPriceReader, SubscriptionRepository (P2.2, P3.1, P4.1)
│   ├── routes.ts                             [EDIT] mounts order, menu, subscription routes
│   └── env.ts
├── delivery-shared/http/                     (unchanged)
├── platform/
│   ├── supabase/                             (unchanged)
│   ├── email/                                [EDIT] holds the Mailer adapter (P6.1)
│   ├── payment/                              [RENAME] from platform/stripe/. Named by port, never by vendor (decision 20) (P6.1)
│   │   └── PaymentGateway.ts                 [NEW] implements the PaymentGateway port; Stripe SDK code stays inside this file (P6.1, HOLD until provider confirmed)
│   └── notification/                         [HOLD] Mailer port lives in the notification module (P6.3)
└── modules/
    ├── order/                                (Phase 2)
    │   ├── index.ts                          [NEW] public surface (decision 14)
    │   ├── domain/
    │   │   ├── Order.ts                      (done)
    │   │   ├── OrderStatus.ts                [EDIT] re-export only from @saucia/domain (decision 6)
    │   │   └── errors/                       [RENAME] remove .gitkeep only if the folder is empty after use; errors use kernel DomainError
    │   ├── application/
    │   │   ├── ports/
    │   │   │   ├── MealPriceReader.ts        (exists)
    │   │   │   ├── OrderRepository.ts        (exists)
    │   │   │   └── UnitOfWork.ts             (exists) extended for P4.2
    │   │   └── use-cases/
    │   │       ├── SubmitOrder.ts            [EDIT] P2.2
    │   │       └── UpdateOrderStatus.ts      [EDIT] calls RecordDelivery on delivered (P4.2)
    │   ├── infrastructure/supabase/
    │   │   ├── SupabaseOrderRepository.ts    [EDIT]
    │   │   ├── dto/OrderRow.ts               [NEW]
    │   │   └── mappers/OrderMapper.ts        [NEW]
    │   ├── delivery/http/
    │   │   ├── orderController.ts            [EDIT]
    │   │   └── routes.ts                     [EDIT]
    │   └── tests/                            [NEW] in-memory use-case tests (P2.6)
    ├── menu/                                 [NEW module] (Phase 3)
    │   ├── index.ts                          [NEW] exports MenuPriceReader adapter only; the port stays in order
    │   ├── domain/
    │   │   ├── Meal.ts                       [NEW]
    │   │   └── Item.ts                       [NEW]
    │   ├── application/
    │   │   ├── ports/
    │   │   │   └── MealRepository.ts         [NEW] needed by admin and rating use cases
    │   │   └── use-cases/
    │   │       ├── PublishReview.ts          [NEW] rating aggregation, P3.5
    │   │       └── ListMeals.ts              [NEW] catalog read, P3.6
    │   ├── infrastructure/supabase/
    │   │   ├── MenuPriceReader.ts            [NEW] implements order's MealPriceReader
    │   │   ├── SupabaseMealRepository.ts     [NEW]
    │   │   ├── dto/MealRow.ts                [NEW]
    │   │   └── mappers/MealMapper.ts         [NEW]
    │   └── delivery/http/
    │       ├── menuController.ts             [NEW]
    │       └── routes.ts                     [NEW]
    ├── subscription/                         [NEW module] (Phase 4)
    │   ├── index.ts                          [NEW]
    │   ├── domain/
    │   │   └── Subscription.ts               [NEW] uses packages/domain/subscription/consumptionRules
    │   ├── application/
    │   │   ├── ports/
    │   │   │   └── SubscriptionRepository.ts [NEW]
    │   │   └── use-cases/
    │   │       ├── RecordDelivery.ts         [NEW] P4.2
    │   │       └── EnrollSubscription.ts     [NEW]
    │   ├── infrastructure/supabase/
    │   │   └── SupabaseSubscriptionRepository.ts [NEW]
    │   └── delivery/http/                    [NEW] routes for enroll and dashboard
    ├── identity/                             (.gitkeep only)
    │   └── index.ts                          [HOLD] login stays client + RLS (decision in §5)
    ├── payment/                              [NEW module] (Phase 6)
    │   ├── index.ts                          [NEW] HOLD until provider confirmed
    │   ├── domain/PaymentStatus.ts           [NEW] re-export from packages/domain/payment (P6.2)
    │   └── application/ports/PaymentGateway.ts [NEW]
    ├── notification/                         (.gitkeep only)
    │   ├── index.ts                          [HOLD] Phase 6
    │   └── application/ports/Mailer.ts       [NEW] HOLD
    └── support/                              [NEW module] (Phase 5)
        ├── index.ts                          [NEW]
        ├── domain/SupportMessage.ts          [NEW]
        ├── application/
        │   ├── ports/
        │   │   ├── SupportMessageRepository.ts [NEW]
        │   │   └── RealtimeChannel.ts          [NEW] adapter port, decision 4 (P5.2)
        │   └── use-cases/SendSupportMessage.ts [NEW]
        ├── infrastructure/supabase/
        │   └── SupabaseSupportRepository.ts    [NEW]
        └── delivery/http/                      [NEW]
```

---

## 4. Open work

### Phase 0: hygiene

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P0.7 | Verify `.env` files are ignored and never committed; rotate if needed | ✅ DONE | None |
| P0.8 | Deno interop spike: bundle inlines `@saucia/domain`; `order-processing` returns 200 locally | 🟡 PARTIAL | Bundle and entry files are present; final local verification remains blocked on stable Supabase image pull |

## Phase 1: boundary enforcement

**Status:** 🟡 PARTIAL. The gate is enforced and proven. Three rule sets are present but not all are proven, and a few small items remain.

**Context.** Architecture rules are enforced by tools and by the platform, not by review discipline. One tool owns each kind of rule: dependency-cruiser owns the import graph and module edges, Steiger owns FSD layers, slices and public APIs, and ESLint owns per-file quality. `eslint-plugin-boundaries` was removed because it duplicated dependency-cruiser. The local gate is `pnpm arch`, the CI gate is the `architecture` job, and branch protection on `main` requires it. On 2026-11-03 the repository had no branch protection; it was configured with the four required checks (`architecture`, `verify`, `secret-scan`, `dependency-review`), strict up-to-date checks, and admin enforcement.

**Proof of the gate.** A throwaway PR (#1) added `apps/server/src/kernel/tmp/bad.ts` importing a module's domain. The `architecture` job failed with `server-kernel-imports-nothing` and `module-order-public-api-only`, `verify` was skipped, and the merge state was BLOCKED. The PR was closed and the branch deleted; the run remains as evidence.

### Phase 1: boundary enforcement

| ID | Task | Status | Evidence / open item |
| :-- | :--- | :--- | :--- |
| P1.1 | Root ESLint, Steiger, CI gate | 🟡 PARTIAL | `pnpm arch` runs both tools; `pnpm lint` passes; one workflow; branch protection requires four checks. Open: `verify` is red on `main` (P1.4 to P1.6), so the gate cannot pass a merge yet |
| P1.2 | `modules-public-api-only` | 🟡 PARTIAL | Rule present; fired in negative test. Open: confirm `modules/order/index.ts` exports the public surface (currently 12 bytes) |
| P1.3 | `server-domain-pure` allow-list | 🟡 PARTIAL | Rules present; negative test fired for the kernel and module rules. Open: negative case for `@supabase/supabase-js` in a domain file |
| P1.4 | `db-types` placeholder restored | ⬜ OPEN (deferred) | `database.ts` was committed empty (`c8bd2409`); valid placeholder at `a1df8576`. Deferred until Supabase setup |
| P1.5 | Real database types generated | ⬜ OPEN (deferred) | Needs Docker, `supabase start`, a unique migration version for `20261028124044`, then `pnpm db:types` |
| P1.6 | `apps/server` type-check green | ⬜ OPEN | Never passed on `main`. Done: `@supabase/supabase-js` added, `IDs` casing fixed (WIP). Open: `never` row types (P1.5), `moneyFromNumeric`, `applyRating` arity, allergen narrowing |

**Note:**
- The Vercel deployment is failing. It is not a required check and is outside Phase 1; it is tracked under P7.3.

**Phase 1 exit criteria.**
| Phase 1 | 
`pnpm arch` and `pnpm lint` green at error; zero new `legacy-*` imports; negative tests observed for each rule family |🟡 PARTIAL. legacy-* check not yet run (git grep -n "legacy-" -- apps packages). |


### Phase 2: order money path:

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P2.1 | Validate `submitOrder.schema` on the server; map codes to i18n keys on the client | 🟡 PARTIAL | Schemas and `ErrorCode` exist; server validation and client mapping remain incomplete |
| P2.2 | `SubmitOrder` recomputes totals via `MealPriceReader`; never trusts client totals | 🟡 PARTIAL | `Order` aggregate exists; `SubmitOrder.ts` and menu price reader remain pending |
| P2.3 | `orders`, `order_meals`, `order_items` migrations with CHECK and total CHECK; `order_number` sequence | ⬜ OPEN | `supabase/migrations/` not complete |
| P2.4 | `order-processing` function via bundle; port `process-order`, `manage-order`, `list-orders`, `track-last-order` | 🟡 PARTIAL | Stub entry exists; depends on stable edge runtime |
| P2.5 | `features/submit-order` + `entities/order` call the edge function via `edgeClient`/`errorNormalizer` | 🟡 PARTIAL | API modules and repo scaffolding exist; feature remains thin |
| P2.6 | Domain tests ✅; use-case tests with in-memory ports | 🟡 PARTIAL | Use-case tests remain incomplete |
| P2.7 | `OrderLine` supports additive item lines (`order_items`) with `max_free_per_meal` rule | ⬜ OPEN | Needs pricing rules |
| P2.8 | Verify legacy order status and payment values against canonical lists; document mapping | ⬜ OPEN | Open questions 1 and 2 (§9) |

**Exit:** checkout works end to end against local Supabase; client totals are display-only.

### Phase 3: menu

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P3.1 | `modules/menu` with `Meal`, `Item`, `MenuPriceReader`; `meals`, `items`, `meal_items` migration | ⬜ OPEN | Need module and migration |
| P3.2 | Admin features (`admin-create-meal`, `admin-update-order-status`) on server use cases | ⬜ OPEN | Placeholders only |
| P3.3 | Keep admin lazy-loaded | ⬜ OPEN | Nothing to verify until admin exists |
| P3.4 | `packages/domain/pricing`: `discountRules.ts` (percentage discount, free-additive allowance) | ⬜ OPEN | Open question 4 |
| P3.5 | Rating aggregation as a use case on review publish | ⬜ OPEN | Needs `meal_reviews` migration |
| P3.6 | Allergy and dietary filters (`meal_allergies`, `item_allergies`) | ⬜ OPEN | Read model |

### Phase 4: subscriptions

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P4.1 | `user_subscriptions` and `plan_meals` migration; `packages/domain/subscription/consumptionRules.ts` | ⬜ OPEN | New |
| P4.2 | Delivery records consumption in the same `UnitOfWork` as the status change | ⬜ OPEN | Depends on P2.3, P4.1 |
| P4.3 | Delivery-date policy in `subscription` domain | ⬜ OPEN | Open question 3 |
| P4.4 | Client `enroll-subscription`, `calculate-health-plan`, `subscription-dashboard` | ⬜ OPEN | Placeholders |

### Phase 5: support chat

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P5.1 | `modules/support`; `user_messages` migration | ⬜ OPEN | No module |
| P5.2 | Realtime adapter behind a port; decide WebSocket or Realtime | ⬜ OPEN | Gated by P5.1 |
| P5.3 | Authorization by RLS: users see their `user_id` rows; admins by role | ⬜ OPEN | Security-critical |

### Phase 6: payments and notifications

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P6.1 | Name adapters by port: `PaymentGateway`, `Mailer` (decision 20) | ⬜ OPEN | Port files absent |
| P6.2 | `payment_status` rules in `packages/domain/payment` | ⬜ OPEN | Open question 2 |
| P6.3 | `payment-webhook` + `notifications` functions with their modules | 🟡 PARTIAL | Webhook stub only |

### Phase 7: Stage B

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P7.1 | Execute moves 2–10 under the gates in §3 | 🟡 PARTIAL | Mixed-state repo; final move not complete |
| P7.2 | Hold `apps/mobile` / `packages/mobile-*` | ⏸ HOLD | By design |
| P7.3 | Vercel root switch | ⬜ OPEN | Root still not fully cut over in the current tree |

### Phase 8: legacy data

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P8.1 | One-way copy from v1 to v2 schema, with owner approval | ⏸ HOLD | Gate: P2–P5 schemas complete. v1 owner coordination required |

**Exit register.**

| Gate | Criterion | State |
| :--- | :--- | :--- |
| Phase 0 | install/build/type-check pass; local Supabase spike passes | 🟡 PARTIAL: repo contains target structure and legacy roots together; end-to-end local proof not yet clean |
| Phase 1 | `pnpm arch` + `pnpm lint` green at `error`; zero new `legacy-*` imports | 🟡 PARTIAL: app-level config exists; root-level enforcement pending |
| Phase 2 | Checkout end to end against local Supabase | ⬜ NOT MET |
| Phases 3–6 | Per-task review | ⬜ NOT STARTED |
| Stage B | §3 exit criterion | 🟡 IN PROGRESS: mixed-state repo; final rename still outstanding |

> Legacy reference paths remain in `_legacy/` and in git history. The current `main` branch is mixed-state and should be treated as transitional rather than final.

---

## 5. Edge functions and the Deno spike

One thin entry per function, delegating to the server bundle.

| Legacy | New home | State |
| :--- | :--- | :--- |
| `process-order` / `manage-order` | `order-processing` → `SubmitOrder` / `UpdateOrderStatus` | 🟡 stubs; use cases not fully wired |
| `list-orders` / `track-last-order` | `order-processing` → `ListOrders` / `GetLastOrder` | ⬜ no use cases |
| `order-delivery` | `order-processing` → delivery route | ⬜ confirm behaviour |
| `subscription-orders` | `cron-jobs` + `subscription-mgmt` | 🟡 stubs, no logic |
| `support-chat` / `support-websocket` | `support` module (+ WS entry) | ⬜ evaluate Realtime + RLS |
| `trial` | delete | ⬜ scratch |
| `auth-handlers` | do not create yet | ℹ️ login can be client + RLS/trigger |
| `payment-webhook` / `notifications` | with their modules | 🟡 webhook stub |

**To port:** `apps/server/runtimes/supabase-edge` builds one ESM bundle (esbuild) into `supabase/functions/_shared/server-bundle.mjs`. The bundle is generated and gitignored. Entries import it with an explicit extension.

**Spike exit (P0.8):** `order-processing` returns 200 locally with a `Money` result; the bundle contains no `@saucia/*` specifiers; the function imports the bundle, not `@saucia/domain`.

**Build and deploy.** `deploy.yml` does not exist yet. It must run `build:edge` before `supabase functions deploy`. Required before P2.4 and before any remote rollout.

**Secrets:** `supabase secrets set`; never commit `.env` (P0.7 done).

**Local prerequisites:** Docker Desktop (WSL 2 engine) and Supabase CLI. The first `supabase start` downloads about 1 GB. On an unstable network, pull `supabase/postgres:17.6.1.054` separately.

---

## 6. Workspace invariants

- **Globs:** `apps/*`, `packages/*`; Turborepo tasks in `turbo.json`.
- **JIT packages:** `exports` point at source; no build step.
- **Turbo env:** `build` declares `VITE_*`.
- **Root scripts:** `arch` runs dependency-cruiser over `apps/customer-web/src apps/server/src packages`, then Steiger over `apps/customer-web/src`. `lint` runs with `--max-warnings=0`. `db:types` is the only writer of `packages/db-types/src/database.ts`.
- **CI:** one workflow, `.github/workflows/CI.yaml`. Jobs: `architecture` (runs `pnpm arch`), then `verify` (needs `architecture`), with `secret-scan` and `dependency-review` also required. Required checks match the job `name:` values.
- **Pinned architecture tooling:** `steiger@0.5.0` with `@feature-sliced/steiger-plugin@0.8.2`, tested together.
- **Vercel:** root `apps/customer-web`, include files outside root, `pnpm install --frozen-lockfile`.
- **Migrations:** created with `supabase migration new`; applied locally with `supabase db reset` only. No `db push` or `link` without owner approval.

---

## 7. Migration map: open items only

| Legacy | v2 home | State |
| :--- | :--- | :--- |
| `CartContext.jsx` | `apps/customer-web/src/entities/cart/model` (+ `LocalStorageCartRepository`) | 🟡 repository exists; no final model split |
| `useOrders` | `apps/customer-web/src/entities/order/model` | ⬜ absent |
| `orderAPI.jsx` | `entities/order/infrastructure` + `features/submit-order` | 🟡 repo exists; feature remains thin |
| `ElementsContext` | TanStack Query hooks in each entity's `model/` | ⬜ none yet |
| `server/database/*` | `supabase/migrations` | 🟡 seed moved; migrations empty |
| `orders`, `order_meals`, `order_items` | `supabase/migrations` (P2.3) | ⬜ schema pending |
| `meals`, `items`, `meal_items`, `meal_reviews`, allergies | `supabase/migrations` (P3.1, P3.5, P3.6) | ⬜ schema pending |
| `user_subscriptions`, `plan_meals` | `supabase/migrations` (P4.1) | ⬜ schema pending |
| `user_messages` | `supabase/migrations` (P5.1) + RLS (P5.3) | ⬜ schema pending |

Schema pending for `orders`, `meals`, `user_subscriptions` and `user_messages`: P2.3, P3.1, P4.1 and P5.1. Already done: `AuthContext` split, edge functions quarantined, `legacy-*` files removed from live layers.

---

## 8. Decisions (active)

| # | Decision | Status |
| :-- | :--- | :--- |
| 1 | Payment provider not confirmed; may be a placeholder | open until Phase 6 |
| 2 | Admin ships as `apps/admin-dashboard` after Phases 0–6; MFA/IP rules are part of the rationale | planned |
| 3 | `order-delivery` / `track-last-order` need server logic | decided |
| 4 | Chat transport behind an adapter for swappability | decided |
| 6 | Order-status values and transitions live in `@saucia/domain`; contracts derives the schema; server file re-exports | implemented |
| 7 | Subscription nutrition uses the ADR activity/goal vocabulary and v1 macro ratios | implemented in domain/contracts |
| 8 | Kernel stays server-local for Stage A; `DomainError` is HTTP-free and generic; `packages/kernel` deferred to a second consumer | implemented |
| 9 | Client has no `Result`; `apps/server/src/kernel/Result.ts` is the single owner | implemented |
| 10 | Session state in `entities/session/model`; `app/providers/SessionProvider` only mounts it | implemented |
| 11 | 3D landing: generic renderer in `shared/ui/three`, composition in `pages/home` | implemented |
| 12 | `DomainError.message` is fixed and client-safe; detail travels in `internalMessage` and is never forwarded | implemented; delivery mapping lands with P2 |
| 13 | Stage B move 1 is underway but the repo is mixed-state until the old roots are fully retired | in progress |
| 14 | Each server module exposes a single `index.ts`; other modules, the edge bundle and composition import only through it. Infrastructure adapters are exported through it and restricted to `composition/` | planned: rule P1.2 |
| 15 | Server domain returns kernel `Result<T, DomainError<Code>>`; shared-package `RangeError`s are converted at the domain boundary. The domain may import the kernel; the kernel imports nothing from modules. Totals are a snapshot computed at placement and validated on rehydration | implemented; rule P1.3 pending |
| 16 | Legacy triggers that encode business sequencing move into server use cases inside `UnitOfWork`: subscription consumption on delivery, delivery dates, rating aggregation. The database keeps only data integrity: CHECK constraints, total CHECK, foreign keys, `order_number` sequence | planned |
| 17 | v2 migrations keep legacy table and column names, so a later one-way copy from v1 needs no renaming | planned |
| 18 | Support chat authorization is enforced by RLS. Client-side room checks are not a security boundary | planned |
| 19 | Order lines include meal and additive item lines. Pricing rules shared by client and server (discounts, free-additive allowance) live in `packages/domain/pricing` | planned |
| 20 | Adapters are named by port (`platform/payment`, `platform/email`), never by vendor. Vendor-specific code lives inside the adapter file | planned |
| 21 | Each architecture rule has one owner: dependency-cruiser for the import graph and module edges, Steiger for FSD layers, slices and public APIs, ESLint for per-file quality. `eslint-plugin-boundaries` is removed as a duplicate of dependency-cruiser | implemented |
| 22 | The architecture gate is enforced by branch protection on `main`, not by convention: required checks `architecture`, `verify`, `secret-scan`, `dependency-review`; strict up-to-date checks; `enforce_admins` on; zero required approvals for a solo developer (raise when a second reviewer exists) | implemented |
**Rejected:** HTTP status on `DomainError`; entities or rules in the kernel; shared repository adapters; `packages/config`; hero Lottie `hero-*.json` and duplicate asset variants; `processing`/`shipped` statuses.

---

## 9. Open questions

1. **Order status values:** does legacy code use `processing` or `shipped`? If so, map to `preparing` and `out_for_delivery` in a documented step (P2.8). Answer: yes.
2. **Payment transitions:** which moves are legal among `pending`, `paid`, `failed`, `refunded`, `partial_refund`? (P6.2) Answer: All.
3. **Delivery-date rule:** exact logic of `trigger_order_delivery_dates` before porting (P4.3). Answer: Free to alter.
4. **Free-additive rule:** is `max_free_per_meal` per meal line or per order? (P3.4): Answer: per meal line.
5. **Payment provider:** Stripe is not confirmed; may be a placeholder (Phase 6). Answer: Make it a placeholder.
6. **Admin:** separate app after Phases 0–6 and rename; MFA/IP allowlist is part of the rationale (move 2). Answer: Hang on!

---

# Final note

The repository as of `main` is not a single clean rename yet. It is a mixed-state monorepo: target paths under `apps/*` exist, and legacy root-level `client/` and `server/` directories still remain in the working tree. This bible should therefore be read as a target architecture document that is currently being adopted incrementally, not as a claim that the migration is fully complete.
