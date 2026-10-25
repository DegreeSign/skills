# Architecture map

Every package keeps a committed `docs/architecture.html`: one self-contained page that maps the package as bands of files and functions, the typed relations between them, the primary flow and any state machine. It is a dependency map, not a file tree, and it opens offline from `file://`.

## When to use

- Creating a package: add the map before the first release.
- Changing code: update the map in the same change as the code.
- Reviewing a package: trace a call path from the entry to a helper.
- Publishing: confirm the map still matches the source.

The map is required even for a small package. Two bands and five nodes are enough; the map grows with the code.

## Hard rules

- Keep the map at `<package>/docs/architecture.html`, committed with the source.
- Keep it one HTML file with inline CSS and JavaScript. No CDN, no framework, no network request, no build step.
- Map the public entry, every source module and every meaningful function with its real definition line and signature.
- Group files into bands in dependency order, from the outside boundary to the build.
- Record real relations only. Never invent an edge to make the picture look complete.
- Give every node a one-sentence note that explains its role, not its syntax.
- Keep the primary flow end to end. A reader must be able to follow one request from the caller to the result.
- Update the line counts, node lines, edges, flow and states in the same change as the code.
- Link the map from the README Architecture section. Keep it out of the npm `files` array unless the docs site is served from the tarball.
- Never put secrets, tokens, private URLs or machine-specific paths in the file.

## Files

- `architecture.template.html`: copy this to `<package>/docs/architecture.html`, then replace the data block.
- `scripts/check_architecture.mjs`: validates the map against the package.

The template ships with empty data. It opens as a blank map with a short hint; that is expected until the data block is filled.

## Data model

All data lives between `// DATA BEGIN` and `// DATA END`. The renderer below that block is generic; leave it alone unless the map itself needs a new feature.

### `MAP`

| Field | Meaning |
| ----- | ------- |
| `name` | Package name shown in the header and the browser title. |
| `subtitle` | One short line about the package, shown in the overview. |
| `root` | Node id of the public entry. The panel traces every path back to it. |
| `flow` | Key in `FLOWS` for the default flow button. |
| `intro` | Copy for the Reading the map card. Inline `<b>` is allowed. |
| `ignore` | Source path substrings the coverage check skips, such as generated files. |

### `BANDS`

