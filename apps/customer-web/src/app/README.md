# app/
--------------------------------------------
## Top layer: application bootstrap.

- di/: dependency container; the only place that imports entity infrastructure.
- providers/: Session, Query, I18n, Theme, DI providers.
- router/: routes and guards.
- main.tsx: entry point.
- May import every layer below.