# kernel/

Smallest shared vocabulary for the server: `Result`, `DomainError`, and the ports `Clock`, `IdGenerator`, `Logger`.

- Every server layer may import it.
- It imports nothing from the server.
- Must stay free of business rules (those belong in `@saucia/domain`).
