# Stage 6 — Before you view the solution

This is the largest backend stage. Confirm CRUD and validation manually before opening solution files.

## You should be able to explain

- **User** and **Issue** Mongoose schemas and required fields.
- **Service layer** (`issueService`, `userService`) vs route handlers — why split?
- REST verbs on `/api/issues` and `/api/users` and status codes (201, 404, 400).

## Self-check

- Mongo running; `MONGODB_URI` set; seed or create via POST works.
- Invalid payloads return structured errors, not stack traces to clients.
- You can create → read → update → delete one issue via HTTP client.

## Common gaps

- Business logic duplicated in routes instead of services.
- Missing validation on assignee/reporter references.
- GraphQL or extra routes added too early (Stage 9+).
