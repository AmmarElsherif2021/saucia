# packages/

Shared leaf packages, consumed by `client/` and `server/`.

- **Leaves:** nothing here may import from `client/`, `server/`, `apps/` or `supabase/`.
- **Just-in-time:** each package's `exports` point at TS source, so there is no build step.
- Naming: `@saucia/<package>`.

| Package | Purpose |
|---|---|
| `domain/` | Pure business rules |
| `contracts/` | Wire shapes shared by client and server |
| `db-types/` | Generated database row types |

# Article to publish:
# Domain and Contracts: two modules, two roles

Two modules carry the order-status concern in the shared packages. They are not peers; they sit at different points on a single axis from *truth* to *projection*.

| Module | Role | Verdict |
|---|---|---|
| `packages/domain/src/order/OrderRules.ts` | Canonical rules. Owns the status list and the transitions. | **Source of truth** |
| `packages/contracts/src/order/orderStatus.ts` | Wire shape. Derives from the domain; adds transport concerns (Zod, JSON). | **Projection** |

The differentiation below is four architectural *levels* (type, value, behaviour, boundary), each with its own OOP principles and GoF patterns. The server-local file is treated separately at the end.

---

## Level 1 — Type level

The compiler sees a type. What kind of type, and where does it come from?

**Domain** — a *derived union* from a canonical literal tuple. This is the TypeScript equivalent of a Value Object: identity is the value itself, not an object reference.

```ts
export const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing',
  'out_for_delivery', 'delivered', 'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
```

- **Single Responsibility** — the file is the only one that names the members.
  - *Search: SOLID, Cohesion, Separation of Concerns.*
- **Open/Closed** — adding a status extends `ORDER_STATUSES`; every consumer of the derived type keeps compiling.
  - *Search: SOLID, Extensibility, Polymorphism.*
- **Pattern:** *Value Object* (type-level form; TypeScript does not require a `class`).
  - *Search: DDD Value Object, Eric Evans, Immutability.*
- **TS construct:** `as const` + indexed access. Deliberately not `enum` — `enum` is nominal and emits runtime values; a derived union merges cleanly with everything downstream.

**Contracts** — the *same shape*, re-exported under a wire-facing name.

```ts
export type { OrderStatus } from '@saucia/domain';
```

- **Liskov Substitution** at the type level — the wire type is the domain type, so a value satisfying one satisfies the other. No "structurally similar" twin to drift.
  - *Search: SOLID, Subtyping, Type Theory.*
- **Dependency Inversion** — contracts depends on the abstraction (`@saucia/domain`), not the reverse.
  - *Search: SOLID, Hexagonal Architecture, Inversion of Control.*
- **Pattern:** *Facade* — the file presents a wire-facing surface, hiding that the type lives upstream.
  - *Search: GoF Structural, API Design.*

The type level decides the source-of-truth question. A type can have one home.

---

## Level 2 — Value level

What exists at runtime, after the types are erased?

**Domain** — the literal array *is* the runtime representation. It is the only place a status string is written down.

```ts
export const ORDER_STATUSES = ['pending', 'confirmed', ...] as const;
```

- **Information Expert** (GRASP) — the module owning the data owns the constant.
  - *Search: GRASP, Responsibility Assignment, Craig Larman.*
- **Pattern:** *Registry* — the array is the single registry of valid statuses.
  - *Search: PoEAA Registry, Service Locator, Martin Fowler.*

**Contracts** — derives the runtime enum *from* the registry.

```ts
import { ORDER_STATUSES } from '@saucia/domain';
import { z } from 'zod';

export const orderStatusSchema = z.enum(ORDER_STATUSES);
```

- **DRY** enforced at runtime, not just at the type level.
  - *Search: Don't Repeat Yourself, Single Source of Truth, Normalization.*
- **Pattern:** *Adapter* — Zod is a transport concern; the adapter reads from the domain, not a copy.
  - *Search: GoF Structural, Hexagonal Ports & Adapters.*
- **What would be wrong:** `z.enum(['pending', 'confirmed', ...])`. That is a fourth definition at the value level. TypeScript will not catch it; a reviewer must.

The value level is where "derive, never redefine" is enforceable.

---

## Level 3 — Behaviour level

What does the module *do* when asked?

**Domain** — owns the transition rules. This is the *State* pattern in its purest TS form: no `class State` hierarchy, just a map and a predicate.

```ts
const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['processing', 'cancelled'],
  processing:       ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered:        [],
  cancelled:        [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
```

- **Single Responsibility** — the only module that knows what a legal transition is.
  - *Search: SOLID, Cohesion.*
- **Polymorphism without inheritance** — `TRANSITIONS` is a data-driven dispatch table. Adding a status means adding a key.
  - *Search: Data-Driven Design, Table-Driven Methods, Steve McConnell.*
