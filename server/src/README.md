# server/src

| Folder | Layer | Role |
|---|---|---|
| `kernel/` | Innermost | `Result`, `DomainError`, ports (`Clock`, `IdGenerator`, `Logger`) |
| `modules/` | Core | One folder per bounded context |
| `delivery-shared/` | Outer | HTTP helpers used by module delivery code |
| `platform/` | Outer | Vendor adapters (email, payment, supabase) |
| `composition/` | Outermost | Container, env, routes: the only place that wires infrastructure to use cases |
