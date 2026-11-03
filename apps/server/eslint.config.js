// apps/server/eslint.config.js
// Inherits the root base. No React rules: the server is Clean, not FSD.

import base from '../../eslint.config.js';

export default [
  ...base,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'runtimes/**/*.ts'],
    rules: {
      // Bible §2.4: the service-role client is created only in platform/supabase
      // and module infrastructure/supabase. Backstop only; layering is enforced
      // by dependency-cruiser.
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@supabase/supabase-js'],
          message: 'Create the service-role client only in platform/supabase or module infrastructure/supabase (bible §2.4).',
        }],
      }],
    },
  },
  {
    files: ['src/platform/supabase/**', 'src/modules/*/infrastructure/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
];