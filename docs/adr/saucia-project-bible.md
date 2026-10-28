

# Saucia v2 — Project Bible

> **Revision:** 4 · **Snapshot:** 2026-10-27 · **Purpose:** the reference of record for structure, rules, sequencing and decisions.
>
> This revision is a **current-state document**. Completed tasks and superseded decisions are not restated; they live in git history (Revisions 1–7) and in `_legacy/`. If a task is not listed as open, it is done.

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
- Paths are current (`apps/...`). Older docs may say `client/` or `server/`; read them as `apps/customer-web/` or `apps/server/`.
- A task may not start before its **gate** is true.
- **V1 is deployed by another owner.** Nothing in v2 may change the v1 deployment, `_legacy/`, or the remote Supabase project until the rollout is agreed.

**Verification baseline (2026-10-21):** `pnpm install --frozen-lockfile`, `pnpm type-check`, `pnpm test` (76 tests), `pnpm arch` (0 violations, 1,634 modules) and `pnpm build` are green.

---

## 1. Current state

| Area | State |
| :--- | :--- |
| Workspace | pnpm + Turborepo; globs `apps/*`, `packages/*`; 6 projects |
| `apps/customer-web` | FSD × Clean skeleton; 3D landing ported; app bootstrap still TODO. Not yet configured against v2 |
| `apps/server` | Kernel complete (8 tests). `Order` aggregate done (kernel `Result`, `reconstitute` validation). `SubmitOrder`, controller, repository and composition still TODO |
| `packages/domain` | Money, order totals, order-status rules, cart rules, phone validation, BMI/TDEE/nutrition: 46 tests |
| `packages/contracts` | Error codes, order-status schema, submit-order and subscription/enrollment schemas: 22 tests |
| `packages/db-types` | Generated row types |
| `supabase/` | Config present (BOM removed); `migrations/` empty; function entry stubs exist, none wired |
| Local tooling | Docker Desktop (WSL 2) and Supabase CLI installed. Local `supabase start` blocked on pulling `supabase/postgres:17.6.1.054` (network timeouts) |
| Stage B | **Move 1 landed**. Moves 2–10 open (§3) |

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

`packages/domain` gains `pricing/`, `payment/` (Phase 6) and `subscription/consumptionRules.ts`. These are shared rules and stay free of I/O.

### 2.3 Server kernel (`apps/server/src/kernel`)

The dependency sink: `Result`, `DomainError`, and the ports `Clock` / `IdGenerator` / `Logger`.

- Every server layer may import it, including the domain. It imports nothing from modules, composition, platform or delivery-shared.
- `Result` is the error channel: use cases and domain methods return `Result<T, DomainError<Code>>`; delivery maps `code` to a transport response.
- `DomainError` carries `code`, a **fixed client-safe `message`** (`'Domain error'`), an `internalMessage` for logs, and optional `details`. No HTTP status, headers or response body. Never forward `internalMessage`.
- The client has **no `Result`**; it owns `AppError` only.
- Entities and aggregates (`Order`, `Meal`, `Cart`, `Subscription`) never live in the kernel.

### 2.4 Workspace boundaries

- `packages/*` are leaves: they never import `apps/` or `supabase/`.
- The two apps never import each other.
- `packages/kernel`, when it exists, may not import apps, `packages/domain`, `contracts` or `db-types`.
- Internal packages are **just-in-time**: `exports` point at TS source; no build step.

### 2.5 Ownership: "where does X go?"

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

**Error messages** are client-only: the server returns codes; the client maps codes to `dict.json` keys.

### 2.6 Rejected / do not reopen

