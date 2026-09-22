# Workflow

## Running things

- Never run release, deploy, server, translate or publish commands.
- Never upload or restart a server build.
- Never test compilation with a bundler. Use the project's dev command (for example `yarn start`) instead.
- Use the package manager the project specifies (for example `yarn`, not `npm`).
- Never build a package unless the task requires it. If you build while testing, revert every generated artifact before finishing.

## Git index

- Never stage or commit changes. The user alone stages and commits, unless they give an explicit order.
- Never unstage changes either. Do not run `git reset`, `git restore --staged`, `git rm --cached`, or any other command that alters the index.
- Leave all modifications unstaged.

## Tickets

See `tickets.md` for the ticket file and shorthand.

## Commit messages

- Follow the project's commit message convention. When it specifies one, keep messages short and lowercase and match the existing log.
