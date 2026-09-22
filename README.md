# DegreeSign Skills

MIT-licensed [Agent Skills](https://agentskills.io) that give AI coding agents reusable workflows for Material Symbols icons, npm package releases, house coding conventions and high-performance, discoverable web apps — no runtime, no lock-in.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-6E56CF.svg)](https://agentskills.io)
[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](ChangeLog.md)
[![Node](https://img.shields.io/badge/node-%3E%3D20.6-339933.svg)](https://nodejs.org)
[![Skills](https://img.shields.io/badge/skills-4-2ea44f.svg)](#skills)

## Table of Contents

- [Intro](#intro)
- [Why DegreeSign Skills](#why-degreesign-skills)
- [Install](#install)
- [Quick Start](#quick-start)
- [Skills](#skills)
  - [`icons`](#icons)
  - [`npm`](#npm)
  - [`coding`](#coding)
  - [`webapp`](#webapp)
- [FAQ](#faq)
- [Layout](#layout)
- [Adding a Skill](#adding-a-skill)
- [Versioning](#versioning)
- [Publishing](#publishing)
- [Keywords](#keywords)
- [Contributing](#contributing)
- [License](#license)

## Intro

DegreeSign Skills is a curated collection of [Agent Skills](https://agentskills.io) — folder-based instructions and resources that AI coding agents load on demand. You bring the agent (Claude Code, Cursor, OpenCode, Gemini CLI, GitHub Copilot, Codex, and any other skills-compatible client); these skills bring the procedure.

Agent Skills use **progressive disclosure**: an agent reads only each skill's name and description until a task matches, then loads the full instructions. That keeps context small while making complex, multi-step work repeatable and auditable.

This repository is the source of truth. Each skill lives in its own folder with a `SKILL.md` plus any scripts, indexes or reference docs it needs. The generated copy that powers the hosted well-known endpoint is produced by `scripts/sync.mjs`.

## Why DegreeSign Skills

- **Repeatable workflows** — turn multi-step tasks (fetch and rasterize an icon, cut a release) into a consistent, auditable procedure.
- **Tiny context footprint** — progressive disclosure loads a skill only when a task matches it.
- **Framework-agnostic** — plain Markdown and a `SKILL.md`; works with any skills-compatible agent, in any project language.
- **Zero runtime dependencies** — the skills are instructions and optional Node helpers; nothing is installed into your app.
- **Version-pinned** — clone a stable tag and install it locally, then upgrade on your schedule.
- **Open and auditable** — MIT licensed, no account, no telemetry, no network calls beyond the public sources a skill documents.

## Install

The recommended way is the [OpenSkills](https://github.com/numman-ali/openskills) CLI — a universal skills loader that installs [Agent Skills](https://agentskills.io) and writes an `<available_skills>` block into your `AGENTS.md`. Run it with your package manager of choice:

```bash
# npm
npx openskills install degreesign/skills -g -u

# yarn
yarn dlx openskills install degreesign/skills -g -u

# pnpm
pnpm dlx openskills install degreesign/skills -g -u
```

Then sync the skills into your agent's `AGENTS.md`:

```bash
npx openskills sync
```

The trailing `-g -u` installs globally (`--global`) into the universal `.agent/skills/` folder (`--universal`) for multi-agent setups. Use `-g` alone for a global `~/.claude/skills` install, or `-u` alone for a project-local `.agent/skills/` install.

Update or remove installed skills at any time:

```bash
npx openskills update
npx openskills remove icons
```

### As a package

The same skill folders ship as a public npm package if you prefer to vendor them:

```bash
# npm
npm install @degreesign/skills

# yarn
yarn add @degreesign/skills

# pnpm
pnpm add @degreesign/skills
```

Then point OpenSkills at the installed folder so your agent can load them:

```bash
npx openskills install ./node_modules/@degreesign/skills/skills -g -u
npx openskills sync
```

### Pin a version

```bash
git clone --branch v1.3.0 --depth 1 https://github.com/degreesign/skills
npx openskills install ./skills -g -u
npx openskills sync
```

## Quick Start

Install the skills, sync them, and confirm what landed:

```bash
npx openskills install degreesign/skills -y -g -u
npx openskills sync
npx openskills list
```

Your agent now sees the skills in `AGENTS.md` and loads one on demand with `npx openskills read <skill-name>`. Ask for the task in plain language:

> Add a `search` icon to the toolbar and make sure it matches the other icons.

The `icons` skill tells the agent to look up the real name in `icons.json`, fetch the official SVG, and save it where the project keeps icons. From a clone of this repo, that is equivalent to running:

```bash
# 1. Find the right icon name
grep -i "search" skills/icons/icons.json

# 2. Fetch the official Material Symbols Rounded SVG
curl -fsSL -o src/assets/icons/search.svg \
  https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/search/materialsymbolsrounded/search_24px.svg
```

For a PNG-only project, the bundled helper rasterizes it:

```bash
node skills/icons/scripts/svg_to_png.mjs input.svg output.png 24
```

Trigger the release workflow the same way:

> Cut a minor release, update the changelog and rewrite the README for discoverability.

The `npm` skill walks the agent through versioning, the matching changelog header, build artifacts, `npm pack --dry-run`, publish, and tag.

## Skills

| Skill | Description | Use when |
| ----- | ----------- | -------- |
| [`icons`](#icons) | Add, find, audit and rasterize Material Symbols Rounded icons. | A page, component or asset needs an icon; you need an icon name; referenced icons are missing; or a PNG-only project needs a raster. |
| [`npm`](#npm) | Release and maintain an npm package. | Creating, naming, versioning, publishing or tagging a package, or rewriting its README. |
| [`coding`](#coding) | Apply house coding conventions when editing a repository. | Writing or changing code, styles, copy or tickets in a project that follows these conventions. |
| [`webapp`](#webapp) | Structure or restructure a TypeScript web app for performance and discoverability. | Setting up a layout, adding or moving pages, wiring the build, or improving SEO, PWA and caching. |

### `icons`

Search, fetch, add and audit [Material Symbols Rounded](https://fonts.google.com/icons) icons. The default output is SVG; produce PNG only when the target project uses PNG exclusively.

| Export | Type | Description |
| ------ | ---- | ----------- |
| `SKILL.md` | Instructions | Entry point: trigger conditions, the source URL pattern, and the add / audit / codepoint / rasterize workflow. |
| `icons.json` | Index | Maps every Material Symbols Rounded icon name to its codepoint for keyword search and font-glyph lookups. |
| `scripts/svg_to_png.mjs` | Node CLI | Rasterize an SVG to PNG at an explicit size using `sharp`, a native renderer, or `npx sharp-cli`. Cross-platform. |
| `scripts/svg_to_png.sh` | POSIX CLI | macOS/Linux wrapper for the same rasterization pipeline. |

Capabilities:

| Capability | What it does |
| ---------- | ------------ |
| Find an icon | Greps `icons.json` for the best matching name. |
| Add an icon | Fetches the real SVG from the Material Design source into the project icon directory. |
| Audit missing icons | Lists icon references in source and diffs them against files on disk. |
| Codepoints | Returns the hex codepoint when an icon is needed as a font glyph. |
| Rasterize | Converts SVG to PNG at a chosen size, preserving transparency and colour. |

### `npm`

Release and maintain an npm package: naming, semantic versioning, changelog, committed build output, publishing, tagging, and README discoverability.

| Export | Type | Description |
| ------ | ---- | ----------- |
| `SKILL.md` | Instructions | Entry point: naming, versioning, changelog rules, build-artifact policy, minimal-diff guidance and the release checklist. |
| `readme-seo.md` | Prompt | A ready-to-use prompt to rewrite a package README for SEO and AI discoverability. |
| `webpack.md` | Guide | Choosing browser, Node or dual targets, folder layout, `package.json` entry fields, `tsconfig.json`, and webpack configuration. |

Capabilities:

| Capability | What it does |
| ---------- | ------------ |
| Versioning | Applies semantic versioning with `package.json` as the source of truth. |
| Changelog | Keeps a changelog whose version header matches `package.json` exactly. |
| Build artifacts | Protects committed `dist/` output and never builds on a whim. |
| Release | Runs the checklist from version bump through `npm pack --dry-run`, publish and `git tag`. |
| README SEO | Rewrites documentation for search engines and AI agents. |

### `coding`

Apply the house coding conventions when editing a repository: TypeScript, CSS, DOM access, i18n, tickets and the release workflow. These rules sit on top of a project's own `AGENTS.md` and stay repo-agnostic, naming only the `@degreesign/ui` helper package they rely on.

| Export | Type | Description |
| ------ | ---- | ----------- |
| `SKILL.md` | Instructions | Entry point: when to use, core principles and the topic index. |
| `typescript.md` | Reference | Types, functions, strings, exports, constants and imports. |
| `css.md` | Reference | Selectors, naming, placement and values. |
| `dom.md` | Reference | Element access through `@degreesign/ui`, null safety and events. |
| `i18n.md` | Reference | Translation source file, key naming, placeholders and hardcoded strings. |
| `workflow.md` | Reference | Build, deploy, translate and git index rules. |
| `tickets.md` | Reference | The ticket file format, shorthand and detail docs. |
| `ui-patterns.md` | Reference | Tooltips, the `icons` skill and vendored browser libraries. |

Capabilities:

| Capability | What it does |
| ---------- | ------------ |
| TypeScript | Keeps types, functions, strings and exports in the shared style. |
| CSS | Enforces class-only selectors, naming, placement and token values. |
| DOM access | Routes all element access through the `@degreesign/ui` helpers. |
| i18n | Keeps copy in the translation source file with consistent keys. |
| Workflow | Guards release, deploy, translate and the git index. |
| Tickets | Maintains one-line tickets and linked detail docs. |

### `webapp`

Structure or restructure a TypeScript web app so it builds fast, ships small and is easy for search engines, social crawlers and AI agents to discover. The build is a single `build()` call from `@degreesign/webapp`; this skill defines the source layout and the config that drive it.

| Export | Type | Description |
| ------ | ---- | ----------- |
| `SKILL.md` | Instructions | Entry point: when to use, core principles, the layout and config at a glance, workflow and checklist. |
| `structure.md` | Reference | The folder contract, the page triad, shared partials, assets, shared code and generated output. |
| `config.md` | Reference | Every `build()` field, `Page` fields, generated files, scripts and tsconfig. |
| `performance.md` | Reference | Hashing, splitting, CSS, minification, obfuscation, service worker, images and caching. |
| `discoverability.md` | Reference | Meta tags, Open Graph, canonical URLs, manifest, sitemap, robots, i18n and LLM files. |
| `restructure.md` | Guide | Migrating an existing app onto the layout and build, step by step. |

Capabilities:

| Capability | What it does |
| ---------- | ------------ |
| Layout | Applies the one-folder-per-page contract and the shared-partial, assets and code directories. |
| Config | Wires `webpack.web.ts` and `webpack.server.ts` from typed options. |
| Performance | Enables content hashing, per-page splitting, inlined CSS, on-demand libraries and asset caching. |
| Discoverability | Generates per-page meta, Open Graph, canonical, manifest, sitemap and robots. |
| PWA | Configures the manifest, shortcuts, service worker and icons. |
| Restructure | Moves an existing app onto the layout without changing behaviour. |

## FAQ

**What is DegreeSign Skills?**
A collection of [Agent Skills](https://agentskills.io): folders containing a `SKILL.md` and supporting files that AI coding agents load on demand to perform specific workflows.

**Is it free?**
Yes. It is open source under the [MIT license](LICENSE). No account, subscription, or telemetry.

**Does it work in Node and the browser?**
The skills themselves are Markdown and JSON with no runtime, so they work anywhere. The bundled helpers (`scripts/svg_to_png.mjs`, `scripts/sync.mjs`) need Node 18+, while the OpenSkills CLI and this package's `engines` require Node 20.6+ and Git. Nothing runs in the browser, and no browser build is shipped.

**Are there dependencies?**
No required dependencies. The `icons` rasterizer opportunistically uses a project's existing `sharp`, then a native tool such as `rsvg-convert`, Inkscape or ImageMagick, and falls back to `npx sharp-cli`.

**Is TypeScript supported?**
Yes. Skills are language-agnostic, and the skill set covers TypeScript-friendly tasks such as npm packaging, `tsconfig.json` targets and `ts-loader` webpack builds. No type definitions are needed or shipped.

**Which frameworks and agents are supported?**
Any agent that reads `AGENTS.md` — Claude Code, Cursor, OpenCode, Gemini CLI, GitHub Copilot, VS Code, Codex, Windsurf, Aider and more — because [OpenSkills](https://github.com/numman-ali/openskills) writes the same `<available_skills>` block they already understand. The skills are framework-agnostic, so they apply to any web or Node project.

**Can I publish the well-known copy?**
Yes. Clone the repo and generate it with `scripts/sync.mjs`, or install the public npm package. See [Publishing](#publishing).

**How do I pin a version?**
Clone the tag and install from the local path: `git clone --branch v1.3.0 --depth 1 https://github.com/degreesign/skills && npx openskills install ./skills -g -u`.

## Layout

Each skill lives in `skills/<name>/` and contains a `SKILL.md` with `name` and `description` frontmatter. Supporting files live beside it.

```text
skills/
├── coding/
│   ├── SKILL.md
│   ├── typescript.md
│   ├── css.md
│   ├── dom.md
│   ├── i18n.md
│   ├── workflow.md
│   ├── tickets.md
│   └── ui-patterns.md
├── icons/
│   ├── SKILL.md
│   ├── icons.json
│   └── scripts/
│       ├── svg_to_png.mjs
│       └── svg_to_png.sh
├── npm/
│   ├── SKILL.md
│   ├── readme-seo.md
│   └── webpack.md
└── webapp/
    ├── SKILL.md
    ├── structure.md
    ├── config.md
    ├── performance.md
    ├── discoverability.md
    └── restructure.md
```

## Adding a Skill

1. Create `skills/<name>/SKILL.md` with `name` and `description` frontmatter.
2. Add any supporting files beside it.
3. Refresh the published copy with `node scripts/sync.mjs <target-dir>`.

## Versioning

`VERSION` holds the current release. Tag the release (`v1.3.0`) so consumers can pin it by cloning the tag and installing locally. See [ChangeLog.md](ChangeLog.md) for release notes.

## Publishing

The well-known copy at `public_html/.well-known/skills/` on degreesign.com is generated from this repo:

```bash
node scripts/sync.mjs /path/to/DS_Website/public_html/.well-known/skills
```

Never edit the generated copy by hand. The output is a directory of skill folders plus an `index.json` manifest.

## Keywords

agent skills, ai coding agent, claude code skills, cursor skills, opencode skills, gemini cli skills, github copilot skills, agent skills collection, material symbols rounded, material design icons, icon finder, icon audit, svg to png, png icons, image rasterization, npm package release, npm publish, semantic versioning, changelog, git tag, webpack build, typescript package, readme seo, ai discoverability, coding conventions, code style, typescript style, css conventions, dom helpers, i18n, translation keys, web app structure, webapp performance, progressive web app, pwa, seo, open graph, web manifest, sitemap, robots txt, service worker, code splitting, asset caching

## Contributing

Issues and pull requests are welcome. Keep each skill self-contained — a skill must not read files from another skill. Bump `VERSION`, update [ChangeLog.md](ChangeLog.md), and refresh the README table when adding a skill.

## License

[MIT](LICENSE) © DegreeSign