- HTTP status or response body on `DomainError`.
- Entities or business rules in the kernel or a shared package.
- Order-status rules duplicated in contracts; contracts derives from `@saucia/domain`.
- Shared repository adapters: client uses anon + RLS, server uses the service role.
- `packages/config`: client and server env models differ and stay app-local.
- Pre-creating `packages/mobile-*` before `apps/mobile` exists.
- `processing` / `shipped` order statuses. The canonical set is `pending`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`. Legacy values are mapped in a documented step (P2.8).
- Extracting a package on its first consumer or "while we're in here".
- Client-side room checks as a security boundary for support chat (decision 18).

---

## 3. Stage B: target structure

**Status:** 🟡 IN PROGRESS. Move 1 landed; moves 2–10 open.

**Target:** `apps/{customer-web,admin-dashboard,server}` (+ optional `mobile`); `packages/{domain,contracts,db-types,ui,i18n,api-client,kernel,testing}` (+ optional `realtime`, `mobile-*`). No app imports another app.

**Gates and order.**

```
rename -> apps/*        ✅ done
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
| 1 | `client/` → `apps/customer-web`, `server/` → `apps/server` | ✅ done 2026-10-21 (one-way door) |
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

**One-way doors:** moves 1 (done) and 2. Land each as one commit with `pnpm install --frozen-lockfile && pnpm build && pnpm type-check && pnpm arch` green.

**Deployment.** The Vercel root must switch from `client` to `apps/customer-web` (keep "include files outside Root Directory" on). The CI artifact path is `apps/customer-web/dist`. Edge deploy is unaffected by Vercel.

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

#### 2. Shared packages

```
packages/
├── domain/src/
│   ├── money/                                (unchanged)
│   ├── order/                                (unchanged; orderRules, computeOrderTotals)
│   ├── cart/ identity/ subscription/ BMI/TDEE  (unchanged)
│   ├── subscription/consumptionRules.ts      [NEW] P4.1
│   ├── subscription/consumptionRules.test.ts [NEW]
│   ├── pricing/                              [NEW] P3.4
│   │   ├── discountRules.ts                  [NEW]
│   │   └── discountRules.test.ts             [NEW]
│   ├── payment/                              [HOLD] P6.2, open question 2
│   │   ├── paymentStatusRules.ts             [NEW]
│   │   └── paymentStatusRules.test.ts        [NEW]
│   └── index.ts                              [EDIT] export pricing, consumption, payment rules
│
├── contracts/src/
│   ├── errors/                               (unchanged)
│   ├── order/submitOrder.schema.ts           [EDIT] add additive item lines (P2.7)
│   ├── subscription/                         (unchanged)
│   ├── meal/                                 [NEW] P3.1, P3.6
│   │   ├── mealSummary.schema.ts             [NEW] read DTO, derived from domain
│   │   └── mealSummary.schema.test.ts        [NEW]
│   ├── payment/                              [HOLD] P6.2
│   │   ├── paymentStatus.schema.ts           [NEW]
│   │   └── paymentStatus.schema.test.ts      [NEW]
│   ├── support/                              [HOLD] P5.1
│   │   ├── supportMessage.schema.ts          [NEW]
│   │   └── supportMessage.schema.test.ts     [NEW]
│   └── index.ts                              [EDIT] export new schemas
│
└── db-types/src/
    └── database.ts                           [REGENERATE] pnpm db:types, after migrations (never by hand)
```

#### 3. Supabase: `supabase/`

```
supabase/
├── functions/
│   ├── _shared/server-bundle.mjs             (generated, gitignored; P0.8)
│   ├── order-processing/index.ts             [EDIT] thin entry; imports bundle (P0.8, P2.4)
│   ├── subscription-mgmt/index.ts            [EDIT] thin entry (P4.1)
│   ├── cron-jobs/index.ts                    [EDIT] thin entry for consumption and delivery dates (P4.3)
│   ├── payment-webhook/index.ts              [EDIT] HOLD until provider confirmed (P6.3)
│   ├── notifications/index.ts                [NEW] HOLD, P6.3
│   ├── support/index.ts                      [NEW] HOLD until P5.2 chooses WebSocket or Realtime
│   └── auth-handlers/                        (unchanged; do not create yet)
├── migrations/                               (empty; created by supabase migration new)
│   ├── <ts>_orders_schema.sql                [NEW] P2.3
│   ├── <ts>_menu_schema.sql                  [NEW] P3.1
│   ├── <ts>_subscriptions_schema.sql         [NEW] P4.1
│   ├── <ts>_support_schema.sql               [NEW] P5.1, HOLD
│   └── <ts>_rls_policies.sql                 [NEW] P5.3, HOLD
└── seed/                                     (unchanged)
```

#### 4. Client: `apps/customer-web/src` (FSD)

New server modules need matching client slices only where a screen uses them.

```
src/
├── entities/
│   ├── meal/                                 [EDIT] index.ts + model/ (P3.1 consumer side)
│   ├── order/model/                          [NEW] useOrders replacement (P2.5)
│   ├── order/infrastructure/                 (exists)
│   ├── subscription/model/                   [NEW] P4.4
│   ├── cart/model/                           [NEW] from CartContext (section 7)
│   └── message/                              [HOLD] Phase 5
├── features/
│   ├── submit-order/                         [EDIT] was index.ts only; P2.5
│   ├── enroll-subscription/                  [EDIT] P4.4
│   ├── calculate-health-plan/                [EDIT] P4.4
│   ├── send-support-message/                 [NEW] HOLD, P5.1
│   └── …other slices                         (unchanged)
├── widgets/
│   ├── subscription-dashboard/               [EDIT] P4.4
│   └── …other widgets                        (unchanged)
└── pages/
    ├── checkout/                             [EDIT] uses submit-order
    ├── premium/                              [EDIT] uses enroll-subscription
    └── admin/                                [EDIT] lazy-loaded (P3.3)
```

### Rules for adding a new server module

Use this checklist before creating any module folder.

1. **One bounded context per folder.** Name it after the business concept, not the table.
2. **Create the public `index.ts` first.** Other modules and composition import through it only.
3. **Ports belong to the consumer.** If `order` needs something from `menu`, the port goes in `order/application/ports`, and `menu` provides the adapter.
4. **Domain may import `@saucia/domain` and the kernel only.** Run `pnpm arch` after each module.
5. **Database rules stay in the database only where they protect data.** CHECK constraints, foreign keys and sequences stay in migrations. Sequencing (delivery → consumption) stays in use cases (decision 16).
6. **Client slices follow the server only where a screen calls it.** Do not mirror every server module into `entities/`.

---

## 4. Open work

### Phase 0: hygiene

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P0.7 | Verify `.env` files are ignored and never committed; rotate if needed | ✅ DONE | None |
| P0.8 | Deno interop spike: bundle inlines `@saucia/domain`; `order-processing` returns 200 locally | 🟡 PARTIAL | Bundle and entry files written. Blocked on pulling `supabase/postgres:17.6.1.054`. Remaining: `supabase start`, `functions serve`, curl 200, evidence. Remote deploy deferred (v1 owner coordination). `deploy.yml` not yet created |

### Phase 1: boundary enforcement

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P1.1 | Root ESLint boundary config + Steiger enforcement; `ci.yml` | 🟡 PARTIAL | `apps/customer-web/eslint.config.js`, `steiger.config.cjs`, `.github/workflows/CI.yaml` exist; no root `eslint.config.js`; Steiger not in `pnpm arch` |
| P1.2 | `modules-public-api-only` dependency-cruiser rule (decision 14) | ⬜ OPEN | Add rule; confirm `pnpm arch` passes after the module `index.ts` files exist |
| P1.3 | `server-domain-pure`: allow `@saucia/domain` and the kernel (decision 15) | ⬜ OPEN | Update rule and its description; confirm `pnpm arch` passes |

### Phase 2: order money path

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P2.1 | Validate `submitOrder.schema` on the server; map codes to i18n keys on the client | 🟡 PARTIAL | Schemas and `ErrorCode` exist; server validation and client mapping missing |
| P2.2 | `SubmitOrder` recomputes totals via `MealPriceReader`; never trusts client totals | 🟡 PARTIAL | `Order` aggregate ✅. `SubmitOrder.ts` and menu price reader ⬜ |
| P2.3 | `orders`, `order_meals`, `order_items` migrations with CHECK and total CHECK; `order_number` sequence | ⬜ OPEN | `supabase/migrations/` empty |
| P2.4 | `order-processing` function via bundle; port `process-order`, `manage-order`, `list-orders`, `track-last-order` | 🟡 PARTIAL | Stub entry; depends on P0.8 |
| P2.5 | `features/submit-order` + `entities/order` call the edge function via `edgeClient`/`errorNormalizer` | 🟡 PARTIAL | API modules and client repo exist; feature is `index.ts` only; no `entities/order/model` |
| P2.6 | Domain tests ✅ (46 domain + 22 contract + Order tests); use-case tests with in-memory ports | 🟡 PARTIAL | Use-case tests ⬜ |
| P2.7 | `OrderLine` supports additive item lines (`order_items`) with `max_free_per_meal` rule | ⬜ OPEN | Needs P3.4 pricing rules |
| P2.8 | Verify legacy order status and payment values against canonical lists; document mapping | ⬜ OPEN | Open questions 1 and 2 (§9) |

**Exit:** checkout works end to end against local Supabase; client totals are display-only.

### Phase 3: menu

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P3.1 | `modules/menu` with `Meal`, `Item`, `MenuPriceReader`; `meals`, `items`, `meal_items` migration | ⬜ OPEN | Folder holds `.gitkeep` only |
| P3.2 | Admin features (`admin-create-meal`, `admin-update-order-status`) on server use cases | ⬜ OPEN | Placeholders only |
| P3.3 | Keep admin lazy-loaded | ⬜ OPEN | Nothing to verify until admin exists |
| P3.4 | `packages/domain/pricing`: `discountRules.ts` (percentage discount, free-additive allowance) | ⬜ OPEN | New. Open question 4 |
| P3.5 | Rating aggregation as a use case on review publish (replaces `trigger_update_meal_rating_*`) | ⬜ OPEN | Needs `meal_reviews` migration |
| P3.6 | Allergy and dietary filters (`meal_allergies`, `item_allergies`) | ⬜ OPEN | Read model |

### Phase 4: subscriptions

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P4.1 | `user_subscriptions` and `plan_meals` migration; `packages/domain/subscription/consumptionRules.ts` | ⬜ OPEN | New |
| P4.2 | Delivery records consumption in the same `UnitOfWork` as the status change (replaces `trigger_order_delivery`) | ⬜ OPEN | Depends on P2.3, P4.1 |
| P4.3 | Delivery-date policy in `subscription` domain (replaces `trigger_order_delivery_dates`) | ⬜ OPEN | Open question 3 |
| P4.4 | Client `enroll-subscription`, `calculate-health-plan`, `subscription-dashboard` | ⬜ OPEN | Placeholders |

### Phase 5: support chat

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P5.1 | `modules/support`; `user_messages` migration | ⬜ OPEN | No module |
| P5.2 | Realtime adapter behind a port; decide WebSocket or Realtime | ⬜ OPEN | Gated by P5.1 |
| P5.3 | Authorization by RLS: users see their `user_id` rows; admins by role. Replaces the legacy client-side room check (decision 18) | ⬜ OPEN | Security-critical |

### Phase 6: payments and notifications

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P6.1 | Name adapters by port: `PaymentGateway`, `Mailer` (decision 20) | ⬜ OPEN | Port files absent |
| P6.2 | `payment_status` rules in `packages/domain/payment` | ⬜ OPEN | Open question 2 |
| P6.3 | `payment-webhook` + `notifications` functions with their modules | 🟡 PARTIAL | Webhook stub only |

### Phase 7: Stage B

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P7.1 | Execute moves 2–10 under the gates in §3 | 🟡 PARTIAL | Move 1 done |
| P7.2 | Hold `apps/mobile` / `packages/mobile-*` | ⏸ HOLD | By design |
| P7.3 | Vercel root switch | ⬜ OPEN | Dashboard root still `client` |

### Phase 8: legacy data

| ID | Task | Status | Remaining |
| :-- | :--- | :--- | :--- |
| P8.1 | One-way copy from v1 to v2 schema, with owner approval | ⏸ HOLD | Gate: P2–P5 schemas complete. v1 owner coordination required |

**Exit register.**

| Gate | Criterion | State |
| :--- | :--- | :--- |
| Phase 0 | install/build/type-check pass; local Supabase spike passes | 🟡 PARTIAL: local commands green; spike blocked on image pull; Vercel preview not re-run |
| Phase 1 | `pnpm arch` + `pnpm lint` green at `error`; zero new `legacy-*` imports | 🟡 PARTIAL: arch green; P1.2 and P1.3 pending; lint and Steiger missing |
| Phase 2 | Checkout end to end against local Supabase | ⬜ NOT MET |
| Phases 3–6 | Per-task review | ⬜ NOT STARTED |
| Stage B | §3 exit criterion | 🟡 IN PROGRESS: move 1 done |

> Legacy reference paths remain in `_legacy/` and in git history (Revisions ≤ 7).

---

## 5. Edge functions and the Deno spike

One thin entry per function, delegating to the server bundle.

| Legacy | New home | State |
| :--- | :--- | :--- |
| `process-order` / `manage-order` | `order-processing` → `SubmitOrder` / `UpdateOrderStatus` | 🟡 stubs; use cases not wired |
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
- **Root scripts:** `dev` filters `@saucia/client`; `arch` runs dependency-cruiser over `apps/customer-web/src apps/server/src packages`; `db:types` is the only writer of `packages/db-types/src/database.ts`.
- **CI:** `pnpm install --frozen-lockfile`, then lint, type-check, arch, test, build; artifact `apps/customer-web/dist`.
- **Vercel:** root `apps/customer-web`, include files outside root, `pnpm install --frozen-lockfile`.
- **Migrations:** created with `supabase migration new`; applied locally with `supabase db reset` only. No `db push` or `link` without owner approval.

---

## 7. Migration map: open items only

| Legacy | v2 home | State |
| :--- | :--- | :--- |
| `CartContext.jsx` | `apps/customer-web/src/entities/cart/model` (+ `LocalStorageCartRepository`) | 🟡 repository exists; no `model/` |
| `useOrders` | `apps/customer-web/src/entities/order/model` | ⬜ absent |
| `orderAPI.jsx` | `entities/order/infrastructure` + `features/submit-order` | 🟡 repo exists; feature empty |
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
| 13 | Stage B move 1 landed; moves 2–10 follow §3 gates | in progress |
| 14 | Each server module exposes a single `index.ts`; other modules, the edge bundle and composition import only through it. Infrastructure adapters are exported through it and restricted to `composition/` | planned: rule P1.2 |
| 15 | Server domain returns kernel `Result<T, DomainError<Code>>`; shared-package `RangeError`s are converted at the domain boundary. The domain may import the kernel; the kernel imports nothing from modules. Totals are a snapshot computed at placement and validated on rehydration | implemented; rule P1.3 pending |
| 16 | Legacy triggers that encode business sequencing move into server use cases inside `UnitOfWork`: subscription consumption on delivery, delivery dates, rating aggregation. The database keeps only data integrity: CHECK constraints, total CHECK, foreign keys, `order_number` sequence | planned |
| 17 | v2 migrations keep legacy table and column names, so a later one-way copy from v1 needs no renaming | planned |
| 18 | Support chat authorization is enforced by RLS. Client-side room checks are not a security boundary | planned |
| 19 | Order lines include meal and additive item lines. Pricing rules shared by client and server (discounts, free-additive allowance) live in `packages/domain/pricing` | planned |
| 20 | Adapters are named by port (`platform/payment`, `platform/email`), never by vendor. Vendor-specific code lives inside the adapter file | planned |

**Rejected:** HTTP status on `DomainError`; entities or rules in the kernel; shared repository adapters; `packages/config`; hero Lottie `hero-*.json` and duplicate asset variants; `processing`/`shipped` statuses.

---

## 9. Open questions

1. **Order status values:** does legacy code use `processing` or `shipped`? If so, map to `preparing` and `out_for_delivery` in a documented step (P2.8).
2. **Payment transitions:** which moves are legal among `pending`, `paid`, `failed`, `refunded`, `partial_refund`? (P6.2)
3. **Delivery-date rule:** exact logic of `trigger_order_delivery_dates` before porting (P4.3).
4. **Free-additive rule:** is `max_free_per_meal` per meal line or per order? (P3.4)
5. **Payment provider:** Stripe is not confirmed; may be a placeholder (Phase 6).
6. **Admin:** separate app after Phases 0–6 and rename; MFA/IP allowlist is part of the rationale (move 2).

---

*Revisions 1–8 (2026-10-08 → 2026-10-27): workspace wiring; domain and contracts; server kernel; Phase 1 cleanup; Stage B gates; move 1; module public surface; domain kernel boundary; legacy schema plan. Detailed history is in git.*

---
