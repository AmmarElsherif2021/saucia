# Saucia v2 — Project Bible

> **Revision:** 5 · **Synced to repo tree snapshot of:** 2026-10-21 **Purpose:** the reference of record for Saucia v2 structure, rules, sequencing and decisions. If any other document disagrees with it, raise the conflict and log it in section 12. **Where this lives in the repo:** `docs/adr/saucia-project-bible.md`

---

## 0. How to use this document

<br />

### 0.1 Status legend

| Mark       | Meaning                                                                                                         |
| :--------- | :-------------------------------------------------------------------------------------------------------------- |
| ✅ DONE    | Structural evidence for the task is present in the repo tree                                                    |
| 🟡 PARTIAL | Some of the task is evidenced; the remainder is named in the evidence column                                    |
| ⬜ OPEN    | No evidence in the tree that the task has landed                                                                |
| 🔍 VERIFY  | Cannot be proven from a file tree (file contents, git history, dashboards, a green build); needs a manual check |
| ⏸ HOLD     | Deliberately not started, as the plan itself specifies                                                          |
| ℹ️ NOTE    | Observation recorded without a status                                                                           |

**Evidence method and limits.** Statuses were derived by comparing the plan with the repository tree as of 2026-10-21 (Revision 5). The tree shows which files and folders exist, not what is inside them, so "DONE" means the structure is there; the 🔍 items inside each row are the content-level checks still owed. Task IDs (`P<phase>.<row>`) number the rows of each phase table in their original order.

### 0.2 Where we are

**Stage A (Phases 0–6) is in progress, and Stage B move 1 has landed.** Phase 0's workspace wiring is verifiable: `pnpm install --frozen-lockfile`, `pnpm type-check`, `pnpm test`, `pnpm arch` and `pnpm build` pass at the root. The shared packages are complete: domain has money, order totals, order-status transitions, cart rules, Saudi phone validation, BMI, TDEE and the nutrition pipeline; contracts has error codes, order-status schema, submit-order and subscription-enrollment schemas. The server-local kernel is the canonical error/port vocabulary: `Result`, a generic HTTP-free `DomainError`, and the `Clock`/`IdGenerator`/`Logger` ports (8 tests); `packages/kernel` remains deferred until a second consumer. **Revision 4 closed P1.3 (the client `Result.ts` duplicate is deleted), P1.4 (provider vs state split for `SessionProvider`), P1.6 (assets deduplicated and the 3D landing system moved into the live client) and P0.9 (every empty scaffolding directory now has a `.gitkeep`). Revision 5 executed Stage B move 1:** `client/` → `apps/customer-web/`, `server/` → `apps/server/`, with the workspace glob, TypeScript `extends`, dependency-cruiser paths, root scripts, CI artifact path, gitignore and lockfile importers updated. Workspace package names stay `@saucia/client`/`@saucia/server` for this move. What remains in Phase 0 is the secrets audit (P0.7) and the Deno interop spike (P0.8). Root ESLint/Steiger enforcement (P1.1) is the only Phase 1 task still open. Phase 2 still owes the server use cases, DB migrations, edge bundle and client features; Phases 3–6 remain scaffolding. Stage B moves 2–10 are open: the admin split, `packages/{ui,i18n,api-client}`, and `kernel`/`testing`/`realtime` only when their gates fire. The Vercel project root still has to be switched in the dashboard from `client` to `apps/customer-web`.

_Reading of the plan used here:_ Stage A = Phases 0–6; Stage B = Phase 7 together with section 2. This follows Phase 7's title and open question 2 ("once Phases 0–6 have landed").

### 0.3 Roadmap dashboard

| Phase | Title                               | Status                   | Task marks                | Still open (by task ID)           |
| :---- | :---------------------------------- | :----------------------- | :------------------------ | :-------------------------------- |
| 0     | Hygiene and wiring                  | 🟡 In progress           | 7 ✅ · 1 🔍 · 1 ⬜ | P0.7, P0.8 |
| 1     | Enforce boundaries on what exists   | 🟡 Started               | 5 ✅ · 1 🟡        | P1.1 |
| 2     | Vertical slice #1: order submission | 🟡 Started (contracts/domain done) | 5 🟡 · 1 ⬜        | P2.1–P2.6 |
| 3     | Menu and admin management           | ⬜ Not started           | 3 ⬜                      | P3.1–P3.3                         |
| 4     | Subscriptions                       | 🟡 Started (domain done) | 1 ✅ · 2 ⬜               | P4.1, P4.3 |
| 5     | Support chat                        | ⬜ Not started           | 2 ⬜                      | P5.1–P5.2                         |
| 6     | Payments and notifications          | ⬜ Not started           | 1 ⬜ · 1 🟡               | P6.1–P6.2                         |
| 7     | Stage B: planned product split      | 🟡 Started (move 1)      | 1 🟡 · 1 ⏸ · 1 ⬜        | P7.1 (moves 2–10), P7.3 |

**Gates stated in the plan that affect sequencing:** the Phase 0 spike "determines the shape of every later edge-function task" (P0.8 → P2.4, P4.1, P6.2); Stage B move 6 now waits only on a second consumer, because the Phase 1 kernel dedup (P1.3) closed by making the server kernel canonical; move 7 waits on Phase 2 in-memory ports (P2.6); the admin split waits on Phases 0–6 landing and the rename settling.

### 0.4 Table of contents

0. How to use this document (front matter)
1. Current-state snapshot
2. Target structure (Stage B, gates and landing order, anti-triggers, ownership table)
3. Boundary rules (3.1 FSD layers, 3.2 Clean rings)
4. Config files
5. Edge functions: legacy -> new (including the Deno interop spike)
6. Where the 3D landing system lives
7. Phased roadmap (Phases 0–7)
8. Migration map
9. Open questions and answers
10. Status ledger (appendix)
11. Baseline tally (appendix)
12. Change log and decision log (appendix)

### 0.5 Rules index (where each rule lives)

| Rule or decision                                                                                      | Where it is defined                               |
| :---------------------------------------------------------------------------------------------------- | :------------------------------------------------ |
| Goals and staged-growth principle                                                                     | Intro paragraph, directly under the plan title    |
| FSD layer direction, `index.ts`-only imports, lint config                                             | 3.1                                               |
| Clean ring direction, DI-only access to infrastructure, dependency-cruiser rules                      | 3.2                                               |
| Workspace rules (`packages-are-leaves`, `server-never-imports-client`, `client-never-imports-server`) | 3.2                                               |
| Where does X go? (ownership table)                                                                    | Section 2, 'Ownership table'                      |
| Stage B moves, gates and landing order, one-way doors, anti-triggers, exit criterion                     | Section 2                                         |
| Just-in-time internal packages, turbo/root/CI/Vercel config                                           | Section 4                                         |
| Edge function mapping, bundle approach, Deno fallback, secrets                                        | Section 5                                         |
| Placement of the 3D landing system                                                                    | Section 6                                         |
| Phase tasks, legacy references, exit criteria, review points                                          | Section 7                                         |
| Legacy → v2 file mapping                                                                              | Section 8                                         |
| Decisions already taken (payment, admin, delivery, chat, hero assets)                                 | Section 9; logged with dependencies in section 12 |

### 0.6 Rules for editing this bible

