# server/

Clean-architecture core. Business logic lives here and is delivered through Supabase Edge functions.

- Source in `src/`; deployment bundle built from `runtimes/supabase-edge/`.
- Imports `@saucia/*` packages; never imports `client/`.
- Dependency direction: `delivery -> application -> domain`; `infrastructure` implements application ports; only `src/composition` wires them together.

| Folder | Purpose |
|---|---|
| `src/` | Kernel, modules, platform adapters, composition root |
| `runtimes/` | Build targets (currently `supabase-edge`) |
| `tests/` | Use-case tests with in-memory ports |