- **Pattern:** *State* (data-driven form). The GoF version uses a class hierarchy; the TS form uses a map keyed by the state value.
  - *Search: GoF Behavioral State, Finite State Machine, Statecharts.*
- **Pattern:** *Guard* — `canTransition` is a pure predicate with no side effects, which is what allows the client and the server to share it without owning each other.
  - *Search: Design by Contract, Bertrand Meyer, Preconditions.*

**Contracts** — no behaviour. Deliberately.

- **Single Responsibility** — contracts describes shapes; if it validated transitions, it would have two reasons to change (wire format *and* business rules).
- **YAGNI** — no `canTransition` re-implementation in the wire layer. If the client needs to know a transition is legal before sending, it imports the domain's guard.
  - *Search: XP Practices, You Aren't Gonna Need It, Simplicity.*
- **Pattern:** *DTO* — an intentionally anemic object. Its only job is to describe what travels.
  - *Search: PoEAA Data Transfer Object, Martin Fowler.*

The behaviour level is where the domain's authority is exercised. Contracts stays silent.

---

## Level 4 — Boundary level

What crosses the process boundary, and in what form?

**Domain** — nothing crosses. The domain package is a leaf. It has no knowledge of HTTP, JSON, or Supabase.

- **Dependency Inversion** — the domain does not depend on transport. Transport depends on the domain.
  - *Search: SOLID, Hexagonal Architecture, Alistair Cockburn.*
- **Pattern:** *Ports and Adapters* — the domain sits at the centre; adapters around it. `@saucia/domain` is the centre; `@saucia/contracts` is an adapter.
  - *Search: Hexagonal Architecture, Onion Architecture, Clean Architecture.*

**Contracts** — the domain gets serialised here.

```ts
export const submitOrderSchema = z.object({
  items: z.array(z.object({ mealId: z.string(), qty: z.number().int().positive() })),
  status: orderStatusSchema.optional(),
});
export type SubmitOrder = z.infer<typeof submitOrderSchema>;
```

- **Interface Segregation** — the wire schema exposes exactly what travels. It does not expose `canTransition` or `TRANSITIONS`, because those are not wire concerns.
  - *Search: SOLID, Role Interfaces, Client-Specific Interfaces.*
- **Pattern:** *Adapter* — Zod adapts between "domain values" and "JSON-shaped bytes."
- **Pattern:** *Facade* — the file presents the domain's `OrderStatus` to the client under a transport-ready name.

The boundary level makes the direction of dependency visible. The domain points at nothing. Contracts points at the domain.

---
# But why the abscence of Entities and Aggregates in the shared packages?
Entities and aggregates belong to the bounded context that owns their identity, lifecycle and invariants — not to packages/domain by default.

## Decision rules:
1. Does it cross the process boundary?

    Answer: Define a DTO or schema in packages/contracts (for example: SubmitOrderRequest, MealSummary).

2. Does it have identity, lifecycle, or invariants?

    Answer: Place it as an entity or aggregate in the owning app context (for example: the Order aggregate in server/src/modules/order/domain/Order.ts or the Meal entity in server/src/modules/menu/domain/Meal.ts).

3. Is it I/O-free behavior that must be identical on client and server?

    Answer: Place it in packages/domain (acting as a shared kernel for pure policy, value objects, and shared behavior like Money, OrderStatus, canTransition, and totals).

4. Is it only a UI projection or local state?

    Answer: Place it in the client-side entities slice (client/src/entities/{order,menu}/domain/).

5. Is it a database row?

    Answer: Place it in packages/db-types accompanied by an infrastructure mapper.
----------------------------------
## How the patterns orchestrate

Each pattern above has a narrow role. They compose because each one only knows about the one immediately downstream. Tracing a single request shows the chain.

### Scenario — client submits an order

**Client side:**

1. A form component builds a payload. It types the payload as `SubmitOrder` — the type inferred from `submitOrderSchema` (from **contracts**).
   - *Pattern invoked:* **DTO** — the object exists only to travel.
2. Before sending, the form optionally calls `canTransition(currentStatus, 'confirmed')` to disable the submit button when the transition is illegal.
   - *Pattern invoked:* **Guard** — a pure predicate; no state, no side effects.
   - *Pattern feeding it:* **State** — `canTransition` reads `TRANSITIONS`, the data-driven state map.
   - *Pattern feeding that:* **Registry** — `TRANSITIONS` is keyed by `OrderStatus`, whose members come from `ORDER_STATUSES`.
   - *Principle in play:* **Dependency Inversion** — the client calls the domain without knowing the domain.