- Update **status overlays** and **appendices 10–12** as work lands; do not edit the original plan text in place.
- If the plan itself must change, add a dated entry to section 12 and keep the superseded text with its date (the plan's own review points for section 9 require this for answers).
- Every change in status should name the file or commit that proves it.

### 0.7 Exit criteria register

| Gate       | Exit criterion (verbatim from the plan)                                                                       | Status           |
| :--------- | :------------------------------------------------------------------------------------------------------------ | :--------------- |
| Phase 0    | `pnpm install && pnpm build && pnpm type-check` pass from the root; Vercel preview builds from the workspace. | 🟡 PARTIAL — install/type-check/test/arch/build pass locally; Vercel preview not re-run in Revision 4 |
| Phase 1    | `pnpm arch` and `pnpm lint` green in CI with rules at `error`; zero new imports of `legacy-*` files. | 🟡 PARTIAL — `pnpm arch` is green (0 violations, 1634 modules) and the legacy-file count is 0; lint/Steiger still missing |
| Phase 2    | Checkout works end to end against local Supabase; client-computed totals are display-only.                    | ⬜ NOT MET       |
| Phases 3–6 | (No explicit exit line in the plan; each has review points.)                                                  | ⬜ NOT STARTED   |
| Stage B    | See 'Exit criterion for Stage B' in section 2.                                                                | 🟡 IN PROGRESS — move 1 landed (`apps/customer-web`, `apps/server`); admin split and package extractions remain |

---

### 0.8 Extracted: done and dead points (Revisions 2–4)

**Closed in Revisions 2–4 (moved out of the open roadmap):**

| Point | Evidence |
| :--- | :--- |
| P1.2 single order status | `packages/domain/src/order/orderRules.ts` owns the values and transitions; `packages/contracts/src/order/orderStatus.ts` derives the Zod schema; `server/src/modules/order/domain/OrderStatus.ts` is a re-export facade. |
| Domain package stubs | `Money`, `computeOrderTotals`, cart rules, Saudi phone validation, BMI, TDEE and the nutrition pipeline are implemented. 46 domain tests pass. |
| Contract package stubs | Error codes, order-status schema, submit-order request/response, subscription enrollment and nutrition-profile schemas are implemented. 22 contract tests pass. |
| Server kernel (Revision 3) | `Result`, a generic HTTP-free `DomainError`, and the `Clock`/`IdGenerator`/`Logger` ports live in `server/src/kernel`; 7 tests at Revision 3, 8 after Revision 4; no business rules or entities. |
| Drift item 4 (triple order status) | Closed by P1.2; no second status list or transition table remains. |
| Drift item 7 (lockfile/tooling) | `pnpm-lock.yaml` exists and `pnpm install --frozen-lockfile` passes. |
| P0.1 lockfile / P1.5 db-types | Root lockfile committed; `packages/db-types` exists and type-checks. |
| Type-check blockers | `client/src/shared/config/constants.ts` is a real module; the server kernel is implemented; workspace `pnpm type-check` is green. |
| Kernel boundaries (Revision 3) | `server-kernel-imports-nothing` and the future `packages-kernel-*` rules are in `.dependency-cruiser.cjs`; entities stay in the app-local domain. |
| P1.3 duplicate `Result.ts` (Revision 4) | `client/src/shared/kernel/Result.ts` deleted; `client/src/shared/kernel/index.ts` exports `AppError` only and records that `server/src/kernel/Result.ts` is the single owner. |
| P1.4 duplicate `SessionProvider` (Revision 4) | Provider shell at `client/src/app/providers/SessionProvider.tsx`; state, type and `useSession` at `client/src/entities/session/model/sessionContext.ts`; the duplicate file is gone. |
| P1.6 assets + 3D landing (Revision 4) | 0 byte-identical asset groups; one canonical file per hero (5 files, `*_compressed` suffixes gone); 19 GLBs (the unused `customize.glb` and `planet.glb` removed); `shared/ui/three/ThreeDisplay.tsx`, `pages/home/ui/{DiscreteLandingPage,Section}.tsx`, `pages/home/config/{landingConfig,modelsConfig}.json`. |
| P0.9 empty scaffolding (Revision 4) | The 12 remaining live empty directories now carry `.gitkeep`; 0 empty directories remain in `client/src`, `server/src` or `packages`. |
| Legacy files in live layers (Revision 4) | The three `legacy-*` files moved to `_legacy/client/src/shared/{api,i18n,theme}/`; live count is 0 and no live file imports them. |
| Stage B move 1 (Revision 5) | `client/` → `apps/customer-web/`, `server/` → `apps/server/`. Updated `pnpm-workspace.yaml`, both app `tsconfig` `extends` paths, `.dependency-cruiser.cjs`, the root `arch` script, `.gitignore`, the CI artifact path and `pnpm-lock.yaml` importers; `pnpm install --frozen-lockfile`, `type-check` (5 tasks), `test` (4 tasks), `arch` and `build` are green.|

**Dead / superseded points (do not reopen):**

| Point | Why dead |
| :--- | :--- |
| "Rules belong in contracts" | Rejected. Transition rules are domain policy; contracts derives the enum/schema. See P1.2 and `packages/README.md`. |
| `packages/domain` / `packages/contracts` have no `package.json` | False since the workspace wiring; both manifests exist and are type-checked. |
| "No root CI files" | `.github/workflows/CI.yaml` and `ci.yml` exist; CI content may still need tuning. |
| `packages/contracts/src/order/orderStatus.ts` importing server | Removed; the broken leaf import was replaced by `@saucia/domain`. |
| `processing` / `shipped` order statuses | Superseded by the ADR/v1 set: `pending`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`, `cancelled`. Do not add `processing`/`shipped` without a new decision. |
| Entities in kernel or shared domain | Rejected. `Order`, `Meal` and `Cart` belong to the app-local domain that owns their lifecycle; kernel is technical vocabulary only. |
| HTTP status on `DomainError` | Rejected. `DomainError` carries a generic code, a fixed client-safe `message`, an `internalMessage` for logs and optional details; delivery maps codes to transport responses. |

**Still live (not extracted):** P0.7 secrets audit, P0.8 Deno spike; P1.1 root lint/Steiger; P2.1 server validation/client mapping, P2.2 server use case/MealPriceReader, P2.3 DB migrations, P2.4 edge bundle, P2.5 client features, P2.6 server use-case tests; Phases 3–7.

---

# Saucia v2: Monorepo Plan

A monorepo plan for Saucia v2 that keeps its goals (FSD x Clean on the client, Clean on the server, pure shared packages, Supabase as the DB source of truth) and grows into the target structure in stages instead of creating nine packages and three apps up front.

---

## 1. Current-state snapshot

**Already good (keep):**

- Client FSD layers exist: `app/{di,providers,router}`, `pages`, `widgets`, `features`, `entities`, `shared/{kernel,config,lib,...}`.
- Entities already use ring folders (`domain, ports, infrastructure, application, model, ui`), and `order` has a real Supabase repo with `dto/` and `mappers/`.
- Server has the Clean skeleton and a real `order` module: `SubmitOrder`, `UpdateOrderStatus`, ports (`MealPriceReader`, `OrderRepository`, `UnitOfWork`), controller, routes.
- `packages/domain` has `Money`, `computeOrderTotals`, `cartRules`, `orderRules`, `phoneValidation`, `BMICalculator`, `TDEECalculator`. `packages/contracts` has error codes, `orderStatus`, `submitOrder.schema`.

**Drift / debt to resolve:**

1. **No root** **`package.json`,** **`turbo.json`,** **`tsconfig.base.json`, or CI files.** The workspace file exists but nothing is wired. `.github/workflows/` is empty.
2. **Root** **`public/assets/*.js`** is built output from the legacy app. It does not belong in source control.
3. **Three migration locations** (`server/database/{migrations,policies,seed}`, `supabase/migrations`, `client/supabase`) and **two function locations** (`supabase/functions` stubs vs `client/supabase/functions` legacy).
4. **Triple definition of order status:** `contracts/order/orderStatus.ts`, `domain/order/orderRules.ts`, `server/.../domain/OrderStatus.ts`.
5. **Duplicate kernel code:** `Result.ts` exists in `client/shared/kernel` and `server/src/kernel`.
6. **Legacy files inside live layers:** `shared/api/legacy-supabaseClient.jsx`, `shared/i18n/legacy-i18n.jsx`, `shared/theme/legacy-theme.jsx`, plus `entities/session/model/SessionProvider.tsx` duplicating `app/providers/SessionProvider.tsx`.
7. **Lockfile/tooling mismatch:** `client/package-lock.json` (npm) in a pnpm workspace; `vite.config.js` is still JS.
8. **Empty scaffolding.** Most entity rings and every `pages/*/ui` are empty folders. Git does not track empty directories, so teammates and CI will not see them. Scaffold when the first file lands, not before.
9. **Assets:** duplicates between `assets/admin` and `assets/menu` (`cheese.svg`, `dessert.svg`, `defaultMeal.jpg`, `logo.png` also at top level); compressed and uncompressed hero images side by side; `hero-*.json` (verify they are still referenced now that the landing page is 3D); an `Outfit` font folder (if Asap EN + Zain AR are the only families, delete Outfit; confirm where Zain loads from).
10. **Secrets hygiene:** `.env` files exist in `client/` and `client/supabase/functions/`. Confirm they are gitignored and were never committed. If they were, rotate the keys.
11. **No home yet for the 3D landing system** (`ThreeDisplay`, `DiscreteLandingPage`, `modelsConfig.json`, `landingConfig.json`, GLTF models). See section 6.

> **Status overlay — drift items (synced 2026-10-08).** The list above is the 'before' picture and is left untouched; this table records where each item stands now.
>
> | #   | Drift item                                                    | Status              | Evidence in tree                                                                                                                                                                                                        |
> | :-- | :------------------------------------------------------------ | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | 1   | No root workspace wiring / CI                                 | ✅ DONE (structure) | Root `package.json`, `turbo.json`, `tsconfig.base.json`, `pnpm-lock.yaml` exist; `.github/workflows/{CI.yaml,ci.yml}` exist. 🔍 build/lint not both re-run.                                                          |
> | 2   | Root `public/assets/*.js` build output                        | ✅ DONE             | No root `public/`; it now lives at `_legacy/public/`.                                                                                                                                                                   |
> | 3   | Three migration locations / two function locations            | ✅ DONE (structure) | `server/database` and `client/supabase` gone from live code; `supabase/{migrations,seed,config.toml}` and `supabase/functions/*` exist; legacy functions at `_legacy/edge-functions/`. `supabase/migrations/` is empty. |
> | 4   | Triple definition of order status                             | ✅ DONE (Revision 2) | Single source in `packages/domain/src/order/orderRules.ts`; contracts derives the schema; the server file is a re-export facade.                                                                                          |
> | 5   | Duplicate `Result.ts`                                         | ✅ DONE (Revision 4) | Client copy deleted; `client/src/shared/kernel/index.ts` exports `AppError` only. `server/src/kernel/Result.ts` is the single owner. Decision 9. |
> | 6   | Legacy files inside live layers + duplicate `SessionProvider` | ✅ DONE (Revision 4) | No `legacy-*` files under `client/src`; `client/src/app/providers/SessionProvider.tsx` is a provider shell and `client/src/entities/session/model/sessionContext.ts` owns the state/hook. |
> | 7   | Lockfile/tooling mismatch                                     | ✅ DONE             | `client/package-lock.json` absent; `client/vite.config.ts` present; root `pnpm-lock.yaml` committed and `pnpm install --frozen-lockfile` passes.                                                                     |
> | 8   | Empty scaffolding                                             | ✅ DONE (Revision 4) | Client slices hold `index.ts`; the 12 remaining empty live directories carry `.gitkeep`. 0 empty directories remain (section 11).                                                                                       |
> | 9   | Assets                                                        | ✅ DONE (Revision 4) | `Outfit` gone; 0 byte-identical asset groups; one canonical hero per slot (`heroA..heroE`); `hero-*.json` and `*_compressed` names removed; Asap static weights pruned (variable fonts + Zain kept); 19 GLBs. |
> | 10  | Secrets hygiene                                               | 🔍 VERIFY           | `client/.env`, `client/.env.example`, `_legacy/edge-functions/.env` exist on disk; gitignore/history status is not visible.                                                                                             |
> | 11  | No home for the 3D landing system                             | ✅ DONE (Revision 4) | GLTFs in `client/public/models/` (19 files); `shared/ui/three/ThreeDisplay.tsx`, `pages/home/ui/DiscreteLandingPage.tsx`, `pages/home/ui/Section.tsx`, `pages/home/config/{landingConfig,modelsConfig}.json` are live. |

**Review points (current-state snapshot):**

- Walk through the "already good" list and point at a real file for each claim (e.g. `client/src/entities/order/infrastructure/SupabaseOrderRepository.ts`, `server/src/modules/order/application/use-cases/SubmitOrder.ts`).
- For each drift item, name the file that proves it and the file that will replace it.
- Produce a one-page inventory: number of duplicate definitions, number of legacy files, number of empty folders. This becomes the "before" baseline.

---

## 2. Target structure

### Stage B: planned product split

> **Status overlay — Stage B (synced 2026-10-21):** 🟡 IN PROGRESS — **move 1 has landed**; moves 2–10 are open. `apps/customer-web/` and `apps/server/` replace `client/`/`server/`; `packages/` holds `contracts`, `db-types`, `domain`. Where the plan text below still says `client/` or `server/`, read `apps/customer-web/` or `apps/server/`. Workspace package names remain `@saucia/client` and `@saucia/server` until the admin split. Sequencing gates remain P0.7, P0.8 and P1.1; see Phase 7 and open question 2.
>
> | #   | Move (see table below)                                     | Status  | Gate stated in the plan                           |
> | :-- | :--------------------------------------------------------- | :------ | :------------------------------------------------ |
> | 1   | `client/` → `apps/customer-web`, `server/` → `apps/server` | ✅ DONE (2026-10-21) | Landed as one commit; one-way door; frozen install/type-check/test/arch/build green |
> | 2   | Split `apps/admin-dashboard`                               | ⬜ OPEN | After move 1; one-way door                        |
> | 3   | `packages/ui`                                              | ⬜ OPEN | After the admin split                             |
> | 4   | `packages/i18n`                                            | ⬜ OPEN | Same gate as `packages/ui`                        |
> | 5   | `packages/api-client`                                      | ⬜ OPEN | After the admin split                             |
> | 6   | `packages/kernel`                                          | ⬜ OPEN | P1.3 closed; gate is now a second consumer        |
> | 7   | `packages/testing`                                         | ⬜ OPEN | After Phase 2 in-memory ports exist (P2.6)        |
> | 8   | `packages/realtime`                                        | ⬜ OPEN | Settled chat adapter interface AND a 2nd consumer |
> | 9   | `apps/mobile`                                              | ⏸ HOLD  | Only when the mobile project is greenlit          |
> | 10  | `packages/mobile-ui`, `packages/mobile-native`             | ⏸ HOLD  | Only after move 9                                 |

Stage B is a **product decision**, not a set of observed triggers. The direction is fixed:

- **`apps/customer-web`** — the customer storefront.
- **`apps/admin-dashboard`** — the admin surface, deployed independently.
- **`apps/server`** — the Clean core and the source of the edge bundle.
- **`apps/mobile`** — optional, future. The architecture is designed so it can be added later; it is **not** pre-created.

The Vercel deployment staying in sync is explicitly **not** a constraint. The split is the goal; deployment config follows the split. Preview deploys may break for a day while Vercel's root directory catches up — that is accepted, not a blocker. CI runs the full matrix until path filters are updated; the repo is small enough that this is correct.

**Gates and order.** A move may not fire before its gate is true. Within that constraint, land the moves in this order:

```
rename -> apps/*        ← spine; no prerequisite; rewrites every import path
admin split             ← after the rename; admin code is already namespaced
packages/ui             ← after the admin split (two apps share a theme)
packages/i18n           ← same gate as packages/ui
packages/api-client     ← after the admin split (both apps share the edge client)
packages/kernel         ← gate: a second app imports Result/DomainError/ports
packages/testing        ← gate: Phase 2 in-memory ports exist (P2.6)
packages/realtime       ← gate: settled adapter AND a second consumer
apps/mobile             ← gate: product greenlight; optional
packages/mobile-*       ← only after apps/mobile exists
shared adapters         ← never (see anti-triggers)

```

`packages/config` is **not planned**: client env (`import.meta.env`, `VITE_*`) and server env (`Deno.env` / `process.env`) are different models and stay app-local — the same reasoning that keeps repository adapters unshared.

**The moves.**

| #   | Move                                                         | Rationale                                                                                                                                                                                                        | Reversibility                                                                                       |
| :-- | :----------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| 1   | `client/` -> `apps/customer-web`, `server/` -> `apps/server` | Structural precondition for adding `apps/admin-dashboard` and `apps/mobile` as siblings. Land as one `git mv` commit.                                                                                            | Medium — one folder rename + import rewrite; deploy config is not a blocker                         |
| 2   | Split `apps/admin-dashboard` out of `apps/customer-web`      | Admin has different auth (MFA, IP allowlist), different deploy cadence, and will be owned separately. Move `pages/admin`, `features/admin-*`, `widgets/admin-*` and the admin-only shared bits into the new app. | Medium — depends on step 1; admin code is already namespaced (`admin-*`), so the move is mechanical |
| 3   | Extract `packages/ui`                                        | Admin and web both need the Chakra theme, tokens, and shared primitives. Two apps sharing a theme is the trigger; the "10+ components" heuristic is dropped — with two apps it is already worth it.              | Low — folder move + import rewrite                                                                  |
| 4   | Extract `packages/i18n`                                      | Same reason as `packages/ui`: two apps need one `dict.json`.                                                                                                                                                     | Low                                                                                                 |
| 5   | Extract `packages/api-client`                                | Admin and web both call the same edge functions with the same `errorNormalizer` and auth wrapper.                                                                                                                | Low                                                                                                 |
| 6   | Extract `packages/kernel`                                    | `Result`, `DomainError`, `Clock`, `IdGenerator`, `Logger` are consumed by `apps/server` today. Extract only when a second app actually imports them: P1.3 removed the duplicate, it did not create a consumer. | Medium — reversible with a codemod                                                                  |
| 7   | Extract `packages/testing`                                   | In-memory ports and the contract-test harness are consumed by server and by both web apps' integration tests. Depends on Phase 2.                                                                                | Medium                                                                                              |
| 8   | Extract `packages/realtime`                                  | Only after the chat transport adapter has a settled interface **and** both web and admin chat consume it. One consumer keeps it local.                                                                           | Medium                                                                                              |
| 9   | `apps/mobile` (optional)                                     | Only when the mobile project is greenlit. Until then, the rest of Stage B is designed so that a future mobile app is _addable_, not _already present_.                                                           | High — new deployable, not a move                                                                   |
| 10  | `packages/mobile-ui`, `packages/mobile-native`               | Only after step 9. Do not pre-create these; an empty mobile package is worse than no mobile package.                                                                                                             | High                                                                                                |
| —   | Shared repository adapters                                   | Never — unless the _same_ implementation runs under the _same_ auth context on both sides. Client uses anon + RLS; server uses service role. These legitimately differ.                                          | —                                                                                                   |

**What "Vercel sync is not a priority" means concretely.**

- Step 1 requires updating Vercel's project root from `client` to `apps/customer-web` and re-enabling "include files outside Root Directory." If that update lags the commit, preview deploys break until it lands. Accept this — a broken preview for a day is cheaper than a structural decision deferred indefinitely.
- CI path filters (`paths:` in `ci.yml`) point at `apps/*` and `packages/*`. Until then, the workflow runs the full matrix on every PR, which is correct for a repo of this size.
- `supabase functions deploy` reads from `supabase/functions/`, which is unaffected by the rename. The `server/runtimes/supabase-edge` bundle path is also unaffected. Only the Vercel project and `ci.yml` need touching.

**Anti-triggers (when not to do the move).** The product decision to split does not license speculative extraction. These are non-triggers:

- "It would be cleaner."
- "We might want a second app."
- "The empty folder bothers me."
- "A blog post recommended it."
- First use of a pattern (extract on the second consumer).
- Pre-creating `packages/config` — client env (`import.meta.env`) and server env (`Deno.env` / `process.env`) are different models.
- Refactoring "while we're in here."
- Pre-creating `packages/mobile-*` before `apps/mobile` exists.

**One-way doors.** Steps 1 (rename) and 2 (admin split) are the only one-way doors. Everything else is a folder move plus an import rewrite. Land each of steps 1 and 2 as a single commit so that `pnpm install && pnpm build && pnpm type-check && pnpm arch` is green at every point a teammate checks out.

**Exit criterion for Stage B.** `apps/` contains `customer-web`, `admin-dashboard`, and `server` (and `mobile` if greenlit). `packages/` contains `domain`, `contracts`, `db-types`, `ui`, `i18n`, `api-client`, plus `kernel` and `testing` once their gates have fired, and optionally `realtime` and `mobile-*`. No app imports another app. Every cross-app dependency goes through a `@saucia/*` package. `pnpm arch` is green. The Vercel project layout may lag — that is accepted, not a blocker.

**Review points (target structure):**

- Draw the Stage A tree and the Stage B tree side by side; annotate each `packages/*` extraction with the consumer that justifies it.
- Walk through the gates-and-order list and point at the phase in section 7 that unblocks each move.
- Show the "anti-triggers" list as a decision log; each rejected extraction gets a one-line reason.
- For the one-way doors (rename, admin split), show the commit plan: one commit per move, green CI at each step.

### Ownership table (answers "where does X go?")

| Concept                                                                                                  | Home                                                                                                               |
| :------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| Money, order totals, cart rules, BMI/TDEE, phone validation, order-status transitions                    | `packages/domain`                                                                                                  |
| Request/response schemas, error codes, status enums as wire types (derived from domain, never redefined) | `packages/contracts`                                                                                               |
| DB row types                                                                                             | `packages/db-types` (generated)                                                                                    |
| Ports, repositories, DTOs, mappers                                                                       | Per app (`client/entities/*` or `server/modules/*` in Stage A; `apps/*` in Stage B)                                |
| Server aggregates with persistence-facing invariants (`Order`)                                           | `server/modules/*/domain` (Stage A) -> `apps/server/src/modules/*/domain` (Stage B)                                |
| Client-only models (cart in localStorage)                                                                | `client/entities/*/domain` (Stage A) -> `apps/customer-web/src/entities/*/domain` (Stage B)                        |
| Theme tokens, Chakra theme, primitives                                                                   | `client/shared/theme` + `client/shared/ui` in Stage A; `packages/ui` in Stage B                                    |
| Translations (`dict.json`)                                                                               | `client/shared/i18n` in Stage A; `packages/i18n` in Stage B                                                        |
| Edge client, `errorNormalizer`, auth wrapper                                                             | `client/shared/api` in Stage A; `packages/api-client` in Stage B                                                   |
| `Result`, `DomainError`, kernel ports                                                                    | `server/src/kernel` (canonical) in Stage A; `packages/kernel` in Stage B                                           |
| In-memory ports, contract-test harness                                                                   | `server/tests/` in Stage A; `packages/testing` in Stage B                                                          |
| Chat transport                                                                                           | `client/entities/message/infrastructure` in Stage A; `packages/realtime` in Stage B (after adapter + 2nd consumer) |
| Error _messages_                                                                                         | Client only. Server returns codes; the client maps codes to `dict.json` keys                                       |

**Review points (ownership table):**

- For every concept in the left column, point at the exact file path today and the exact file path after Stage B.
- Pick three concepts and show the diff produced by moving them (imports rewritten, no logic changed).

---

## 3. Boundary rules

> **Status overlay — boundary rules (synced 2026-10-18):** partially enforced; dependency-cruiser is green and includes the server-kernel rules.
>
> | Item                                                                            | Status    | Evidence in tree                                                    |
> | :------------------------------------------------------------------------------ | :-------- | :------------------------------------------------------------------ |
> | FSD layer folders (`app`, `pages`, `widgets`, `features`, `entities`, `shared`) | ✅ DONE   | All present under `client/src/`; `app/{di,providers,router}` exist. |
> | Slices expose an `index.ts`                                                     | ✅ DONE   | Every slice listed in the tree has an `index.ts`.                   |
> | ESLint boundaries config (3.1)                                                  | 🟡 PARTIAL | `client/eslint.config.js` exists; no root `eslint.config.js`; boundary rules not re-audited.                     |
> | `.dependency-cruiser.cjs` (3.2)                                                | ✅ DONE   | Present at the root; `pnpm arch` is green; kernel boundary rules added in Revision 3. |
> | Steiger (`steiger ./client/src`)                                                | 🟡 PARTIAL | `steiger.config.cjs` exists; `pnpm arch` currently runs only dependency-cruiser, so Steiger is not enforced.     |

### 3.1 FSD layers (client)

Allowed imports go **downward only**, and **slices in the same layer may not import each other**:

```
app -> pages -> widgets -> features -> entities -> shared

```

- Widgets _may_ import features (for example `cart-summary` uses `update-cart-quantity`).
- Cross-entity references (order -> meal) go through FSD's `@x` public-API convention, or the logic moves up into a feature/widget.
- Slices are imported only through their `index.ts`.

**Explanation.** The layer order is the contract that keeps composition roots from leaking into leaves. The lint config below encodes the allowed directions; the default `disallow` also blocks same-layer, cross-slice imports, which is the correct default for FSD.

`eslint.config.js` (flat config; confirm option names against the `eslint-plugin-boundaries` version you install):

```
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

const sliced = ['pages', 'widgets', 'features', 'entities'];

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    files: ['client/src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'client/src/app', mode: 'folder' },
        ...sliced.map((t) => ({
          type: t,
          pattern: `client/src/${t}/*`,
          mode: 'folder',
          capture: ['slice'],
        })),
        { type: 'shared', pattern: 'client/src/shared', mode: 'folder' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'app',      allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
          { from: 'pages',    allow: ['widgets', 'features', 'entities', 'shared'] },
          { from: 'widgets',  allow: ['features', 'entities', 'shared'] },
          { from: 'features', allow: ['entities', 'shared'] },
          { from: 'entities', allow: ['shared'] },
          { from: 'shared',   allow: [] },
        ],
      }],
      'boundaries/entry-point': ['error', {
        default: 'disallow',
        rules: [
          { target: sliced, allow: 'index.ts' },
          { target: ['shared', 'app'], allow: '**' },
        ],
      }],
      'no-restricted-imports': ['error', {
        patterns: [{ group: ['**/legacy-*'], message: 'Legacy file: do not add new imports' }],
      }],
    },
  },
);

