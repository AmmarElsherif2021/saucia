# client/
## React app (@saucia/client), structured as Feature-Sliced Design x Clean.

- Imports @saucia/* packages; never imports server/.
- Source in src/; static assets in public/ (fonts, GLTF models).
- Import direction goes downward only: app -> pages -> widgets -> features -> entities -> shared.
- Slices are imported only through their index.ts.
- legacy-* files are quarantined: do not add new imports of them.