# AGENTS.md

## General

- Apply these rules to every skill in this repository.
- Use neutral placeholders for paths, hosts, environment variable names, service names and deploy commands.
- Always use a fresh generic name; never reuse a specific one, and generalise the whole flow, not just the names.

## Adding a rule

- Every rule must be generic, state a required behaviour and never a preference.
- Never put specific values or examples in a rule.

## Adding a skill

- Create one folder per skill at `skills/<name>/`.
- Every skill must have `SKILL.md` with `name` and `description` frontmatter. `name` must match the folder and use lowercase hyphen-separated words.
- Put supporting files beside `SKILL.md` and reference them with relative paths.
- Keep each skill self-contained. A skill must not read files from another skill.

## Writing a skill

- Write skills generically. Never mention the projects, repos or packages that inspired a skill; use neutral example names such as `mylib`.
- Research the real source material first, then generalise. Do not invent behaviour or APIs.
- Keep the frontmatter `description` focused on the skill's most important aspects. Do not use colons.
- When the scope is unclear, ask the user with concrete options before writing.

## Changing a skill

- Adding a skill is a minor version bump.
- After changing a skill, refresh the `README.md` skills table and `ChangeLog.md`.
- Keep the `skills` badge count in `README.md` equal to the number of folders under `skills/`.

## Version and changelog

- Bump `VERSION` and add a `ChangeLog.md` entry for every release.
- Keep `ChangeLog.md` to public changes only, one line per change.

## Commit messages

- Use 2 to 4 words, alphabetic letters only (no digits or punctuation).
- Use lowercase letters only.
- Never commit or stage changes. Only the user commits or stages, unless the user gives an explicit order.
- Never unstage changes either. Do not run `git reset`, `git restore --staged`, `git rm --cached`, or any other command that alters the index. The user alone controls the index.
