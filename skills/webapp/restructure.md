# Restructure

Use this when an existing app must be moved onto the layout and build. Work route by route and keep the change behaviour-preserving.

## 1. Inventory

- List every route the app serves and whether it is indexable.
- List the pages, shared headers, footers, menus and repeated blocks.
- List the images, icons, fonts and third-party libraries.
- List the runtime API calls and the origins they target.
- List any server code and its entry points.

## 2. Install the build

- Add `@degreesign/webapp`, `webpack`, `webpack-cli`, `typescript` and `ts-loader`.
- Add `webpack.web.ts` and `webpack.server.ts` with the fields from `config.md`.
- Add the `start`, `build`, `start_server` and `build_server` scripts that drive `DEVELOPMENT_ENV`.
- Add `tsconfig.json` with `resolveJsonModule`, `strict` and the generated directories excluded.

## 3. Move the sources

- Create `src/`, `src/assets/`, `src/common/`, `src/code/`, `src/pages/`, `src/text/` and `types/`.
- Move images, favicon, app icons and cover into `src/assets/images/`.
- Move third-party browser libraries into `src/assets/lib/` and add a banner comment to each.
- Move the global stylesheet to `src/styles.css` and import it at the top of every page entry.

## 4. Split pages

For each route:

1. Create `src/pages/<uri>/<uri>.html` and `<uri>.ts`, named after the route.
2. Move only that page's markup into the HTML fragment, without `<html>`, `<head>` or `<body>`.
3. Make the entry import the global stylesheet and then bind that page.
4. Move repeated markup shared with other pages into a common partial and inject it with `htmlCommonElements` or `customHTML`.

Add a `404` page and an `index`-serving home page.

## 5. Move shared code

- Move cross-page utilities and components into `src/code/`, one concern per module.
- Move page-specific helpers into the page folder.
- Move interfaces, types and shared enums into `types/` and import them.
- Group shared constants into one module and replace hardcoded domains with the domain constant.
- Replace any copy-pasted helper with a single shared function.

## 6. Register the pages

- Add every page to `pagesList` with `uri`, `name` and `description`.
- Set `pageHome` to the home page `uri`.
- Set `noindex: true` on 404, terms, privacy, account and other non-search pages.
- Set `shortcut: true` on the one or two most useful pages.
- Set `coverImage`, `coverImageDescription`, `publishDate` and `keywords` where they differ from the defaults.

## 7. Carry over SEO and redirects

- Move old redirects and rewrites into `htaccessCustom` and convert them to 301.
- Add a canonical host redirect for the `www` and non-HTTPS variants.
- Keep any dynamic, server-rendered metadata; mark those pages `isPHP: true`.

## 8. Turn on performance

- Leave minification on and enable obfuscation for production.
- Replace bundled heavy libraries with dynamic imports or on-demand script loads.
- Split oversized page modules into shared modules and page-local modules.
- Add caching and compression rules for hashed assets in `htaccessCustom`.
- Add the API and CDN origins to `preconnectLinks`.
- Convert covers and photos to WebP and size them to their display size.

## 9. Turn on discoverability

- Write unique titles and descriptions for every indexable page.
- Provide a cover image, maskable app icon and favicon.
- Confirm the generated `app.json`, `sitemap.xml` and `robots.txt` are correct.
- Add JSON-LD, `llms.txt` and `hreflang` where the app needs them.

## 10. Split the server

- Move server entries into `server/` and list them in `filesList`.
- Give each entry a single responsibility and a long-running start function.
- Move shared server helpers into `server/` subfolders.

## 11. Verify

1. Run the development server and open each page.
2. Compare every route against the old app; nothing should change except performance and markup.
3. Build for production and confirm the output described in `structure.md`.
4. Check each page's `<head>` for a unique title, description, canonical URL and social image.
5. Check `robots.txt`, `sitemap.xml` and `app.json`.
6. Check that old URLs redirect with a 301.
7. Leave staging and commits to the user.
