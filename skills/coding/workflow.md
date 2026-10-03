# Workflow

## Running things

- Never run release, deploy, server, translate or publish commands.
- Never upload or restart a server build.
- Never test compilation with a bundler. Use the project's dev command (for example `yarn start`) instead.
- Run every build verification with a dev build, never with a release or production build.
- Cap every verification run at 30 seconds, and raise the cap incrementally only when 30 seconds is not enough.
- Use the package manager the project specifies (for example `yarn`, not `npm`).
- Never build a package unless the task requires it. When verification needs a real build, either remove every auto-generated file afterward or direct the output into an untracked, gitignored build directory.
- Keep generated build output only when the user explicitly asks to build the project.

## Git index

- Never stage or commit changes. The user alone stages and commits, unless they give an explicit order.
- Never unstage changes either. Do not run `git reset`, `git restore --staged`, `git rm --cached`, or any other command that alters the index.
- Leave all modifications unstaged.

## Commit messages

- Follow the project's commit message convention. When it specifies one, keep messages short and lowercase and match the existing log.
