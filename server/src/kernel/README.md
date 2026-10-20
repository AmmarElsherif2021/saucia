# kernel/
The server is built in layers, like an onion. The kernel is the tiny center of that onion: a shared dictionary of three things everyone needs — how to report success/failure (Result), what a business error looks like (DomainError), and three interfaces for outside stuff (Clock, IdGenerator, Logger).

Result.ts is the file that answers one question: "When this function fails, how does it tell me?" Answer: it returns the failure, it doesn't throw it.

- Every server layer may import from the kernel.
- It imports nothing from `server/src/modules`, `server/src/composition`, `server/src/platform` or `server/src/delivery-shared`.
- It must stay free of business rules (those belong in `@saucia/domain`), HTTP semantics, and framework types.

## Contents

| Export | Role |
| :--- | :--- |
| `Result`, `Ok`, `Err`, `Success`, `Failure`, `isSuccess`, `isFailure` | Explicit success/failure channel; no exceptions across layers. |
| `DomainError` | Expected business failure carrying a generic `code`, a fixed client-safe `message`, an `internalMessage` for logs, and optional details. No status code, headers or response body. |
| `Clock` | Time port. Implementations live in `server/src/platform` and are injected by composition. |
| `IdGenerator` | ID port. Implementations live in platform adapters. |
| `Logger` | Logging port. Implementations live in platform adapters. |

Entities and aggregates (`Order`, `Meal`, `Cart`) do not belong here. They live in the app-local domain that owns their identity, lifecycle and invariants.

> **Contract note (2026-10-20).** `DomainError` exposes `code`, a fixed
> client-safe `message` (`'Domain error'`), `internalMessage` for logging, and
> `details`. Delivery maps `code` to the public response and must never forward
> `internalMessage`. Where the article below says "message", read
> `internalMessage` for logs and the generic `message` for clients.

# Article:

---

## Introduction

The server is built in layers, like an onion. The **kernel** is the tiny center of that onion: a shared dictionary of three things everyone needs — how to report success/failure (`Result`), what a business error looks like (`DomainError`), and three interfaces for outside stuff (`Clock`, `IdGenerator`, `Logger`).

`Result.ts` is the file that answers one question: **"When this function fails, how does it tell me?"** Answer: it *returns* the failure, it doesn't *throw* it.

---



### 1. What `Result` actually is:

Think of a function's return value as a box with a label on it:

```ts
Result<Order, DomainError>
//     ^^^^^  ^^^^^^^^^^^
//     if it worked, you get an Order
//            if it failed, you get a DomainError
```

The box (A child of Result class) always has a `kind` sticker on it — `'success'` or `'failure'` — so you can always tell which one you're holding:

```ts
const result = await submitOrder(userId, request);

if (isFailure(result)) {
  // TypeScript now KNOWS result.error exists
  return mapErrorToHttp(result.error);   // e.g. 404
}

// TypeScript now KNOWS result.value exists
return json(result.value, 201);
```

The API is deliberately boring:

| Name | What it does |
|---|---|
| `Ok(value)` | Wraps a success |
| `Err(error)` | Wraps a failure |
| `isSuccess(x)` / `isFailure(x)` | Tells you which one you have (and narrows the type) |

That's it. No `.map()`, no `.unwrap()`, no chaining. It's a box with a sticker, not a framework.

**Why the `kind` field instead of `instanceof`?** Because `instanceof` breaks the moment two copies of the class exist (bundlers do this all the time). A plain string field always works.

## 3. Why return errors instead of throwing?

Compare the two styles for the same bug:

```ts
// ❌ Throwing style
async function submitOrder(...) {
  if (!meal) throw new DomainError('MEAL_NOT_FOUND', '...');
  ...
}

// Somewhere far away — the controller
app.post('/orders', async (req, res) => {
  try {
    const result = await submitOrder(...);
    res.json(result);
  } catch (e) {
    // ...what is `e`? A DomainError? A Supabase network error?
    // A bug in your code? You genuinely cannot tell from here.
    // If you forget this try/catch, the user gets a 500 for "meal not found".
  }
});
```

