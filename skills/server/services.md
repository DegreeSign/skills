# Services

Every service uses the same runtime: a `start` function that loads state, schedules work and calls `startListener` with a request gate and a listener array.

## Entry shape

```typescript
import { oneSec } from "@degreesign/utils";
import {
    APIData,
    ListenerSpecs,
    chkStg,
    ff,
    redJ,
    rf,
    setServerConfig,
    startListener,
    wrtJ,
} from "@degreesign/server";
import { ipCheck, startAnalyticsServer } from "@degreesign/analytics";
import { AccessData } from "../types/server";
import { apiPort, dataDir, domain } from "./constants";
import { getRecord } from "./records";

let records: Records = {};

const start = () => {
    const
        /** Runs for every request: identity, then hand off */
        listenProcessor = ({
            endPoint,
            ips,
            req,
            res,
            fun,
        }: APIData<AccessData>) =>
            ipCheck(ips)
                ? fun({ endPoint, ips, body: req.body, res })
                : ff(res),
        /** One entry per endpoint */
        listeners: ListenerSpecs<AccessData>[] = [{
            endPoint: `record`,
            task: `Record fetch`,
            fun: ({ body, res }: AccessData) =>
                rf(res, { record: getRecord(records, chkStg(body.id)) }),
        }, {
            method: `GET`,
            endPoint: `health`,
            task: `Health check`,
            fun: ({ res }: AccessData) => rf(res, { ok: 1 }),
        }],
        startServer = async () => {

            // configure
            setServerConfig({
                sanitisationString: `[<>"']`,
            });

            // start analytics
            await startAnalyticsServer({
                trafficDir: `${dataDir}traffic/`,
                thisDomain: domain,
            });

            // read state
            try { records = redJ(dataDir + `records.json`); }
            catch (e) { console.log(`load failed`, e); };

            // schedule persistence
            setInterval(
                () => {
                    try { records && wrtJ(dataDir + `records.json`, records); }
                    catch (e) { console.log(`save failed`, e); };
                },
                oneSec * 15,
            );

            // listen
            startListener<AccessData>({
                port: apiPort,
                allowedOrigins: [`https://${domain}`],
                listenProcessor,
                listeners,
            });
        };

    startServer();
};

// Initiate
start();
```

## The request gate

`listenProcessor` receives `APIData<T>` and decides whether the request reaches the endpoint:

- `endPoint` is the matched route.
- `ips` is the resolved client IP.
- `req` is the `IncomingMessage` with `body` already parsed.
- `res` is the `ServerResponse`.
- `fun` is the endpoint's own handler.

Call `fun(payload)` to proceed, or `ff(res)` to reject. Do identity, captcha, signature and rate-limit checks here so no endpoint repeats them. Build the payload object once and pass only the fields endpoints need.

Endpoints that must stay open (health, stats, webhooks) are matched by `endPoint` inside the gate before the auth check.

The gate never rejects a request for an empty payload; each listener validates its own body before use.

## Listeners

Each listener is a `ListenerSpecs<T>`:

| Field | Required | Description |
| ----- | -------- | ----------- |
| `endPoint` | yes | Route path without the leading slash. Case-insensitive. |
| `task` | yes | Short description used in failure logs. |
| `fun` | yes | Handler receiving the payload type `T`. |
| `method` | no | `GET` or `POST`, default `POST`. |

Rules:

- One listener per endpoint, declared inline in the array.
- Keep the handler thin: parse, validate, act, respond. Move logic into `server/<feature>/`.
- Use `GET` only for reads, tracking pixels and redirects.
- For redirects or non-JSON responses, write headers and end `res` directly.
- Wrap handler bodies in `try`/`catch` and respond with `ff(res)` on failure.

## Requests and bodies

`startListener` handles the HTTP details:

- `POST` with a `Content-Type` containing `application/json` is parsed into `req.body`; invalid JSON returns `400`.
- `POST` with another content type leaves `req.body` as the raw string.
- `GET` query parameters are parsed into `req.body` as an object.
- `OPTIONS` preflight is answered automatically; other methods get `204`.
- An unknown route or a method mismatch returns `404`.
- A body larger than `maxBodySizeMB` returns `413`.
- The client IP is read from `x-forwarded-for`, then the socket address, then `cf-connecting-ip`.

## Responses

| Helper | Behaviour |
| ------ | --------- |
| `rf(res, data, success?)` | Sends `200` JSON shaped `{ success, ...data }`. When `success` is omitted it is `false` only when `data.e` is set. Use `{ e: code }` for a handled error. |
| `ff(res)` | Ends the connection with `504`. Use for rejected or failed requests. |

Return the smallest useful payload and keep error codes consistent across services.

## Ports and origins

- Read the port from a constant in `server/constants.ts`, never from a fallback expression.
- Give each service its own port constant, for example `apiPort` and `workerPort`.
- Pass every trusted front-end origin to `allowedOrigins`; matching origins receive `Access-Control-Allow-Origin`.
- When there is no `allowedOrigins`, any origin that sends one is echoed back. Set the list in production.

## Multiple services

- One `startListener` call per service, on its own port.
- Each service is a separate `filesList` entry and a separate process.
- Services never share memory; share data through files, the cache or the public directory.
- A service can host two listeners on two ports (an internal one and a public API one) when they share the same in-memory state.
