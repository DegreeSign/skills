# Performance

Performance comes from the build defaults plus a few source rules. Keep the defaults on and manage what the build cannot decide for you.

## Content hashing and caching

- Page bundles are emitted as `code/[name].[contenthash].js`. Changing a bundle changes its name, so it can be cached forever.
- Images are copied without a hash. When an image changes, rename it or append a version query string.
- Set long-lived caching for the hashed bundles in `htaccessCustom`, together with gzip or brotli compression, so repeat visits cost nothing:

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>
```

- HTML is served fresh; it points at the new hashed bundles.

## Code splitting

- The build makes one entry and one bundle per page. A visitor only downloads the page they open.
- Shared code is duplicated across page bundles. Move genuinely shared code into small modules so each page stays light, and keep page-specific code inside the page folder.
- Split heavy features behind `import()`. Load a PDF, chart or editor module only when the user opens the feature that needs it.
- Never bundle a browser library that most visits do not use. Put it in `src/assets/lib/` and load it on demand with a script loader; import its type only, with `import type`, so it stays out of the bundle.

## Styles

- CSS is compiled and then inlined into every page head by the build. There is no render-blocking stylesheet request and no separate CSS file to fetch.
- Keep the global stylesheet small. Move page-only rules into a stylesheet imported by that page entry.
- Leave `cssDiscardUnused` off when classes are applied at runtime; the optimizer cannot see them and would drop live rules.

## Minification and obfuscation

- `minimiseON` runs Terser on JavaScript and the CSS minimizer on styles. It defaults on; keep it on for production.
- `obfuscateON` runs the obfuscator with hexadecimal identifiers and string splitting. Keep it off in development so errors and stack traces stay readable, and on in production.

## Images and media

- Prefer SVG for icons and WebP for photos and covers. Serve a fallback only when a target browser needs it.
- Size images before shipping them. Do not scale large PNG or JPEG files down in CSS.
- Let only above-the-fold images load eagerly. Set every other image's source from TypeScript after load, or use native lazy loading.
- Load a lightweight placeholder background first and swap in the high-resolution image after the user reveals it.

## Resource hints

- List every origin the app calls at runtime in `preconnectLinks`, for example the API and the image CDN. The build emits `<link rel="preconnect">` with CORS on by default.
- Keep the list short; preconnecting to unused origins wastes a connection.

## Service worker

- The build emits `sw.js` and inlines a registration script into every page head. The script unregisters old workers and registers `/sw.js?updated=<timestamp>`.
- Set `updateServiceWorker` on when you want the timestamp held until you explicitly release a new worker; leave it off to bump on every build.
- Set `onlineIndicatorFile` to a small asset the worker can ping to test connectivity.
- Wire offline caching for the pages you want available offline in the worker template or through the project's own worker.

## Budget and analysis

- Set `maxFileSizeMB` to a realistic ceiling. The default is 2 MB per asset and per entry.
- Set `openAnalyzer: true` while tuning to see what is heavy, then turn it off.

## Server build

- The server target externalizes `node_modules` and tree-shakes by default. Leave `includeServerModules` off unless a dependency must be bundled, and enable obfuscation through `obfuscateON`.
- Cache hot data in memory and persist on an interval instead of writing on every request.
- Gate expensive endpoints behind rate limiting and validation.