```ts
// ✅ Result style
async function submitOrder(...): Promise<Result<Order, DomainError>> {
  if (!meal) return Err(new DomainError('MEAL_NOT_FOUND', '...'));
  return Ok(order);
}

// Somewhere far away — the controller
const result = await submitOrder(...);
// TypeScript forces you to deal with it. You literally cannot
// use the Order without checking isFailure() first.
```

The compiler becomes your reviewer. With `throw`, forgetting to handle an error is invisible. With `Result`, forgetting is a **type error** — you can't reach `result.value` without going through the guard.

Three practical consequences:

1. **Expected failures are data, not disasters.** "Meal not found" is normal. It shouldn't unwind the stack.
2. **Exceptions are reserved for real bugs** (`TypeError`, undefined access, network dead). If you see `throw` in this codebase outside infrastructure, be suspicious.
3. **Every layer handles failure explicitly.** Nobody silently swallows errors.

## 4. What the kernel layer is (and the one rule)

The kernel is the **innermost layer**. Its one rule is a one-way street:

> **Everyone can import the kernel. The kernel can import nobody.**

```
modules/.../domain        ─┐
modules/.../application   ─┤
modules/.../delivery      ─┤
modules/.../infrastructure─┤
platform/                 ─┼──►  kernel/   ──►  (nothing)
delivery-shared/          ─┤
composition/              ─┘
```

