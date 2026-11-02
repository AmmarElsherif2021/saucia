# Admin Split: Execution Plan (Bible §3, Move 2)

## 0. Where this move actually stands

Before the steps, there is a conflict in the bible that has to be resolved, because it decides whether this plan can start at all.

| Source | What it says about the admin split |
| :--- | :--- |
| §3 move table | Gate: "after move 1". Move 1 is 🟡 PARTIAL. |
| §3 gate chain | `admin split ← after the rename; one-way door` |
| §8 decision 2 | "Admin ships as `apps/admin-dashboard` **after Phases 0–6**" |
| §9 question 6 | Answer: **"Hang on!"** |
| §4 Phase 2 exit | Checkout end to end is ⬜ NOT MET |

Two gates apply, and the stricter one should win. Phases 0–6 are not complete, and move 1 is not cleanly complete while `client/` and `server/` still exist in `main`. The bible's own answer to question 6 is a hold.

**Recommendation:** treat move 2 as **blocked**. The plan below is ready to execute when the owner confirms the gate. Preparation work that does not touch the repo's shape (dependency-cruiser rule drafts, contract inventory) can run now.

---

## 1. Why the split exists (interview framing)

The admin is a different product with different users, risk, and release cadence. Splitting it into its own app gives you:

1. **Bundle isolation.** Admin screens (the legacy `Admin.jsx` was over 2,000 lines) should not ship to every customer. Today, §4 P3.3 requires lazy loading as a workaround. A separate app removes the problem.
2. **Security surface.** The admin app can have its own hosting, its own CSP, and an IP allowlist. Decision 2 cites MFA and IP rules as part of the rationale.
3. **Independent deploys.** Admin changes stop forcing customer releases.
4. **Enforced boundaries.** Two apps that never import each other make the separation a build-time fact, not a convention.

The cost is duplication and coordination. Most of this plan manages that cost.

---

## 2. Preconditions (gate checklist)

All of these must be true before Step 1 starts.

- [ ] Owner confirms the gate: Phases 0–6 per decision 2, or move 1 alone per §3. The plan assumes the stricter reading.
- [ ] Move 1 is closed: legacy `client/` and `server/` removed, or explicitly kept as compatibility wrappers (decision 13). Rename references in §6 are updated.
- [ ] Phase 1 rules exist: `modules-public-api-only` (P1.2) and `server-domain-pure` (P1.3). These are needed so the new boundary rules have a stable baseline.
- [ ] Admin authorization is decided. The `identity` module is on HOLD (§3), and "admins by role" comes from P5.3. This is the largest open dependency.
- [ ] Admin server use cases exist. P3.2 (`admin-create-meal`, `admin-update-order-status`) is still a placeholder. The admin app cannot be useful without them.

---

## 3. Architectural constraints that shape the plan

These come straight from the bible's rules and are not negotiable in this move:

- **§2.5:** the two apps never import each other. The admin app cannot import from `apps/customer-web/src/shared`.
- **§2.4:** the client uses anon key + RLS, read-only. Writes of orders, money, or status go through **edge functions only**. The admin app therefore cannot update an order with a direct Supabase write, even though it is "trusted".
- **§2.2:** the same Clean ring rules apply inside the admin app (`model`/`ui` never import `infrastructure`; only the DI root does).
- **§2.6 and §2.7:** shared repository adapters are rejected. Admin and customer use different auth and data scopes.
- **§6:** `dev` filters `@saucia/client`, and `arch` scans fixed paths. Both must change.

### The tension you must accept: shared code during the split

Moves 3–5 (`packages/ui`, `packages/i18n`, `packages/api-client`) are gated *after* move 2. But the admin app will need the theme, i18n dictionary, edge client, and error normalizer on day one. Because it cannot import from customer-web, there are only three options:

| Option | Trade-off |
| :--- | :--- |
| A. Copy the needed files into `apps/admin-dashboard/src/shared` | Fast. Creates duplicate definitions, which breaks the "0 duplicate definitions" invariant until extraction. |
| B. Extract the packages first, before the split | Clean. But moves 3–5 are gated behind move 2, so this violates the sequence. |
| C. Ship admin with zero shared UI, using only `@saucia/contracts` and `@saucia/domain` | Cleanest boundary. Admin UI is initially plainer. |

**Recommendation: Option A, time-boxed, plus Option C where possible.** Copy only what the admin needs, record every copied file in a register, and extract to packages in moves 3–5. This respects the gate order and makes the duplication visible. The bible needs an explicit exception to the duplication invariant for this window. Do not leave it implicit.

---

## 4. Target structure after the split

