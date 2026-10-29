---
name: llms
description: Make a site easy for AI agents to discover and read with llms.txt and clean Markdown page versions. Covers the v2 file format, path scopes, link relations, HTTP headers, the Lighthouse llms.txt audit, validation and repairs. Use when publishing, auditing or fixing llms.txt, exposing Markdown versions, or passing the agentic browsing audit.
---

# LLM discovery

`llms.txt` is a small Markdown file at a site or path root that tells an AI
agent what the content covers and where to read the detail. The file is
optional, mainly serves on-demand inference rather than training, and
complements `robots.txt` and `sitemap.xml` instead of replacing them.

The convention is the [llms.txt v2 proposal](https://llmstxt.org/). Lighthouse
audits the file as part of its experimental agentic browsing category: a
server error fails the audit, a `404` is reported as not applicable, and a
successful response passes it.

## When to use

- Adding `/llms.txt` or a path-scoped `llms.txt` to a site.
- Auditing or repairing an existing file.
- Publishing clean Markdown versions of pages.
- Advertising those files with link relations or HTTP headers.
- Fixing the Lighthouse `llms.txt` audit.

## Principles

- Curate for retrieval. An agent reads the file, then fetches only the links
  it needs, so list what answers real questions and leave the rest out.
- Keep the file small. Detail belongs behind the links, not in the file.
- Link Markdown. Point at clean, text-first pages rather than rendered HTML.
- Scope by path. A file covers the URLs under its path; when several apply,
  the most specific one wins.
- Use stable URLs. Every link must keep working after the next deploy.
- Treat every error as a defect. Optional does not mean a `500` is acceptable.

## Workflow

1. Find the current state: fetch `/llms.txt` and any `llms.txt` at the paths
   involved, and note what each one already covers.
2. Inventory the content an agent needs: overview, docs, API reference,
   guides, examples, policies, changelog and support entry points.
3. Confirm with the user where the files belong before writing anything. Each
   framework publishes a different directory, copies static files from a
   different source folder, or serves them from a route or handler. Ask for
   the directory or route that maps to the site root, whether the build
   generates the files or copies them, and whether a path-scoped file is
   wanted. Never assume a directory name.
4. Write or update the file in the shape below, in the confirmed location.
5. Publish a Markdown version of every page the file links to, in the same
   confirmed location.
6. Advertise the Markdown version and the covering file with link relations
   and, where HTML is not involved, an HTTP `Link` header.
7. Serve the file as UTF-8 text with a successful status, without a browser,
   JavaScript, authentication or a single-page-app fallback.
8. Validate the structure and links with the bundled checker, then run the
   Lighthouse agentic browsing audit.
9. Ask a fresh agent a real question with only the `llms.txt` URL as a
   starting point, and fix the gaps it hits.

## File shape

```markdown
# Project or site name

> One or two sentences that say what this is and who it is for.

Context an agent needs to interpret the links below.

## Docs

- [Getting started](https://example.com/docs/getting-started.md): Install and first run
- [API reference](https://example.com/docs/api.md): Endpoints, types and errors

## Optional

- [Changelog](https://example.com/changelog.md): Secondary reading
```

Replace every placeholder. The example domain is not a real destination.

## Format rules

- Start with an optional byte-order mark, then the H1. Nothing may come
  before the H1, and the H1 is the only required section.
- Follow the H1 with a blockquote summary. Put any further context in ordinary
  Markdown paragraphs or lists, not in headings.
- Delimit file lists with H2 headings. Each H2 section contains a Markdown
  list of links.
- Write each item as `[name](url)`, then optionally `: notes`. Keep names
  short and make the notes say what the link answers.
- Use `## Optional` by convention for secondary links. It is a naming
  convention in v2, not a directive to a tool.
- Never use H3 or deeper. The format allows H1 and H2 only.
- Keep every link absolute and reachable without a session.

See `format.md` for the full grammar, subpath scopes and valid and invalid
examples.

## Placement and scope

- Confirm the location with the user before writing. Frameworks differ in the
  folder they publish, whether static files are generated or copied, and
  whether a route or handler serves the file; do not guess a path.
- Publish at the site root, `/llms.txt`, to cover the whole site.
- Publish at any path, such as `/docs/llms.txt`, to cover only the URLs below
  it. A project that controls only a path can still participate.
- Let the most specific file win. Do not repeat the same links in a root file
  and a path file when the path file already covers them.
- Link path files from the root file when both exist.
- Remember that the Lighthouse audit fetches the domain root only. A valid
  path file does not satisfy the root audit, and a root file can link down.

## Markdown versions and discovery

Give every page an LLM-friendly Markdown version at the same URL, either by
appending `.md` (`page.html.md`) or by replacing the extension (`page.md`).
For a URL without a file name, use `index.html.md` or `index.md`.

Advertise both relations in HTML:

```html
<link rel="alternate" type="text/markdown" href="/docs/page.html.md">
<link rel="describedby" href="/llms.txt">
```

For non-HTML resources, send the same relations in an HTTP header:

```http
Link: </docs/page.html.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"
```

See `markdown.md` for naming, content rules and server configuration.

## Delivery

- Return `200` with the file itself. A rewrite that returns the HTML shell
  with `200` is a failure even though the status looks healthy.
- Serve `text/plain` or `text/markdown` as UTF-8. Either is acceptable; pick
  one and keep it stable.
- Never require a cookie, a login, JavaScript or a client-side router.
- Do not block the file with robots rules, bot protection or a WAF.
- Keep redirects short and permanent. Do not point the file at another host
  without reason.
- Regenerate the file when the content changes, and review it on every
  release.

## Verify

Run the bundled checker against the deployed URL or the built file:

```bash
node <skill>/scripts/check_llms.mjs https://example.com/llms.txt
node <skill>/scripts/check_llms.mjs ./public/llms.txt --check-links
node <skill>/scripts/check_llms.mjs ./public/llms.txt --strict
```

It checks the H1, summary, structure, file-list shape, notes, duplicate and
placeholder URLs, size and, with `--check-links`, every link. It exits
non-zero on errors, or on warnings too with `--strict`.

## Lighthouse audit

The `llms.txt` audit lives in the experimental Agentic Browsing category,
which requires a current Chrome. It makes one request to the domain root:

| Response | Result | Action |
| -------- | ------ | ------ |
| `2xx` | Pass | Keep the file valid and current. |
| `404` | Not applicable | Nothing, unless the file should exist. |
| `5xx` | Fail | Fix the route, rewrite or server error. |

Run the category in Chrome DevTools Lighthouse or in the Lighthouse
integration already used by the project. Investigate the network response
before changing content: most failures are routing, not Markdown.

## Common failures

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Audit fails with a server error | The path hits a broken rewrite or handler | Add an explicit static route or file |
| `200` but the body is HTML | The single-page-app fallback caught the path | Exclude `/llms.txt` from the fallback |
| File not found after deploy | Wrong output directory, case or trailing slash | Copy the file into the published root |
| Checker reports a missing H1 | Front matter or a comment above the title | Put the H1 first |
| Checker reports H3 headings | Deep headings copied from docs | Use H2 sections and plain text |
| Many broken links | Content moved without redirects | Update the link or add a permanent redirect |
| File keeps growing | Every page and heading was added | Keep the root curated and move detail to path files |
| Markdown links return HTML | `.md` variants were never published | Generate them in the build or at the CDN |

## Anti-patterns

- Mirroring `sitemap.xml` and calling it curation.
- Pasting the full documentation into the file. `llms-full.txt` is a separate
  community convention, not part of the v2 proposal, and does not replace it.
- Linking rendered pages that need JavaScript.
- Writing one file per page.
- Adding marketing claims the linked pages do not support.
- Leaving placeholder hosts, `TODO` notes or dead links.
- Treating the file as a search-ranking trick. It serves retrieval.

## Files in this skill

| File | Purpose |
| ---- | ------- |
| `format.md` | The v2 format, scopes and worked valid and invalid examples. |
| `markdown.md` | Markdown page versions, link relations and headers. |
| `audit.md` | Manual audit, Lighthouse, link checks and repair steps. |
| `scripts/check_llms.mjs` | Dependency-free structural and link checker. |
