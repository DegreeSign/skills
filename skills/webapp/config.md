# Config

`build(params)` returns a webpack `Configuration`. Pass `type: 'webapp'` for the front end or `type: 'server'` for a Node bundle. Export it from `webpack.web.ts` or `webpack.server.ts` and point webpack at it.

```typescript
import { build } from "@degreesign/webapp";

module.exports = build({ type: `webapp`, /* ... */ });
```

The package also exports `Page`, `PreconnectLink`, `ConfigBuild`, `ConfigWebApp`, `ConfigServer`, `MetaTags`, `MetaTagsInput` and `WebManifest` types, and the file helpers `readData`, `readJSON`, `writeData` and `writeJSON`.

## Base options

Shared by both targets.

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `type` | `'webapp'` \| `'server'` | required | Selects the target. |
| `srcDir` | `string` | `src` | Source directory. For the server build this holds the entries. |
| `productionDir` | `string` | `public_html` | Output directory. |
| `mode` | `'development'` \| `'production'` | `production` | Webpack mode. |
| `obfuscateON` | `boolean` | `false` | Obfuscate shipped JavaScript. |
| `minimiseON` | `boolean` | `true` | Minify JavaScript and CSS. |
| `port` | `number` | `3210` | Development server port. |
| `maxFileSizeMB` | `number` | `2` | Asset and entry size budget in MB. |
| `resolveOptions` | `ResolveOptions` | `{}` | Extra webpack resolve options, for example `fallback`. |
| `licenseText` | `string` | `''` | Banner text prepended to every bundle. |
| `openAnalyzer` | `boolean` | `false` | Open the bundle analyzer window. |
| `includeServerModules` | `boolean` | `false` | Bundle `node_modules` into server output instead of externalizing. |

## Web app options

`ConfigWebApp` extends the base options.

| Option | Type | Description |
| ------ | ---- | ----------- |
| `websiteName` | `string` | Application name. |
| `websiteDomain` | `string` | Domain used for canonical URLs, sitemap and Open Graph. |
| `appShortName` | `string` | Manifest short name. |
| `twitterUserName` | `string` | Handle for `twitter:site`. |
| `publishedTime` | `string` | ISO 8601 publication timestamp. |
| `author` | `string` | Author meta tag. |
| `websiteTitle` | `string` | Default title and slogan. |
| `websiteDescription` | `string` | Default meta description. |
| `coverImage` | `string` | Social cover image. |
| `coverImageDescription` | `string` | Cover image alt text. |
| `background_color` | `string` | Manifest background colour. |
| `theme_color` | `string` | Manifest and `theme-color`. |
| `appIcon` | `string` | App icon path. |
| `appIconMaskable` | `string` | Maskable app icon path. |
| `fav_icon` | `string` | Favicon path. |
| `orientation` | `'portrait'` \| `'landscape'` | Screen orientation. |
| `pagesList` | `Page[]` | The pages to generate. |
| `htmlCommonElements` | `('header' \| 'footer' \| 'menu')[]` | Shared partials injected into every page. |
| `assetsDir` | `string` | Assets directory under `srcDir`. |
| `commonDir` | `string` | Common partials directory under `srcDir`. |
| `imagesDir` | `string` | Images directory under `assetsDir`. |
| `pagesDir` | `string` | Pages directory under `srcDir`. |
| `pageHome` | `string` | The home page `uri`, emitted as `index.html`. |
| `htaccessCustom` | `string` | Directives appended to the generated `.htaccess`. |
| `startURI` | `string` | PWA `start_url`. |
| `language` | `string` | Open Graph locale, for example `en_GB`. |
| `cssDiscardUnused` | `boolean` | Discard unused CSS. Leave off when classes are applied at runtime. |
| `updateServiceWorker` | `boolean` | Re-version the service worker only when set on. |
| `onlineIndicatorFile` | `string` | Reference file the service worker pings to test connectivity. |
| `preconnectLinks` | `(string \| PreconnectLink)[]` | Origins for `<link rel="preconnect">`. CORS is on unless `{ crossorigin: false }`. |

Image and icon fields accept either a bare file name under `assets/<imagesDir>/` or a full path or URL.

## Page fields

Every entry in `pagesList` is a `Page`.