```
apps/
├── customer-web/                 (loses all admin code)
│   └── src/
│       ├── pages/                 admin/ removed
│       ├── widgets/               admin-meals-manager/, admin-orders-board/ removed
│       ├── features/              admin-update-order-status/ removed
│       └── app/router/guards.ts   admin guard removed
├── admin-dashboard/              [NEW] FSD × Clean, same layer rules
│   ├── package.json              name: @saucia/admin-dashboard
│   ├── vite.config.ts
│   └── src/
│       ├── app/                  di/, providers/, router/, main.tsx
│       ├── pages/                admin-orders, admin-meals, admin-subscriptions, admin-support
│       ├── widgets/              admin-orders-board, admin-meals-manager (moved)
│       ├── features/             admin-update-order-status (moved, calls edge function)
│       ├── entities/             order (admin read view), meal, subscription
│       │   └── {domain,model,ui,infrastructure}/   infra calls edge functions and anon+RLS reads
│       └── shared/               temporary copies, listed in the register (Option A)
└── server/                       (adds admin delivery routes, no new module)
```

Key point for the interview: the admin app depends on `@saucia/contracts` and `@saucia/domain`, which are leaves. That is the correct way to share types. It avoids sharing UI code and avoids sharing infrastructure.

---

## 5. Step-by-step plan

### Step 1: Decide and record (no code)
- Resolve the gate (§2) and record the answer in bible §9 question 6 and §8 decision 2.
- Decide admin authorization. Options: Supabase Auth role claim checked in RLS and again in the edge function (defence in depth), or a server-side admin allowlist. Record it as a new decision.
- Decide the shared-code option (§3). Record it as a new decision.
- Decide the package rename timing. The bible says names stay `@saucia/client` and `@saucia/server` "until the admin split", so the rename happens here: `@saucia/client` → `@saucia/customer-web`.

### Step 2: Inventory admin code in the current tree
- List every admin file in `apps/customer-web/src` (the slices above), and in the legacy `client/src` as reference: `Pages/Admin/*`, `Admin.jsx`, `adminAPI.jsx`, `adminInstantOrdersAPIs.jsx`, `adminSubscriptionAPI.jsx`, `useAdmin*` hooks.
- Add the missing rows to the bible §7 migration map. Currently it has no admin entries.
- Do not modify `_legacy/` or `client/`. §1 forbids changes to v1 and to the legacy roots while they remain in use.

### Step 3: Scaffold `apps/admin-dashboard`
- Copy the customer-web tooling (`tsconfig.json`, `eslint.config.js`, `.prettierrc`, `vite.config.ts`) and adjust it. Do not share it through a package yet; that is a later extraction.
- Add the `@saucia/*` path aliases in `tsconfig.base.json` usage. Only `contracts` and `domain` are allowed.
- Create the FSD × Clean skeleton with empty slices, README files per layer (matching the existing ones), and an `app/di` container.
- Add the admin `index.html` and an `.env.example` with its own `VITE_*` variables.

### Step 4: Move the slices
- Move `pages/admin`, the two admin widgets, and `features/admin-update-order-status` with `git mv` to preserve history.
- Replace every direct Supabase write with a call to the edge function (`order-processing` → `UpdateOrderStatus`). Writes must go through the edge function (§2.4).
- Replace every reference to customer `shared/` with either a register-listed copy or a contracts/domain import.
- Route-level code splitting is no longer needed for admin inside customer-web, so remove P3.3's lazy-load workaround from customer-web.

### Step 5: Server admin delivery
- Add admin routes under the existing modules' `delivery/http/` (for example in `order`). Do not create an `admin` module. Admin is a delivery concern over existing use cases, not a bounded context.
- Each admin route must check the admin role on the server. The client-side guard is a UX convenience, not a security boundary (the same reasoning as decision 18).
- Export only through each module's `index.ts` (decision 14).

### Step 6: Enforce boundaries
Add dependency-cruiser rules (proposed names):
- `admin-never-imports-customer-web`
- `customer-web-never-imports-admin`
- `admin-never-imports-server`
- `admin-only-contracts-and-domain-from-packages`

Update the `arch` script path list in root `package.json` to include `apps/admin-dashboard/src`. Confirm `pnpm arch` is green. Also add the admin app to Steiger and the ESLint boundary config (P1.1).

### Step 7: Workspace and CI wiring
- Root `package.json`: add `dev:admin` with a filter, and keep `dev` on customer-web.
- `turbo.json`: no change needed beyond the workspace glob, which already covers `apps/*`. Confirm the `VITE_*` env declaration applies to both apps.
- CI: add `admin-dashboard` to lint, type-check, arch, test, and build. Upload its `dist` artifact separately. The current CI uploads only `apps/customer-web/dist`.

### Step 8: Deployment
- Create a second Vercel project with root `apps/admin-dashboard`, "include files outside root", and `pnpm install --frozen-lockfile`.
- Apply the IP allowlist and MFA requirements at the appropriate layer. These are infrastructure settings, so mark them 🔍 VERIFY in the bible.
- Update `DEPLOYMENT.md`.

