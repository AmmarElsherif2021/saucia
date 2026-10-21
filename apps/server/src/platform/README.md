# platform/

Vendor adapters that implement ports: email, payment, Supabase client.

- Outer ring: depends on ports, never the reverse.
- Name adapters by the port they serve (`PaymentGateway`, `Mailer`), so swapping a provider is a new file, not a rename.
