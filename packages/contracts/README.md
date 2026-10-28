# @saucia/contracts

The wire layer between client and server: request and response schemas, error codes, and status enums as wire types.

- May import `@saucia/domain`. Nothing else from the repo.
- **Derive, never redefine:** status enums come from `@saucia/domain` (`ORDER_STATUSES`). Schemas are built from those values.
- Server returns error **codes**; the client maps codes to `dict.json` keys. Messages are client-only.

## Folders under `src/`

| Folder | Purpose | State |
|---|---|---|
| `errors/` | `ErrorCode` values returned by the server | done |
| `order/` | `orderStatus` schema, `submitOrder.schema` (additive item lines pending, P2.7) | done; P2.7 pending |
| `subscription/` | Enrollment and nutrition profile schemas | done |
| `meal/` | `mealSummary.schema.ts`: read DTO for the catalog | pending (P3.1, P3.6) |
| `payment/` | Payment status wire schema | held (P6.2) |
| `support/` | Support message schema | held (P5.1) |

## Rules

- A schema describes what travels on the wire. It does not hold business rules: no transition logic and no totals math. Those live in `@saucia/domain`.
- Adding a field here means the server and client both validate it. Run the contract tests after any change.
- Do not export vendor-specific types (for example, a payment SDK type). Wire types are vendor-neutral (decision 20).

## Tests

```powershell
pnpm --filter @saucia/contracts test
pnpm --filter @saucia/contracts type-check
```