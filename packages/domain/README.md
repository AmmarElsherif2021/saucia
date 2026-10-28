# @saucia/domain

Pure business rules: money, order totals and status rules, cart rules, phone validation, BMI/TDEE, discounts, subscription consumption and (later) payment status.

- Imports nothing from the apps. Imports no I/O, framework or runtime assumptions; testable without a database or network.
- Source of truth for order-status values and transitions. Contracts and the server derive from it; neither redefines it.
- Shared by the client and the server through `@saucia/domain`.

## Folders under `src/`

| Folder | Purpose | State |
|---|---|---|
| `money/` | `Money` value object, integer cents | done |
| `order/` | `computeOrderTotals`, `orderRules` (status list and transitions) | done |
| `cart/` | Cart rules | done |
| `identity/` | Phone validation | done |
| `subscription/` | BMI, TDEE, nutrition; `consumptionRules.ts` (end > start, consumed ≤ total) | `consumptionRules` pending (P4.1) |
| `pricing/` | `discountRules.ts`: percentage discount and free-additive allowance | pending (P3.4) |
| `payment/` | Payment status transitions | held (P6.2, provider open question) |

## Rules

- No I/O, no framework imports, no environment reads.
- Errors are returned as values where the caller can act on them. Server domain code wraps these rules and returns kernel `Result`; this package does not depend on the kernel.
- Legacy triggers that enforced these rules are replaced by these functions plus CHECK constraints in migrations (decision 16).

## Tests

Each rule file has a sibling `*.test.ts`. Run from the repo root:

```powershell
pnpm --filter @saucia/domain test
pnpm --filter @saucia/domain type-check
```