```js
{ id: `entry`, title: `1 · public entry`, hint: `one exported call`, color: `#274b6b` }
```

- `id`: stable slug. Every file names one.
- `title`: short label with a position, for example `1 · public entry`.
- `hint`: one line about the layer.
- `color`: any CSS color. Keep the palette muted and distinct.

Order bands from the outside in. A typical package uses host boundary, public entry, core pipeline, adapters or storage, verification and build. Use the package's own names, not this list.

### `FILES`

```js
f(`entry`, `entry`, `index.ts`, `src/index.ts`, 14);
f(`host`, `host`, `host app`, `host app`, 0, true);
```

| Argument | Meaning |
| -------- | ------- |
| `id` | Stable slug, unique in the map. |
| `band` | Id of an existing band. |
| `label` | Short file name for the card header. |
| `path` | Repository-relative path, or a boundary name for an external entry. |
| `loc` | Real line count. Use `wc -l` and keep a trailing newline. |
| `external` | `true` for a boundary such as the host app. Skips path and line checks. |

Every source file under `src` must appear, with or without nodes. List generated or vendored paths in `MAP.ignore` instead.

### `NODES`

```js
n(`entry`, `main`, 12, `main`, `(input: Input) => Result`, `One request per call.`);
```

| Argument | Meaning |
| -------- | ------- |
| `file` | Id of an existing file. |
| `id` | Short node name. The full node id becomes `file.id`. |
| `line` | 1-based line of the definition. Use `0` only for an external boundary. |
| `label` | Function, method or type name as a reader recognises it. |
| `sig` | Short signature. Trim types that do not help the reader. |
| `note` | One sentence about the role. |

Include the entry, every meaningful function or method and every exported type. Skip trivial re-exports, one-line getters, generated code and code that only forwards a call. A type node is useful when its shape explains a boundary.

Verify each line by opening the file at that line. A line number that has drifted is worse than no line number.

### `EDGES`

```js
e(`entry.main`, `core.run`, `call`);
```

| Kind | Use when |
| ---- | -------- |
| `build` | A build file or config wires a module, bundle or asset. |
| `call` | One runtime function calls another. |
| `event` | A callback, listener or emitted event crosses a boundary. |
| `store` | The code reads or writes storage, or downloads an asset. |
| `type` | The relation is type-only. |
| `inner` | A returned closure or inner function. |

Endpoints accept a full node id (`core.run`) or a short name (`run`) when it is unique. When two nodes share a short name, use full ids.

### `STATES`

```js
STATES.push({
    title: `Status`,
    viewBox: `0 0 300 62`,
    boxes: [
        { x: 8, y: 20, w: 54, label: `idle` },
        { x: 104, y: 20, w: 52, label: `loading` },
        { x: 200, y: 20, w: 62, label: `ready` },
    ],
    arrows: [
        { d: `M62,32 L104,32` },
        { d: `M156,32 L200,32`, both: true, label: `retry`, x: 158, y: 18 },
    ],
});
```

Draw a state machine only when the package has a real enum or lifecycle. `d` is an SVG path. `both` adds a start arrow. `label` with `x` and `y` annotates an arrow.

### `FLOWS`

```js
FLOWS.main = {
    title: `one request end to end`,
    steps: [
        step([`host.input`, `entry.main`], ` The caller passes one request.`),
        step([`core.run`], ` Validate the input, load the state, stream the result.`),
        step([`core.emit`], ` Report progress and the final status.`),
    ],
};
```

Each step names the nodes it touches. The first node becomes the step label. Keep one primary flow; add another named flow only when the package has a second real entry.

## Build the map

1. Inventory the files. List source, test and build files. Run `wc -l` on each and keep only real files. Record external boundaries such as the host app.
2. Choose the bands. Put them in dependency order and give each a title, hint and color.
3. Locate the definitions. Search for `function`, `class`, exported symbols and module constants. Record the definition line, then open the file at that line to confirm it.
4. Write the file entries. Cover every source module and the build and test files that explain how the package runs.
5. Write the node entries. One node per meaningful function, method or exported type. Shorten the signature and write a role note.
6. Write the edges from the real call graph. Use `type` for type-only imports and `build` for bundler wiring.
7. Set `MAP.root` to the public entry node.
8. Write the primary flow. Walk it once in the source and list each stage in order.
9. Add a state machine only if an enum or lifecycle is part of the public behaviour.
10. Write `MAP.name`, `MAP.subtitle` and `MAP.intro`, then open the file and check the copy.

## Worked example

A neutral package with a host boundary, a public entry, one core module and its support. Replace these entries with the real ones.

```js
const MAP = {
    name: `mylib`,
    subtitle: `one request, one result`,
    root: `entry.main`,
    flow: `main`,
    intro: `Bands run top to bottom in dependency order. The host passes one`
        + ` request, the entry validates it, and the core streams the result.`,
    ignore: [],
};

const BANDS = [
    {
        id: `host`,
        title: `1 · host boundary`,
        hint: `the caller owns the input`,
        color: `#8a7a5f`,
    },
    {
        id: `entry`,
        title: `2 · public entry`,
        hint: `one exported call`,
        color: `#274b6b`,
    },
    {
        id: `core`,
        title: `3 · request pipeline`,
        hint: `validate, load and stream`,
        color: `#2f6b52`,
    },
    {
        id: `support`,
        title: `4 · support`,
        hint: `storage and build`,
        color: `#5c574f`,
    },
];

f(`host`, `host`, `host app`, `host app`, 0, true);
f(`entry`, `entry`, `index.ts`, `src/index.ts`, 14);
f(`core`, `core`, `core.ts`, `src/core.ts`, 36);
f(`store`, `support`, `store.ts`, `src/store.ts`, 10);
f(`build`, `support`, `package.json`, `package.json`, 19);

n(`host`, `input`, 0, `Request`,
    `input · limits · callbacks`,
    `One request assembled and owned by the caller.`);
n(`entry`, `main`, 12, `main`,
    `(input: Input) => Promise<Result>`,
    `One call per request, bound to the shared runtime.`);
