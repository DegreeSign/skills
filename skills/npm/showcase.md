# Showcase page

Every package keeps a committed `docs/index.html`: one page that shows what the
package does, a tiny live demo, install steps, a link to
`docs/architecture.html` and, when approved, a case study of a production
project using the package.

## When to use

- Creating a package: add the page before the first release.
- Adding or changing the tiny demo, architecture link or install steps.
- Adding a production case study.
- Reviewing a package: confirm the page still matches the public API.

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
  they are measured or documented.
- Keep the page responsive, accessible and calm. Respect
  `prefers-reduced-motion`.
- Never put secrets, tokens, private URLs or machine-specific paths in the
  file.

## Page outline

1. Hero: package name, one-sentence promise, buttons to the demo and the
   architecture map.
2. Facts strip: a few real, verifiable facts.
3. Capabilities: three to six cards drawn from the public API.
4. Tiny demo: one small interactive card with a clear status line.
5. Models and limits: real download sizes, formats, runtimes and constraints.
6. Architecture: a preview card and a new-tab link to `architecture.html`.
7. Install: a package manager command, a copy button and a short code sample.
8. Case study, only when approved: product lockup, one short paragraph, two to
   four real screenshots and a link to the product.
9. Footer: version, licence, repository and documentation links.

## Tiny demo

- Prefer a small interaction that does not download a large model on page
  load.
- If the full flow needs weights, a worker or a microphone, keep it behind a
  button or link to a fuller `docs/demo.html`.
- Show a clear loading status and a readable error when the bundle or network
  is unavailable.
- Do not block the rest of the page on the demo.
- Add a standalone demo link when a fuller demo exists.
- Keep the controls keyboard accessible and the demo markup semantic.

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

## Design

- Match the package's own theme. Do not paste a generic template.
- Use one display face, one body face and one mono label face.
- Use a restrained palette with one accent.
- Use a max-width container around 1100 to 1200px and a responsive grid.
- Keep the hero short and the sections scannable.
- Prefer real screenshots and logos over decorative mockups.
- Use a floating or sticky menu only when it helps navigation.
- Keep motion calm and respect `prefers-reduced-motion`.

## Starter skeleton

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>mylib</title>
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
        <style>
            :root {
                --paper: #f6f3ec;
                --ink: #15171c;
                --accent: #0f766e;
                --line: #ded7ca;
            }
            * {
                box-sizing: border-box;
            }
            body {
                background: var(--paper);
                color: var(--ink);
                font: 16px/1.6 system-ui, sans-serif;
                margin: 0;
            }
            .shell {
                margin-inline: auto;
                max-width: 1160px;
                width: 90%;
            }
            section {
                padding: 72px 0;
            }
            .grid {
                display: grid;
                gap: 18px;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            }
            .card {
                background: #fff;
                border: 1px solid var(--line);
                border-radius: 18px;
                padding: 24px;
            }
            .button {
                background: var(--ink);
                border-radius: 999px;
                color: #fff;
                display: inline-block;
                padding: 12px 18px;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <main>
            <section class="shell">
                <p>mylib</p>
                <h1>One sentence about the package.</h1>
                <p>One short paragraph about the problem it solves.</p>
                <a class="button" href="demo.html">Try the demo</a>
                <a
                    class="button"
                    href="architecture.html"
                    target="_blank"
                    rel="noreferrer"
                >
                    Open the architecture
                </a>
            </section>
            <section class="shell">
                <h2>What it does</h2>
                <div class="grid">
                    <article class="card">
                        <h3>Capability</h3>
                        <p>One sentence.</p>
                    </article>
                    <article class="card">
                        <h3>Capability</h3>
                        <p>One sentence.</p>
                    </article>
                    <article class="card">
                        <h3>Capability</h3>
                        <p>One sentence.</p>
                    </article>
                </div>
            </section>
            <section class="shell">
                <h2>Tiny demo</h2>
                <div class="card">
                    <p>Replace this card with the smallest real interaction.</p>
                </div>
            </section>
            <section class="shell">
                <h2>Architecture</h2>
                <p>
                    Trace the public entry, the core pipeline and the platform
                    boundary.
                </p>
                <a
                    class="button"
                    href="architecture.html"
                    target="_blank"
                    rel="noreferrer"
                >
                    Open the full map
                </a>
            </section>
            <section class="shell">
                <h2>Install</h2>
                <pre><code>npm install mylib</code></pre>
            </section>
        </main>
    </body>
</html>
```

## Verification

- Serve `docs/` and open `index.html`. Also open it from `file://` when it has
  no network assets.
- Check every link: demo, architecture in a new tab, install, repository and
  case study.
- Check the page at desktop and mobile widths.
- Check the browser console for errors.
- Confirm images load at their natural size and have alt text.
- Confirm the page still works when the demo bundle is unavailable.
- Run the package checks the repository requires.

## Files

- `showcase.md`: this guide.
- `<package>/docs/index.html`: the page.
- `<package>/docs/architecture.html`: the map linked from the page.
- `<package>/docs/demo.html`: optional fuller demo.
- `<package>/docs/<product>-<state>.png`: optional case study screenshots.
- `<package>/docs/<product>-logo.svg`: optional case study logo.
