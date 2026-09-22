---
name: webapp
description: Structure or restructure a TypeScript web app for excellent performance and discoverability using @degreesign/webapp. Use when setting up a project layout, adding or reorganising pages, wiring the webpack build, or improving SEO, PWA and caching.
---

# Webapp

Structure a TypeScript web app so it builds fast, ships small and is easy for search engines, social crawlers and AI agents to discover. The build is a single `build()` call from `@degreesign/webapp`; the source layout and the config fields are the contract.

## When to use

- Starting a new web app or a Node server bundle.
- Restructuring folders, pages or shared code.
- Wiring or changing `webpack.web.ts` or `webpack.server.ts`.
- Improving load performance, caching or the PWA service worker.
- Improving SEO, Open Graph, sitemap, robots or manifest output.
- Adding a page, a common partial, an asset or a server entry.

## Core principles

- One folder per page. Each page owns a thin `.html` fragment and a same-named `.ts` entry. Keep page-specific logic in that folder, never in a shared file.
- Config is the single source of truth. `pagesList` drives the HTML, meta tags, canonical URL, sitemap, robots and manifest shortcuts from one place.
- Generated output is disposable. `public_html/` and `server_build/` are build artifacts. Never hand-edit them.
- Reuse partials. Shared markup lives in the common directory and is injected, never duplicated per page.
- Ship only what a page needs. Per-page bundles, content hashes, inlined CSS and on-demand libraries.
- Keep discoverable content in the HTML. Pages are generated as real markup at build time, so crawlers see content without running JavaScript.
- Keep each source file small and single-purpose; move logic shared by pages into the shared code directory.

## Layout at a glance

```text
myapp/
├── src/
│   ├── assets/
│   │   ├── images/            # images, favicon, app icon, cover
│   │   └── lib/               # browser libraries loaded on demand
│   ├── common/                # shared HTML partials
│   ├── code/                  # shared TypeScript modules
│   ├── pages/<uri>/           # <uri>.html and <uri>.ts per page
│   ├── text/                  # translation source of truth
│   └── styles.css             # global stylesheet
├── server/                    # Node entry files
├── types/                     # shared interfaces and enums
├── webpack.web.ts
├── webpack.server.ts
├── tsconfig.json
└── package.json
```

See `structure.md` for the full contract.

## Build config

`build({ type: 'webapp', ... })` and `build({ type: 'server', ... })` return a webpack configuration. See `config.md` for every field. A minimal web config:

```typescript
import { build } from "@degreesign/webapp";

module.exports = build({
    type: `webapp`,
    websiteName: `MyApp`,
    websiteDomain: `example.com`,
    appShortName: `MyApp`,
    twitterUserName: `myapp`,
    publishedTime: `2025-01-01T00:00:00+00:00`,
    author: `MyApp`,
    websiteTitle: `Do a thing well`,
    websiteDescription: `MyApp does a thing well.`,
    coverImage: `cover.webp`,
    coverImageDescription: `MyApp screenshot`,
    background_color: `#ffffff`,
    theme_color: `#000000`,
    appIcon: `app_icon.png`,
    appIconMaskable: `app_icon_maskable.png`,
    fav_icon: `favicon.ico`,
    orientation: `portrait`,
    htmlCommonElements: [`menu`, `footer`],
    srcDir: `src`,
    assetsDir: `assets`,
    commonDir: `common`,
    imagesDir: `images`,
    pagesDir: `pages`,
    pageHome: `home`,
    productionDir: `public_html`,
    pagesList: [],
    htaccessCustom: ``,
    obfuscateON: true,
    preconnectLinks: [],
});
```

## Workflow

1. Read the project `AGENTS.md` and the target `webpack.web.ts` and `webpack.server.ts`.
2. Choose the layout from `structure.md`; for an existing app follow `restructure.md`.
3. Register every page in `pagesList` with its metadata and set `pageHome` to the home `uri`.
4. Apply the performance rules in `performance.md`.
5. Apply the discoverability rules in `discoverability.md`.
6. Verify the output: one `code/[name].[contenthash].js` per page, inlined CSS, `app.json`, `robots.txt`, `sitemap.xml`, `sw.js` and `.htaccess`.
7. Leave staging and commits to the user.

## Checklist

- [ ] Every page has `src/pages/<uri>/<uri>.html` and `.ts` and a `pagesList` entry.
- [ ] `pageHome` matches the home `uri` and emits `index.html`.
- [ ] Shared markup is in the common directory and injected, not duplicated.
- [ ] `noindex: true` is set on 404, terms, account and other non-search pages.
- [ ] `shortcut: true` is set on the one or two pages worth a PWA shortcut.
- [ ] Cover image, description and icons are set globally and per page where useful.
- [ ] Heavy libraries are imported dynamically or loaded on demand, not bundled.
- [ ] Long-lived caching for hashed assets is set in `htaccessCustom`.
- [ ] Preconnect origins are listed for the API or CDN the app talks to.

## Topics

- `structure.md`: folders, the page contract, partials, assets, shared code, generated output.
- `config.md`: every `build()` field, `Page` fields, generated files, scripts and tsconfig.
- `performance.md`: hashing, splitting, CSS, obfuscation, service worker, images, caching.
- `discoverability.md`: meta, Open Graph, canonical, manifest, sitemap, robots, i18n, LLM files.
- `restructure.md`: migrating an existing app into this shape, step by step.
