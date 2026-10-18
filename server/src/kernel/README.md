# kernel/

Smallest shared vocabulary for the server: `Result`, `DomainError`, and the ports `Clock`, `IdGenerator`, `Logger`.

- Every server layer may import it.
- It imports nothing from `server/src/modules`, `server/src/composition`, `server/src/platform` or `server/src/delivery-shared`.
- It must stay free of business rules (those belong in `@saucia/domain`), HTTP semantics, and framework types.

## Contents

| Export | Role |
| :--- | :--- |
| `Result`, `Ok`, `Err`, `Success`, `Failure`, `isSuccess`, `isFailure` | Explicit success/failure channel; no exceptions across layers. |
| `DomainError` | Expected business failure carrying a generic `code`, message and optional details. No status code, headers or response body. |
| `Clock` | Time port. Implementations live in `server/src/platform` and are injected by composition. |
| `IdGenerator` | ID port. Implementations live in platform adapters. |
| `Logger` | Logging port. Implementations live in platform adapters. |

Entities and aggregates (`Order`, `Meal`, `Cart`) do not belong here. They live in the app-local domain that owns their identity, lifecycle and invariants.