### Step 9: Cutover and cleanup
- Verify that the customer bundle contains no admin code (grep the built `dist` for admin route names and admin-only API paths).
- Remove the admin entries from customer-web's routes and the README tree.
- Close P7.3 only for the customer app. The admin Vercel project is a new item.

### Step 10: Documentation and bible update (after confirmation)
Covered in §6 below. This is the step the owner asked for explicitly, so it is not optional.

---

## 6. Documentation and bible updates

Per your rules, the bible is updated first, with minimal changes, and only after each change is confirmed. The proposed minimal patch is:

| Bible section | Minimal change |
| :--- | :--- |
| §0 / §1 | Admin split status: "gated" → "in progress" when Step 3 starts |
| §3 move 2 | 🟡 / ⬜ status and the gate wording, resolved to a single gate |
| §4 new items | P7.4 admin scaffold; P7.5 admin slices moved; P7.6 admin server delivery; P7.7 admin Vercel project and IP/MFA (🔍 VERIFY) |
| §4 P3.3 | Note it becomes moot once admin is out of customer-web |
| §6 Workspace | `arch` paths and the admin CI artifact |
| §7 migration map | Admin legacy rows (`Admin.jsx`, `adminAPI.jsx`, `useAdmin*`) |
| §8 decision 2 | Gate wording, resolved |
| §8 decision (new) | Shared-code strategy during the split (Option A, time-boxed) |
| §8 decision 13 / 14 | Confirm they still apply |
| §9 question 6 | Replace "Hang on!" with the confirmed answer |

Related documents to update during the execution steps:
- `README.md` (root): the table of directories.
- `apps/customer-web/README.md`: remove admin references.
- `apps/customer-web/src/pages/README.md`, `widgets/README.md`: remove admin slices.
- `apps/admin-dashboard/README.md`: new, following the existing pattern.
- `API_CONTRACTS.md`: admin routes, which currently has only a placeholder.
- `DEPLOYMENT.md`: second Vercel project and the admin's IP/MFA settings.
- `FSD_CLEAN_RULES.md` and `ARCHITECTURE.md`: admin as a second FSD app. Both are currently TODO stubs, so write the admin section, not a full rewrite.
- `SERVER.md`: admin delivery routes.

---

## 7. Verification and exit criteria

| Check | Pass condition |
| :--- | :--- |
| Boundaries | `pnpm arch` green with the new rules; no import between the two apps |
| Types | `type-check` green for both apps; contracts and domain only from packages |
| Writes | Zero direct Supabase writes in the admin app; every mutation goes through an edge function |
| Security | Every admin server route rejects a non-admin token in a test (use-case tests with in-memory ports, P2.6) |
| Bundles | Customer `dist` contains no admin strings |
| Deploy | Both Vercel projects build from the lockfile |
| Duplication | Register lists every copied shared file, with a target package and a gate |
| Bible | §0–§9 updated and no stale "Hang on!" or "after move 1" wording left |

---

## 8. Risks and rollback

- **One-way door:** after the admin Vercel project is public and the customer root has been cut over, reverting is expensive. Keep the customer-side removal (Step 9) as the last step, after the admin app has run in production.
- **Authorization gap:** if admin roles are not in RLS and the edge function, the split makes the gap more visible, not less. Block Step 5 on this.
- **Shared-code drift:** the copied files can diverge. The register and the gate on moves 3–5 are the control.
- **Edge runtime dependency:** admin writes depend on `order-processing` (P0.8, P2.4), which is still partial. Admin is blocked on the same spike as checkout.

---

## 9. Educational takeaways

1. A monorepo split is a boundary decision first and a file move second. The rules (`pnpm arch`) are what make it real.
2. Shared code should be extracted when there is a second consumer, not earlier. The admin split creates that second consumer, which is why moves 3–5 follow it.
3. Client-side authorization is for UX. The server must check the role. Use this as a concrete example when discussing security in interviews.
4. "Admin" is a delivery concern on top of existing use cases, not a new bounded context. Recognizing when *not* to create a module is as important as creating one.
5. Derive, never redefine: the admin app consumes contracts and domain. Copying domain rules into the admin app would be the same anti-pattern the bible rejects in §2.6.

---

## 10. Questions to confirm before execution

1. Is the gate Phases 0–6 (decision 2) or move 1 alone (§3)? I have assumed the stricter reading.
2. Is temporary, time-boxed duplication of shared files (Option A) acceptable, or do you prefer Option C with a plainer admin UI?
3. What is the admin authorization model: Supabase role claim in RLS plus edge check, or a different mechanism?
4. Should the package rename (`@saucia/client` → `@saucia/customer-web`) happen at this split, as §1 implies?

Once you confirm, I will apply the minimal bible patch from §6 and update the related documents in the same change.