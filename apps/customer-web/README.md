# apps/customer-web/
## React app (@saucia/client), structured as Feature-Sliced Design x Clean.

- Imports @saucia/* packages; never imports `apps/server/`.
- Source in src/; static assets in public/ (fonts, GLTF models).
- Import direction goes downward only: app -> pages -> widgets -> features -> entities -> shared.
- Slices are imported only through their index.ts.
- No legacy-* imports: the three v1 files are quarantined under `_legacy/client/src/shared/`.