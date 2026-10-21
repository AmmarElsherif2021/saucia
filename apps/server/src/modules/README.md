  # modules/

One folder per bounded context: `order`, `menu`, `identity`, `subscription`, `payment`, `notification`.

Inside each module:

| Ring | Contains | May import |
|---|---|---|
| `domain/` | Aggregates, status, errors | `@saucia/domain`, kernel |
| `application/` | `ports/` and `use-cases/` | domain, ports |
| `infrastructure/` | Repositories, `dto/`, `mappers/` | ports, domain, `@saucia/db-types` |
| `delivery/http/` | Controllers, routes | application |

A module must not import another module's `domain`, `application` or `infrastructure`.
