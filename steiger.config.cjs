// steiger.config.cjs
//
// .cjs is deliberate: Steiger loads config via cosmiconfig's synchronous API,
// which uses require(). The repo is "type": "module", so .js/.mjs/.ts files
// are ESM and cannot be require()-ed (Node 22 throws ERR_REQUIRE_CYCLE_MODULE).
//
// This file must not import Steiger or the plugin: `steiger` is ESM-only and
// has no CommonJS export, so require('steiger') fails. Steiger merges the
// array below with its built-in defaults, so listing only the overrides is
// sufficient.

module.exports = [
  {
    rules: {
      // TODO(2026-10-11): empty-slice rules are off until Phase 2+ fills the
      // scaffolded slices. The scaffold is deliberate ? see
      // docs/adr/saucia-phase2.md section 2 item 8.
      'fsd/no-segmentless-slices': 'off',
      'fsd/insignificant-slice': 'off',
      // FSD-idiomatic names; the rule assumes stricter naming.
      'fsd/segments-by-purpose': 'off',
    },
  },
];