# Discoverability

Discoverability is mostly data in `pagesList` and config. Set it once, per page where needed, and the build emits the tags, canonical URL, sitemap and manifest.

## What the build emits per page

Every generated page head includes:

- Core meta: charset, content type, viewport, `X-UA-Compatible`, mobile web app capability and status bar tags.
- Indexing: `robots` and `googlebot-news` set to `index,follow`, or `noindex` when the page sets `noindex: true`.
- Name and description: `author`, `description`, and `keywords` plus `news_keywords` when a page supplies `keywords`.
- Open Graph: `og:type`, `og:locale`, `og:title`, `og:site_name`, `og:description`, `og:publish_date`, `og:modified_date`, `og:url`, `og:image` and `og:image:alt`.
- Twitter: `summary_large_image`, `twitter:site`, title, description, image and image alt.
- Article and thumbnail: `article:published_time`, `article:modified_time`, and `itemprop` thumbnail and image.
- Icons at several sizes and `theme-color`.
- Link tags: favicon, `manifest`, `image_src`, `canonical`, and the configured preconnects.

The title is `<name> | <websiteName>` for inner pages and `<websiteName> | <name>` for the home page.

## Per-page metadata

Override the global values on any page:

- `name` and `description` drive the title, description, Open Graph and Twitter text.
- `coverImage` and `coverImageDescription` give the page its own social image.
- `publishDate` sets the page's publication time.
- `keywords` adds the keyword meta tags.
- `canonicalURL` replaces the computed canonical URL.
- `noindex: true` removes the page from search: it emits `robots noindex`, a `Disallow` line in `robots.txt`, and no sitemap entry.

Write a real, unique description for every indexable page. Keep page names short and human.

## Canonical URLs

- The canonical URL is `https://<websiteDomain>` for the home page and `https://<websiteDomain>/<uri>` for every other page.
- Set `canonicalURL` only when a page is reachable at more than one address, and point all addresses at one canonical.
- Keep the domain in `websiteDomain`; never hardcode it elsewhere.

## Manifest and PWA

- `app.json` is generated with `name`, `short_name`, description, theme and background colours, orientation, `start_url`, maskable and any icons, and `display: standalone`.
- A page with `shortcut: true` becomes a manifest shortcut with its own name, description, icon and URL. Mark only the one or two most useful pages.
- Provide a maskable icon with the important artwork inside the safe zone so launchers do not crop it.

## Sitemap and robots

- `sitemap.xml` (plus a gzipped copy) lists the home page at priority 1.0 and every non-`noindex` page at 0.8, with a build timestamp as `lastmod`.
- `robots.txt` allows everything, adds a `Disallow` for each `noindex` page and points at the sitemap.
- If the site has dynamic URLs that are not in `pagesList`, generate a sitemap index on the server and point `robots.txt` at it through `htaccessCustom`.

## Dynamic content without JavaScript

- Static pages are generated as real HTML, so their content is crawlable without JavaScript.
- For routes built from data, prefer server-side rendering: mark the page `isPHP: true` so the build leaves the file to be handled as PHP, and echo per-request metadata. Keep a static fallback.
- For client-rendered routes, update the document at runtime: set `document.title`, the description, the Open Graph and Twitter tags, `og:url` and the canonical link when the route changes, and push a history entry so each route has a unique URL.
- Add structured data as JSON-LD in the page, for example `BreadcrumbList` and a page or product schema. The build does not generate JSON-LD; add it in the page head or at runtime.

## Language

- Set `language` to the Open Graph locale, for example `en_GB`.
- The template sets `<html lang="en">`. Set the real language on the element at runtime when the app is localised, along with `dir` for right-to-left languages.
- Keep translations in a source-of-truth file and generate locale files from it.
- For separate URLs per language, give each language its own indexable page and add `hreflang` links; the build does not emit them.

## AI and LLM discoverability

- Add an `llms.txt` (and optionally `llms-full.txt`) to the output that lists the main pages as Markdown links and summarises what the site offers. The build does not generate it; write it or generate it in a small build step.
- Keep the copy on the home page factual and descriptive. AI agents and search engines both read generated HTML.

## Redirects and URL hygiene

- Put permanent redirects and rewrites in `htaccessCustom`, not in markup.
- Redirect the `www` host and any legacy paths to one canonical host and path with a 301.
- Serve the 404 page for unknown routes; the build writes `ErrorDocument 404 /404` and `ErrorDocument 403 /404`.
