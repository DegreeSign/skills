# Structure

Split the backend by responsibility, not by file type. Each service is one process with one job; each feature is one small module; shared code has one home.

## Directories

| Path | Purpose |
| ---- | ------- |
| `server/` | Server sources and the root of the server build (`srcDir`). |
| `server/<service>.ts` | A service entry, listed in `filesList`, built to `server_build/<service>.js`. |
| `server/<feature>/` | Modules for one area (for example `billing/`, `reports/`). |
| `server/utils/` | Helpers imported by more than one module. |
| `server/constants.ts` | Disk paths, sanitisers and other server constants. |
| `types/` | Interfaces, enums and request shapes shared across services. |
| `server_build/` | Generated server output (`productionDir`). Disposable. |
| `webpack.server.ts` | The server build config. |
| `deploy.ts` | Build, upload and restart script. |

Keep feature code under `server/<feature>/` and cross-service code under `server/utils/`. Do not put shared helpers in a service entry.

## Service boundaries

A service is a process, not a folder:

- Give each service a single responsibility and its own port, so one can be restarted without the others.
- Keep the entry file focused on wiring: read state, configure, schedule work, register listeners, start.
- Move the endpoint logic into feature modules and import them into the entry.
- Share code through `server/utils/` and `server/constants.ts` instead of copying between services.

```text
server/
├── api.ts               # public request service
├── worker.ts            # background job service
├── hooks.ts             # inbound webhook service
├── billing/
│   ├── charges.ts
│   └── invoices.ts
├── reports/
│   └── daily.ts
├── utils/
│   └── valid.ts
└── constants.ts
```

If two services need the same module, keep the module in one place and import it from both. Each bundle includes the shared code it uses, so do not duplicate the source.

## Entry responsibilities

Each entry owns exactly these steps, in order:

1. Load persisted state into module-level variables.
2. Apply server configuration with `setServerConfig`.
3. Schedule periodic work: state flush, cache refresh, TTL sweeps, backups.
4. Register listeners and start the server with `startListener`.

Do not put request-handling logic in the entry. Import it from feature modules and pass it to `startListener`.

## Shared code

- Cross-service helpers live in `server/utils/`, split by concern, one module per topic.
- Feature helpers live beside the feature module that uses them.
- Interfaces, types and shared enums live in `types/` and are imported; never declare them inline.
- Group shared constants in one module. Define data directories once and build paths from them.
- Read environment variables for secrets and hosts only; keep fixed values as constants.
- Keep every file small and single-purpose so it is easy to change and to tree-shake.

## Types

Name the listener payload once and reuse it:

```typescript
interface RecordBody {
    id?: string;
}

interface AccessData {
    endPoint: string;
    ips: string;
    body: RecordBody;
    res: ServerResponse<IncomingMessage>;
}
```

- `AccessData` is what `listenProcessor` passes to `fun`; add any extra field here (an account id, a record id).
- Give each endpoint its own body interface and import `ServerResponse` and `IncomingMessage` from `node:http`.
- `ProcessInputs` from `@degreesign/server` is the base `{ ips, req, res }` used inside `listenProcessor`; `APIData<T>` adds `endPoint` and `fun`.
- Declare persisted shapes in `types/` too, and reuse them for the in-memory state.
- Use enums for endpoint names and statuses that are shared across services or with the front end.

## Constants

Keep a small `server/constants.ts` for values the whole backend shares:

```typescript
const
    /** Private data directory, never web-served */
    dataDir = `/srv/myapp/data/`,
    /** Public data directory, served statically by the web server */
    publicDir = `/var/www/myapp/`,
    /** Pattern rejected by the length validators */
    unsafePattern = `[<>"'{}|]`,
    /** Public site domain */
    domain = `example.com`,
    /** Public API service port */
    apiPort = 3000,
    /** Background worker service port */
    workerPort = 3001;

export {
    dataDir,
    publicDir,
    unsafePattern,
    domain,
    apiPort,
    workerPort,
};
```

Build every path as `${dataDir}records.json` or `${publicDir}feed/latest.json`. Never scatter paths through the code.

## Restructuring an existing backend

Work through these steps and keep behaviour identical:

1. Inventory every process, entry, port and scheduled task, and every endpoint it serves.
2. Move server sources under `server/` and list each entry in `filesList`.
3. Split a monolithic entry: one entry per service, endpoint logic into `server/<feature>/`.
4. Move helpers used by more than one module into `server/utils/` and delete the copies.
5. Move interfaces, enums and persisted shapes into `types/` and import them.
6. Collect paths, sanitisers and shared values into `server/constants.ts`.
7. Rewrite each entry to the four responsibilities above.
8. Apply the build and deploy steps in `build.md` and `deploy.md`.
9. Verify each service still listens, answers and persists, then remove the old files.
