# modules/

One folder per bounded context: `order`, `menu`, `subscription`, and later `payment`, `notification`, `identity`, `support`.

A module is a business concept, not a table. Name it after the concept.

## Inside each module

| Ring | Contains | May import |
|---|---|---|
| `index.ts` | Public surface: use-case entry points, port types, and the adapter composition needs | its own ring files |
| `domain/` | Aggregates, invariants, status | `@saucia/domain`, `src/kernel` |
| `application/` | `ports/` (interfaces the module needs) and `use-cases/` | `domain`, `ports`, `src/kernel`, `@saucia/*` |
| `infrastructure/` | Repositories, `dto/`, `mappers/` (for example `infrastructure/supabase/`) | `ports`, `domain`, `@saucia/db-types` |
| `delivery/http/` | Controllers and routes | `application`, `src/delivery-shared` |
| `tests/` | Use-case tests with in-memory ports | the module's own code |

## Rules

1. **Public surface only.** Other modules, the edge bundle and composition import through `index.ts`. Enforced by `modules-public-api-only` (P1.2, planned).
2. **Ports belong to the consumer.** If `order` needs a meal price, `order/application/ports/MealPriceReader.ts` declares it, and `menu` provides the adapter. `menu/index.ts` exports the adapter, not the port.
3. **No cross-module internals.** A module never imports another module's `domain`, `application` or `infrastructure`.
4. **Database rules stay in migrations only where they protect data.** Sequencing (for example, delivery → subscription consumption) lives in use cases inside a `UnitOfWork` (decision 16).
5. **Check before creating a module.** Use the checklist in the bible §3 (Suggested structure, section 5).

## Current modules

| Module | State |
|---|---|
| `order` | `Order` aggregate done. `SubmitOrder` and the infrastructure mappers are pending (P2.2) |
| `menu` | Folder stubs only (P3.1) |
| `subscription` | Folder stubs only (P4.1) |
| `payment`, `notification`, `identity`, `support` | Held until their gates open |