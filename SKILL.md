---
name: degreesign
description: Route a task to the right DegreeSign sub-skill and keep the installed collection current. Use when a task needs Material Symbols icons, an npm package release, the house coding conventions, a TypeScript web app structure, a Node backend structure or task backlog management, or when asked to check for updates to the installed skills.
---

# DegreeSign

One entry skill for the DegreeSign collection. It routes a task to the matching sub-skill and checks for a newer published version at most once a day.

## When to use

- A task matches one of the sub-skills below.
- You need to know which sub-skill applies.
- You need to check whether the installed collection is current.

## Sub-skills

Read the matching file before acting. Resolve each path relative to this `SKILL.md`.

- `skills/icons/SKILL.md`: add, find, audit and rasterize Material Symbols Rounded icons.
- `skills/npm/SKILL.md`: release and maintain an npm package.
- `skills/coding/SKILL.md`: apply the house coding conventions when editing a repository.
- `skills/webapp/SKILL.md`: structure or restructure a TypeScript web app.
- `skills/server/SKILL.md`: structure or restructure a Node backend.
- `skills/todo/SKILL.md`: manage a project's task backlog and ticket file.

Load only the sub-skill a task needs; do not read every sub-skill up front.

## Keep the collection current

At the start of a session, run the bundled check once per machine per day. Run `node` on the `check.mjs` that sits beside this `SKILL.md`, using its absolute path.

The check reads the install marker, queries the npm registry at most once every 24 hours (the result is cached under the XDG cache directory so every session on the machine shares one timestamp), and prints an update command when a newer version exists. When it reports a newer version, ask the user whether to update, then run the printed command. Never update without asking.