This is enforced by a lint tool, [`.dependency-cruiser.cjs`](D:\projects\saucia-v2\.dependency-cruiser.cjs#L31-L33), run via `pnpm arch`. If you accidentally write `import { Order } from '../../modules/order/domain/Order'` inside the kernel, `pnpm arch` goes red.

**Why so strict?** Because `Result` is imported by *everything*. If `Result` imported `Order`, then `Order`'s dependencies would leak into every single file in the server. The kernel is small precisely so it can be safely everywhere. It's plumbing, not furniture.

Analogy: the kernel is the office's **power outlet standard**. Every room uses the same socket. But the socket standard itself must not depend on any particular appliance, or it's no longer a standard.

**Why does the kernel include `Clock`, `IdGenerator`, `Logger`?** Same logic. Your use case needs "what time is it?" but should not import `Date` directly or a vendor logger — otherwise tests can't control time and you can't swap vendors. So the kernel declares the *interface*:

```ts
export interface Clock {
  now(): Date;
}
```

The concrete implementation lives out in [`platform/`](D:\projects\saucia-v2\server\src\kernel\ports\Clock.ts), and `composition/` passes it into the use case. This is "dependency inversion" — the inner layer owns the interface; the outer layer owns the implementation.

## 5. Who is allowed to import the kernel and what they use it for

| Layer | Folder | Uses the kernel how |
|---|---|---|
| Domain | `modules/order/domain/` | Creates `DomainError`s when an entity rule is broken (`FINANCIAL_MISMATCH`) |
| Application | `modules/order/application/` | **Main user.** Returns `Result<T, DomainError>`; receives `Clock`/`IdGenerator`/`Logger` in its constructor |
| Delivery | `modules/order/delivery/` | **The translator.** Turns `Ok` into a 2xx and `Failure<DomainError>` into a 404/400 JSON response |
| Infrastructure | `modules/order/infrastructure/` | Implements the application's ports (Supabase repo); returns data or `null`, doesn't invent business errors |
| Platform | `platform/` | Implements the kernel's `Clock`/`IdGenerator`/`Logger` |
| Composition | `composition/` | Wires it all together: creates the adapters, passes them to use cases |
| **`packages/domain`** | `packages/domain/` | **NOT allowed.** It's shared with the client, so it must not know about a server-local type. It uses plain `{ isValid, error }` objects instead. |

## 6. Follow one failed order through the layers

This is the flow, and it's the whole point of the design:

```
POST /orders
   │
   ▼
delivery/http/routes.ts        →  picks the controller
   │
   ▼
orderController                →  calls the use case, reads the Result
   │
   ▼
SubmitOrder (application)      →  business decisions happen here
   │  ├── asks MealPriceReader: "price of meal X?"
   │  └── rule broken → return Err(new DomainError('MEAL_NOT_FOUND', ...))
   │
   ▼
SupabaseOrderRepository        →  talks to the database, returns Order | null
```

And the trip back up:

```
"meal not found"
   → use case returns  Err(DomainError { code: 'MEAL_NOT_FOUND' })
   → controller matches on  result.error.code  →  picks HTTP 404
   → response: { error: { code: 'MEAL_NOT_FOUND', message: '...' } }
```

The key teaching point: **`DomainError` has no HTTP status on it.** It only has a `code`. The kernel is forbidden from knowing what a 404 is — that's a web concept, and the kernel is supposed to be usable from a cron job or an edge function too. Choosing the status number is the delivery layer's job, and *only* the delivery layer's job.

## 7. "Where do I put my new code?" — cheat sheet

| You're writing… | Goes in… | Touches kernel? |
|---|---|---|
| A calculation: prices, BMI, order totals | `packages/domain/` | No |
| An entity + its invariants (`Order`, `Meal`) | `modules/<bc>/domain/` | Maybe `DomainError` |
| A business operation ("submit this order") | `modules/<bc>/application/use-cases/` | Yes — returns `Result` |
| An interface the use case needs from the DB | `modules/<bc>/application/ports/` | No |
| The actual Supabase query | `modules/<bc>/infrastructure/` | Rarely |
| A route / controller | `modules/<bc>/delivery/http/` | Yes — reads the `Result` |
| A `Result` → HTTP response mapper | `delivery-shared/http/` | Yes |
| Wiring: "use Supabase here, real clock there" | `composition/` | Yes |
| `Order`, `Meal`, `Cart` inside `kernel/` | 🚫 **Nowhere.** Never. | — |

## 8. Five traps to avoid

1. **Don't put entities in the kernel.** `Order`, `Meal`, `Cart` belong to the module that owns their lifecycle. The kernel is vocabulary, not a junk drawer. (The docs call this out explicitly.)
2. **Don't return `Result` from the controller.** The controller is the exit door. By the time data leaves it, it's plain JSON. `Result` must never appear in an HTTP response body.
3. **Don't import `@saucia/contracts` into the kernel.** That's why [`DomainError`](D:\projects\saucia-v2\server\src\kernel\DomainError.ts#L10) is generic: `DomainError<Code extends string = string>`. The kernel stays free of the error-code enum so it could be moved into a shared package later.
4. **Don't `throw` a `DomainError`.** That was the *old* plan in the ADR, and it was deliberately reversed. Today: return `Err(...)`. (The code samples in [`saucia-phase2.md`](D:\projects\saucia-v2\docs\adr\saucia-phase2.md#L646-L659) still show the old style — they're outdated. Trust `kernel/README.md`.)
5. **Don't put `statusCode` on `DomainError`.** Tempting, convenient, and explicitly rejected (see [bible:122](D:\projects\saucia-v2\docs\adr\saucia-project-bible.md#L122)). Codes go in, HTTP comes out at the edge.

## 9. What's actually built today

Be aware: the kernel is real, but almost everything around it is a stub.

- ✅ `server/src/kernel/` — complete, with tests (3 for `Result`, 5 for `DomainError`).
- 🚧 `SubmitOrder.ts`, `orderController.ts`, `Order.ts`, `container.ts`, `routes.ts`, the Supabase repository — all contain literally `// TODO: implement`.

So `Result` currently has **zero real callers**. It's a contract waiting for its first user. That first user will be the `SubmitOrder` use case. If you write it, your signature should be:

```ts
// Illustration only — this file is still a TODO stub
export class SubmitOrderUseCase {
  constructor(
    private readonly orders: OrderRepository,
    private readonly mealPrices: MealPriceReader,
    private readonly clock: Clock,        // from kernel
    private readonly ids: IdGenerator,    // from kernel
    private readonly logger: Logger,      // from kernel
  ) {}

  async execute(userId: string, request: SubmitOrderRequest): Promise<Result<Order, DomainError>> {
    const meals = await this.mealPrices.getMealPrices(...);
    if (meals.length === 0) {
      return Err(new DomainError('MEAL_NOT_FOUND', 'No meals found'));
    }
    return Ok(order);
  }
}
```

Read the constructor and the return type out loud: *"I need a repository, a price reader, a clock, an ID maker and a logger; give me back an `Order` or a `DomainError`."* Everything about the architecture is in that one line.