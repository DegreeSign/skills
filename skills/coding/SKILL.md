---
name: coding
description: Apply house coding conventions when editing a repository, covering TypeScript, CSS, DOM access, i18n, tickets and release workflow. Use when writing or changing code, styles, copy or tickets in a project that follows these conventions.
---

# Coding

House conventions for editing a repository. These rules apply on top of a project's own `AGENTS.md`; when the two collide, the project's file wins and this skill is the fallback for anything it does not cover.

## When to use

- Writing or changing any TypeScript or JavaScript.
- Adding or editing CSS or markup.
- Touching user-facing copy or translation keys.
- Adding, editing or closing a ticket.
- Running a build, dev server, translate or publish command.

## Core principles

- Keep the diff minimal. Touch only what the task requires and never reformat unrelated code.
- Match the surrounding code. Copy the style, helpers and patterns already in the file before inventing anything.
- Reuse before you build. Prefer an existing helper, component or class over a new hand-rolled one.
- Never invent a convention. When a rule is unclear, follow the closest existing example in the codebase.
- Keep lines short so code stays readable on narrow screens.
- Write rules as direct instructions. State the required behaviour on its own, without contrasting it against what not to do.
- Write rules generically and use neutral example names such as `mylib`. Name a real package only when a rule depends on its API, such as the `@degreesign/ui` helpers.

## Topics

- `typescript.md`: types, functions, strings, exports and naming.
- `css.md`: selectors, properties, naming, sizing and colour.
- `dom.md`: DOM access via `@degreesign/ui` and event handlers.
- `i18n.md`: translation files, keys and auto-population.
- `workflow.md`: build, deploy, translate and git index rules.
- `tickets.md`: the ticket file format and shorthand.
- `ui-patterns.md`: tooltips, icons via the `icons` skill, and vendored browser libraries.

## Workflow

1. Read the project's `AGENTS.md` and the relevant topic files above.
2. Read the target files and their neighbours to learn the local patterns.
3. Make the smallest change that satisfies the task, in the existing style.
4. Never run release, deploy, translate or publish commands.
5. Leave staging and commits to the user.
