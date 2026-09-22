# Build

`@degreesign/webapp` builds the server with the same `build()` call as the front end. Pass `type: 'server'`, list the entries and point the output at the deploy directory.

## Config

```typescript
import { build } from "@degreesign/webapp";
import dotenv from "dotenv";
dotenv.config();

const service = process.env.SERVICE || `api`;

module.exports = build({
    type: `server`,
    obfuscateON: true,
    srcDir: `server`,
    productionDir: `server_build`,
    port: 3210,
    filesList: [service],
});
```

| Option | Default | Description |
| ------ | ------- | ----------- |
| `type` | required | `server` selects the Node target. |
| `srcDir` | `src` | Holds the entries. Set it to `server`. |
| `productionDir` | `public_html` | Output directory. Set it to `server_build`. |
| `filesList` | `[]` | Entry names. Each compiles `./<srcDir>/<name>.ts` to `<name>.js`. |
| `obfuscateON` | `false` | Obfuscate shipped JavaScript. |
| `minimiseON` | `true` | Minify the output. |
| `port` | `3210` | Dev server port, unused when only building. |
| `includeServerModules` | `false` | Bundle `node_modules` instead of externalizing. |
| `resolveOptions` | `{}` | Extra webpack resolve options, such as `fallback`. |
| `maxFileSizeMB` | `2` | Asset and entry size budget. |

## What each entry produces

- One file per `filesList` entry: `./server/<name>.ts` becomes `<productionDir>/<name>.js`.
- Output is CommonJS targeting Node 18, `__dirname` and `__filename` preserved.
- `node_modules` is externalized by default, so the host must keep dependencies installed.
- Tree-shaking is on and obfuscation follows `obfuscateON`.

## Build one service at a time

Name the service in a build-time environment variable so the same config builds any entry. This selector is a build input, not runtime configuration; every runtime value is a constant in `server/constants.ts` or a secret in the environment:

```bash
SERVICE=api webpack --config webpack.server.ts
SERVICE=worker webpack --config webpack.server.ts
```

Wire one script per service plus a catch-all:

```json
{
	"scripts": {
		"build_server": "webpack --config webpack.server.ts",
		"build_api": "SERVICE=api webpack --config webpack.server.ts && ts-node deploy.ts",
		"build_worker": "SERVICE=worker webpack --config webpack.server.ts && ts-node deploy.ts"
	}
}
```

## Bundling dependencies

- Leave `includeServerModules` off to keep bundles small; the host runs them with its own `node_modules`.
- Set it on only when the host has no `node_modules`, and check native modules still load.
- When shared code imports packages the server target cannot resolve, add webpack fallbacks:

```typescript
resolveOptions: {
    fallback: {
        crypto: require.resolve(`crypto-browserify`),
        stream: require.resolve(`stream-browserify`),
        buffer: require.resolve(`buffer`),
    },
},
```

## Environment

- `DefinePlugin` inlines every `process.env.*` reference into the bundle at build time.
- Build separately per environment; changing an env value requires a rebuild.
- Source files never see the build-time values at runtime, so read them as `process.env.NAME` in code.
- Keep `obfuscateON` off while developing so stack traces stay readable.

## tsconfig

```json
{
	"compilerOptions": {
		"target": "ES2021",
		"module": "commonjs",
		"resolveJsonModule": true,
		"esModuleInterop": true,
		"strict": true,
		"skipLibCheck": true,
		"removeComments": true,
		"outDir": "build"
	},
	"ts-node": { "transpileOnly": true },
	"exclude": ["node_modules", "public_html", "server_build", "build"]
}
```

Exclude the generated output from compilation and require `resolveJsonModule` for JSON imports.
