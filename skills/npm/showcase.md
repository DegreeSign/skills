# Showcase page

Every package keeps a committed `docs/index.html`: one page that shows what the
package does, proves it with a tiny live demo, states its real limits, links to
`docs/architecture.html` and, when approved, shows a production case study.

The page is a product argument, not a README rendered in HTML. It should let a
visitor understand the promise in one screen, try the core idea without reading
documentation, and trust the numbers because every one of them is measured.

## When to use

- Creating a package: add the page before the first release.
- Adding or changing the hero, tiny demo, architecture link or install steps.
- Adding a production case study or a comparison with another tool.
- Reviewing a package: confirm the page still matches the public API and the
  measured facts.

## Hard rules

- Keep the page at `<package>/docs/index.html`, committed with the source.
- Keep it one HTML file with inline CSS and JavaScript. External runtime assets
  such as a CDN bundle, screenshots and a logo are allowed; no build step and
  no framework.
- Link the full architecture map from the page:
  `href="architecture.html"` with `target="_blank" rel="noreferrer"`.
- Include a tiny demo. It must show the core idea in one screen and use the
  public API, not internal modules.
- Ask the user before adding a case study: "Is there a production project
  using this package that should appear as a case study?" Never invent one.
- Use the real product name, logo, URL and actual screenshots. Never fabricate
  quotes, metrics, customers or screenshots.
- Keep the copy honest. State sizes, formats, limits and performance only when
  they are measured or documented. Repeat a fact with the same value in the
  hero, stats, specs, FAQ and closing call to action.
- Treat the template's neutral grayscale and system type as a scaffold, not a
  design. Replace its tokens with the package's own palette, type and shape
  language; never reuse another package's colours or exact visual style.
- Keep the page responsive, accessible and calm. Respect
  `prefers-reduced-motion`.
- Never put secrets, tokens, private URLs or machine-specific paths in the
  file.

## Narrative spine

The page follows one argument. Drop a section when the package has nothing real
to put in it; do not fill it with placeholder marketing.

1. Hero: package lockup, one-sentence promise, primary demo button, install
   button, repository link and the one-line fact strip.
2. Hero preview: a small artifact that shows the product working, such as a
   console, a rendered result or a before-and-after. It is not a screenshot of
   the page itself.
3. Facts strip: four real numbers or constraints in a distinct band.
4. Why this exists: three numbered statements that name the dependencies or
   costs the package removes.
5. Live demo: three short challenge steps, optional editable option, a window
   with status, progress, cancel and reset.
6. Capabilities: three to six cards, each drawn from a public export or a
   measurable behaviour.
7. First run: three numbered steps from install to first result to steady state.
8. Proof: an approved production case study, or nothing.
9. Specs and limits: real options, a table, a "straight talk" paragraph and a
   collapsed technical-details block.
10. Comparison: optional, only with measured numbers and a fair verdict.
11. Architecture: a distinct section with a banded preview and a new-tab link
    to `architecture.html`.
12. Install: one package manager command, a copy button and one minimal sample.
13. FAQ: six questions that the rest of the page does not already answer.
14. Closing call to action: restate the promise with the same facts.
15. Footer: version, licence, runtime requirement, repository, npm and docs.
16. Floating section menu: seven or fewer labelled destinations with icons,
    an expanded active item and scroll tracking.

Use alternating surfaces only when they help separate the argument. The
architecture section, the facts strip and the closing call to action can each
share the page surface or use a contrast band; choose what fits the package's
identity. Keep each section head to one eyebrow, one short heading and one
paragraph.

## Hero

- Lead with the outcome, not the package category. The first line should be
  understandable without the word "library".
- Keep the promise to one sentence. Use a second line for the proof or the
  trade-off.
- Provide exactly three actions: try the demo, install, open the repository.
  Extra actions dilute the first one.
- Match each action icon to the action: a terminal or command glyph for a
  runnable demo, a download glyph for install and a repository glyph for the
  source. Never reuse a chat bubble for a command, install or file action.
- Put a proof link under the actions only when a real product uses the package.
- State the licence, runtime requirement and the one relevant cost or limit in
  a single mono line below.