| Field | Type | Description |
| ----- | ---- | ----------- |
| `uri` | `string` | Route and folder name. Required. Must match `src/pages/<uri>/`. |
| `name` | `string` | Page name used in the title. Required. |
| `description` | `string` | Meta description. Required. |
| `short_name` | `string` | Short name for the manifest shortcut. |
| `icon` | `string` | Shortcut icon. |
| `iconMaskable` | `string` | Shortcut maskable icon. |
| `shortcut` | `boolean` | Add the page to the manifest shortcuts. |
| `noindex` | `boolean` | Emit `noindex`, a robots `Disallow` and exclude from the sitemap. |
| `publishDate` | `string` | Per-page publication time. |
| `coverImage` | `string` | Per-page social image. |
| `coverImageDescription` | `string` | Per-page social image alt text. |
| `headerHTML` | `string` | Extra head HTML appended to the common header. |
| `menuHTML` | `string` | Extra markup appended to the common menu. |
| `footerHTML` | `string` | Extra markup appended to the common footer. |
| `customHTML` | `string[]` | Common partials joined into the page body. |
| `isPHP` | `boolean` | Mark the page as PHP-rendered. |
| `keywords` | `string` | Comma-separated keywords. |
| `canonicalURL` | `string` | Override the canonical URL. |

The generated title is `<name> | <websiteName>` for inner pages and `<websiteName> | <name>` for the home page. Set `noindex: true` on the 404 page, terms, privacy, account and any page that must not rank. Set `shortcut: true` only on pages worth a home-screen shortcut.

## Server options

`ConfigServer` extends the base options.

| Option | Type | Description |
| ------ | ---- | ----------- |
| `srcDir` | `string` | Server source directory, for example `server`. |
| `productionDir` | `string` | Server output directory, for example `server_build`. |
| `filesList` | `string[]` | Entry names. Each compiles `./<srcDir>/<name>.ts` to `<name>.js`. |
| `includeServerModules` | `boolean` | Bundle dependencies instead of externalizing them. |

The server target compiles to Node 18 CommonJS, externalizes `node_modules` unless `includeServerModules` is set and enables tree-shaking. Obfuscation follows the `obfuscateON` flag.

## What the web build generates

| Output | Source |
| ------ | ------ |
| `index.html` and one extension-less file per page | the page HTML fragment wrapped in the template. |
| `code/[name].[contenthash].js` | one entry per page, content-hashed. |
| `assets/` | a copy of `src/assets`. |
| (inlined in each page) | the compiled CSS is extracted and inlined into every page head; no separate stylesheet is shipped. |
| `app.json` | the web manifest, with icons and shortcuts. |
| `sw.js` | the service worker, from the package template. |
| `sitemap.xml` and `sitemap.xml.gz` | the home page and every non-`noindex` page. |
| `robots.txt` | `Allow: /`, a `Disallow` per `noindex` page and a sitemap pointer. |
| `.htaccess` | security headers, HTTPS redirect, per-page content type, `htaccessCustom` and error documents. |

## package.json scripts

Keep the dev and production builds separate and drive them with an environment flag.

```json
{
	"scripts": {
		"start": "DEVELOPMENT_ENV=true webpack serve --config webpack.web.ts",
		"build": "DEVELOPMENT_ENV=false webpack --config webpack.web.ts",
		"start_server": "webpack serve --config webpack.server.ts",
		"build_server": "webpack --config webpack.server.ts"
	},
	"devDependencies": {
		"@degreesign/webapp": "latest",
		"typescript": "^5.0.0",
		"ts-loader": "^9.0.0",
		"webpack": "^5.0.0",
		"webpack-cli": "^6.0.0"
	}
}
```

Use the env flag to switch `productionDir`, `obfuscateON` and `minimiseON` so development is fast and production is small.

## tsconfig.json

```json
{
	"compilerOptions": {
		"target": "ES2021",
		"module": "commonjs",
		"moduleResolution": "node",
		"resolveJsonModule": true,
		"esModuleInterop": true,
		"strict": true,
		"skipLibCheck": true,
		"removeComments": true,
		"outDir": "build"
	},
	"ts-node": { "transpileOnly": true },
	"exclude": ["node_modules", "public_html", "server_build", "build"]
}
```

`resolveJsonModule` is required for JSON imports. Exclude the generated output from compilation.

## Environment and state files

- `.env` holds secrets and keys read during the build. Never commit it.
- `updateTimes.json` stores `{ "serviceWorker": <timestamp> }`. When `updateServiceWorker` is on the timestamp is reused, so the service worker URL changes only on request. Otherwise it is bumped on every build.
- `app.json?v=<timestamp>` and `sw.js?updated=<timestamp>` carry the same cache-busting value.
- The `DefinePlugin` inlines `process.env.*` into the bundle at build time, so reference environment variables as `process.env.NAME` in code.
