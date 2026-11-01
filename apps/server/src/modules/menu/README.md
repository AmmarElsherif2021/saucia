# The menu module, layer by layer

The tree has four rings, plus a public `index.ts` and a `.gitkeep` placeholder. Each ring has one job and depends only on the rings allowed by the architecture rules (bible §2.2).

```
menu/
├── domain/              what a meal IS            depends on: @saucia/domain, kernel
├── application/         what the menu DOES         depends on: domain, its own ports, kernel
├── infrastructure/      how data is STORED         depends on: ports, domain, db-types, supabase
├── delivery/http/       how it is EXPOSED          depends on: application, delivery-shared
└── index.ts             what other code may USE    exports only the price adapter
```

## 1. Domain: the rules that hold regardless of storage

| File | Responsibility |
|---|---|
| `IDs.ts` | Branded `MealId` and `ItemId`, so one cannot be passed for the other. |
| `Meal.ts` | Identity and invariants: a meal has an id, a base price that is not negative, at least one item, no duplicate items. `create` and `reconstitute` share one validator. |
| `Item.ts` | Same pattern for additive items: id, unit price, free-allowance rule, availability. |

**Depends on:** `@saucia/domain` (for `Money`) and the kernel (for `Result` and `DomainError`). Nothing else.

**Shared package engaged:** `@saucia/domain` supplies `Money`. The entity uses it to hold prices, but the discount formula is not here. It belongs in `packages/domain/pricing`, so the client and the server compute the same discounted price.

**Why `Meal` holds `ItemId[]`, not `Item[]`:** an item is shared across meals and changes on its own (price, availability). Holding ids keeps the aggregates independent, and a meal survives a change to an item.

## 2. Application: what the menu can do

| File | Responsibility |
|---|---|
| `ports/MealRepository.ts` | The interface the use cases need for reading and writing meals. Defined here, implemented in infrastructure. |
| `use-cases/ListMeals.ts` | Catalog read: fetch meals, return them to the caller. Applies no storage detail. |
| `use-cases/PublishReview.ts` | Rating aggregation when a review is published (P3.5). Replaces the legacy `trigger_update_meal_rating_*` triggers, which is decision 16. |

**Depends on:** its own domain, its own ports, and the kernel. It must not import `infrastructure`. It receives the repository through its constructor.

**Shared package engaged:** indirectly. Use cases return `Result` and use domain types. They do not import `@saucia/db-types` or `@saucia/contracts`. The contract mapping for the response happens in `delivery`.

**Why a port here, and not a direct Supabase call:** the use case can be tested with an in-memory repository, which is what P2.6 requires.

## 3. Infrastructure: how meals are stored

| File | Responsibility |
|---|---|
| `supabase/dto/MealRow.ts` | Alias of the generated `meals` row type, narrowed to the columns the price reader needs. |
| `supabase/mappers/MealMapper.ts` | Converts a row to domain values. Money is converted to integer cents once, here. |
| `supabase/SupabaseMealRepository.ts` | Implements `MealRepository` with the Supabase client. Maps rows to `Meal` through the mapper. |
| `supabase/MenuPriceReader.ts` | Implements the **order module's** `MealPriceReader` port. Returns list prices for available meals. |

**Depends on:** `@saucia/db-types` (row types), `@supabase/supabase-js` (the client), its own domain (to build entities), and the ports it implements.

**Shared package engaged:** `@saucia/db-types` is the only place the row shape is defined, and it is generated. `@saucia/domain` supplies `Money` in the mapper.

**Why `MenuPriceReader` lives in `menu` but implements an `order` port:** the consumer owns the interface (decision 14 and dependency inversion). `order` declares what it needs, and `menu` provides it. Neither module imports the other. Composition connects them, and `menu/index.ts` exports only this adapter.

## 4. Delivery: how meals are exposed over HTTP

| File | Responsibility |
|---|---|
| `http/menuController.ts` | Receives the request, calls a use case, maps the `Result` to a response. |
| `http/routes.ts` | Maps URLs to controller methods. |

**Depends on:** `application` (use cases), `delivery-shared` (HTTP helpers), and `@saucia/contracts` for the response schema.

**Shared package engaged:** `@saucia/contracts` defines the wire shape, such as the `MealSummary` schema. The controller validates or serializes with it. This is the only ring that maps domain to wire.

**Why errors become status codes here:** `DomainError` carries a code and no HTTP status (decision 12). The controller maps `MEAL_NOT_FOUND` to 404, and an unknown code to 500. The domain never learns what a 404 is.

## 5. `index.ts`: the public surface

Exports `MenuPriceReader` only. Other modules and composition import through this file (decision 14). `Meal`, `Item` and the repository stay private until a second module needs them. A smaller surface is cheaper to keep stable.

## 6. `.gitkeep`

A placeholder that keeps the folder in git while it was empty. Delete it once real files exist, as the earlier script noted.

## The dependency flow

```
delivery  ──►  application  ──►  domain  ──►  @saucia/domain, kernel
                   ▲
                   │ implements
infrastructure ────┘          ──►  @saucia/db-types, supabase-js
                                       ▲
composition wires infrastructure ──────┘  (the only place that joins them)
```

Arrows point toward what a ring is allowed to depend on. No arrow points from `domain` or `application` toward `infrastructure`, and `delivery` never touches the database.

## Where each shared package is engaged

| Package | Engaged in | Why there |
|---|---|---|
| `@saucia/domain` | `domain/` (Money), `infrastructure/` mapper | Pure rules and values that client and server must agree on. |
| `@saucia/contracts` | `delivery/` | The wire shape is a contract with the client, not a server internal. |
| `@saucia/db-types` | `infrastructure/` only | The database shape is an implementation detail, and it must not leak into business rules. |

## Why it is shaped this way

- **Each ring can change without the others.** Replacing Supabase changes `infrastructure/` only. Changing the HTTP framework changes `delivery/` only.
- **Business rules are testable without a database.** `Meal` and the use cases run against in-memory fakes.
- **The shared packages stay small.** Only `Money` and the schemas are shared. Entities and repositories are server-local, because they have identity and server-only invariants.

## Open items in this tree

1. `IDs.ts` is imported by `order`. Move it to `@saucia/domain` so both modules share one brand (see the earlier note on decision 14).
2. `MealRepository.ts` and `SupabaseMealRepository.ts` need to match. Write the port first, then the adapter.
3. `ListMeals.ts` and `PublishReview.ts` are not yet connected to `routes.ts`. Wire them in `composition/` when the endpoints exist.