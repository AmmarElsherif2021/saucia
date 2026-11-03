/** @type {import('dependency-cruiser').IConfiguration} */
const serverModules = [
  'health-profile','identity','menu','notification','order','payment','subscription',
];
const modulePublicApiRules = serverModules.map((m) => ({
  name: `module-${m}-public-api-only`,
  severity: 'error',
  comment: `Only modules/${m}/index.ts importable from outside ${m} (decision 14).`,
  from: { pathNot: `^apps/server/src/modules/${m}/` },
  to: {
    path:    `^apps/server/src/modules/${m}/`,
    pathNot: `^apps/server/src/modules/${m}/index\\.ts$`,
  },
}));
module.exports = {
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.base.json' },   // resolves @saucia/* aliases
    tsPreCompilationDeps: true,                     // type-only imports count too
  },

  forbidden: [
    // ---- client: Clean rings inside entities (bible §2.2) ----
    { name: 'client-inner-rings-no-infra', severity: 'error',
      from: { path: '^apps/customer-web/src/entities/[^/]+/(domain|ports|application|model|ui)/' },
      to:   { path: '^apps/customer-web/src/entities/[^/]+/infrastructure/' } },
    { name: 'client-infra-only-from-di', severity: 'error',
      from: { pathNot: '^(apps/customer-web/src/app/di/|apps/customer-web/src/entities/[^/]+/infrastructure/)' },
      to:   { path: '^apps/customer-web/src/entities/[^/]+/infrastructure/' } },
    { name: 'client-domain-pure', severity: 'error',
      from: { path: '^apps/customer-web/src/entities/[^/]+/domain/' },
      to:   { path: '^apps/customer-web/src/entities/[^/]+/(ports|application|infrastructure|model|ui)/' } },

    // ---- client: FSD layers import downward only (bible §2.1) ----
    { name: 'fsd-shared-is-bottom', severity: 'error',
      from: { path: '^apps/customer-web/src/shared/' },
      to:   { path: '^apps/customer-web/src/(app|pages|widgets|features|entities)/' } },
    { name: 'fsd-entities-no-upward', severity: 'error',
      from: { path: '^apps/customer-web/src/entities/' },
      to:   { path: '^apps/customer-web/src/(app|pages|widgets|features)/' } },
    { name: 'fsd-features-no-upward', severity: 'error',
      from: { path: '^apps/customer-web/src/features/' },
      to:   { path: '^apps/customer-web/src/(app|pages|widgets)/' } },
    { name: 'fsd-widgets-no-upward', severity: 'error',
      from: { path: '^apps/customer-web/src/widgets/' },
      to:   { path: '^apps/customer-web/src/(app|pages)/' } },
    { name: 'fsd-pages-no-app', severity: 'error',
      from: { path: '^apps/customer-web/src/pages/' },
      to:   { path: '^apps/customer-web/src/app/' } },

    // ---- client: slices in the same layer never import each other ----
    { name: 'fsd-features-no-cross-slice', severity: 'error',
      from: { path: '^apps/customer-web/src/features/([^/]+)/' },
      to:   { path: '^apps/customer-web/src/features/(?!$1/)[^/]+/' } },
    { name: 'fsd-widgets-no-cross-slice', severity: 'error',
      from: { path: '^apps/customer-web/src/widgets/([^/]+)/' },
      to:   { path: '^apps/customer-web/src/widgets/(?!$1/)[^/]+/' } },
    { name: 'fsd-pages-no-cross-slice', severity: 'error',
      from: { path: '^apps/customer-web/src/pages/([^/]+)/' },
      to:   { path: '^apps/customer-web/src/pages/(?!$1/)[^/]+/' } },
    // entities may reference each other only through an @x folder (the @x exception is on the target side)
    { name: 'fsd-entities-no-cross-slice', severity: 'error',
      from: { path: '^apps/customer-web/src/entities/([^/]+)/' },
      to:   { path: '^apps/customer-web/src/entities/(?!$1/)[^/]+/', pathNot: '/@x/' } },

    // ---- server: domain is pure (bible decision 15, P1.3) ----
    { name: 'server-domain-pure', severity: 'error',
      comment: 'Server domain may import only @saucia/domain and the server kernel. No other module, composition, platform or delivery-shared.',
      from: { path: '^apps/server/src/modules/([^/]+)/domain/' },
      to:   { path: '^apps/server/src/((composition|platform|delivery-shared)/|modules/(?!$1/domain/)[^/]+/)' } },
    { name: 'server-domain-pure-external', severity: 'error',
      comment: 'Server domain may not use third-party packages, Node core modules, or unresolved modules. Tests are exempt.',
      from: { path: '^apps/server/src/modules/[^/]+/domain/', pathNot: '\\.test\\.ts$' },
      to:   { dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled', 'npm-no-pkg', 'core', 'unknown'] } },
    { name: 'server-domain-no-other-packages', severity: 'error',
      comment: 'Server domain may import the @saucia/domain package only, not contracts, db-types, or any other workspace package.',
      from: { path: '^apps/server/src/modules/[^/]+/domain/' },
      to:   { path: '^packages/(?!domain/)' } },

    // ---- server: application and delivery (bible §2.2) ----
    { name: 'server-application-no-outer', severity: 'error',
      from: { path: '^apps/server/src/modules/[^/]+/application/' },
      to:   { path: '^apps/server/src/(modules/[^/]+/(infrastructure|delivery)/|platform/|composition/|delivery-shared/)' } },
    { name: 'server-delivery-no-infra', severity: 'error',
      from: { path: '^apps/server/src/modules/[^/]+/delivery/' },
      to:   { path: '^apps/server/src/modules/[^/]+/infrastructure/' } },

    // ---- server: module public API (decision 14, P1.2) ----
    { name: 'modules-public-api-only', severity: 'error',
      comment: 'Other modules import only a module\'s index.ts.',
      from: { path: '^apps/server/src/modules/([^/]+)/' },
      to:   { path: '^apps/server/src/modules/(?!$1/)[^/]+/(?!index\\.ts$)' } },
    { name: 'modules-infra-only-from-composition', severity: 'error',
      comment: 'Adapters are wired only by composition. A module index may re-export them (decision 14).',
      from: { pathNot: '^apps/server/src/(composition/|modules/[^/]+/(infrastructure/|index\\.ts$))' },
      to:   { path: '^apps/server/src/modules/[^/]+/infrastructure/' } },

    // ---- server kernel: the dependency sink (bible §2.3) ----
    { name: 'server-kernel-imports-nothing', severity: 'error',
      from: { path: '^apps/server/src/kernel/' },
      to:   { path: '^apps/server/src/(modules|composition|platform|delivery-shared)/' } },

    // ---- workspace (bible §2.5) ----
    { name: 'packages-are-leaves', severity: 'error',
      from: { path: '^packages/' },
      to:   { path: '^(apps|supabase)/' } },
    { name: 'server-never-imports-client', severity: 'error',
      from: { path: '^apps/server/' },
      to:   { path: '^apps/customer-web/' } },
    { name: 'client-never-imports-server', severity: 'error',
      from: { path: '^apps/customer-web/' },
      to:   { path: '^apps/server/' } },
    { name: 'domain-package-is-innermost', severity: 'error',
      from: { path: '^packages/domain/' },
      to:   { path: '^packages/(contracts|db-types|kernel)/' } },
    { name: 'contracts-never-imports-db-types', severity: 'error',
      from: { path: '^packages/contracts/' },
      to:   { path: '^packages/db-types/' } },

    // ---- packages/kernel (Stage B, not yet present) ----
    { name: 'packages-kernel-no-apps', severity: 'error',
      from: { path: '^packages/kernel/' },
      to:   { path: '^(apps|supabase)/' } },
    { name: 'packages-kernel-no-model-packages', severity: 'error',
      from: { path: '^packages/kernel/' },
      to:   { path: '^packages/(domain|contracts|db-types)/' } },
      ... modulePublicApiRules
  ],
};