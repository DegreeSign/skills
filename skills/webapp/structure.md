# Structure

The build expects a fixed folder contract. The names below are the defaults and can be renamed through config, but keep the defaults unless a project already uses something else.

## Directories

| Path | Purpose |
| ---- | ------- |
| `src/` | Authored front-end source (`srcDir`). |
| `src/assets/` | Static assets copied to the output (`assetsDir`). |
| `src/assets/images/` | Images, favicon, app icon, maskable icon, cover (`imagesDir`). |
| `src/assets/lib/` | Third-party browser libraries loaded on demand, never bundled. |
| `src/common/` | Shared HTML partials injected into pages (`commonDir`). |
| `src/code/` | Shared TypeScript modules. |
| `src/pages/` | One folder per page (`pagesDir`). |
| `src/text/` | Translation source of truth. |
| `src/styles.css` | Global stylesheet imported by every page entry. |
| `server/` | Server entry files, built separately (`srcDir` for the server build). |
| `types/` | Shared interfaces and enums. |
| `public_html/` | Generated web output (`productionDir`). |
| `server_build/` | Generated server output (`productionDir` for the server build). |

Do not put shared code in a page folder and do not put page-specific code in `src/code/`.

## The page contract

For every page, create a folder whose name is the page `uri`:

```text
src/pages/<uri>/
├── <uri>.html    # body fragment only
└── <uri>.ts      # entry point
```

- Folder name, file names and the `pagesList` `uri` must match exactly.
- `<uri>.html` is a fragment. It has no `<html>`, `<head>` or `<body>` and no stylesheet link; the build wraps it in the template.
- `<uri>.ts` imports the global stylesheet for side effects, then binds the page. Keep the entry thin and move real logic into `src/code/` or a subfolder of the page.
- The build creates one webpack entry per page (`./src/pages/<uri>/<uri>.ts`) and one HTML chunk from it.
- The home page (`pageHome`) is emitted as `index.html`; every other page is emitted as an extension-less file named `<uri>`.
- A page can keep its own submodules in its folder (for example `src/pages/account/logic/`) and import them from the entry.

Navigation is full-document; there is no client-side router. Each route is its own file. If a route must be dynamic, render it server-side or rewrite to the page in `htaccessCustom`.

## Shared partials

Shared markup is one file per block in the common directory, injected by the build:

- `htmlCommonElements` reads `src/<commonDir>/<name>.html` for `menu`, `footer` and `header` and wraps them in `<nav role="navigation">`, `<footer role="contentinfo">` and the head. The generated service worker registration is always injected into the head; listing `header` also injects `header.html` there.
- `customHTML: ['block_a', 'block_b']` on a page reads those files from the common directory and joins them into the `<main>` body.
- `headerHTML`, `menuHTML` and `footerHTML` on a page are appended to the injected common elements.

Put anything used by two or more pages in a common partial. Keep the `<uri>.html` fragment for content unique to that page.

## Assets

- Files under `src/assets/` are copied to `<productionDir>/assets/` on build.
- Images are written to `assets/images/[name][ext]` without a content hash, so bust their cache with a query string or a renamed file when they change.
- Use SVG for icons and WebP or PNG for the cover and app icons.
- Reference images from TypeScript through a constants map and assign `src` or `style.backgroundImage` at runtime. Hardcode a `src` in HTML only for assets that must load before JavaScript runs (for example the logo).
- Browser libraries belong in `src/assets/lib/`. Load them on demand at runtime instead of importing them, and start each file with a banner comment naming the library, version, license and source URL.

## Shared code

- Cross-page logic lives in `src/code/`, split by concern (one module per topic).
- Page-specific helpers live beside the page entry.
- Interfaces, types and shared enums live in `types/` and are imported; never declare them inline in a code file.
- Shared constants are grouped in one constants module. Build URLs from a single domain constant instead of hardcoding the domain.
- Keep every file small and single-purpose so it is easy to change and to tree-shake.

## Text and translations

- Keep one source-of-truth translation file for the default language.
- Mark user-facing text with keys or data attributes rather than hardcoding strings in markup where the project translates.
- Never edit generated locale files by hand; regenerate them from the source of truth.

## Generated output

The web build writes these into `productionDir`:

```text
public_html/
├── index.html                 # home page
├── <uri>                      # one extension-less HTML file per other page
├── assets/                    # copy of src/assets
├── code/[name].[contenthash].js   # one hashed bundle per page
├── app.json                   # PWA web manifest
├── sw.js                      # generated service worker
├── sitemap.xml (+ .gz)        # generated sitemap
├── robots.txt                 # generated robots
└── .htaccess                  # security headers, HTTPS, error pages, htaccessCustom
```

Treat this directory as disposable. It is safe for the build to overwrite, and it must never be edited to fix a bug. The build cleans only `code/*.js` and `code/*.js.LICENSE.txt`, so other generated files persist between builds. Decide with the project whether `productionDir` is committed or ignored, and follow that.

## Server layout

- Server entry files live in `server/` and are named in `filesList`.
- Each list entry becomes one bundle at `./server/<name>.ts`, written to `server_build/<name>.js` with `node_modules` externalized.
- A server entry is a long-running process; deploy and supervise it separately from the web build.
- Shared server helpers live in `server/` subfolders and are imported by the entries.