```

### 3.2 Clean rings (client entities and server modules)

Correct dependency direction:

```
domain  <-  ports + application  <-  infrastructure   (implements ports)
                                 <-  model  <-  ui     (get use cases via DI, never infrastructure)

```

- `domain`: imports nothing except `@saucia/domain`.
- `ports` and `application`: may import `domain`, `ports`, `@saucia/*`. Never `infrastructure`, `model`, `ui`.
- `infrastructure`: may import `ports`, `domain`, `@saucia/*`, `@saucia/db-types`.
- `model` / `ui`: never import `infrastructure`.
- Only `client/src/app/di` (and `server/src/composition`) may import infrastructure.

**Explanation.** The ring order puts infrastructure _outside_ application and treats ports as the seam: application depends on ports; infrastructure implements them. `model` and `ui` reach use cases via dependency injection, never by importing infrastructure directly.

`.dependency-cruiser.cjs`:

```
module.exports = {
  forbidden: [
    // ---- client entities ----
    { name: 'client-inner-rings-no-infra', severity: 'error',
      from: { path: '^client/src/entities/[^/]+/(domain|ports|application|model|ui)/' },
      to:   { path: '^client/src/entities/[^/]+/infrastructure/' } },
    { name: 'client-infra-only-from-di', severity: 'error',
      from: { pathNot: '^(client/src/app/di/|client/src/entities/[^/]+/infrastructure/)' },
      to:   { path: '^client/src/entities/[^/]+/infrastructure/' } },
    { name: 'client-domain-pure', severity: 'error',
      from: { path: '^client/src/entities/[^/]+/domain/' },
      to:   { path: '^client/src/entities/[^/]+/(ports|application|infrastructure|model|ui)/' } },

    // ---- server modules ----
    { name: 'server-domain-pure', severity: 'error',
      from: { path: '^server/src/modules/[^/]+/domain/' },
      to:   { path: '^server/src/modules/[^/]+/(application|infrastructure|delivery)/' } },
    { name: 'server-application-no-outer', severity: 'error',
      from: { path: '^server/src/modules/[^/]+/application/' },
      to:   { path: '^server/src/modules/[^/]+/(infrastructure|delivery)/' } },
    { name: 'server-delivery-no-infra', severity: 'error',
      from: { path: '^server/src/modules/[^/]+/delivery/' },
      to:   { path: '^server/src/modules/[^/]+/infrastructure/' } },
    { name: 'server-no-cross-module-internals', severity: 'error',
      from: { path: '^server/src/modules/([^/]+)/' },
      to:   { path: '^server/src/modules/(?!\\1/)[^/]+/(domain|application|infrastructure)/' } },

    // ---- server kernel ----
    { name: 'server-kernel-imports-nothing', severity: 'error',
      from: { path: '^server/src/kernel/' },
      to:   { path: '^server/src/(modules|composition|platform|delivery-shared)/' } },

    // ---- workspace ----
    { name: 'packages-are-leaves', severity: 'error',
      from: { path: '^packages/' }, to: { path: '^(client|server|apps|supabase)/' } },
    { name: 'server-never-imports-client', severity: 'error',
      from: { path: '^server/' }, to: { path: '^client/' } },
    { name: 'client-never-imports-server', severity: 'error',
      from: { path: '^client/' }, to: { path: '^server/' } },

    // packages/kernel is the planned Stage B technical kernel.
    { name: 'packages-kernel-no-apps', severity: 'error',
      from: { path: '^packages/kernel/' },
      to:   { path: '^(client|server|apps|supabase)/' } },
    { name: 'packages-kernel-no-model-packages', severity: 'error',
      from: { path: '^packages/kernel/' },
      to:   { path: '^packages/(domain|contracts|db-types)/' } },
  ],
};

```

**Server kernel.** `server/src/kernel` is the server's dependency sink: `Result`, `DomainError` and the ports. Every server layer may import it; it may not import modules, composition, platform or delivery. `DomainError` carries no HTTP status. `packages/kernel` is a Stage B extraction, gated on a second consumer; it must not import apps, domain, contracts or db-types, and entities/aggregates stay in the app-local domain.

Add **Steiger** (`steiger ./client/src`) for FSD structure. Expect to tune or disable a couple of its rules that assume the default segment vocabulary (`api/model/ui/lib/config`), since the ring names are custom.

**Review points (boundary rules):**

- Run `pnpm arch` before and after; capture the violation count. Show the trend in the write-up.
- Point at one file that was moved or refactored solely because a boundary rule flagged it.
- Explain the ring order in one paragraph: why `infrastructure` is outside `application`, and why only `app/di` touches it.

---

## 4. Config files

> **Status overlay — config files (synced 2026-10-17).**
>
> | Item                                                | Status     | Evidence in tree                                                                                               |
> | :-------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------- |
> | `pnpm-workspace.yaml`                               | ✅ DONE    | Present at root. 🔍 Globs not visible.                                                                         |
> | Root `package.json`                                 | ✅ DONE    | Present. 🔍 Scripts (`dev`, `build`, `lint`, `type-check`, `test`, `arch`, `db:types`) not visible.            |
> | `turbo.json`                                        | ✅ DONE    | Present. 🔍 Task contents not visible.                                                                         |
> | `tsconfig.base.json`                                | ✅ DONE    | Present.                                                                                                       |
> | `packages/*/package.json` (JIT shape)               | ✅ DONE    | `packages/{domain,contracts,db-types}/package.json` exist; contracts declares `@saucia/domain` and `zod`.       |
> | Root `eslint.config.js` / `.dependency-cruiser.cjs` | 🟡 PARTIAL | `.dependency-cruiser.cjs` is at the root and `pnpm arch` is green; root `eslint.config.js` is still missing.    |
> | Vercel project settings                             | 🔍 VERIFY  | `client/vercel.json` and `client/.vercel/` exist; dashboard settings are not visible.                          |
> | `ci.yml` / `deploy.yml`                                 | 🟡 PARTIAL | `.github/workflows/CI.yaml` and `ci.yml` exist; `deploy.yml` is absent.                                        |

`pnpm-workspace.yaml`

```
packages:
  - client
  - server
  - packages/*

```

(Stage B swaps `client`/`server` for `apps/*`.)

**Explanation.** Internal packages are **just-in-time**: `exports` point at TS source, so Vite and Vitest consume them with no build step. This avoids a build-before-dev dance and keeps the package surface honest.

```
// packages/domain/package.json (same shape for contracts, db-types)
{
  "name": "@saucia/domain",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "type-check": "tsc --noEmit", "test": "vitest run" }
}

```

`turbo.json` (Turborepo 2.x uses `tasks`, not `pipeline`)

```
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["tsconfig.base.json", "eslint.config.js"],
  "tasks": {
    "build":      { "dependsOn": ["^build"], "outputs": ["dist/**"], "env": ["VITE_*"] },
    "type-check": { "dependsOn": ["^type-check"], "outputs": [] },
    "lint":       { "outputs": [] },
    "test":       { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "dev":        { "cache": false, "persistent": true }
  }
}

```

**Explanation.** `env: ["VITE_*"]` matters: in strict env mode Turbo hides undeclared variables from the build and can serve a cached bundle built with different `VITE_*` values.

Root `package.json`

```
{
  "name": "saucia",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@<pin the version you use>",
  "scripts": {
    "dev": "turbo run dev --filter=@saucia/client",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "arch": "depcruise client/src server/src packages --config .dependency-cruiser.cjs && steiger ./client/src",
    "db:types": "supabase gen types typescript --local > packages/db-types/src/database.ts"
  }
}

```

**Explanation.** Use current majors of `typescript-eslint`, `eslint`, `turbo`, and `dependency-cruiser` rather than older pins. `db:types` is the single generator for `packages/db-types`; no other command writes to that package.

**Vercel:** set the project root to `client`, install with `pnpm install --frozen-lockfile`, and enable "include source files outside the Root Directory" so `@saucia/*` resolves. In Stage B the root becomes `apps/customer-web` (and a separate project for `apps/admin-dashboard`); deploy config follows the split, and a brief preview outage while the root directory catches up is accepted.

**CI (`ci.yml`)** on every PR: `pnpm install --frozen-lockfile`, then `lint`, `type-check`, `test`, `arch`. **`deploy.yml`** on main: build the edge bundle, `supabase db push`, `supabase functions deploy`.

**Review points (config files):**

- Show `turbo run build --dry-run=json` and explain the task graph.
- Show the `arch` script output before and after Phase 1; the deltas are the story.
- Explain why internal packages point at TS source instead of `dist/`.

---

## 5. Edge functions: legacy -> new

> **Status overlay — edge functions (synced 2026-10-08).** New entry stubs exist at `supabase/functions/{auth-handlers,cron-jobs,order-processing,payment-webhook,subscription-mgmt}/index.ts`; none is ported or wired to a bundle. Legacy functions are quarantined at `_legacy/edge-functions/`.
>
> | Legacy function                                  | Status     | Evidence in tree                                                                                                 |
> | :----------------------------------------------- | :--------- | :--------------------------------------------------------------------------------------------------------------- |
> | `process-order`                                  | 🟡 PARTIAL | `SubmitOrder` exists in the server; `order-processing` stub exists; not wired.                                   |
> | `manage-order`                                   | 🟡 PARTIAL | `UpdateOrderStatus` exists in the server; same stub; not wired.                                                  |
> | `list-orders`                                    | ⬜ OPEN    | No `ListOrders` use case.                                                                                        |
> | `track-last-order`                               | ⬜ OPEN    | No `GetLastOrder` use case (open question 3: needs server logic).                                                |
> | `order-delivery`                                 | ⬜ OPEN    | No delivery route; plan says to confirm what it does.                                                            |
> | `subscription-orders`                            | 🟡 PARTIAL | `cron-jobs` and `subscription-mgmt` stubs exist; no logic.                                                       |
> | `support-chat`, `support-websocket`              | ⬜ OPEN    | No `support` module or function.                                                                                 |
> | `trial`                                          | ⬜ OPEN    | Still present under `_legacy/edge-functions/trial/` (quarantined, not deleted).                                  |
> | `auth-handlers`                                  | ℹ️ NOTE    | A stub folder exists; section 5 says 'do not create yet'. Recorded in section 10.                                |
> | `payment-webhook`, `notifications`               | 🟡 PARTIAL | `payment-webhook` stub exists; no `notifications` function.                                                      |
> | Deno interop spike                               | ⬜ OPEN    | See P0.8.                                                                                                        |
> | Secrets: remove `client/supabase/functions/.env` | ✅ DONE    | No longer at that path. 🔍 `_legacy/edge-functions/.env` still on disk; `supabase secrets set` usage unverified. |

Supabase recommends fewer, "fatter" functions (fewer cold starts, shared code). Each deployed function becomes a thin entry that delegates to the server bundle's router.

| Legacy (`client/supabase/functions`) | New home                                                                             | Note                                                               |
| :----------------------------------- | :----------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `process-order`                      | `order-processing` -> `SubmitOrder`                                                  | Exists in server                                                   |
| `manage-order`                       | `order-processing` -> `UpdateOrderStatus`                                            | Exists in server                                                   |
| `list-orders`                        | `order-processing` -> new `ListOrders` use case                                      | Or a plain RLS-protected client query if no server logic is needed |
| `track-last-order`                   | `order-processing` -> new `GetLastOrder`                                             | Same RLS question                                                  |
| `order-delivery`                     | `order-processing` -> delivery route                                                 | Confirm what it does                                               |
| `subscription-orders`                | `cron-jobs` (scheduled order generation) + `subscription-mgmt` (enroll/pause/resume) | <br />                                                             |
| `support-chat`                       | `support`                                                                            | Needs a `support` module                                           |
| `support-websocket`                  | `support` (separate function for the WS upgrade)                                     | Evaluate replacing with Supabase Realtime + RLS                    |
| `trial`                              | delete                                                                               | Scratch                                                            |
| `auth-handlers`                      | do not create yet                                                                    | Google login + profile completion can be client + RLS/trigger      |
| `payment-webhook`, `notifications`   | create together with their modules                                                   | <br />                                                             |

(Mappings are inferred from function names; confirm each before porting.)

### Deno interop: spike this in Phase 0, before porting anything

Server code is TS in a pnpm workspace, but edge functions run on Deno. Three things break naively:

1. Deno needs explicit `.ts` extensions on relative imports; the packages use bundler-style extensionless imports.
2. Deno does not understand `workspace:*` links to `@saucia/domain`.
3. Depending on CLI version and bundling mode, imports from outside `supabase/` may not deploy.

**Recommended approach.** `server/runtimes/supabase-edge` builds one ESM bundle (tsup/esbuild) with domain, contracts, and the server composition inlined, written to `supabase/functions/_shared/`. Each function entry is then:

```
// supabase/functions/order-processing/index.ts
import { handlers } from '../_shared/server.js';
Deno.serve(handlers.order);

```

**Explanation.** The bundle is generated, so gitignore it and build it in `deploy.yml` and locally (`tsup --watch` alongside `supabase functions serve`). Exit criterion for the spike: one function importing `@saucia/domain` (`Money`) deploys and runs. If the bundle approach fails, the fallback is `deno.json` import maps with `.ts` extensions throughout the packages.

Secrets: use `supabase secrets set`; remove `client/supabase/functions/.env`.

**Review points (edge functions):**

- Show the Deno spike result: the deployed function URL, the log line proving `Money` was imported from `@saucia/domain`.
- Show one legacy function and its new entry side by side; the new entry should be a few lines.
- Document the fallback (import maps) and the condition that would trigger it.

---

## 6. Where the 3D landing system lives

> **Status overlay — 3D landing system (synced 2026-10-20, Revision 4).**
>
> | Target                                                | Status  | Evidence in tree                                                                                             |
> | :---------------------------------------------------- | :------ | :----------------------------------------------------------------------------------------------------------- |
> | `shared/ui/three/ThreeDisplay.tsx`                    | ✅ DONE | Typed port of `_legacy/client/src/Components/ThreeScene.jsx` plus `types.ts`; config is a prop, so it has no page knowledge. |
> | `pages/home/ui/DiscreteLandingPage.tsx`               | ✅ DONE | Owns active segment, camera target, scroll and focus; renders `ThreeDisplay`.                                 |
> | `pages/home/config/{landingConfig,modelsConfig}.json` | ✅ DONE | Copied from `_legacy/client/src/Pages/NewLanding/`; the missing `fruit_salad.glb` entry was removed.         |
> | GLTF files in `client/public/models/`                 | ✅ DONE | 19 `.glb` files present (unused `customize.glb` and `planet.glb` removed).                                   |
>
> Also live: `pages/home/ui/Section.tsx`, `pages/home/model/useDiscreteScroll.ts`, `shared/lib/useClickSpark.ts`, and `shared/i18n/locale.ts` (`useLocale`) replacing the legacy `I18nContext` import.

- `shared/ui/three/ThreeDisplay.tsx`: generic renderer, no business knowledge (shared may not import upward).
- `pages/home/ui/DiscreteLandingPage.tsx`: owns camera authority and segment/scroll logic (page-level composition).
- `pages/home/config/{landingConfig,modelsConfig}.json`: scene composition and per-model config, next to the only consumer.
- GLTF files in `client/public/models/` so the prefetch worker can fetch them by URL instead of the bundler inlining them.

**Explanation.** The generic renderer goes to `shared/` because it has no business knowledge and can be reused. The page-level composition stays in `pages/home` because camera authority and scroll logic belong to a single page. If a second page ever needs the scene, promote it to `widgets/landing-scene`.

**Review points (3D landing):**

- Show the import graph for the landing system: `pages/home` -> `shared/ui/three`, never the reverse.
- Show the bundle-size delta between inlining GLTFs and serving them from `public/models/`.

---

## 7. Phased roadmap

### Phase 0: hygiene and wiring (no behavior change)

> **Status overlay — Phase 0 (synced 2026-10-17):** 🟡 IN PROGRESS — 6 ✅ · 1 🟡 · 1 🔍 · 1 ⬜
>
> | ID   | Task (first column of the table below, verbatim)                                                                                                                         | Status     | Evidence in tree                                                                                                                                                                                                                                                                                                                       |
> | :--- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | P0.1 | Add root `package.json`, `turbo.json`, `tsconfig.base.json`; delete `client/package-lock.json`; generate `pnpm-lock.yaml`                                                | ✅ DONE    | Root manifests and `pnpm-lock.yaml` present; `client/package-lock.json` absent; `pnpm install --frozen-lockfile` passes. |
> | P0.2 | Rename `client/vite.config.js` -> `.ts`; give `client` the name `@saucia/client`, `server` -> `@saucia/server`                                                           | ✅ DONE    | `client/vite.config.ts` exists (no `.js`). 🔍 Confirm `name` fields are `@saucia/client` / `@saucia/server`.                                                                                                                                                                                                                           |
> | P0.3 | Delete root `public/` (built output); gitignore build dirs. If `_headers` is intentional, port it to `client/vercel.json` headers                                        | ✅ DONE    | No root `public/`; the old output now sits at `_legacy/public/`. `client/public/_headers` and `client/vercel.json` exist. 🔍 Confirm build dirs are gitignored and the `_headers` decision is settled.                                                                                                                                 |
> | P0.4 | Move `Saucia-phase2 (1).md` into `docs/adr/`; keep `_legacy/` and `docs/legacy/` but out of workspace globs                                                              | ✅ DONE    | Plan lives at `docs/adr/saucia-phase2.md`; `_legacy/` and `docs/legacy/{docs-2,root-docs}` kept. 🔍 Confirm `pnpm-workspace.yaml` globs exclude them.                                                                                                                                                                                  |
> | P0.5 | Consolidate DB: everything under `supabase/`; move `server/database/seed/legacy-seed-data` to `supabase/seed/`; delete the empty `server/database` migration/policy dirs | ✅ DONE    | No `server/database/`; seed JSON is under `supabase/seed/` (5 files); `supabase/migrations/` and `supabase/config.toml` exist. `migrations/` is empty (content arrives in Phase 2).                                                                                                                                                    |
> | P0.6 | Move `client/supabase/functions/*` to `_legacy/edge-functions/` (still deployable from there until ported); gitignore `.temp`                                            | ✅ DONE    | No `client/supabase/`; functions quarantined at `_legacy/edge-functions/` (all 9 functions plus `deno.json`, `deno.lock`, `.env`, `.env.example`). 🔍 Confirm `.temp` is gitignored.                                                                                                                                                   |
> | P0.7 | Verify `.env` files are ignored and never committed; rotate if needed                                                                                                    | 🔍 VERIFY  | Not provable from a tree. `.env` files visible on disk: `client/.env`, `client/.env.example`, `_legacy/edge-functions/.env`. `client/supabase/functions/.env` no longer exists at that path. Needs a manual gitignore + git-history check (and key rotation if ever committed).                                                        |
> | P0.8 | Run the Deno interop spike (section 5)                                                                                                                                   | ⬜ OPEN    | `supabase/functions/_shared/` and `server/runtimes/supabase-edge/` each hold only `.gitkeep`; no bundler config visible. Entry stubs exist for `order-processing`, `cron-jobs`, `subscription-mgmt`, `payment-webhook`, `auth-handlers`, but no recorded proof that `Money` was imported from `@saucia/domain` in a deployed function. |
> | P0.9 | Remove empty scaffolding folders (or keep them with `.gitkeep` only where you will fill them this week)                                                                  | ✅ DONE (Revision 4) | Every remaining empty directory in the live tree carries a `.gitkeep`: `server/src/delivery-shared/http`, `server/src/modules/{identity,menu,notification,payment,subscription}`, `server/src/modules/order/domain/errors`, `server/src/modules/order/infrastructure/supabase/{dto,mappers}`, `server/src/platform/{email,stripe,supabase}`. 12 placeholders, 0 unmarked empty directories. Client slices hold `index.ts`. |
>
> **Exit status:** 🟡 PARTIAL — install/type-check/test/arch pass; build and Vercel preview not re-run in Revision 2.

| Task                                                                                                                                                                     | Suggested legacy reference (from `_legacy/`)                                                                                                                                                                                                                                                                                                                                                                                                     | Explanation                                                                                                     |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| Add root `package.json`, `turbo.json`, `tsconfig.base.json`; delete `client/package-lock.json`; generate `pnpm-lock.yaml`                                                | `_legacy/client/package.json`, `_legacy/client/package-lock.json`                                                                                                                                                                                                                                                                                                                                                                                | The workspace exists but nothing is wired; the root files make `pnpm install && pnpm build` meaningful.         |
| Rename `client/vite.config.js` -> `.ts`; give `client` the name `@saucia/client`, `server` -> `@saucia/server`                                                           | `_legacy/client/vite.config.js`, `_legacy/client/package.json`, `_legacy/client/.vercel/project.json`, `_legacy/client/.vercel/README.txt`                                                                                                                                                                                                                                                                                                       | Workspace packages need stable names for `workspace:*` references and Turbo filters.                            |
| Delete root `public/` (built output); gitignore build dirs. If `_headers` is intentional, port it to `client/vercel.json` headers                                        | `_legacy/public/assets/*.js`, `_legacy/public/index.html`, `_legacy/public/vite.svg`, `_legacy/public/_headers` (also `_legacy/_headers`), `_legacy/client/vercel.json`                                                                                                                                                                                                                                                                          | `public/` at the repo root is committed build output from the legacy app; it does not belong in source control. |
| Move `Saucia-phase2 (1).md` into `docs/adr/`; keep `_legacy/` and `docs/legacy/` but out of workspace globs                                                              | `_legacy/docs-2/*` (database-documentation.md, schema.json, `Subscription and ordering system.pdf`, `Support Chat System Documentation.pdf`, test.sql, test1.md), `_legacy/root-docs/*` (about-saucia.md, client-structure.md, model.json, README.md, Supabase-models.md, upcoming.md), `_legacy/about-saucia.md`, `_legacy/client-structure.md`, `_legacy/model.json`, `_legacy/README.md`, `_legacy/Supabase-models.md`, `_legacy/upcoming.md` | Keeps the plan discoverable without polluting the workspace.                                                    |
| Consolidate DB: everything under `supabase/`; move `server/database/seed/legacy-seed-data` to `supabase/seed/`; delete the empty `server/database` migration/policy dirs | `_legacy/seed-data/fruits_items.json`, `_legacy/seed-data/items.json`, `_legacy/seed-data/ItemsToImport.json`, `_legacy/seed-data/meals.json`, `_legacy/seed-data/Menu.json`                                                                                                                                                                                                                                                                     | Three migration locations is three sources of truth; the CLI only applies files under `supabase/migrations/`.   |
| Move `client/supabase/functions/*` to `_legacy/edge-functions/` (still deployable from there until ported); gitignore `.temp`                                            | `_legacy/edge-functions/{list-orders, manage-order, order-delivery, process-order, subscription-orders, support-chat, support-websocket, track-last-order, trial}/` (each with `deno.json`, `index.ts`; some with `.npmrc`), `_legacy/edge-functions/{deno.json, deno.lock, .env, .env.example}`, `_legacy/client/supabase/.temp/*`, `_legacy/client/supabase/.gitignore`                                                                        | Quarantines legacy code without losing deployability.                                                           |
| Verify `.env` files are ignored and never committed; rotate if needed                                                                                                    | `_legacy/client/.env`, `_legacy/edge-functions/.env`, `_legacy/edge-functions/.env.example`, `_legacy/client/.gitignore`, `_legacy/client/supabase/.gitignore`                                                                                                                                                                                                                                                                                   | Secrets hygiene is a one-time check that prevents a much larger incident.                                       |
| Run the Deno interop spike (section 5)                                                                                                                                   | `_legacy/edge-functions/{process-order, manage-order, list-orders, track-last-order}/index.ts`, `_legacy/edge-functions/{process-order, manage-order}/deno.json`                                                                                                                                                                                                                                                                                 | The spike's outcome determines the shape of every later edge-function task.                                     |
| Remove empty scaffolding folders (or keep them with `.gitkeep` only where you will fill them this week)                                                                  | `_legacy/client/src/Pages/Admin/admin-assets/` (empty), `_legacy/client/src/assets/fonts/Outfit/static/` (empty)                                                                                                                                                                                                                                                                                                                                 | Git does not track empty directories; scaffolding ahead of the first file creates noise.                        |

**Exit.** `pnpm install && pnpm build && pnpm type-check` pass from the root; Vercel preview builds from the workspace.

**Review points (Phase 0).**

- `pnpm install` completes from a clean clone; the lockfile is committed.
- `turbo run build --dry-run=json` shows the expected task graph.
- A one-paragraph "before/after" diff of the repo root.
- The Deno spike result documented (success or fallback).
- A short note on the secrets audit: what was checked, what was rotated.

---

### Phase 1: enforce boundaries on what exists

> **Status overlay — Phase 1 (synced 2026-10-18):** 🟡 STARTED (2 ✅ · 3 🟡 · 1 ⬜)
>
> | ID   | Task (first column of the table below, verbatim)                                                                                                  | Status     | Evidence in tree                                                                                                                                                                                                                                                                                                                                                                                                  |
> | :--- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | P1.1 | Add the ESLint boundary config, dependency-cruiser rules, Steiger; add `ci.yml`. Start with rules as `warn`, fix violations, then flip to `error` | 🟡 PARTIAL | `.dependency-cruiser.cjs`, `steiger.config.cjs` and CI workflows exist; `pnpm arch` is green. Root ESLint boundaries and Steiger enforcement are still missing. |
> | P1.2 | Single source for order status: define in `packages/domain/order`; derive the contracts enum from it; delete the server's duplicate               | ✅ DONE    | `packages/domain/src/order/orderRules.ts` owns values/transitions; `packages/contracts/src/order/orderStatus.ts` derives the Zod schema; `server/.../OrderStatus.ts` is a re-export facade. 6 domain + 3 contract tests pass. |
> | P1.3 | Diff `client/shared/kernel/Result.ts` vs `server/src/kernel/Result.ts`; if identical, move to `@saucia/domain` (kernel) and import from both      | ✅ DONE (Revision 4, decision 9) | The client file was a `const Result = {}` placeholder, never a real duplicate. It is deleted; `client/src/shared/kernel/index.ts` exports `AppError` only and records the server kernel as owner. `server/src/kernel` is canonical; `packages/kernel` stays deferred until a second real consumer. |
> | P1.4 | Resolve duplicate `SessionProvider`; keep the provider in `app/providers` and the state/hooks in `entities/session/model`                         | ✅ DONE (Revision 4) | `client/src/app/providers/SessionProvider.tsx` is the provider shell; `client/src/entities/session/model/sessionContext.ts` owns `SessionState`, `SessionContext` and `useSession`. The duplicate file is deleted and `entities/session/index.ts` exports the state API. |
> | P1.5 | Add `packages/db-types` and wire `db:types`                                                                                                       | ✅ DONE    | `packages/db-types/` exists with `package.json`, `src/database.ts`, `src/index.ts`. 🔍 Confirm the `db:types` script is wired in the root `package.json` and one consumer imports the package.                                                                                                                                                                                                                    |
> | P1.6 | Asset cleanup and relocate the 3D system (section 6)                                                                                              | ✅ DONE (Revision 4) | 0 byte-identical asset groups; 11 duplicate admin copies removed; one canonical hero per slot (`heroA..heroE`, no `*_compressed` names); `hero-*.json` removed; Asap static weights pruned to the variable fonts (Zain kept); 19 GLBs. 3D system live in `shared/ui/three` + `pages/home` (section 6). |
>
> **Exit status:** 🟡 PARTIAL — `pnpm arch` is green (0 violations, 1634 modules) and the legacy-file count is 0. Only P1.1 (root ESLint/Steiger enforcement) remains.

| Task                                                                                                                                              | Suggested legacy reference (from `_legacy/`)                                                                                                                                                                                                                                                                                        | Explanation                                                                                                                  |
| :------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| Add the ESLint boundary config, dependency-cruiser rules, Steiger; add `ci.yml`. Start with rules as `warn`, fix violations, then flip to `error` | `_legacy/client/eslint.config.js`, `_legacy/client/.prettierrc`, `_legacy/.github/workflows/` (empty), `_legacy/.vscode/settings.json`, `_legacy/client/.vscode/{extensions.json, settings.json}`                                                                                                                                   | Moving rules to `error` before the codebase is clean blocks every PR; starting at `warn` lets the fix land in small batches. |
| Single source for order status: define in `packages/domain/order`; derive the contracts enum from it; delete the server's duplicate               | `_legacy/Supabase-models.md`, `_legacy/model.json`, `_legacy/client-structure.md`, `_legacy/docs-2/{database-documentation.md, schema.json}`                                                                                                                                                                                        | Three definitions of the same enum drift; one source with derivation ends the drift.                                         |
| Diff `client/shared/kernel/Result.ts` vs `server/src/kernel/Result.ts`; if identical, move to `@saucia/domain` (kernel) and import from both      | `_legacy/client/src/API/*.jsx` (for current error/response shapes)                                                                                                                                                                                                                                                                  | Duplicate kernel types are a symptom of missing ownership, not a design choice.                                              |
| Resolve duplicate `SessionProvider`; keep the provider in `app/providers` and the state/hooks in `entities/session/model`                         | `_legacy/client/src/Contexts/AuthContext.jsx`, `_legacy/client/supabaseClient.jsx`, `_legacy/client/src/lib/otpService.js`, `_legacy/client/src/Pages/Auth/{Auth.jsx, AuthCallback.jsx, CompleteProfile.jsx, OTPAuth.jsx}`                                                                                                          | The provider is composition; the state is domain-adjacent. Splitting by role is the FSD-aligned fix.                         |
| Add `packages/db-types` and wire `db:types`                                                                                                       | `_legacy/docs-2/schema.json`, `_legacy/docs-2/database-documentation.md`, `_legacy/Supabase-models.md`, `_legacy/model.json`                                                                                                                                                                                                        | Generated types replace hand-written row types and stay in sync with the schema.                                             |
| Asset cleanup and relocate the 3D system (section 6)                                                                                              | `_legacy/client/src/assets/{admin,menu,hero,icons,premium,about,fonts}/*`, `_legacy/client/src/Pages/NewLanding/*`, `_legacy/client/src/Pages/Home/Hero/*`, `_legacy/client/src/Components/ThreeDisplayer.jsx`, `_legacy/client/public/models/*.glb`, `_legacy/client/public/fonts/{Asap,Zain}/*`, `_legacy/client/public/_headers` | Assets have drifted into duplicates; the 3D system has no home yet.                                                          |

**Exit.** `pnpm arch` and `pnpm lint` green in CI with rules at `error`; zero new imports of `legacy-*` files.

**Review points (Phase 1).**

- Show the violation count before (`warn`) and after (`error`) for each rule.
- Point at one file deleted because of the order-status dedup and one file created (`packages/domain/order`).
- Show the `Result` diff; if the two were identical, show the single canonical file.
- Show the `db:types` output and one consumer using it.
- Attach the asset-cleanup diff: files removed, references updated.

---

### Phase 2: vertical slice #1, order submission (the money path)

> **Status overlay — Phase 2 (synced 2026-10-17):** 🟡 STARTED — domain and contracts complete; server/DB/edge/client wiring remains (5 🟡 · 1 ⬜)
>
> | ID   | Task (first column of the table below, verbatim)                                                                                           | Status     | Evidence in tree                                                                                                                                                                                                                                                |
> | :--- | :----------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | P2.1 | Contract: `submitOrder.schema` validated on the server; error codes mapped to i18n keys on the client                                      | 🟡 PARTIAL | `submitOrderSchema`, response schema and `ErrorCode`/`ErrorResponse` are implemented and tested (7 + 4 tests). Server-side validation and client code→i18n mapping are still unwired. |
> | P2.2 | Server: `SubmitOrder` recomputes totals with `computeOrderTotals` from current meal prices (`MealPriceReader`); never trusts client totals | 🟡 PARTIAL | Domain `Money` + `computeOrderTotals` are implemented and tested (14 tests across money/totals). Server `SubmitOrder.ts` is still a TODO and `modules/menu` has no `MealPriceReader` implementation. |
> | P2.3 | DB: trigger/constraint enforcing totals invariants; RLS for user isolation (as migrations)                                                 | ⬜ OPEN    | `supabase/migrations/` is empty — no trigger/constraint or RLS migrations yet.                                                                                                                                                                                  |
> | P2.4 | Edge: `order-processing` function via the bundle; port `process-order`, `manage-order`, `list-orders`, `track-last-order`                  | 🟡 PARTIAL | Stub `supabase/functions/order-processing/index.ts` exists. Gated on the Phase 0 Deno spike (P0.8); no bundle. `list-orders`, `track-last-order`, `order-delivery` remain in `_legacy/edge-functions/` with no new use cases.                                   |
> | P2.5 | Client: `features/submit-order` and `entities/order` call the edge function via `shared/api/edgeClient` with `errorNormalizer`             | 🟡 PARTIAL | `client/src/shared/api/{edgeClient.ts,errorNormalizer.ts}` and `entities/order/infrastructure/SupabaseOrderRepository.ts` exist; `features/submit-order` holds only `index.ts`; `entities/order` has no `model/` yet.                                           |
> | P2.6 | Tests: domain unit tests, server use-case tests with in-memory ports, one contract test                                                    | 🟡 PARTIAL | 46 domain tests and 22 contract tests pass. Server use-case tests with in-memory ports are still missing. |
>
> **Exit status:** ⬜ NOT MET — domain/contract layers are complete; server use cases, DB migrations, edge bundle and client features are not.

| Task                                                                                                                                       | Suggested legacy reference (from `_legacy/`)                                                                                                                                                                                                                                                                                                                                                                                          | Explanation                                                                                                                |
| :----------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Contract: `submitOrder.schema` validated on the server; error codes mapped to i18n keys on the client                                      | `_legacy/edge-functions/process-order/index.ts`, `_legacy/edge-functions/manage-order/index.ts`, `_legacy/client/src/API/orderAPI.jsx`, `_legacy/client/dict.json`                                                                                                                                                                                                                                                                    | Validation at the wire boundary stops malformed payloads from reaching use cases; error codes keep messages client-owned.  |
| Server: `SubmitOrder` recomputes totals with `computeOrderTotals` from current meal prices (`MealPriceReader`); never trusts client totals | `_legacy/client/src/API/{orderAPI.jsx, mealAPI.jsx, itemAPI.jsx}`, `_legacy/client/src/Hooks/useOrders.jsx`, `_legacy/client/src/Pages/Cart/{CartPage.jsx, OrderStatusTracker.jsx}`                                                                                                                                                                                                                                                   | Client totals are display-only; the server is the authority on money.                                                      |
| DB: trigger/constraint enforcing totals invariants; RLS for user isolation (as migrations)                                                 | `_legacy/docs-2/{schema.json, database-documentation.md, test.sql}`, `_legacy/docs-2/Subscription and ordering system.pdf`                                                                                                                                                                                                                                                                                                            | Invariants the server relies on should also hold at the DB layer, and RLS is the isolation mechanism for user-scoped data. |
| Edge: `order-processing` function via the bundle; port `process-order`, `manage-order`, `list-orders`, `track-last-order`                  | `_legacy/edge-functions/process-order/index.ts`, `_legacy/edge-functions/manage-order/index.ts`, `_legacy/edge-functions/list-orders/index.ts`, `_legacy/edge-functions/track-last-order/index.ts`, `_legacy/edge-functions/order-delivery/index.ts`, `_legacy/edge-functions/deno.json`, `_legacy/edge-functions/deno.lock`                                                                                                          | One fatter function replaces four thin ones; the bundle carries the shared code.                                           |
| Client: `features/submit-order` and `entities/order` call the edge function via `shared/api/edgeClient` with `errorNormalizer`             | `_legacy/client/src/API/orderAPI.jsx`, `_legacy/client/src/Hooks/useOrders.jsx`, `_legacy/client/src/Components/Cart.jsx`, `_legacy/client/src/Contexts/CartContext.jsx`, `_legacy/client/src/Pages/Checkout/{CheckoutPage.jsx, CheckoutPlan.jsx, MealPlanCard.jsx, ConfirmPlanModal.jsx, DeliveryTimeSelector.jsx, AddressesList.jsx, MapModal.jsx, SubscriptionSummarySection.jsx}`, `_legacy/client/src/Components/Map/MapBox.jsx` | One client for edge calls and one normalizer for error shapes keeps error handling consistent.                             |
| Tests: domain unit tests, server use-case tests with in-memory ports, one contract test                                                    | `_legacy/client/src/API/orderAPI.jsx` (as behaviour reference), `_legacy/edge-functions/process-order/index.ts`                                                                                                                                                                                                                                                                                                                       | In-memory ports make use-case tests fast and deterministic; a contract test pins the wire shape.                           |

**Exit.** Checkout works end to end against local Supabase; client-computed totals are display-only.

**Review points (Phase 2).**

- End-to-end demo: place an order locally, show the row in Supabase, show the recomputed totals on the server.
- Test pyramid screenshot: domain unit tests, use-case tests, one contract test.
- Show one place where a client-computed total is displayed but not trusted.
- Show the DB trigger/constraint that mirrors the server invariant.

---

### Phase 3: menu and admin management

> **Status overlay — Phase 3 (synced 2026-10-08):** ⬜ NOT STARTED (3 ⬜)
>
> | ID   | Task (first column of the table below, verbatim)                                              | Status  | Evidence in tree                                                                                                                                                                                                    |
> | :--- | :-------------------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | P3.1 | `server/modules/menu`; `MealPriceReader` backed by it                                         | ⬜ OPEN | `server/src/modules/menu/` is empty. Seed data is in `supabase/seed/`.                                                                                                                                              |
> | P3.2 | Admin features (`admin-create-meal`, `admin-update-order-status`) moved onto server use cases | ⬜ OPEN | Placeholders only: `features/admin-update-order-status/index.ts`, `widgets/admin-meals-manager/index.ts`, `widgets/admin-orders-board/index.ts`, `pages/admin/index.ts`. No `admin-create-meal` feature folder yet. |
> | P3.3 | Keep admin lazy-loaded                                                                        | ⬜ OPEN | Depends on the admin page existing; nothing to verify yet.                                                                                                                                                          |

| Task                                                                                          | Suggested legacy reference (from `_legacy/`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Explanation                                                                                                          |
| :-------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| `server/modules/menu`; `MealPriceReader` backed by it                                         | `_legacy/client/src/API/{itemAPI.jsx, mealAPI.jsx, allergiesAPI.jsx, dietaryPreferencesAPI.jsx}`, `_legacy/seed-data/{meals.json, Menu.json, items.json, fruits_items.json, ItemsToImport.json}`, `_legacy/docs-2/schema.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | The reader is the seam the order module depends on; backing it with a real menu module keeps the order module clean. |
| Admin features (`admin-create-meal`, `admin-update-order-status`) moved onto server use cases | `_legacy/client/src/API/{adminAPI.jsx, adminInstantOrdersAPIs.jsx, imageUtils.jsx}`, `_legacy/client/src/Hooks/{useAdminFunctions.jsx, useAdminOrders.jsx, setUserMenuFiltering.jsx, useEntityConfigs.jsx, useEntityManager.jsx}`, `_legacy/client/src/Pages/Admin/{Admin.jsx, OrderForm.jsx, DietaryPreferenceForm.jsx, MenPDF.jsx, InstantOrdersSchedule.jsx, DailySceduleDashboard.jsx, AdminAddressManager.jsx}`, `_legacy/client/src/Pages/Admin/Forms/{AllergyForm.jsx, ItemForm.jsx, MealsForm.jsx, PlanForm.jsx, SubscriptionForm.jsx, UserForm.jsx}`, `_legacy/client/src/Pages/Admin/Shared/AdminComponents.jsx`, `_legacy/client/src/Components/{Cards.jsx, ItemsCarousel.jsx}`, `_legacy/client/src/Pages/Menu/{MenuPage.jsx, CustomizableCard.jsx, CustomizableMealModal.jsx, menuData.json}` | Admin writes should flow through the same use-case layer as customer writes; no direct DB writes from the admin UI.  |
| Keep admin lazy-loaded                                                                        | `_legacy/client/src/Pages/Admin/*`, `_legacy/client/src/API/{adminAPI.jsx, adminInstantOrdersAPIs.jsx, adminSubscriptionAPI.jsx}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Admin code should not inflate the customer bundle; lazy loading is the cheapest way to enforce that.                 |

**Review points (Phase 3).**

- Show the `MealPriceReader` port and its menu-module implementation.
- Show one admin feature calling a server use case instead of the DB.
- Show the customer bundle's admin chunk is lazy-loaded (network panel).

---

### Phase 4: subscriptions

> **Status overlay — Phase 4 (synced 2026-10-17):** 🟡 STARTED — domain/contracts complete; porting and client features remain (1 ✅ · 2 ⬜)
>
> | ID   | Task (first column of the table below, verbatim)                                                                   | Status     | Evidence in tree                                                                                                                                                                                  |
> | :--- | :----------------------------------------------------------------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | P4.1 | Port `subscription-orders` to `cron-jobs` (scheduled order generation) + `subscription-mgmt` (enroll/pause/resume) | ⬜ OPEN    | Stubs `supabase/functions/{cron-jobs,subscription-mgmt}/index.ts` exist; `server/src/modules/subscription/` is empty; legacy `subscription-orders` is unported.                                   |
> | P4.2 | Move plan calculations behind `@saucia/domain`                                                                     | ✅ DONE    | `BMICalculator`, `TDEECalculator` and `NutritionCalculator` (macros/profile) are implemented and tested (14 tests). Client wiring remains P4.3. |
> | P4.3 | `features/enroll-subscription`, `features/calculate-health-plan`, `widgets/subscription-dashboard`                 | ⬜ OPEN    | Placeholders only: `features/enroll-subscription/index.ts`, `features/calculate-health-plan/index.ts`, `widgets/subscription-dashboard/index.ts`, `entities/subscription/index.ts`.               |

| Task                                                                                                               | Suggested legacy reference (from `_legacy/`)                                                                                                                                                                                                                                                                                                                                                                                | Explanation                                                                                                            |
| :----------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| Port `subscription-orders` to `cron-jobs` (scheduled order generation) + `subscription-mgmt` (enroll/pause/resume) | `_legacy/edge-functions/subscription-orders/index.ts`, `_legacy/edge-functions/subscription-orders/deno.json`, `_legacy/client/src/API/{planAPI.jsx, adminSubscriptionAPI.jsx}`, `_legacy/client/src/Hooks/{useUserSubscriptions.jsx, useAdminSubscription.jsx}`                                                                                                                                                            | Scheduled generation and user-initiated management are different concerns; splitting them keeps each function focused. |
| Move plan calculations behind `@saucia/domain`                                                                     | `_legacy/client/src/Pages/Premium/JoinPlan/{nutritionCalculator.jsx, dataIntegrityUtils.jsx, JoinPlanPage.jsx, CommonQuestions.jsx}`, `_legacy/client/src/Pages/Premium/{orderUtils.jsx, planImageUtils.jsx, PlanCard.jsx, PlanSettingsModal.jsx, PlanAvatar.jsx}`                                                                                                                                                          | Plan math is pure rules; it belongs where it can be tested without a runtime.                                          |
| `features/enroll-subscription`, `features/calculate-health-plan`, `widgets/subscription-dashboard`                 | `_legacy/client/src/Pages/Premium/{PremiumPage.jsx, CurrentPlanBrief.jsx, JoinPremiumTeaser.jsx, PurchasePortal.jsx, PaymentInstructions.jsx, TestOrders.jsx, premiumModelsConfig.json}`, `_legacy/client/src/Pages/Premium/JoinPlan/*`, `_legacy/client/src/Contexts/ChosenPlanContext.jsx`, `_legacy/client/src/Pages/Dashboard/{UserDashboard.jsx, DashboardSections.jsx, DashboardComponents.jsx, UserAccountPage.jsx}` | Each feature owns one user action; the dashboard widget composes them.                                                 |

**Review points (Phase 4).**

- Show the cron function and one subscription-mgmt call side by side.
- Show domain tests for plan calculations; no network, no DB.
- Show the subscription dashboard composed from the two features.

---

### Phase 5: support chat

> **Status overlay — Phase 5 (synced 2026-10-08):** ⬜ NOT STARTED (2 ⬜)
>
> | ID   | Task (first column of the table below, verbatim)                                                                                         | Status  | Evidence in tree                                                                                                                                 |
> | :--- | :--------------------------------------------------------------------------------------------------------------------------------------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------- |
> | P5.1 | New `server/modules/support`; decide WebSocket function vs Supabase Realtime; client `entities/message`, `features/send-support-message` | ⬜ OPEN | No `server/src/modules/support/`; no `support` function; `entities/message/index.ts` is a placeholder; no `send-support-message` feature folder. |
> | P5.2 | Extract `packages/realtime` only if a second app needs it                                                                                | ⬜ OPEN | Gated on a second consumer; no `packages/realtime/`.                                                                                             |

| Task                                                                                                                                     | Suggested legacy reference (from `_legacy/`)                                                                                                                                                                                                                                                                           | Explanation                                                                                                          |
| :--------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| New `server/modules/support`; decide WebSocket function vs Supabase Realtime; client `entities/message`, `features/send-support-message` | `_legacy/edge-functions/support-chat/index.ts`, `_legacy/edge-functions/support-websocket/index.ts`, `_legacy/client/src/Hooks/useSupportChat.jsx`, `_legacy/client/src/Pages/Admin/AdminSupportPortal.jsx`, `_legacy/client/src/Pages/Home/SupportPortal.jsx`, `_legacy/docs-2/Support Chat System Documentation.pdf` | The transport choice is behind an adapter; the client and server depend on the adapter interface, not on the vendor. |
| Extract `packages/realtime` only if a second app needs it                                                                                | `_legacy/edge-functions/support-websocket/index.ts`, `_legacy/client/src/Hooks/useSupportChat.jsx`                                                                                                                                                                                                                     | One consumer keeps the code local; extraction on the second consumer avoids a premature abstraction.                 |

**Review points (Phase 5).**

- Show the transport adapter interface and both possible implementations.
- Show the chat feature in isolation; the transport is swappable.
- Document the decision (WebSocket vs Realtime) and the condition that would reverse it.

---

### Phase 6: payments and notifications

> **Status overlay — Phase 6 (synced 2026-10-08):** ⬜ NOT STARTED (1 ⬜ · 1 🟡 stub)
>
> | ID   | Task (first column of the table below, verbatim)                                                                                                             | Status     | Evidence in tree                                                                                                                                                                       |
> | :--- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | P6.1 | Name adapters by port (`PaymentGateway`, `Mailer`), not by vendor, so the folder `platform/stripe` does not lock in a provider before you have confirmed one | ⬜ OPEN    | `server/src/modules/payment/` and `modules/notification/` are empty; `server/src/platform/{email,stripe,supabase}/` exist as empty folders; no `PaymentGateway` / `Mailer` port files. |
> | P6.2 | Add `payment-webhook` and `notifications` functions with their modules                                                                                       | 🟡 PARTIAL | Stub `supabase/functions/payment-webhook/index.ts` exists; no `notifications` function and no module logic.                                                                            |

| Task                                                                                                                                                         | Suggested legacy reference (from `_legacy/`)                                                                                                                                                                                                                     | Explanation                                                                                                       |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| Name adapters by port (`PaymentGateway`, `Mailer`), not by vendor, so the folder `platform/stripe` does not lock in a provider before you have confirmed one | `_legacy/client/src/Hooks/usePaymentMethods.jsx`, `_legacy/client/src/Pages/Premium/PaymentInstructions.jsx`, `_legacy/client/src/API/planAPI.jsx`, `_legacy/client/src/API/orderAPI.jsx`, `_legacy/client/src/assets/premium/*` (plan icons used in payment UI) | Vendor-named folders make swapping providers a rename-everywhere exercise; port-named folders make it a new file. |
| Add `payment-webhook` and `notifications` functions with their modules                                                                                       | `_legacy/client/src/API/planAPI.jsx`, `_legacy/client/src/API/orderAPI.jsx`, `_legacy/client/src/Hooks/usePaymentMethods.jsx`, `_legacy/edge-functions/trial/index.ts` (scratch reference)                                                                       | Each webhook is thin; the module holds the logic, the function holds the delivery.                                |

**Review points (Phase 6).**

- Show the `PaymentGateway` port and its current implementation; swapping is a one-file change.
- Show the `payment-webhook` function is thin (a few lines); the logic is in the module.
- Show the placeholder payment provider and the swap plan.

---

### Phase 7: Stage B — the planned product split

> **Status overlay — Phase 7 (synced 2026-10-21):** 🟡 STARTED (1 🟡 · 1 ⬜ · 1 ⏸ hold)
>
> | ID   | Task (first column of the table below, verbatim)                                                                                                                                                                                      | Status  | Evidence in tree                                                                                                             |
> | :--- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------ | :--------------------------------------------------------------------------------------------------------------------------- |
> | P7.1 | Execute the moves in section 2 under the gates and order defined there: rename `client`/`server` -> `apps/*`, split `apps/admin-dashboard` out, then extract `packages/{ui,i18n,api-client}`; extract `packages/{kernel,testing,realtime}` only when its own gate fires (second consumer, P2.6, adapter + second consumer) | 🟡 PARTIAL | Move 1 landed: `apps/customer-web/` and `apps/server/` exist; workspace glob, app `tsconfig` extends, depcruise paths, root `arch` script, CI artifact path, gitignore and lockfile importers updated. Moves 2–10 remain. |
> | P7.2 | Hold `apps/mobile` and `packages/mobile-*` until the mobile project is greenlit                                                                                                                                                       | ⏸ HOLD  | Held by design. No `apps/mobile`, no `packages/mobile-*` exist — consistent with the plan.                                   |
> | P7.3 | The Vercel project layout may lag the codebase; that is accepted, not a blocker                                                                                                                                                       | ⬜ OPEN | CI artifact path is `apps/customer-web/dist`; the Vercel project root still needs switching from `client` to `apps/customer-web` in the dashboard. |

> **Note (Revision 4.1).** The table below is the original plan text and stays as written. Its “dependency order” wording, and its inclusion of `kernel`/`testing` in the rename batch, are superseded by the gates in section 2: rename → admin split → `ui`/`i18n`/`api-client`, then `kernel`/`testing`/`realtime` only when their own gates fire.

| Task                                                                                                                                                                                                                                  | Suggested legacy reference (from `_legacy/`)                                                                                                                                                                                                                                                                                   | Explanation                                                                                                 |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| Execute the moves in section 2 in dependency order: rename `client`/`server` -> `apps/*`, split `apps/admin-dashboard` out, then extract `packages/{ui,i18n,api-client,kernel,testing}` (and `realtime` once its 2nd consumer exists) | Whole `_legacy/` tree, plus the current `client/` and `server/` trees. Concretely: `_legacy/client/src/Contexts/{ThemeProvider.jsx, I18nContext.jsx}`, `_legacy/client/src/theme.jsx`, `_legacy/client/src/i18n.jsx`, `_legacy/client/dict.json`, `_legacy/client/src/Components/Navbar/*`, `_legacy/client/src/Pages/Admin/*` | Each move is a folder move plus an import rewrite; the dependency order avoids half-migrated states.        |
| Hold `apps/mobile` and `packages/mobile-*` until the mobile project is greenlit                                                                                                                                                       | `_legacy/client/src/Components/Map/MapBox.jsx`, `_legacy/client/src/Hooks/{useRestaurantAddress.jsx, useScrollNavigation.jsx, useDiscreteScroll.jsx, useClickSpark.jsx}` (mobile-relevant UX primitives)                                                                                                                       | An empty mobile package is worse than no mobile package.                                                    |
| The Vercel project layout may lag the codebase; that is accepted, not a blocker                                                                                                                                                       | `_legacy/client/.vercel/{project.json, README.txt}`, `_legacy/client/vercel.json`, `_legacy/.github/workflows/` (empty)                                                                                                                                                                                                        | Deployment config follows the split; a brief preview outage is cheaper than a deferred structural decision. |

**Review points (Phase 7).**

- One commit per one-way door; CI green at each step.
- Show the final `apps/` and `packages/` trees side by side with the Stage A trees.
- Show `pnpm arch` green with the workspace rules (`packages-are-leaves`, `server-never-imports-client`, `client-never-imports-server`) enforced.
- Document any deploy lag (Vercel root directory, CI path filters) and the commit that closes it.

---

## 8. Migration map

> **Status overlay — migration map (synced 2026-10-08).**
>
> | Legacy                                 | Status          | Evidence in tree                                                                                                    |
> | :------------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------ |
> | `CartContext.jsx`                      | 🟡 PARTIAL      | `entities/cart/infrastructure/LocalStorageCartRepository.ts` exists; no `model/` yet.                               |
> | `useOrders`                            | ⬜ OPEN         | `entities/order/model/` absent.                                                                                     |
> | `orderAPI.jsx`                         | 🟡 PARTIAL      | `entities/order/infrastructure/SupabaseOrderRepository.ts` exists; `features/submit-order` empty beyond `index.ts`. |
> | `AuthContext`                          | ✅ DONE (Revision 4) | Provider shell `app/providers/SessionProvider.tsx`; state/hook `entities/session/model/sessionContext.ts`.       |
> | `ElementsContext`                      | ⬜ OPEN         | No TanStack Query hooks visible in entity `model/` folders (`app/providers/QueryProvider.tsx` exists).              |
> | `client/supabase/functions/*`          | ✅ DONE (moved) | At `_legacy/edge-functions/`; porting is tracked in section 5.                                                      |
> | `server/database/*`                    | 🟡 PARTIAL      | Seed moved to `supabase/seed/`; `supabase/migrations/` empty.                                                       |
> | `shared/{api,i18n,theme}/legacy-*.jsx` | ✅ DONE (Revision 4) | Quarantined at `_legacy/client/src/shared/{api,i18n,theme}/`; live legacy-file count is 0.                     |

| Legacy                                 | v2                                                                               |
| :------------------------------------- | :------------------------------------------------------------------------------- |
| `CartContext.jsx`                      | `client/src/entities/cart/model/` (+ existing `LocalStorageCartRepository`)      |
| `useOrders`                            | `client/src/entities/order/model/`                                               |
| `orderAPI.jsx`                         | `client/src/entities/order/infrastructure/` (client-owned; not a shared package) |
| `AuthContext`                          | `client/src/entities/session/` + `app/providers/SessionProvider.tsx`             |
| `ElementsContext`                      | TanStack Query hooks in each entity's `model/`                                   |
| `client/supabase/functions/*`          | See section 5                                                                    |
| `server/database/*`                    | `supabase/migrations`, `supabase/seed*`                                          |
| `shared/{api,i18n,theme}/legacy-*.jsx` | Replace with TS equivalents; delete when lint quarantine hits zero               |

**Review points (migration map):**

- For each row, point at the file that existed before and the file that exists after.
- Track the legacy-file count over time; the number should only decrease.

---

## 9. Open questions and answers

> **Status overlay — open questions (synced 2026-10-08):** all five have recorded answers. The dependent phase and affected files for each are logged in section 12 (decision log).

1. **Payment provider:** is Stripe confirmed? **Answer:** no, and it could be just placeholded.
2. **Admin:** do you expect a separate admin domain, MFA, or a separate team soon? **Answer:** yes — Stage B treats the admin split as a planned product decision. It ships as `apps/admin-dashboard` once Phases 0–6 have landed and the rename has settled. MFA / IP rules are part of the split's rationale.
3. **Order delivery / track-last-order:** do these need server logic or can RLS-protected client queries replace them? **Answer:** they need server logic.
4. **Chat transport:** keep the custom WebSocket function or move to Supabase Realtime? **Answer:** through an adapter for extensibility concerns.
5. **Hero assets (`hero-*.json`,** **`hero*.jpg`):** still referenced after the 3D landing, or safe to delete? **Answer:** deleted in Revision 4. Nothing in the live tree referenced them; the `hero-*.json` Lottie files are gone and the raster heroes are consolidated to one canonical file per slot (`heroA..heroE`).

**Review points (open questions):**

- For each answer, name the phase that depends on it and the file that changes.
- Track the answers as a decision log; superseded answers stay with a date.

---

## 10. Status ledger (appendix)

_Added in revision 1. Not part of the original plan._

### 10.1 All tasks at a glance

| Marks                 | Count                                                                                                          |
| :-------------------- | :------------------------------------------------------------------------------------------------------------- |
| ✅ DONE               | 13 task rows (P0.1–P0.6, P0.9, P1.2–P1.6, P4.2) plus drift items 1–9 and 11 |
| 🟡 PARTIAL            | 7 task rows (P1.1, P2.1, P2.2, P2.4, P2.5, P2.6, P7.1) — see per-phase overlays |
| 🔍 VERIFY             | P0.7 plus inline 🔍 checks inside DONE/PARTIAL rows |
| ⬜ OPEN / NOT STARTED | P0.8, P2.3, P3.1–P3.3, P4.1, P4.3, P5.1–P5.2, P6.1, P7.3 (P7.2 on hold) |

### 10.2 Tree-versus-plan observations (recorded, not judged)

1. `supabase/functions/auth-handlers/` exists; section 5 lists `auth-handlers` as "do not create yet".
2. `server/src/platform/stripe/` exists as an empty vendor-named folder; the Phase 6 task speaks of naming adapters by port. The plan's open question 1 says the payment provider could be a placeholder.
3. ~~`packages/domain` and `packages/contracts` show no `package.json` in the tree; `packages/db-types` does.~~ Resolved in Revision 2: all three manifests exist, and contracts declares `@saucia/domain` + `zod`.
4. Section 1 describes the `order` module's Supabase repository as having `dto/` and `mappers/`; on the client side that is the case only as a repository file, and on the server `infrastructure/supabase/{dto,mappers}` hold only `.gitkeep` placeholders as of Revision 4.
5. `docs/` contains `API_CONTRACTS.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`, `FSD_CLEAN_RULES.md`, `SERVER.md`. They are not referenced by the plan; they need to be reconciled with this bible (see 0.1 and section 12).
6. `client/src/shared/api/` now holds only `supabaseClient.ts`; Revision 4 moved `legacy-supabaseClient.jsx`, `legacy-i18n.jsx` and `legacy-theme.jsx` to `_legacy/client/src/shared/` (see P1 exit: zero _new_ imports of `legacy-*`).
7. `server/src/kernel` has `Result`, a generic `DomainError` and the ports with 8 tests (Revision 4); `packages/kernel` does not exist and the client `Result.ts` duplicate has been removed (decision 9).

---

## 11. Baseline tally (appendix)

_Added in revision 1. Fulfils the 'one-page inventory' review point of section 1, measured on the 2026-10-20 snapshot (Revision 4)._

| Metric                                                    | Count | Detail                                                                                                                                                                                                                                                                                                                                                                        |
| :-------------------------------------------------------- | :---- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate definition sets                                 | 0     | Order status is single-sourced (Revision 2); `Result.ts` and `SessionProvider.tsx` were deduped in Revision 4.                                                                                                                                                                                                                                                                  |
| `legacy-*` files inside live layers                       | 0     | All three moved to `_legacy/client/src/shared/`; no live file imports them.                                                                                                                                                                                                                                                                                                    |
| Empty directories in the live tree (excluding `_legacy/`) | 0     | 12 scaffolding directories carry `.gitkeep`; client slices hold `index.ts`.                                                                                                                                                                                                                                                                                                     |
| Empty directories inside `_legacy/`                       | 3     | `.github/workflows`; `client/src/Pages/Admin/admin-assets`; `client/src/assets/fonts/Outfit/static`                                                                                                                                                                                                                                                                             |
| Duplicate asset groups (byte-identical)                   | 0     | 11 `admin/` copies removed in favour of `menu/`; hero duplicates collapsed.                                                                                                                                                                                                                                                                                                    |
| Asset files under `shared/assets`                          | 109   | 5.61 MB total.                                                                                                                                                                                                                                                                                                                                                                 |
| GLTF models in `public/models`                            | 19    | 20.1 MB; unused `customize.glb` and `planet.glb` removed.                                                                                                                                                                                                                                                                                                                        |
| Fonts in `public/fonts`                                   | 12    | 2.18 MB: Zain (8 weights + OFL) and Asap variable + italic + OFL; static Asap weight dumps pruned (≈6.2 MB saved).                                                                                                                                                                                                                                                               |

Counts were taken by hand from the tree. To recompute from the repo root:

```powershell
# empty live directories (PowerShell)
Get-ChildItem -Recurse -Directory client\src, server\src, packages |
  Where-Object { $_.FullName -notmatch 'node_modules|\.turbo' -and -not (Get-ChildItem -Force -LiteralPath $_.FullName) }

# duplicate asset bytes
Get-ChildItem -Recurse -File client\src\shared\assets | Get-FileHash -Algorithm SHA256 |
  Group-Object Hash | Where-Object Count -gt 1
```

Track these numbers over time; the migration map (section 8) expects the legacy-file count to only decrease.

---

## 12. Change log and decision log (appendix)

_Added in revision 1._

### 12.1 Change log

| Date       | Revision | Change                                                                                                                   |
| :--------- | :------- | :----------------------------------------------------------------------------------------------------------------------- |
| 2026-10-08 | 1        | Bible created from the original plan. Added section 0, status overlays and sections 10–12. Original plan text unchanged. |
| 2026-10-17 | 2        | Domain and contracts completed (money, totals, cart, phone, BMI/TDEE/nutrition; error codes, order/subscription schemas); P1.2 order-status dedup; 68 tests; type-check/test/arch green; done/dead points extracted to 0.8. |
| 2026-10-18 | 3        | Server kernel implemented (`Result`, generic HTTP-free `DomainError`, `Clock`/`IdGenerator`/`Logger` ports, 7 tests); kernel boundary rules added to dependency-cruiser; 75 tests green. |
| 2026-10-20 | 4        | Closed the Phase 1 cleanup queue. Deleted the client `Result.ts` (server kernel is canonical, decision 9); split `SessionProvider` into provider shell + entity state/hook (P1.4); quarantined the three `legacy-*` files; removed 11 duplicate admin assets, hero duplicates and `hero-*.json`, pruned static Asap weights, deleted 2 unused GLBs; ported the 3D landing system to `shared/ui/three` + `pages/home` (P1.6); added 12 `.gitkeep` placeholders (P0.9). `DomainError` now has a fixed client-safe `message` plus `internalMessage` (8 kernel tests). Arch, type-check, tests and build green. |
| 2026-10-21 | 4.1      | Section 2 consistency pass, no tree change. Kernel gate restated as “a second consumer” instead of the already-closed P1.3 dedup; `packages/config` removed from the plan (client and server env models differ); the dependency diagram rewritten as **gates + landing order** with the rename first. Stage B exit criterion and P7.1 aligned with those gates. |
| 2026-10-21 | 5        | Stage B move 1: `client/` → `apps/customer-web/`, `server/` → `apps/server/`. Updated `pnpm-workspace.yaml`, both app `tsconfig` extends paths, `.dependency-cruiser.cjs`, the root `arch` script, `.gitignore`, CI artifact path and `pnpm-lock.yaml` importers; package names unchanged. `pnpm install --frozen-lockfile`, `type-check` (5 tasks), `test` (4 tasks), `arch` and `build` green. |

### 12.2 Decision log

The answers in section 9 are carried here with the phase that depends on each and the files that change, as the section 9 review points ask. The plan does not state when each answer was given; superseded answers, when they occur, stay in this table with a date.

| #   | Decision (from section 9)                                                                                                                                   | Depends on                  | Files affected                                                                                                          | Date recorded      | Status                              |
| :-- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :----------------- | :---------------------------------- |
| 1   | Payment provider: not confirmed; may be only a placeholder                                                                                                  | Phase 6                     | `server/src/platform/*` adapters, `PaymentGateway` port, `supabase/functions/payment-webhook/index.ts`                  | Not stated in plan | Open until Phase 6                  |
| 2   | Admin split is a planned product decision; ships as `apps/admin-dashboard` after Phases 0–6 and the rename settle; MFA / IP rules are part of the rationale | Phase 7 (Stage B moves 1–2) | `pages/admin`, `features/admin-*`, `widgets/admin-*`, admin-only shared bits                                            | Not stated in plan | Planned                             |
| 3   | `order-delivery` / `track-last-order` need server logic                                                                                                     | Phase 2 (task P2.4)         | New use cases under `server/src/modules/order/application/use-cases/`; `supabase/functions/order-processing/index.ts`   | Not stated in plan | Decided; not yet implemented        |
| 4   | Chat transport goes through an adapter for extensibility                                                                                                    | Phase 5                     | `server/src/modules/support` (new), `client/src/entities/message/infrastructure`, `features/send-support-message` (new) | Not stated in plan | Decided; not yet implemented        |
| 5   | Hero assets (`hero-*.json`, `hero*.jpg`) can be deleted                                                                                                     | Phase 1 (task P1.6)         | `client/src/shared/assets/hero/*`                                                                                       | Not stated in plan | Implemented (Revision 4)            |
| 6   | Order-status values and transitions live in `@saucia/domain`; contracts derives the wire schema; the server file is a re-export facade | Phase 1/2 | `packages/domain/src/order/orderRules.ts`, `packages/contracts/src/order/orderStatus.ts`, `server/src/modules/order/domain/OrderStatus.ts` | 2026-10-17 | Implemented |
| 7   | Subscription nutrition uses the ADR activity/goal vocabulary and the v1 macro ratios | Phase 4 | `packages/domain/src/subscription/*`, `packages/contracts/src/subscription/*` | 2026-10-17 | Implemented in domain/contracts |
| 8   | Server kernel stays server-local for Stage A; `DomainError` is generic and HTTP-free; `packages/kernel` is deferred until a second consumer and must be the lowest package | Phase 1/Stage B | `server/src/kernel/*`, `.dependency-cruiser.cjs` | 2026-10-18 | Implemented server-local; extraction deferred |
| 9   | The client `Result.ts` is not a second kernel. The server kernel is the single owner, the client copy is deleted, and `packages/kernel` waits for a real second consumer | Phase 1 (P1.3) / Stage B | `client/src/shared/kernel/*`, `server/src/kernel/Result.ts` | 2026-10-20 | Implemented |
| 10  | Session state belongs to `entities/session/model`; `app/providers/SessionProvider.tsx` only mounts it | Phase 1 (P1.4) | `client/src/app/providers/SessionProvider.tsx`, `client/src/entities/session/model/sessionContext.ts` | 2026-10-20 | Implemented |
| 11  | The 3D landing system lives in `shared/ui/three` (generic renderer) and `pages/home` (camera, scroll, configs) | Phase 1 (P1.6) / section 6 | `client/src/shared/ui/three/*`, `client/src/pages/home/*` | 2026-10-20 | Implemented |
| 12  | `DomainError.message` is a fixed client-safe string; detail travels in `internalMessage` and is never forwarded to a client | Phase 1/2 | `server/src/kernel/DomainError.ts`; delivery error mapping (Phase 2) | 2026-10-20 | Implemented in kernel; delivery mapping follows P2 |
| 13  | Stage B is structurally ready: no duplicate definitions, no live `legacy-*` imports, no unmarked empty directories; sequencing gates remain P0.7, P0.8 and P1.1 | Phase 7 | `client/`, `server/`, `packages/` | 2026-10-20 | Move 1 landed 2026-10-21; moves 2–10 and the named gates remain |
