module.exports = {
  forbidden: [
    // ---- client entities ----
    { name: 'client-inner-rings-no-infra', severity: 'error',
      from: { path: '^apps/customer-web/src/entities/[^/]+/(domain|ports|application|model|ui)/' },
      to:   { path: '^apps/customer-web/src/entities/[^/]+/infrastructure/' } },
    { name: 'client-infra-only-from-di', severity: 'error',
      from: { pathNot: '^(apps/customer-web/src/app/di/|apps/customer-web/src/entities/[^/]+/infrastructure/)' },
      to:   { path: '^apps/customer-web/src/entities/[^/]+/infrastructure/' } },
    { name: 'client-domain-pure', severity: 'error',
      from: { path: '^apps/customer-web/src/entities/[^/]+/domain/' },
      to:   { path: '^apps/customer-web/src/entities/[^/]+/(ports|application|infrastructure|model|ui)/' } },

    // ---- server modules ----
    { name: 'server-domain-pure', severity: 'error',
      from: { path: '^apps/server/src/modules/[^/]+/domain/' },
      to:   { path: '^apps/server/src/modules/[^/]+/(application|infrastructure|delivery)/' } },
    { name: 'server-application-no-outer', severity: 'error',
      from: { path: '^apps/server/src/modules/[^/]+/application/' },
      to:   { path: '^apps/server/src/modules/[^/]+/(infrastructure|delivery)/' } },
    { name: 'server-delivery-no-infra', severity: 'error',
      from: { path: '^apps/server/src/modules/[^/]+/delivery/' },
      to:   { path: '^apps/server/src/modules/[^/]+/infrastructure/' } },
    { name: 'server-no-cross-module-internals', severity: 'error',
      from: { path: '^apps/server/src/modules/([^/]+)/' },
      to:   { path: '^apps/server/src/modules/(?!\\1/)[^/]+/(domain|application|infrastructure)/' } },

    // ---- server kernel ----
    // The kernel is the server's dependency sink: every layer may import it,
    // but it must not reach into modules, composition, platform or delivery.
    { name: 'server-kernel-imports-nothing', severity: 'error',
      from: { path: '^apps/server/src/kernel/' },
      to:   { path: '^apps/server/src/(modules|composition|platform|delivery-shared)/' } },

    // ---- workspace ----
    { name: 'packages-are-leaves', severity: 'error',
      from: { path: '^packages/' }, to: { path: '^(apps|supabase)/' } },
    { name: 'server-never-imports-client', severity: 'error',
      from: { path: '^apps/server/' }, to: { path: '^apps/customer-web/' } },
    { name: 'client-never-imports-server', severity: 'error',
      from: { path: '^apps/customer-web/' }, to: { path: '^apps/server/' } },

    // `packages/kernel` is the planned Stage B technical kernel. It does not
    // exist yet; when it lands it must stay the lowest package. Entities and
    // aggregates (Order, Meal, Cart) belong to the app-local domain that owns
    // their lifecycle, never to kernel or shared domain.
    { name: 'packages-kernel-no-apps', severity: 'error',
      from: { path: '^packages/kernel/' },
      to:   { path: '^(apps|supabase)/' } },
    { name: 'packages-kernel-no-model-packages', severity: 'error',
      from: { path: '^packages/kernel/' },
      to:   { path: '^packages/(domain|contracts|db-types)/' } },
  ],
};
