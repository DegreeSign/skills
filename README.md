# DegreeSign Skills

Self-hosted [Agent Skills](https://agentskills.io) from DegreeSign. Each skill is a folder of instructions and resources an AI coding agent loads on demand.

## Install

```
npx skills add degreesign/skills --list
npx skills add degreesign/skills -s icons
```

Install to a specific agent, or globally:

```
npx skills add degreesign/skills -s icons -a opencode
npx skills add degreesign/skills -s icons -g
```

The `owner/repo@skill` shorthand also works:

```
npx skills add degreesign/skills@icons
```

## Skills

| Skill | Description |
| ----- | ----------- |
| `icons` | Add, find, audit and rasterize Material Symbols Rounded icons. |

## Layout

Each skill lives in `skills/<name>/` and contains a `SKILL.md` with `name` and `description` frontmatter. Supporting files live beside it.

## Adding a skill

1. Create `skills/<name>/SKILL.md` with `name` and `description` frontmatter.
2. Add any supporting files beside it.
3. Refresh the published copy with `node scripts/sync.mjs <target-dir>`.

## Versioning

`VERSION` holds the current release. Tag the release (`v1.0.0`) so users can pin it with `degreesign/skills#v1.0.0`.

## Publishing to the website

The well-known copy at `public_html/.well-known/skills/` on degreesign.com is generated from this repo:

```
node scripts/sync.mjs /path/to/DS_Website/public_html/.well-known/skills
```

## License

MIT
