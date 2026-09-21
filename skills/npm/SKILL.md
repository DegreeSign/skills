---
name: npm
description: Release and maintain an npm package. Covers naming, versioning, changelog, building and publishing. Use when creating, versioning, publishing or tagging a package, or rewriting its README.
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
- Record external / public API changes only: new exports, changed types, breaking changes. Ignore internal refactors and renames.
- One sentence per change, absolute need-to-know only. Never mention a type or symbol that is not publicly exported.

## Build artifacts

- `dist/` is a committed build artifact. Do not regenerate or modify it casually.
- Never build the package unless the task requires it.
- If you build for testing, revert every change under `dist/` (for example `git checkout dist`) before finishing.
- Never stage, commit or report `dist/` changes as part of a change.

## Project structure and webpack

See `webpack.md` for how to pick the browser, Node or both targets from the package's code, the folder layout, `package.json` entry fields (`main`, `module`, `browser`, `types`), `tsconfig.json`, and a dual browser + Node webpack config (plus the Node-only variant) built on `ts-loader`, `TerserPlugin` and `BannerPlugin`.

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
4. Build and test.
5. Inspect the publish contents with `npm pack --dry-run`.
6. Publish: `npm publish` (add `--access public` for scoped packages).
7. Tag the release: `git tag vX.Y.Z`.
8. Push the commit and tag.

## README for SEO and AI discoverability

Use the prompt in `readme-seo.md` to rewrite a package README so it ranks and is easy for AI agents to discover and summarise.