- The preview should show the smallest successful interaction: one input, one
  output and a live indicator. If the package has no UI, show its output
  artifact instead of inventing a chat window.

## Facts strip

- Use four facts, each with a large number in the display face and a short mono
  label.
- Prefer facts that answer objections: downloads, keys, servers, quotas,
  bundle size, offline behaviour, supported runtimes.
- Never use an unmeasured percentage, benchmark or "10x" claim.

## Tiny demo

The demo is the centre of the page. It must be real, lazy and honest.

- Load the package bundle only when the visitor interacts. Do not block the
  page or download a large artifact on page load.
- Use the public API. Never import internal modules or copy a private helper
  into the page.
- If the full flow needs weights, a worker, a microphone or a long download,
  put it behind the demo button and state the first-run cost in a warning
  directly before or after the controls.
- Show one clear status line for every state: idle, loading, downloading,
  working, finished, stopped and error.
- Show determinate progress when the API reports a percentage. Use an
  indeterminate bar when it only reports a phase.
- Provide stop during a run and reset afterwards. Stop must cancel the real
  call; reset must clear the output, the session details and the stored state.
- Keep a run id or equivalent guard so a stale callback cannot paint into a new
  run after stop or reset.
- On a bundle or network failure, restore the input, remove the empty bubbles
  and show a readable error. Never leave a spinner running.
- If the output is Markdown, escape HTML first and then add only the supported
  subset. Never inject model or package output with `innerHTML` before escaping.
- Mark the thread as a log with `role="log"`, `aria-live="polite"` and
  `aria-relevant="additions text"`. Mark the card `aria-busy` while working.
- Keep the empty state visible until the first real result. Put the one-sentence
  invitation there.
- Put secondary session facts in a narrow rail: runtime, mode, cost, limit and
  rate. Do not invent values; show `auto` or `-` until the real value is known.

## Capabilities and first run

- Every capability card needs a concrete result, not a category label.
- Add two or three tags per card only when they are real names or modes.
- Keep the same card order as the public API's mental model.
- The first-run section must state the one-time cost, what is cached, what
  resumes and what later runs skip.
- Put a measurable fact in each step. "Fast" is not a fact.

## Specs and honesty

- Use a table when the package has real variants. State which one is the
  default and when the package chooses it.
- Include a "straight talk" callout that names the package's weak cases and
  the slow path. This builds more trust than another feature card.
- Put long limits, timeouts, budgets and transport details in a native
  `<details>` block so the main page stays scannable.
- If you compare with another tool, measure both sides yourself, keep the
  method next to the number and name where the other tool wins. Never invent a
  competitor's limits or a customer's results.
- If you cannot measure a comparison, omit the comparison section.

## Case study

Ask the user first. If approved, collect:

- the product name and URL
- the actual logo file, copied into `docs/`
- two to four real screenshots from the production app
- what the product uses the package for
- a credit line only when it is true

Capture screenshots with a headless browser:

- use a fresh profile and the real app URL
- when the flow needs a microphone, use fake media flags:
  `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream`
  and `--use-file-for-fake-audio-capture=<file>`
- perform the real flow: open the real screen, click the real control, wait for
  the real result
- capture the state and crop to the product UI, keeping the product chrome
- never use mockups or placeholders
- store images in `docs/` with descriptive names such as
  `<product>-<state>.png`
- add width and height attributes and meaningful alt text
- label real captures "Screenshots from <domain>"; never label a mockup as a
  screenshot

## Design system

- Match the package's own identity. Do not paste a generic template unedited
  and do not reuse another package's palette, type or signature layout.
- Start from the neutral scaffold and replace every token: colour, type, radius,
  spacing, border, shadow and motion. The scaffold's grayscale is a placeholder.
- Derive the palette from the package's brand, its product surface or its
  domain. If none exists, use a neutral base plus one accent; keep semantic
  colours separate from the brand accent.
- Use one display face, one body face and one mono label face. If the package
  has no display face, a single family with weight and size contrast is enough.
- Use a max-width container around 1100 to 1200px, a 90% width and a responsive
  grid.
