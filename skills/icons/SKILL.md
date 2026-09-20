---
name: icons
description: Add, find, audit and rasterize Material Symbols Rounded icons. Use when a project needs a new icon, when asked to find an icon name, to check for missing icon assets, or to produce PNG icons for a project that uses PNG only.
---

# Icons

Search, fetch, add and audit Material Symbols Rounded icons in a project. The default output is SVG; produce PNG only when the target project uses PNG exclusively.

## When to use

- A page, component or asset needs an icon that is not yet in the project.
- You need the correct icon name for a concept.
- You need to check which referenced icon assets are missing.
- The target project uses PNG icons and needs a rasterized version.

Never draw an icon by hand and never inline SVG paths. Fetch the real SVG from the source below.

## Source

```
https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/{name}/materialsymbolsrounded/{name}_{size}px.svg
```

- `{name}` is the icon name in snake_case, for example `arrow_forward`.
- `{size}` is `20`, `24` (default) or `48`.
- Save the file to the target icon directory, typically `src/assets/icons/{name}.svg`.
- Reference it from code with a relative path, for example `/assets/icons/{name}.svg`.

Do not use the legacy `materialiconsround/{size}px.svg` path, it returns 404.

## Icon index

`icons.json` (next to this file) maps every Material Symbols Rounded icon name to its codepoint. Search it for a keyword:

```
grep -i "{keyword}" icons.json
```

Only fetch a name that appears in the index.

## Add an icon

1. Search `icons.json` for the best name.
2. Fetch the SVG and save it to `src/assets/icons/{name}.svg`:
   `https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/{name}/materialsymbolsrounded/{name}_24px.svg`
3. Reference it from code as `/assets/icons/{name}.svg`.

## Audit missing icons

List icon references in the project source, then compare against the files on disk:

```
grep -rhoE '/assets/icons/[a-z0-9_]+\.(svg|png)' src | sort -u
```

Fetch any missing icon with the source URL above.

## Codepoints

Look up the hex value in `icons.json` when an icon is needed as a font glyph instead of a file.

## SVG to PNG

Default to SVG. Convert to PNG only when the target project uses PNG exclusively.

### Detect PNG-only projects

Scan the project source directory only (for example `src`). Never inspect build or output directories such as `build`, `dist`, `public_html`, `out`, `.next`, `coverage` or `node_modules`.

- List the icon files in the source icon directory. If they are all `.png`, the project is PNG-only.
- Scan source files (`*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.html`, `*.css`) for icon references and check their extensions.
- If no SVG is found and PNG is present, produce PNG. If the project mixes both, default to SVG and add PNG only when asked.
- If the source directory is not obvious, ask which directory to scan instead of scanning the whole repository.

### Convert

Run the bundled Node helper on any platform (Windows, macOS, Linux; needs Node):

```
node scripts/svg_to_png.mjs input.svg output.png 24
```

On macOS and Linux the POSIX helper works as well:

```
scripts/svg_to_png.sh input.svg output.png 24
```

The helpers use the project's `sharp` when it is installed, then the first available native tool, and finally `npx sharp-cli`. The native commands, in order:

1. `rsvg-convert -w {size} -h {size} -o {out}.png {in}.svg` (macOS: `brew install librsvg`)
2. `sharp` or `npx --yes sharp-cli -i {in}.svg -o {dir} -f png resize {size} {size}` (cross-platform)
3. `inkscape {in}.svg --export-type=png --export-filename={out}.png --export-width={size}` (all platforms)
4. `magick {in}.svg -background none -resize {size}x{size} {out}.png` (on ImageMagick 6 use `convert` on macOS and Linux)

Windows notes:

- Run the Node helper from PowerShell or cmd, or call any native command above directly.
- Use `magick`, never `convert`: on Windows `convert` is the built-in disk converter, not ImageMagick.
- `scripts/svg_to_png.sh` needs Git Bash, WSL or MSYS2.

Always pass an explicit size: some renderers cannot infer it from an SVG that has no `width`/`height`. Match the size the project already uses, otherwise default to `24` (and `48` for `@2x`). Keep transparency and the SVG's own colour.
