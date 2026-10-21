# shared/

Bottom layer: code with no business knowledge. Imports nothing from layers above.

| Folder | Purpose |
|---|---|
| `api/` | `edgeClient`, `errorNormalizer`, `supabaseClient` |
| `config/` | Constants and env access |
| `i18n/` | `dict.json`, locale state, i18n setup |
| `kernel/` | `AppError` only — `Result` lives in `apps/server/src/kernel` |
| `lib/` | Framework-level hooks with no business knowledge (`useClickSpark`) |
| `theme/` | Theme tokens |
| `ui/` | Generic UI primitives (for example the three.js renderer) |
| `assets/` | Images, icons, hero art |

`legacy-*` files were removed from this layer on 2026-10-20; they live in
`_legacy/client/src/shared/` until their replacements land.

The brand SVG logo is served from `apps/customer-web/public/logo.svg` (favicon
and UI) so there is one copy instead of a bundled duplicate.
