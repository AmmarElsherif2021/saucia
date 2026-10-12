# @saucia/domain

Pure business rules: money, order totals and status rules, cart rules, phone validation, BMI/TDEE.

- Imports nothing (innermost layer of the repo).
- No I/O, no framework, no runtime assumptions; testable without a DB or network.
- Source of truth for order-status values and transitions.

Folders under `src/`: `money`, `order`, `cart`, `identity`, `subscription`.
