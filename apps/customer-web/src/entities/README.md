# entities/

Business objects as the client sees them (`order`, `cart`, `session`, `meal`, `address`, `message`, `subscription`).

Rings inside a slice, added only when the first file needs them:

```
domain  <-  ports + application  <-  infrastructure
                                 <-  model  <-  ui
```

- `model/` and `ui/` get use cases through DI, never from `infrastructure/`.
- May import `shared` only (cross-entity references use FSD's `@x` convention).
