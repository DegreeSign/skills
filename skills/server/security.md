# Security

Configure the server once at boot, validate every input and let the gate do the access checks.

## Configure the server

Call `setServerConfig` before `startListener`. Every field is optional and merged into the live config.

| Field | Type | Default | Purpose |
| ----- | ---- | ------- | ------- |
| `cacheDir` | `string` | OS cache dir | Directory used by `saveCache` / `readCache`. |
| `encryptionKey` | `string` | `''` | Key for `en` / `de`. |
| `encryptionSalt` | `string` | `''` | Salt for `en` / `de`. |
| `captchaSecret` | `string` | `''` | hCaptcha secret for `capVerify`. |
| `sanitisationString` | `string` | `''` | Characters that make `chkStg` reject the value. |
| `sanitisationStringExtended` | `string` | `''` | Extra pattern rejected by `validLen`. |
| `overrideUserAgent` | `string` | `''` | User agent used for outbound requests. |
| `maxBodySizeMB` | `number` | `10` | Body limit before `413`. |
| `requestTimeoutMs` | `number` | `30000` | Max time to receive a body. |
| `headersTimeoutMs` | `number` | `60000` | Max time to receive headers. |
| `keepAliveTimeoutMs` | `number` | `5000` | Keep-alive idle timeout. |
| `maxRequestsPerSocket` | `number` | `0` | Requests per socket, `0` is unlimited. |

```typescript
setServerConfig({
    encryptionKey: process.env.ENCRYPTION_KEY,
    encryptionSalt: process.env.ENCRYPTION_SALT,
    captchaSecret: process.env.CAPTCHA_SECRET,
    sanitisationString: `[<>"']`,
    sanitisationStringExtended: unsafePattern,
    maxBodySizeMB: 10,
    requestTimeoutMs: 30_000,
    headersTimeoutMs: 60_000,
    keepAliveTimeoutMs: 5_000,
});
```

Keep keys and secrets in the environment. The build inlines `process.env.*` at build time, so a missing key must be treated as a build error for that environment. Ports, hosts and other fixed values are constants in `server/constants.ts`, never environment variables.

## Validate inputs

| Helper | Use |
| ------ | --- |
| `chkStg(txt)` | Return the value unchanged when it contains none of the characters in `sanitisationString`, otherwise `''`; numbers and numeric strings pass un-sanitised. |
| `validLen(len, txt, checkNeg?)` | True when `txt` is shorter than `len`; with `checkNeg`, also rejects the extended sanitiser. |
| `validLenEq(len, txt, checkNeg?)` | Same, but the length must match exactly. |
| `txtShort(txt, len?)` | Last `len` characters, for masked identifiers. |

Sanitise before length-checking, and validate every value read from `req.body`. Never trust a type from the client.

## Encryption and signatures

| Helper | Use |
| ------ | --- |
| `en(data)` | AES-256-CBC encrypt a string, returns hex. |
| `de(hex)` | Decrypt a value produced by `en`. |
| `hmacValid({ data, secret, algorithm? })` | Hex HMAC digest, `sha512` by default. |

Use `en` for at-rest identifiers such as API keys, and `hmacValid` to verify a request signature. Recompute the signature over the exact payload without the signature field and compare it to the sent value.

## One-time codes

| Helper | Use |
| ------ | --- |
| `genAPI(len)` | Base32 TOTP secret of a given length. |
| `genRandomCodeSize()` | Base32 secret of random length 20 to 30. |
| `genShortCode()` | Short base32 code, length 4. |
| `verAPI(auth, t)` | Verify a TOTP token against a secret. |

Store only the encrypted secret, and verify with `verAPI` before granting API access.

## Captcha

`capVerify(token)` verifies an hCaptcha token against `captchaSecret` and resolves `true`, `false` or `undefined`. Require it once per costly action, such as account creation or a paid request. A token is single-use; consume it at the point of verification.

## Access and rate limits

Use `@degreesign/analytics` in the gate:

| Helper | Use |
| ------ | --- |
| `ipCheck(ips)` | True when the client IP is allowed; records hits and blacklists abusers. |
| `ipWhiteList(ips)` | Raise a trusted IP's allowance. |
| `ipPriorityList(ips)` | Raise a paying client's allowance. |
| `ipRateLimits` | The general, white and paid thresholds. |
| `startAnalyticsServer(config)` | Start the IP and traffic engine at boot. |
| `recordStats(input)` | Record a page view or interaction. |

`startAnalyticsServer` takes a `ServiceConfig`. Every field is optional:

| Field | Type | Default | Purpose |
| ----- | ---- | ------- | ------- |
| `trafficDir` | `string` | `traffic` | Directory for the traffic snapshots. |
| `thisDomain` | `string` | `''` | Domain treated as internal traffic. |
| `excludeURIs` | `string[]` | `[]` | URI fragments to ignore. |
| `searchEngines` | `string[]` | `[]` | Referrer fragments counted as search. |
| `uriAlias` | `object` | `{}` | Display names per URI fragment. |
| `ipRangeRefreshInterval` | `number` | one day | How often to refresh the IP range table. |
| `ipLimitResetInterval` | `number` | five minutes | How often the IP counters reset. |

Start the engine once at boot, before the first request. `ipCheck` reads its loaded state, so a gate that checks IPs without it never has an IP range and never resets its counters.

```typescript
await startAnalyticsServer({
    trafficDir: `${dataDir}traffic/`,
    thisDomain: domain,
});
```

`recordStats` takes `{ ipRange, ips, data }`; pass `ipData.ipRange` from the engine and the client IP. Run the IP check in `listenProcessor` and raise priority only inside the endpoint that earns it. The SDK also hardens the socket against slow-body and slowloris attacks through the timeout fields above.

## Never

- Never log a secret, key or token.
- Never put a secret in a constant or a source file; use the environment.
- Never skip validation because the front end already checked.
- Never widen `allowedOrigins` to a wildcard in production.
