# TypeScript

## Types

- Define every interface and type in the project's dedicated types module, never inline in a code file. Import it where needed.
- Use `interface` for object shapes and `type` for aliases and unions.
- Never use `any`. Never use `unknown` as a shortcut either; find the actual type.
- Never combine the optional `?` marker with an explicit `| undefined` union. The `?` already includes `undefined`.
- Never write an untyped object literal. Every object is typed by a library type or an interface from the types module.
- Types derived from data (for example a translation file) are inferred from that data. Never hardcode key unions.
- Never double-export a type from both the types module and a file that imports it.
- Persisted, serialized or shared statuses are `enum`s defined in the types module, never inline string literal unions.
- Values passed to shared tracking or analytics helpers are members of a defined enum, never inline string literals.

## Functions

- Always use an object parameter when a function takes more than one input parameter.
- Never extract a helper for logic that has a single call site. Inline it at that call site.
- Only add a parameter that actually varies across call sites. Never parameterise a value that is always the same.
- Never use `forEach`. Use a `for` loop.
- Use early returns (`if (!x) return;`) instead of nested braces.

## Strings

- Use backtick strings and template literals for all runtime strings. Use single quotes only for imports.
- Use template literal interpolation (`${value}`) instead of concatenation with `+`.
- Never use the em dash in any content (code, markup, prose). Use a colon, comma, hyphen or restructure the sentence.

## Optional chaining

- Use optional chaining (`?.`) instead of explicit null or undefined guards. Never write `x && x.prop` when you mean `x?.prop`.
- When reading a property through a dynamic key lookup, always chain (`obj[key]?.prop`), never `obj[key].prop`.
- Prefer direct optional chaining with an inline fallback over a temporary variable plus a ternary.

## Exports and declarations

- Place every export at the end of the file.
- Exports inside an export object each go on their own line.
- Chain related `const` declarations into a single statement separated by commas.
- Keep comments to three or four words. Add one only when the code is not clear on its own. Never remove an existing comment.
- Never invent abbreviations. Drop letters from a word only when the short form is universally known (for example `msg`, `max`, `min`); otherwise spell the word out.

## Constants and config

- Only secrets (passwords, API keys) go in environment variables.
- Host, port, user and delay values are constants with no fallbacks.
- Define a shared domain once as a constant and build URLs from it with template literals. Never hardcode the domain in strings.
- Put constants shared by frontend and backend in the shared location. Put frontend-only constants in the frontend location.
- Decide the audience before adding a constant, and never let a server-only value ship to the browser.

## Imports

- Group imports as standard library, then third-party, then internal modules.
- Use named imports. Avoid default imports.
