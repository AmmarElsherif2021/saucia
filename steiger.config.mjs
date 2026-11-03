// steiger.config.mjs
//
// FSD rules come from @feature-sliced/steiger-plugin (0.8.2, namespace "fsd").
// configs.recommended enables 16 rules, all as "error". The overrides below
// are the only deviations; each is listed with its reason in the bible
// (section 8) and must be removed or promoted, not extended silently.
//
// ESM (.mjs) because the repo is "type": "module".
//
// Scope: apps/customer-web/src only. The server is Clean architecture and is
// covered by dependency-cruiser.

import fsd from '@feature-sliced/steiger-plugin';

export default [
  ...fsd.configs.recommended,
  {
    rules: {
      // Scaffolded slices are intentionally empty until Phase 2+.
      'fsd/no-segmentless-slices': 'off',
      'fsd/insignificant-slice': 'off',

      // FSD-idiomatic segment names. Re-check at Phase 1 exit.
      'fsd/segments-by-purpose': 'off',

      // Rollout: warn until the customer app has zero findings, then 'error'.
      'fsd/public-api': 'warn',
      'fsd/no-public-api-sidestep': 'error',
      'fsd/forbidden-imports': 'warn',
    },
  },
];