# llms.txt format

The v2 proposal (August 2026) defines a Markdown file named `llms.txt` that
gives an agent a curated entry point into a site or a path. The format is
readable by people and models, and regular enough to parse with ordinary
code.

## Required order

| Part | Required | Rule |
| ---- | -------- | ---- |
| Byte-order mark | No | Only at the very start, before everything else. |
| H1 title | Yes | The name of the project or site. This is the only required section. |
| Blockquote | Expected | A short summary directly after the H1. |
| Detail | No | Paragraphs, lists, tables or code that explain the content. No headings. |
| H2 sections | No | Each one is a file list of links. |

Nothing may come before the H1. That includes front matter, comments, badges
and a second title.

## H1

- Write exactly one H1 as `# Name`.
- Use the project or site name, not a tagline.
- Keep it stable; agents and people use it to identify the file.

## Summary

- Start the line after the H1 with `>` and one or two sentences.
- Say what the site or path offers and who it serves.
- Include the key fact needed to interpret the rest of the file.
- Continue the blockquote on further `>` lines if needed.

## Detail

- Use plain Markdown: paragraphs, bullet lists, tables, blockquotes and code.
- Do not add headings. Heading levels below H2 are outside the format.
- Keep it short. Move long explanations behind a link.
- Explain terms the links rely on, especially when the site uses in-house
  names.

## File lists

- Open with an H2 heading, for example `## Docs`.
- Follow it with a Markdown list. Each item is one resource.
- Write the required link first: `[name](url)`.
- Add notes after a colon: `[name](url): what it answers`.
- Keep names specific enough to choose between two links.
- Link external sites when they help an agent understand the content.
- Do not put a bare URL in a list item; always give it a name.
- Do not use a dash or other separator before the notes.

Example:

```markdown
## Guides

- [Deploy a service](https://example.com/guides/deploy.md): Build, copy and restart
- [Rotate a secret](https://example.com/guides/rotate.md): Replace a credential without downtime
```

## The Optional section

- `## Optional` is a naming convention for secondary links an agent can skip
  when context is tight.
- It has no mechanical meaning in v2. Do not rely on a consumer dropping it.
- Use it for changelogs, background, community links and other nice-to-haves.

## Scopes

- A file covers the URLs under the path where it is served.
- `/llms.txt` covers the whole site.
- `/docs/llms.txt` covers `/docs/` and below.
- A file can live at any path; it does not have to use `/.well-known/`.
- The well-known prefix is unsuitable because it exists only at the origin
  root, while a project may control only a path on a shared host.
- When more than one file applies to a URL, agents should use the most
  specific one.
- A root file can link to the path files so an agent can descend without
  guessing.

## Relationship to other files

- `robots.txt` states what automated access is acceptable. It does not
  replace `llms.txt` and should not block it.
- `sitemap.xml` lists every indexable page for search engines. It is usually
  too large, too complete and missing the Markdown variants.
- Structured data describes entities and markup. An `llms.txt` file can link
  to it when it helps interpretation.
- `llms-full.txt` is a community convention for a single expanded document.
  It is not part of v2 and does not replace the file.

## Parsing notes

- Read the file as UTF-8 and strip one leading byte-order mark.
- Treat the first `# ` line as the title.
- Treat `>` lines after the title as the summary.
- Treat `## ` lines as section boundaries.
- Treat list items in those sections as entries. The first Markdown link in
  an item is the resource; text after it is a note.
- Ignore fenced code blocks when parsing structure.
- Do not infer meaning from line order beyond the required order above.

## Valid minimal example

```markdown
# Example

> A short description of the site.
```

This is valid because the H1 is the only required section. A summary and
links are still strongly expected.

## Valid full example

```markdown
# Example

> Example is a documentation site for a small HTTP toolkit.

The toolkit ships a server, a client and a command line. Every page below has
a Markdown version at the same URL with `.md` appended.

## Start

- [Install](https://example.com/docs/install.md): Requirements and first run
- [Quick start](https://example.com/docs/quick-start.md): One request end to end

## Reference

- [API](https://example.com/docs/api.md): Types, functions and errors
- [Configuration](https://example.com/docs/config.md): Every option and default

## Optional

- [Changelog](https://example.com/changelog.md): Release history
- [Source](https://example.com/source): Repository and issues
```

## Invalid examples

| Example | Why it is invalid |
| ------- | ----------------- |
| Front matter before the H1 | Content must not come before the title. |
| No H1 at all | The title is required. |
| Two H1 lines | The format describes one title. |
| `### Details` anywhere | Only H1 and H2 headings are allowed. |
| An H2 with only a paragraph | H2 sections are file lists. |
| `- https://example.com/page` | Each item needs `[name](url)`. |
| `- [Page](https://example.com) - notes` | Notes follow a colon, not a dash. |
| An HTML page served as `llms.txt` | The file must be Markdown, not a rendered shell. |
| A list of every sitemap URL | The file is curated, not exhaustive. |

## Review checklist

- The first content is the H1.
- A blockquote summary follows it.
- Detail has no headings.
- Every H2 section has at least one `[name](url)` item.
- Notes use a colon and say what the link answers.
- No H3 or deeper.
- `Optional` is used only for secondary links.
- The file covers its path, and the most specific file wins.
- Every URL is absolute, current and returns the intended content.
- The file stays small enough to read in one context.