- Keep one radius family and one spacing rhythm. Cards, windows and panels
  should feel like the same object.
- On small screens, turn wide spec tables into stacked rows with visible labels
  instead of a horizontal scroll. Keep the same values.
- Use real screenshots and logos over decorative mockups.
- Keep the hero short, the section heads scannable and the cards one idea each.
- Use a floating or sticky menu only when the page has enough sections to need
  it. Keep it keyboard reachable, auto-centre the active item and respect
  reduced motion.
- Use a scroll-reveal only when it helps a long page. Gate it behind a `js`
  class so the page is visible without JavaScript, and disable it under
  `prefers-reduced-motion`.
- Keep focus outlines visible. Add a skip link to `#main`.

## Metadata and structured data

- Write a specific `<title>` and meta description. Lead with the outcome, not
  the package name.
- Add `canonical`, `theme-color`, Open Graph and Twitter card metadata.
- Add `FAQPage` structured data only when every answer matches a visible FAQ
  item. Keep the two in sync or remove the structured data.
- Add `favicon.svg` beside the page.
- Link the architecture map from both the page body and the footer.
- Keep the install command and version in the footer consistent with the
  package.

## Install section

- Show one package manager command with a copy button.
- Keep a fallback for contexts where the Clipboard API is unavailable, such
  as `file://`: prefer `navigator.clipboard.writeText`, then try a temporary
  textarea and `document.execCommand("copy")`, and report the real result.
- Show one minimal code sample with syntax spans, not a screenshot.
- Put the runtimes and integrations that are actually supported in tags.
- State the first-call behaviour under the command.

## Template

Start from `showcase.template.html` beside this guide. It contains the full
page: hero preview, facts strip, why, demo, capabilities, first run, specs,
architecture, install, FAQ, call to action, footer and floating menu.

1. Copy the template to `<package>/docs/index.html`.
2. Replace every `mylib`, `@scope/mylib`, `Product`, `example.com` and `owner`
   placeholder with the real value.
3. Replace the neutral CSS tokens, font stacks and shape values with the
   package's own identity. The grayscale scaffold is not a finished design.
4. Remove every section the package cannot fill with real content.
5. Uncomment the case study block only after the user approves a real product,
   and add a matching floating-menu link.
6. Uncomment the comparison block only with measured numbers for both sides.
7. Wire the demo in `startRun` to the public API and keep its contract: chunk,
   progress, done, error and a stop function.
8. Delete the remaining placeholder comments before committing.

A minimal page may drop the stats, why, first run, specs, comparison, case
study and FAQ sections. Keep the hero, demo, architecture, install and footer.
Never keep an empty section just because the template has it.

## Verification

- Serve `docs/` and open `index.html`. Also open it from `file://` when it has
  no network assets.
- Check every link: demo, architecture in a new tab, install, repository, npm,
  licence and case study.
- Check the page at desktop and mobile widths, including 360px.
- Check the browser console for errors.
- Confirm the palette, type and shape language belong to this package, not to
  the template and not to another package.
- Confirm images load at their natural size and have alt text.
- Confirm the demo works, fails gracefully when the bundle or network is
  unavailable, can be stopped and can be reset.
- Confirm the copy button reports a real copied or failed state over HTTPS and
  from `file://`.
- Confirm the floating menu tracks the visible section and remains keyboard
  reachable.
- Confirm the page is readable with JavaScript disabled and with
  `prefers-reduced-motion: reduce`.
- Confirm the JSON-LD parses and every answer matches the visible FAQ.
- Confirm the same fact has the same value in the hero, stats, specs, FAQ and
  closing call to action.
- Run the package checks the repository requires.

## Files

- `showcase.md`: this guide.
- `showcase.template.html`: the full page template to copy.
- `<package>/docs/index.html`: the page.
- `<package>/docs/architecture.html`: the map linked from the page.
- `<package>/docs/demo.html`: optional fuller demo.
- `<package>/docs/<product>-<state>.png`: optional case study screenshots.
- `<package>/docs/<product>-logo.svg`: optional case study logo.
