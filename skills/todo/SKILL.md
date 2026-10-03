---
name: todo
description: Manage a project's task backlog and ticket file, covering ticket layout, status and category markers, ordering, line-number shorthand, detail docs and recording done work from git history. Use when listing, adding, ordering or closing tasks, updating tickets or reporting what is done.
---

# Todo and task management

A project keeps its whole task backlog in a single ticket file. The project
declares that file's path in its own conventions, normally its `AGENTS.md`.
This skill defines the file layout, the status and category markers, the
ordering rules, and how finished work is recorded from history.

## When to use

- Adding, editing, reordering or closing a ticket.
- Summarising completed work from commit history.
- Reviewing what is open, in progress or done.

## The ticket file

- One file holds the full backlog.
- The title is `# Tickets - Planned Tasks`.
- Open tasks come first, then a `## Done` section, then a `## Legend`.
- Each ticket is one line: `- <status> <category> <description>`.
- Write every ticket as an imperative action.
- Keep each description short, with no full stop, at most about seven words.
- Add or edit a ticket only when the user asks; keep each edit to the minimum
  diff.

## Shorthand

- A reference like `L4` means the line number in the ticket file (line 4), not
  an ID or a position in a task list. Read that line to find the ticket.

## Status markers

Use these fixed markers on every ticket:

- ⬛ not started
- 🟨 in progress
- 🟩 done

## Category markers

- Choose one category marker per group of tickets with similar
  characteristics. Examples: 💸 revenue, 🧐 analysis, 📣 marketing, 🛠️
  maintenance, 🫦 interfaces and 🚀 launching.
- Reuse a marker that already appears in the file. Add a new one only when a
  new workstream appears, and record it in the legend.

## Legend

- Keep a legend section at the bottom of the file.
- List every marker in use, grouped under status and category headings.
- Keep the legend in step with the markers the tickets use.

## Ordering

- Open tickets run by importance, highest first.
- Done tickets run latest to oldest.
- Place a newly finished ticket at the top of the done list.

## Detail docs

- When a ticket needs detailed technical notes for future implementation, write
  them in the project's details folder, one file per feature, and link the
  ticket to it with a relative link.
- Detail docs are implementation references: steps, files and verification.
  Never speculation or a completed-work log.

## Recording done work

- Upon request derive done entries from commit history, for example
  `git log --date=short --no-merges --pretty=format:'%h %ad %s'`.
- Read the changed files in each commit to name the work it completed.
- Write one entry per distinct piece of work, merging repeats across commits.
- Report each entry as a finished action in the same short style as a ticket.

## Scope

- Do not stage or commit the file; leave every edit for the user.
- Leave detailed implementation notes to the project's plan documents and keep
  the ticket file to one line per ticket.
