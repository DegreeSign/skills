# CSS

## Selectors

- Use classes, never IDs, for styling.
- Never chain two classes in one selector. This is a hard ban on new code. Refactor existing chained selectors when you touch that area.
- To refactor a chained selector that combines a base class and a modifier, rename it to a single `_`-combined class holding only the modifier delta, and keep the base class on the element in markup. Never drop the base class from the element.
- Never use descendant class selectors. Give each element its own class and target it directly.
- Never combine a class with an element in a selector. Give the element its own class.
- Never combine multiple properties or selectors on one line.
- Never write vendor-prefixed fallbacks such as `-webkit-mask`. The build adds prefixes automatically.

## Naming and reuse

- Never use `-` in class names or IDs. Use `_` (for example `my_class`, not `my-class`).
- Reuse an existing class whenever one fits. Never add a new class when an existing one fits.
- Give any class used in more than one module a generic name that fits every location, and use that single name everywhere.
- Only create different class names when they are needed as selectors or have different styles. Otherwise reuse one class.

## Placement

- Add all styles in the stylesheet file, never inline in markup.
- Place new class definitions above the existing `@media` blocks, never after them.
- Merge new `@media` queries into the existing block for the same breakpoint. Never append a separate block at the end of the file.
- In a new page module, import the shared stylesheet at the top.

## Values

- Put each CSS property on its own line.
- Use multiples of 8px for sizing, spacing, border-radius, padding, margin and gap.
- Never use `rem` units. Use `px`.
- Never hardcode colour values. Reference a `var(--name)` and add the colour to the root variables first.
- Never reference asset files directly in CSS with `url(...)`. Reference assets only from code.
- Never hardcode image URLs in CSS. Assign them from code (for example via `element.style.backgroundImage`).
