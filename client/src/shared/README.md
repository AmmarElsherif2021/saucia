# shared/

Bottom layer: code with no business knowledge. Imports nothing from layers above.

| Folder | Purpose |
|---|---|
| `api/` | `edgeClient`, `errorNormalizer`, `supabaseClient` |
| `config/` | Constants and env access |
| `i18n/` | `dict.json` and i18n setup |
| `kernel/` | `AppError`, `Result` |
| `theme/` | Theme tokens |
| `assets/` | Images, icons, hero files |

`legacy-*` files here are scheduled for removal.
