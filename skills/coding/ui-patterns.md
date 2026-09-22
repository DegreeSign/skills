# UI patterns

## Tooltips

Use a CSS-only tooltip:

- An info glyph inside a `<sup>` element is the trigger.
- The tooltip text sits in a sibling element immediately after the trigger.
- CSS reveals the tooltip on hover. Never add JavaScript and never use the `title` attribute.
- Give the tooltip element its own class so it does not collide with other inline elements.

```html
Your label<sup>ℹ</sup><span>Explanatory text.</span>
```

## Icons

Use the `icons` skill to find, add or audit icons. Load it whenever a task needs an icon, an icon name, or a missing icon asset; never draw an icon by hand and never inline SVG paths.

Reference an icon from markup with an `<img>`, or assign it from code (for example via `element.style.backgroundImage`). Never hardcode an icon URL in CSS.

## Vendored browser libraries

- Vendor browser libraries under the project's library folder. They are loaded on demand, never bundled.
- Every library file starts with a banner comment stating the library name, version, license, and the CDN URL it was downloaded from.
- Load a vendored library from its local path, never from an external CDN.