n(`entry`, `public`, 14, `public exports`,
    `main + the public types`,
    `Only main and the public types leave the package.`);
n(`core`, `run`, 12, `run`,
    `(input: Input) => Promise<Result>`,
    `Validate the request, load the state and stream the result.`);
n(`core`, `stream`, 27, `stream`,
    `(state: State, signal: AbortSignal) => AsyncIterable<string>`,
    `Yield result chunks until the signal aborts.`);
n(`store`, `read`, 3, `read`,
    `(key: string) => Promise<string | null>`,
    `Read one cached value.`);
n(`store`, `write`, 8, `write`,
    `(key: string, value: string) => Promise<void>`,
    `Persist one value for the next request.`);
n(`build`, `scripts`, 4, `scripts`,
    `build · test`,
    `The two commands that produce and check the package.`);

e(`host.input`, `entry.main`, `call`);
e(`entry.main`, `core.run`, `call`);
e(`core.run`, `core.stream`, `call`);
e(`core.run`, `store.read`, `call`);
e(`core.run`, `store.write`, `call`);
e(`entry.public`, `entry.main`, `type`);
e(`build.scripts`, `entry.main`, `build`);

STATES.push({
    title: `Status`,
    viewBox: `0 0 300 62`,
    boxes: [
        { x: 8, y: 20, w: 54, label: `idle` },
        { x: 104, y: 20, w: 52, label: `loading` },
        { x: 200, y: 20, w: 62, label: `ready` },
    ],
    arrows: [
        { d: `M62,32 L104,32` },
        { d: `M156,32 L200,32` },
        { d: `M231,20 C231,2 35,2 35,20` },
    ],
});

FLOWS.main = {
    title: `one request end to end`,
    steps: [
        step([`host.input`, `entry.main`],
            ` The caller passes the request, the limits and the callbacks.`),
        step([`core.run`, `store.read`],
            ` Read the cached state, then validate the request.`),
        step([`core.stream`],
            ` Stream the result and report progress.`),
        step([`core.run`, `store.write`],
            ` Persist the final state and return the result.`),
    ],
};
```

Do not paste this example unchanged. The checker rejects a map whose files do not exist or whose line counts do not match.

## Verify

Run the checker from the installed skill folder against the package root:

```bash
node <skill>/scripts/check_architecture.mjs <package-root>
```

It checks that:

- each band, file and node id is unique;
- every file exists and its `loc` matches the real line count;
- every node points inside its file and carries a label and signature;
- every edge endpoint resolves and uses a known kind;
- `MAP.root` and `MAP.flow` resolve, and every flow step names real nodes;
- every source file under `src` is in the map or in `MAP.ignore`;
- the HTML does not load an external script, stylesheet or URL.

Then open `docs/architecture.html` in a browser and confirm:

1. The bands, files, nodes and edges render, and `fit` frames the whole map.
2. Search finds a function by name and dims the rest.
3. Hovering a node brightens its neighbours; clicking pins it.
4. The panel lists callers and callees and a path back to the root.
5. The flow button numbers the primary flow.
6. The state machines render and the console stays clean.
7. The page makes no network request.

Use `--allow-empty` only to syntax-check the untouched template.

## Keep it current

Update the map in the same change as the code:

| Change | Update |
| ------ | ------ |
| Add, move or remove a function | `NODES` line, label, signature and note |
| Add or delete a module | `FILES`, `MAP.ignore`, the file header and the coverage |
| Change a call, import or closure | `EDGES` |
| Change a public state or enum | `STATES` |
| Change the main path | `FLOWS` and the step text |
| Change the package scope | `MAP.name`, `MAP.subtitle`, the README link |
| Reformat a file | `loc` and every node line in that file |

Run the checker after the edit. Never wait for a later change to catch up.

## Publish and link

- Commit `docs/architecture.html` with the source. It is documentation, not a build artifact.
- Add an Architecture section to the README and link the map, relative or at its hosted URL.
- Keep the map out of the npm `files` array unless the package publishes its docs site from the tarball.
- If the repository serves `docs/` as a static site, the map is available at the matching URL. Never hardcode a host-specific path in the file.
