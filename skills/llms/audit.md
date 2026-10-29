# Auditing LLM discovery

An audit answers three questions: does the file resolve, is it valid, and
does it lead an agent to the right content. Work in that order. A structural
problem is cheap to fix; a coverage problem needs a conversation about the
site.

## What to audit

| Layer | Question |
| ----- | -------- |
| Delivery | Does the URL return the file itself with a healthy status? |
| Placement | Does the file live in a directory or route the build actually publishes? |
| Structure | Does it follow the v2 format? |
| Coverage | Does it list the content an agent needs? |
| Links | Do the targets resolve to clean content? |
| Markdown | Does every page have a usable Markdown version? |
| Discovery | Can an agent find the file and the Markdown versions? |
| Size | Does the file fit comfortably in one context? |

## Lighthouse

The `llms.txt` audit sits in the experimental Agentic Browsing category. It
requires a current Chrome and makes one request to the domain root.

| Response | Result | Meaning |
| -------- | ------ | ------- |
| `2xx` | Pass | The file was retrieved. |
| `404` | Not applicable | The file is optional; this is not a failure. |
| `5xx` | Fail | The server errored while serving the file. |

- The audit checks the root only. A valid `/docs/llms.txt` does not satisfy
  it, and a root file may link down to path files.
- Investigate the response before editing the file. A `500` is a routing,
  rewrite or handler defect, not a Markdown defect.
- The category is experimental and unscored, so treat a pass as one signal
  rather than a complete review.

## Delivery checks

```bash
curl -sS -D - -o /tmp/llms.txt https://example.com/llms.txt
```

Confirm:

- The status is `200`, not a redirect chain or a `404`.
- The content type is `text/plain` or `text/markdown`, not `text/html`.
- The body starts with `# ` and not `<!doctype html>`.
- No cookie, login or JavaScript is required.
- The body is UTF-8 and has no replacement characters.
- The response is not a cached error page.
- The file is not blocked by robots rules, a WAF or bot protection.

A `200` that returns the single-page-app shell is the most common silent
failure. Check the body, not just the status.

## Structure checks

Run the bundled checker:

```bash
node <skill>/scripts/check_llms.mjs https://example.com/llms.txt
```

It reports the byte-order mark, size, H2 sections and link count, then every
finding with a line number:

- Errors: missing H1, content before the H1, H3 or deeper, an H2 section
  without a file list, a list item without `[name](url)`.
- Warnings: missing summary, more than one H1, notes not after a colon,
  non-list text inside an H2 section, relative or placeholder URLs, duplicate
  URLs, oversize file.

Add `--strict` to treat warnings as failures in a build.

## Link checks

```bash
node <skill>/scripts/check_llms.mjs ./public/llms.txt --check-links
```

- Every `2xx` target passes.
- `401`, `403` and `429` warn because the link may be valid but protected.
- Other `4xx` and `5xx` responses fail.
- Redirects are followed; the report shows the final URL when it moved.

For a large site, run the full link check on a schedule and the structural
check on every build. External links change without warning, so do not make a
release depend on every third party.

## Coverage checks

- List the site's main sections from its navigation, sitemap or routes.
- Mark each one as covered, covered by a path file, or intentionally omitted.
- Ask what an agent could not answer from the file alone: pricing, limits,
  licence, support, migration, error codes, version policy.
- Remove links to retired pages and folded sections.
- Keep the root file to the entry points; move deep material into path files.
- Check that names and notes describe the destination, not the marketing
  claim.
- Compare against the docs index, not only the sitemap.

## Markdown checks

- Fetch every linked URL and confirm it returns Markdown, not an HTML shell.
- Confirm the first heading matches the page and the body has no navigation,
  cookie text or scripts.
- Spot-check code fences, tables and links.
- Test the other URL form if the site publishes both; keep one canonical.
- Confirm the build regenerates the Markdown in the same change as the page.
- Confirm private or draft pages are not exposed.

## Discovery checks

- Fetch an HTML page and inspect the head for `alternate` and `describedby`.
- Fetch a non-HTML resource and inspect the `Link` header.
- Confirm `describedby` points at the most specific covering file.
- Confirm every advertised Markdown URL exists.
- Confirm path files are linked from the root file.
- Confirm no relation points at a redirect, a preview host or a dead path.

## Agent test

Use a fresh session with no project context. Give it only the file URL and a
real task:

> Starting only from https://example.com/llms.txt, find how to install the
> toolkit, which licence it uses, and how to rotate a credential.

Record every question it cannot answer, every link it has to guess, and every
page it reaches that still needs JavaScript. Fix the file, not the prompt.
Repeat until the answers come from the linked content.

## Continuous integration

- Validate structure on every build, against the built file at the location
  the user confirmed.
- Check links on a schedule, not on every commit.
- Fail the build on errors; treat warnings as review items.
- Run the Lighthouse category in the existing browser CI when available.
- Keep a smoke test for the deployed root URL, so a rewrite regression is
  caught before a release.
- Store the generated file in the repository only when the site is not built
  from source.

## Severity

| Level | Example | Action |
| ----- | ------- | ------ |
| Fail | `5xx`, missing H1, broken internal link | Fix before release. |
| Warn | Missing summary, protected link, oversize file | Fix or record why not. |
| Info | BOM present, section count | No action needed. |

## Report

Write findings in this order:

1. URL, status, content type and size.
2. Structure findings with line numbers.
3. Broken or protected links.
4. Coverage gaps and stale entries.
5. Markdown and discovery problems.
6. The smallest set of fixes, in delivery-first order.

## Repair order

1. Confirm the published location with the user, then make the root URL
   return the file.
2. Remove any content before the H1 and fix the section structure.
3. Repair broken and placeholder links.
4. Add or regenerate the Markdown versions.
5. Add the link relations and headers.
6. Reduce the file by moving detail into path files.
7. Re-run the checker and the Lighthouse audit.
