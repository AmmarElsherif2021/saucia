# runtimes/supabase-edge

Build target: bundles the server core with every `@saucia/*` package inlined into one ESM file that Supabase Edge (Deno) can load.

## Why a bundle
Deno cannot reliably resolve pnpm `workspace:*` links, extensionless relative imports, or imports outside the function folder. The bundle flattens them at build time.

## Inputs
- `entry.ts` (this folder): re-exports what the functions need. Imports only `@saucia/*` packages and `apps/server/src`.
- Path aliases from `tsconfig.base.json`.

## Output
- `supabase/functions/_shared/server-bundle.mjs`. **Generated and gitignored. Never edit or commit.**

## Build
    pnpm --filter @saucia/server build:edge

Rebuild after any change under `packages/*` or `apps/server/src/*`.

## Rules
1. The bundle is an artifact. Source changes go in `packages/` or `apps/server/src/`, never in the output.
2. Function entries in `supabase/functions/*` are thin: import the bundle, route, return. No business logic.
3. The bundle must contain no `@saucia/*` import specifiers. Check:
       grep -E "(from|import\()\s*[\"']@saucia/" supabase/functions/_shared/server-bundle.mjs
   Expected output: nothing.
4. CI (`deploy.yml`, not yet created) runs `build:edge` before `supabase functions deploy`.

## Fallback (only if bundling fails)
- Add a `deno.json` import map in each function folder mapping `@saucia/*` to `packages/*/src/index.ts`.
- Use explicit `.ts` extensions in relative imports inside `packages/*`. This requires TypeScript 5.7+ (`rewriteRelativeImportExtensions`); verify the locked version first.

## Status
- Spike: see bible §4 P0.8 and §5.
- Verified locally: <date>, Deno <version>.