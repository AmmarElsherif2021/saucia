# runtimes/supabase-edge

Build target that bundles the server (with `@saucia/*` inlined) into one ESM file written to `supabase/functions/_shared/`.

- The bundle is generated: gitignore it, build it locally and in `deploy.yml`.
- Each function in `supabase/functions/*` is a thin entry importing from that bundle.
- Fallback if bundling fails: `deno.json` import maps with `.ts` extensions throughout the packages.
