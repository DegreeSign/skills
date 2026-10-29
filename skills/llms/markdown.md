# Markdown page versions

The second half of LLM discovery is giving each page a clean Markdown version
at the same URL, then telling agents where it is. The `llms.txt` file links to
that version, and link relations make it discoverable from the rendered page.

## Why a Markdown version

- It removes navigation, ads, cookie banners, scripts and layout.
- It keeps headings, lists, tables and code in their original order.
- It costs fewer tokens than the rendered page.
- It survives a redesign, as long as the URL does not move.

## URL forms

Use one form per page, consistently. Both forms below are allowed by v2.

| Page URL | Markdown URL |
| -------- | ------------ |
| `https://example.com/guide.html` | `https://example.com/guide.html.md` |
| `https://example.com/guide.html` | `https://example.com/guide.md` |
| `https://example.com/guide` | `https://example.com/guide.md` |
| `https://example.com/docs/` | `https://example.com/docs/index.html.md` |
| `https://example.com/docs/` | `https://example.com/docs/index.md` |
| `https://example.com/` | `https://example.com/index.html.md` |

- Appending `.md` to the full URL keeps the original path intact. It is the
  form the v1 proposal used and the safest choice for existing sites.
- Replacing the extension is shorter and common on publishing platforms.
- A URL without a file name uses `index.html.md` or `index.md`.
- Keep query strings out of the Markdown URL unless the page depends on one.
- Serve `text/markdown` with UTF-8. Do not leave the default content type as
  `application/octet-stream`.

## Content rules

- Include the information of the page, not the site around it.
- Drop navigation, breadcrumbs, ads, cookie prompts, share buttons, related
  links and footers.
- Keep the heading hierarchy, starting at the page title.
- Keep lists, tables and blockquotes.
- Keep code fences and add the language when known.
- Keep images with meaningful alt text and an absolute source URL.
- Rewrite relative links so they still resolve when the file is read alone.
- Use plain Markdown. No scripts, no inline styles, no tracking pixels.
- Do not add a generated banner, timestamp or "this page" preamble.
- Regenerate the file whenever the page changes; a drifted copy is a defect.

## Linking between pages

- Point internal links at the Markdown version when one exists.
- Otherwise point at the stable canonical page, not a preview or staging host.
- Use absolute URLs, or root-relative URLs when the file stays on one host.
- Never link to a page that needs a session, a form post or JavaScript.

## Advertising with HTML

Add both relations to the `<head>` of every HTML page:

```html
<link rel="alternate" type="text/markdown" href="/guide.html.md">
<link rel="describedby" href="/llms.txt">
```

- `alternate` with `type="text/markdown"` identifies the Markdown version of
  this page.
- `describedby` identifies the `llms.txt` file that covers this page.
- Point `describedby` at the most specific covering file. A page under
  `/docs/` should point at `/docs/llms.txt` when that file exists.
- Use root-relative or absolute URLs, not paths that depend on the current
  route.
- Add the links to error and empty pages only if they still make sense.

## Advertising with headers

Send the same relations in an HTTP `Link` header. The header form also works
for non-HTML resources, such as the Markdown files themselves, PDFs and
images.

```http
Link: </guide.html.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"
```

- Separate multiple link values with a comma.
- Send it from the web server, reverse proxy or CDN so no page template needs
  to change.
- Send `describedby` on every resource a covering file describes.
- Send `alternate` only where a distinct Markdown version exists.
- Use absolute paths or full URLs. Keep the values quoted with `<>`.
- Check that a proxy does not strip the header.
- Confirm the relation name arrives without escape characters. A value such as
  `rel=\"describedby\"` is invalid; the backslashes are sent literally.

## Placement

Confirm with the user where the Markdown files are written before creating
any. Frameworks handle static assets differently: one publishes a dedicated
folder, another copies a source folder into the output, another generates
routes at request time, and some mount the site under a base path.

- Confirm the directory or route that maps to the site root and to each path
  scope.
- Confirm whether the build generates the Markdown versions, copies stored
  files, or serves them from a handler.
- Confirm that the chosen location is included in the published output and
  not ignored by the build.
- Confirm how the base path affects the advertised URLs.
- Record the decision in the project so later pages use the same place.

## Server configuration

- Route the `.md` suffix to the generator or the stored Markdown file, before
  any single-page-app fallback.
- Map it to `text/markdown; charset=utf-8` in the response header, not through
  extension-to-charset mapping, which hosts may ignore.
- Do not require a rewrite for every page if a static file can be emitted at
  build time.
- Exclude `/llms.txt` and the Markdown files from HTML fallbacks, auth middle
  ware and bot challenges.
- Add caching and compression like any other text asset.
- Keep the header and the HTML links in step; do not advertise a file that
  does not exist.
- Inspect the deployed response headers with a request that prints them.

Directive syntax is host specific. Set the media type, the charset and the
header explicitly, and keep backslash escapes out of the header value.
Apache-style configuration:

```apache
<FilesMatch "\.md$">
  Header set Content-Type "text/markdown; charset=UTF-8"
  Header set Link "</llms.txt>; rel=describedby"
</FilesMatch>
```

- A directive that passes `\"` through places the backslashes in the sent
  header, so the relation no longer parses. Use an unquoted token or quote the
  whole value with single quotes and keep the double quotes for the relation:

  ```apache
  Header set Link '</llms.txt>; rel="describedby"'
  ```

- Set the charset on `Content-Type`. A separate charset directive may be
  ignored for a custom extension.
- Confirm the result on a deployed Markdown URL with a request that prints
  response headers.

## Verification

Fetch a page and its Markdown version:

```bash
curl -sI https://example.com/guide.html | grep -i '^link:'
curl -sI https://example.com/guide.html.md | grep -i '^content-type:'
curl -s https://example.com/guide.html.md | head -40
```

Check that:

- The header lists both relations and points at real URLs.
- The Markdown response has a Markdown content type and no HTML wrapper.
- The first heading matches the page title.
- Navigation, cookie text and scripts are absent.
- Code fences and links survive.
- The `llms.txt` file links to the same form you publish.

## Edge cases

- **Localised pages** get their own Markdown version and their own
  `describedby` relation. Do not merge languages into one file.
- **Versioned docs** keep the version in the path and get one `llms.txt` per
  major version when the content differs materially.
- **Generated API pages** should emit Markdown in the same build as the HTML.
- **Binary resources** need no Markdown version, but the `Link` header can
  still point at the covering `llms.txt`.
- **Private pages** stay out of both the file and the header.
- **Moved pages** keep a permanent redirect from the old Markdown URL too.

## Checklist

- One URL form is chosen and used everywhere.
- Every linked page has a working Markdown version.
- The content is clean, ordered and free of page chrome.
- HTML pages carry `alternate` and `describedby`.
- Non-HTML resources carry the `Link` header where useful.
- The content type is `text/markdown`.
- Fallbacks, auth and bot rules do not intercept the files.
- The build regenerates the Markdown when the page changes.
