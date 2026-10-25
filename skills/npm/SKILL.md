---
name: npm
description: Release and maintain an npm package. Covers naming, versioning, changelog, building, publishing and the architecture map. Use when creating, versioning, publishing or tagging a package, rewriting its README, or mapping its architecture.
---

# npm

Release and maintain an npm package: versioning, changelog, committed build output, publishing, tagging and README discoverability.

## When to use

- Bumping the package version.
- Naming a new package.
- Updating the changelog.
- Building or handling `dist/` artifacts.
- Publishing to npm or tagging a release.
- Rewriting a README for SEO and AI discoverability.
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
- Link the map from the README Architecture section. Keep it out of the `files` array unless the docs site is served from the tarball.
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
5. Build and test.
6. Inspect the publish contents with `npm pack --dry-run`.
7. Publish: `npm publish` (add `--access public` for scoped packages).
8. Tag the release: `git tag vX.Y.Z`.
9. Push the commit and tag.

## README for SEO and AI discoverability

Use the prompt in `readme-seo.md` to rewrite a package README so it ranks and is easy for AI agents to discover and summarise.
