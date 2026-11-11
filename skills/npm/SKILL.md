---
name: npm
description: Release and maintain an npm package. Covers naming, versioning, changelog, building, publishing, the showcase page and the architecture map. Use when creating, versioning, publishing or tagging a package, rewriting its README, building its showcase page, or mapping its architecture.
---

# npm

Release and maintain an npm package: versioning, changelog, committed build output, publishing, tagging, README discoverability, the showcase page and the architecture map.

## When to use

- Bumping the package version.
- Naming a new package.
- Updating the changelog.
- Building or handling `dist/` artifacts.
- Publishing to npm or tagging a release.
- Rewriting a README for SEO and AI discoverability.
- Creating or updating the package showcase page.
- Creating or updating the package architecture map.

## Package name

- Always ask the user for the package name before naming anything (folder, `package.json` `name`, files, README, configs).
- If the user has no name, propose one and wait for explicit approval. Never pick or change the name on your own.
- Get the scope right too (plain, or `@scope/name`); proposal options can be a scope plus a name.

## Versioning

- Follow semantic versioning.
- `package.json` `version` is the source of truth.
- Bump the version only when explicitly requested; never on your own initiative.
- When bumping, also bump any versioned CDN links in the README if the package targets the web too (for example jsDelivr or unpkg URLs pinned to a version).

## Changelog

- Keep a changelog file (`ChangeLog.md` or `changes.md`) updated.
- The changelog version header must always match the `version` in `package.json` exactly. Never use `Unreleased` or any placeholder.
- The changelog documents exports only. Record external / public API changes: new exports, changed types, breaking changes.
- Never add internal changes: refactors, renames, tests, tooling, dependencies or other non-export work.
- One sentence per change, absolute need-to-know only. Never mention a type or symbol that is not publicly exported.

## Build artifacts

- `dist/` is a committed build artifact. Do not regenerate or modify it casually.
- Never build the package unless the task requires it.
- If you build for testing, revert every change under `dist/` (for example `git checkout dist`) before finishing.
- Never stage, commit or report `dist/` changes as part of a change.

## Project structure and webpack

See `webpack.md` for how to pick the browser, Node or both targets from the package's code, the folder layout, `package.json` entry fields (`main`, `module`, `browser`, `types`), `tsconfig.json`, and a dual browser + Node webpack config (plus the Node-only variant) built on `ts-loader`, `TerserPlugin` and `BannerPlugin`.

## Architecture map

Every package keeps a committed `docs/architecture.html`: one self-contained page that maps the package as bands of files and functions, the typed relations between them, the primary flow and any state machine.

- Create the map when the package is created, not after the first release. Keep it at `docs/architecture.html`.
- Build it from `architecture.template.html`. See `architecture.md` for the data model, the worked example, the build procedure and the update checklist.
- Keep it a single offline HTML file: inline CSS and JavaScript, no CDN, no framework, no network request and no build step.
- Map the public entry, every source module and every meaningful function with its real definition line and signature. Group files into bands in dependency order.
- Record real relations only: build, call, event, store, type and inner. Add the primary flow and any enum-driven state machine.
- Update the map in the same change as the code. A drifted line, line count or edge is a defect.
- Verify with `node <skill>/scripts/check_architecture.mjs <package-root>` and open the file in a browser before a release.
- Link the map from the README Architecture section and from the showcase page. Keep it out of the `files` array unless the docs site is served from the tarball.
- Never put secrets, tokens, private URLs or machine-specific paths in the file.

## Showcase page

Every package keeps a committed `docs/index.html`: a landing page with the package promise, a live proof, real limits, install steps, a link to `docs/architecture.html` and, when approved, a production case study.

- Create the page when the package is created, not after the first release. Keep it at `docs/index.html`.
- Build it from `showcase.template.html` and the rules, narrative spine, demo contract and checks in `showcase.md`.
- Follow one argument: hero promise, working preview, facts strip, why, live demo, capabilities, first run, approved proof, real specs, architecture, install, FAQ and closing action. Drop any section the package cannot fill with real content.
- Keep it one HTML file with inline CSS and JavaScript. External runtime assets such as a CDN bundle, screenshots and a logo are allowed; no build step and no framework.
- Style it from the package's own identity. The template is a neutral grayscale scaffold; replace its tokens, type and shape values, and never reuse another package's colours or exact visual style.
- Include a tiny demo that shows the core idea in one screen and uses the public API. Lazy-load its bundle, show every state, support stop and reset, and fail readably. If the full flow needs weights, a worker or a microphone, keep it behind the demo button or link to a fuller `docs/demo.html`.
- Link the full architecture map from the page: `href="architecture.html"` with `target="_blank" rel="noreferrer"`.
- State sizes, limits and performance only when measured or documented. Repeat each fact with the same value everywhere.
- Ask the user whether a production project uses the package and should appear as a case study. Never invent a case study.
- When approved, use the real product name, logo, URL and actual screenshots. Capture the real flow in a headless browser; never use mockups, fabricated metrics or invented quotes.
- Keep the page responsive, accessible and calm. Respect `prefers-reduced-motion`; keep a skip link, focus outlines and an accessible demo.
- Add canonical, Open Graph and Twitter metadata. Add `FAQPage` structured data only when every answer matches a visible FAQ item.
- Link the showcase from the README Demo section.
- Verify at desktop and mobile widths, check every link, the copy button, keyboard navigation and reduced motion, and confirm the demo fails gracefully when its bundle is unavailable.
- Keep `docs/` out of the npm `files` array unless the docs site is served from the tarball.
- Never put secrets, tokens, private URLs or machine-specific paths in the file.

## Minimal diff

- Keep the diff absolutely minimal. Touch only what the task requires.
- Do not reformat unrelated code, reorder or rename symbols, or move code beyond the request.
- Do not duplicate code. Code needed in more than one place must be a shared helper function in the same location.

## Git state

- Never stage or commit changes. Only the user stages and commits, unless the user gives an explicit order.
- Never unstage changes either. Do not run `git reset`, `git restore --staged`, `git rm --cached`, or any other command that alters the index. The user alone controls the index.

## Release checklist

1. Bump `version` in `package.json` (only when requested).
2. Update the changelog with a matching version header.
3. Bump versioned CDN links in the README when the package also targets the web.
4. Confirm `docs/architecture.html` matches the source: run the checker and recheck every changed line.
5. Confirm `docs/index.html` still matches the public API, links to the demo and `docs/architecture.html`, and that every fact and case study is current.
6. Build and test.
7. Inspect the publish contents with `npm pack --dry-run`.
8. Publish: `npm publish` (add `--access public` for scoped packages).
9. Tag the release: `git tag vX.Y.Z`.
10. Push the commit and tag.

## README for SEO and AI discoverability

Use the prompt in `readme-seo.md` to rewrite a package README so it ranks and is easy for AI agents to discover and summarise.
