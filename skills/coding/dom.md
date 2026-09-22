# DOM access

## Use the `@degreesign/ui` helpers

- Never call raw DOM APIs in page code: no `querySelector`, `querySelectorAll`, `getElementById`, `createElement`, `createDocumentFragment`, `appendChild`, or any other direct `document.` call.
- Use only these helpers from `@degreesign/ui`: `selectElement`, `selectAll`, `hideElement`, `showElement` and `repeatElements`.
- Use `selectElement` and `selectAll` in place of older selection helpers.
- Use `hideElement` and `showElement` in place of older show or hide helpers.
- Never assign `innerHTML`. All markup lives in markup files.
- Use `innerText` instead of `textContent`.

## Selecting elements

- Use class selectors (`.foo`), never ID selectors (`#foo`), in `selectElement` and `selectAll`.
- Scope a lookup with a parent: `selectElement('.child', parent)`, or a context selector `selectElement('.container .child')`.
- Never chain `.closest(...)` then `.querySelector(...)`.
- Define a `const` when the same element is looked up more than once.
- Every selector in code must match a class that exists in the corresponding markup. If an element needs selecting, give it a class in markup. An `id` alone is not reachable via a class selector.
- Never give an element both `id="x"` and `class="x"` for the same name `x`.

## Null safety

- `selectElement` and `selectAll` return `null` or an empty result when nothing matches. Optional-chain before chaining further.
- The helpers handle `null` or `undefined` parents internally, so never write `parent ? selectElement('.child', parent) : null`. Call it directly.
- Never write a null guard (`if (!el) return;`) after a lookup. Every selector must match markup that exists, and the show, hide and repeat helpers already accept a null or empty result. Chain directly.

## Building markup

- Never create elements with `createElement` or `createDocumentFragment`. All HTML elements are defined in markup files.
- For repeated content, use `repeatElements` with a template element and populate each copy via `innerText` and `setAttribute`.

## Events

- Never use `addEventListener` for common events. Assign the handler via the matching property: `el.onclick`, `el.oninput`, `el.onfocus`, `el.onblur`, `el.onchange`, `window.onkeydown`, and so on.
- For input events, always assign `el.oninput`, never `addEventListener('input', ...)`.

## URLs

- Read URL parameters with `new URLSearchParams(window.location.search)`. Never split a query string by hand.
