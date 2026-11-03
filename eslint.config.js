// eslint.config.js (repo root): shared base for every workspace.
//
// Scope: syntax, TypeScript, general JS and React-agnostic rules only.
// Architecture boundaries are NOT enforced here:
//   - layers and modules:  .dependency-cruiser.cjs
//   - FSD public API:      steiger.config.mjs
// One rule, one owner.
//
// Workspaces spread this file: import base from '../../eslint.config.js'.
// Ignore patterns are written as '**/...' because a spread config resolves
// its patterns relative to the workspace that loads it, not to the root.

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/*.d.ts',
      '**/_legacy/**',
      '**/legacy-*',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Prefer the TypeScript-aware rule; the base rule misreports type-only uses.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  },
);