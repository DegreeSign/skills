# Deploy

A server build is a plain JavaScript file per service. Deployment is three steps: build the bundle, put it on the host, restart the process.

## Steps

1. Build the service bundle locally.
2. Copy the bundle to the host with the project's existing method (a deploy script or a CI artifact). Copy only the bundle, not the source.
3. Restart the running service with the process manager, one process per service.
4. Persist the process list so services come back after a reboot.

Keep the copy-and-restart steps in one script at the project root, and drive it by service name so the same script deploys any service. Build before copying, and log the result per service so a partial deploy is obvious.

## Environment

- Secrets belong in the environment, never in the repository.
- Host names and ports are constants in `server/constants.ts`, one port per service.
- Give each service a matching `allowedOrigins` constant for the front end.
- The build inlines environment variables, so build in the environment that matches the target.
- Treat a missing secret as a deploy failure and fail loudly at boot.

## Reverse proxy

The service speaks plain HTTP/1.1 and should not terminate TLS itself. Put a reverse proxy in front of it:

- Terminate TLS at the proxy and forward cleartext HTTP to the service port.
- Preserve the host header so the client IP arrives in `x-forwarded-for`, which the SDK reads.
- Register routes without the proxy prefix, because the proxy strips the prefix it matches.
- Firewall the service port so only the proxy can reach it.

## Supervision

- Run each service under a process manager so it restarts on crash and on boot.
- Keep one process per service so a restart affects only that service.
- Watch the process logs for the `Server Online` line and for handler failures.
- Back up the private data directory on a schedule, separately from the code.

## Agents and deploys

Never upload, restart or otherwise deploy a service. The user runs the build and deploy steps; an agent may only prepare the change and run the local dev server where the project allows it.
