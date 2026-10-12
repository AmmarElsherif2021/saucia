# @saucia/contracts

The wire layer between client and server: request/response schemas, error codes, status enums as wire types.

- May import `@saucia/domain`.
- **Derive, never redefine:** enums here come from the domain lists.
- Server returns error *codes*; the client maps codes to `dict.json` keys (messages are client-only).

Folders under `src/`: `errors`, `order`, `subscription`.
