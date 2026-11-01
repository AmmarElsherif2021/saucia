## TypeScript OOP tips

**1. Prefer `private constructor` plus static factories.** A constructor cannot return an error, so `create` returns `Result` and the only way in is through validation. This is how `Order.create` already works.

```ts
export class Meal {
  private constructor(private readonly props: MealProps) {}
  static create(p: MealProps): MealResult<Meal> { /* validate, then new Meal(p) */ }
}
```

**2. Use `readonly` by default.** Fields that never change are `readonly`. Collections are exposed as `readonly T[]`, so callers cannot push into an internal array.

```ts
get itemIds(): readonly ItemId[] { return this.props.itemIds; }
```

**3. Use parameter properties sparingly.** `private constructor(private readonly cents: number)` is fine for a value object with one field. For entities with many fields, a `props` object is clearer and keeps the constructor stable as fields grow.

**4. Brand primitive ids.** A `number` for `mealId` and a `number` for `itemId` look identical to the compiler, so swapping them compiles. Branded types prevent that.

```ts
type MealId = number & { readonly __brand: 'MealId' };
type ItemId = number & { readonly __brand: 'ItemId' };
```

**5. Model states with string-literal unions, not enums.** `OrderStatus` is a derived union from an `as const` tuple. It is erasable, merges with JSON, and keeps one source of truth (decision 6).

**6. Use discriminated unions for outcomes.** `Result` is a union on `kind`, so `isFailure` narrows the type and the compiler forces the error branch to be handled.

**7. Keep `this` out of pure functions.** Pricing rules are plain exported functions (`discountRules.ts`). They take values and return values. No class is needed when there is no state.

**8. Avoid `class` where a function does the job.** `canTransition` is a function, not a method on a stateless class. Use classes when there is identity or state, not for namespacing.

**9. Prefer composition over inheritance.** There is no `Entity` base class that `Meal` and `Order` extend. Shared behavior, such as the `Result` pattern, is passed in as functions. Inheritance chains make invariants harder to see.

**10. Type the errors.** `DomainError<'MEAL_NOT_FOUND' | 'ITEM_UNAVAILABLE'>` makes each error code part of the signature, so a caller cannot forget one.

**11. Use `satisfies` and `as const` for lookup tables.** `ORDER_STATUS_TRANSITIONS` is typed as `Record<OrderStatus, readonly OrderStatus[]>`, so adding a status without a transition row fails to compile.

## SOLID, applied to your entities

**Single Responsibility.** Each file has one reason to change.
- `Money` changes only when arithmetic rules change.
- `Meal` changes when menu rules change (availability, item membership).
- `Order` changes when order lifecycle or snapshot rules change.
- `pricing/discountRules.ts` changes when the discount policy changes.

If a `Meal` method starts computing a discounted price, that is a sign the rule belongs in `pricing`. Keep the price formula out of the entity.

**Open/Closed.** Adding a new discount type should mean adding a new function, not editing an existing one.

```ts
type DiscountPolicy = (unitPrice: Money) => Money;
const percentageOff = (pct: number): DiscountPolicy => (p) => /* ... */;
```

A new policy is a new function. The `Order` code that applies it does not change.

**Liskov Substitution.** Any `DiscountPolicy` can replace another in the same position and still return a valid non-negative `Money`. The contract is the type plus the invariant, so a policy that returns a negative amount breaks LSP. `Money.subtract` already throws on that, which is a useful guard.

**Interface Segregation.** The menu module should not expose one large `MenuRepository` with every method. Split by consumer:
- `order` needs only `MealPriceReader` (one method).
- Admin needs create and update.
- Catalog reads need list and filter.

Small ports let each consumer depend on exactly what it uses.

**Dependency Inversion.** `Order` depends on the `MealPriceReader` port it declares, not on `menu`. `SubmitOrder` receives its repositories through the constructor. Domain code depends on abstractions owned by the consumer, and infrastructure depends on the domain.

```ts
// order/application/ports/MealPriceReader.ts
export interface MealPriceReader {
  getUnitPrices(ids: readonly MealId[]): Promise<Map<MealId, Money>>;
}
```

## Applying it to all four

| Concept | Main tips | Main principles |
|---|---|---|
| `Money` | Readonly value, operations return new instances, integer cents | SRP, LSP (throws on invalid subtract) |
| `Meal` | Private constructor, `create` returns `Result`, readonly `itemIds` | SRP, ISP (small read and write ports) |
| `Item` | Branded `ItemId`, `is_additive` as a flag, no price logic inside | SRP, OCP (new item kinds extend, not rewrite) |
| `Order` | Snapshot totals, `OrderLine` holds `unitPrice`, `updateStatus` returns `Result` | SRP, DIP (depends on `MealPriceReader` port) |
| `pricing` | Plain functions, no class, typed policy function | OCP (new policy = new function), LSP |

## Common mistakes to avoid

- **Anemic entities.** A `Meal` that is only a bag of fields, with all rules in services, moves the invariants away from the data they protect. Put the guards on the entity.
- **God services.** A `MenuService` that does everything violates SRP and ISP. Split by use case: `ListMeals`, `PublishReview`.
- **Getters that leak arrays.** `get items() { return this.props.items; }` lets callers mutate the entity. Return `readonly` types, and copy if necessary.
- **Premature abstraction.** Do not add a `DiscountPolicy` interface class hierarchy for one discount type. Start with one function and extract a policy only when a second type exists.

## Interview takeaways

1. TypeScript gives you structural typing, so you enforce SOLID with **types and ports**, not with class hierarchies.
2. Value objects are immutable and return new values. Entities guard invariants and return `Result`.
3. Pricing is a set of functions, because it has no identity. Making it a class would add state without a reason.
4. DIP is what keeps `order` from depending on `menu`. Name the port by what the consumer needs.