# State

Serve reads from memory and write on a timer. Disk work on the request path is the fastest way to slow a backend down.

## Load once, serve from memory

- Declare module-level variables for the data a service reads often.
- On boot, load each file with `redJ` and guard the load, because a first run has no file yet.
- Endpoints read and update the in-memory object directly.
- Never read a file inside a listener.

```typescript
let records: Records = {};

const startServer = async () => {
    try { records = redJ(dataDir + `records.json`); }
    catch (e) { console.log(`load failed`, e); };
    // ...
};
```

## Persist on an interval

- Flush related state together on one timer.
- Wrap every write in `try`/`catch`; a failed write must not stop the interval.
- Choose the cadence by how much data could be lost: 10 to 15 seconds for accounts, longer for cold data.
- Keep the file a whole snapshot of the in-memory object.

```typescript
setInterval(
    () => {
        try {
            wrtJ(dataDir + `records.json`, records);
        } catch (e) { console.log(`save failed`, e); };
    },
    oneSec * 15,
);
```

## File and cache helpers

| Helper | Use |
| ------ | --- |
| `wrt(file, data)` / `wrtJ(file, data)` | Write a value, JSON for the latter. |
| `red(file)` / `redJ(file)` | Read a value; `redJ` parses JSON. |
| `safeFolder(path)` | Ensure a folder exists before writing into it. |
| `delFile(file)` / `delFolder(path)` | Remove a file or folder. |
| `fileStats(file)` | `fs.Stats` for a file. |
| `saveCache(key, data)` / `readCache(key)` | Small derived data under `cacheDir`. |
| `getData(url, body?, headers?, noCache?)` | Outbound HTTP returning parsed JSON. |
| `saveFileLocally({ url, filePath })` | Stream a remote file to disk. |
| `cmd(command)` | Run a shell command and capture output. |

Use the cache for derived data that can be rebuilt, such as aggregated totals or rendered charts. Use files for the source of truth.

The time constants `oneSec` and `oneMin`, and the timestamp helper `tN`, come from `@degreesign/utils`.

## Disk paths

- Keep private data under a directory that is not web-served, for example `/srv/myapp/data/`.
- Keep files that must be web-served under the public directory, for example `/var/www/myapp/`.
- Define both roots once in `server/constants.ts` and build every path from them.
- Never concatenate a user-supplied value into a path; sanitise it first.

## Memory hygiene

Ephemeral maps must be swept or they grow forever:

- Rate-limit maps keyed by IP: store `{ count, resetAt }` and delete the entry when the window passes.
- Pending or temporary records keyed by id: store a `createdAt` and delete entries older than a TTL.
- Duration or session windows: prune entries older than the window on a timer.

```typescript
let pending: Pending = {};

const ttl = oneMin * 5;

setInterval(
    () => {
        const now = Date.now();
        for (const id in pending)
            if (now - pending[id].createdAt > ttl) delete pending[id];
    },
    oneMin,
);
```

## Concurrency

- Model state as plain objects keyed by id; there is no locking.
- Because Node runs handlers one at a time, a read-modify-write within one synchronous block is safe.
- Across `await`, re-read the current value before mutating.
- Persist whole snapshots; there is no partial update to reconcile.

## Backup

Back up the directories, not the code: the private data directory and any web-served data the service writes. Archive them to a timestamped `.tar.gz` on a schedule and move old copies off the host. Keep the backup step beside the deploy step.
