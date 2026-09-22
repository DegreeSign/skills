---
name: server
description: Structure or restructure a Node backend for performance and maintainability with @degreesign/server and @degreesign/webapp. Use when creating, splitting or reorganising server services, adding request listeners, validating requests, persisting state, or building and deploying a service.
---

# Server

A backend built with `@degreesign/server` is one or more long-running Node processes. Each process is a plain `node:http` server with a small router, one central request gate and an array of listeners. `@degreesign/webapp` bundles each service entry for deployment.

Keep the runtime thin, the state in memory and the request path short. The framework is deliberately small, so structure is what keeps a growing backend fast and readable.

## When to use

- Creating a new backend or adding another service.
- Splitting a monolithic server into separate processes.
- Adding, moving or reorganising listeners and endpoints.
- Reading, writing or caching server state.
- Validating requests, gating access or hardening the server.
- Building or deploying a server bundle.

## Core principles

- One service per entry file. Each process has a single responsibility, its own port and its own deploy target.
- One listener per endpoint. Each endpoint parses, validates and responds; keep the function small.
- Gate in one place. Access checks and rate limits live in `listenProcessor`, not repeated in every listener.
- Keep hot state in memory. Read disk once at boot, serve from memory, flush on an interval.
- Validate every input. Sanitise and length-check before use; read secrets only from the environment.
- Share, never copy. Cross-service code lives in a shared module imported by each entry.
- Types live in `types/` and are imported; never declare interfaces inline.
- Keep the diff minimal and match the surrounding code.

## Layout at a glance

```text
myapp/
├── server/
│   ├── api.ts               # service entry -> server_build/api.js
│   ├── worker.ts            # another service entry
│   ├── billing/             # feature modules for one area
│   ├── utils/               # cross-service helpers
│   └── constants.ts         # disk paths and sanitisers
├── types/                   # shared interfaces, enums, request shapes
├── server_build/            # generated server bundles
├── webpack.server.ts
├── deploy.ts                # build, upload and restart script
├── tsconfig.json
└── package.json
```

See `structure.md` for the full contract.

## Topics

- `structure.md`: folders, service boundaries, shared code, types and the restructure steps.
- `services.md`: the entry shape, `startListener`, listeners, the request gate and responses.
- `security.md`: `setServerConfig`, request hardening, validation, crypto, codes and IP gating.
- `state.md`: in-memory state, persistence, cache, disk paths, TTL sweeps and backup.
- `build.md`: bundling each service with `@degreesign/webapp`.
- `deploy.md`: copying bundles to a host, restarting the process and terminating TLS.

## Workflow

1. Read the project `AGENTS.md`, `webpack.server.ts`, the deploy script and the target entry.
2. Choose the layout from `structure.md`; for an existing backend follow its restructure steps.
3. Define the service boundary: one entry, one port, one responsibility.
4. Add listeners in the `services.md` shape, put the gate in `listenProcessor`, start the analytics engine and validate per `security.md`.
5. Hold state in memory and persist it on an interval as in `state.md`.
6. Build with `build.md` and deploy with `deploy.md`; the user runs the deploy.
7. Verify: the process starts, the port listens, routes answer and the flush writes.
8. Leave staging and commits to the user.

## Checklist

- [ ] Each service has one entry file, one port and one responsibility.
- [ ] `listenProcessor` is the only place access and rate limits are checked.
- [ ] The analytics engine is started at boot before the first request.
- [ ] Every listener sanitises and length-checks its inputs before use.
- [ ] Hot state is read once at boot and served from memory.
- [ ] Persistence runs on an interval, never on the request path.
- [ ] Ephemeral maps are swept on a timer so memory cannot leak.
- [ ] Shared code and every type live in their shared directory, not duplicated per service.
- [ ] The service is built for its own `filesList` entry and restarted by name.
- [ ] Staging and commits are left to the user.