3. The form serialises the payload. The wire bytes are a shape whose `status` field is validated against `orderStatusSchema`.
   - *Pattern invoked:* **Adapter** — Zod converts between in-memory values and wire-shaped JSON.
   - *Pattern feeding it:* **Facade** — the type is re-exported from `@saucia/domain` under the contracts' name.
   - *Principle in play:* **Liskov Substitution** — the wire type *is* the domain type, so a value satisfying one satisfies the other.

**Wire:**

4. The payload crosses the network. Nothing in it knows about TypeScript, Zod, or the domain. It is JSON.
   - *Pattern in play:* **DTO** — by the time it is bytes, the object has only one responsibility: carry data.

**Server side:**

5. The edge function receives the payload and calls `submitOrderSchema.parse(body)`.
   - *Pattern invoked:* **Adapter** — the same Zod schema, now on the inbound edge.
   - *Principle in play:* **Interface Segregation** — the schema admits exactly what travels, and no more.
6. The use case (`SubmitOrder`) loads the current `Order` aggregate and calls `canTransition(order.status, next)`.
   - *Patterns invoked:* **Guard** → **State** → **Registry**, same chain as the client, same files.
   - *Principle in play:* **Information Expert** — the module with the data owns the rule.
7. The use case mutates the aggregate. `Order` carries any persistence-facing invariants (e.g. "cancelled is terminal once the delivery row exists") that go beyond the status table.
   - *Principle in play:* **Single Responsibility** — the status table answers "which statuses may follow which"; the aggregate answers "under what persistence conditions." Different reasons to change, different modules.
8. The response payload is typed as `OrderStatus` — the re-exported type from contracts, which is the domain's type.
   - *Patterns re-invoked:* **DTO** and **Facade** on the outbound edge.

**Back on the client:**

9. The response is parsed against the same schema. The rendering components pattern-match on the status string.
   - *Pattern invoked:* **State** — the UI branches on the status value, using the same canonical members.
   - *Principle in play:* **Open/Closed** — adding a status adds a branch in the renderer, but does not edit the domain, the contracts, or any other consumer.

### The orchestration graph

```
                  ORDER_STATUSES  (Registry)
                          │
                          │ keyed-by
                          ▼
                     TRANSITIONS  (State)
                          │
                          │ consumed-by
                          ▼
                   canTransition  (Guard)
                          │
                          │ called-by
              ┌───────────┴────────────┐
              ▼                        ▼
       client form              server use-case
              │                        │
              │ builds                 │ validates
              ▼                        ▼
      SubmitOrder (DTO)  ───wire───►  submitOrderSchema (Adapter)
              │                        │
              │ typed-as               │ re-exports
              ▼                        ▼
        OrderStatus  ◄── Facade ──  @saucia/domain
```

Read the arrows:

- The **Registry** is at the top because it is the only module that spells a status string.
- The **State** map and the **Guard** predicate are behaviours that read the registry.
- The **DTO** and the **Adapter** are boundary concerns that carry the value across the wire.
- The **Facade** is the seam that lets the wire layer re-export the domain's type without importing anything else from it.
- The **Value Object** is the type itself — present at every node, owning no node.

Each pattern is replaceable in isolation:

- Swap Zod for Yup → only the **Adapter** changes. The Registry, State, and Guard are untouched.
- Add a status → only the **Registry** changes. The State map gains a key; the Guard predicate needs no edit; the Adapter reads the new value automatically; every DTO and Facade picks it up because they were derived.
- Move `canTransition` from the client to the server only → the **Guard** and its callers change. The Registry and State stay put.

That substitutability is what "orchestration" means here: the patterns do not collaborate by knowing about each other. They collaborate by agreeing on a single axis — the canonical list of statuses — and by each facing only the node immediately downstream of it.

### The single invariant that holds them together

> **Derive, never redefine.**

The moment any node in that graph spells a status string itself, the orchestration breaks. The compiler will not notice if the two copies happen to agree today; it will notice the day they do not, and by then the failure is in production.

The Registry is the anchor. Every other pattern hangs off it, in one direction, without loops.

---

## Summary table

|  | `packages/domain` | `packages/contracts` | `server/.../domain` |
|---|---|---|---|
| **Type level** | Canonical union, derived from `as const` tuple | Re-export of the domain type | Duplicate union (delete) |
| **Value level** | Canonical literal array | `z.enum(ORDER_STATUSES)` | Duplicate array or enum (delete) |
| **Behaviour level** | Transition map + `canTransition` guard | None (deliberate) | None; if it exists, it belongs next to `Order.ts` |
| **Boundary level** | Leaf; knows nothing of transport | Adapter + Facade for JSON | None |
| **Primary principle** | Single Responsibility, Open/Closed | Dependency Inversion, Liskov | (violated) DRY |
| **Primary GoF pattern** | State (data-driven), Value Object | DTO, Adapter, Facade | Anti-pattern (shadow copy) |
| **Reason to change** | The business changes its mind | The wire format changes | Nothing — it should not exist |