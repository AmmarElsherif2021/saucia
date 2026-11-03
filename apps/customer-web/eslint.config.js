// apps/customer-web/eslint.config.js
// Inherits the root base. Adds React rules for the client source only.

import base from '../../eslint.config.js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  ...base,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Warn during rollout. At the Phase 1 gate: 'error' and --max-warnings=0.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];