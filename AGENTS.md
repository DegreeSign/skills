# AGENTS.md

## Adding a skill

- Create one folder per skill at `skills/<name>/`.
- Every skill must have `SKILL.md` with `name` and `description` frontmatter. `name` must match the folder and use lowercase hyphen-separated words.
- Put supporting files beside `SKILL.md` and reference them with relative paths.
- Keep each skill self-contained. A skill must not read files from another skill.

## Version and changelog

- Bump `VERSION` and add a `ChangeLog.md` entry for every release.
- Keep `ChangeLog.md` to public changes only, one line per change.

## Publishing

- The well-known copy at `public_html/.well-known/skills/` is generated. After changing a skill, run:
  `node scripts/sync.mjs /path/to/DS_Website/public_html/.well-known/skills`
- Never edit the generated copy by hand.
