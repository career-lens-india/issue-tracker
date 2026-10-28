# Stage 5 — Before you view the solution

Backend stages start here. Verify **health** and middleware order before comparing solutions.

## You should be able to explain

- **Express app factory** (`createApp`) vs listening in `server.js`.
- Order of **middleware**: JSON parser, logging, routes, error handler.
- What **GET /api/health** returns and why it exists (deployments, workshops, tests).

## Self-check

- `curl` or browser to `/api/health` returns JSON success without Mongo (this stage).
- Invalid JSON body does not crash the process.
- You know which file owns route registration vs server bootstrap.

## Common gaps

- Calling `listen` inside the factory (harder to test).
- Missing centralized error middleware.
- Port/env not read from `process.env`.
