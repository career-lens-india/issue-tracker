# Stage 10 — Before you view the solution

Final stage connects **mutations**, demo UI, and project quality gates.

## You should be able to explain

- **`createIssue` mutation** — arguments, validation, returned fields.
- How **GraphQLDemo** differs from the main REST-driven Issues page (purpose, not duplicate app).
- **REST vs GraphQL** tradeoffs you experienced in this workshop.
- What `npm test`, `npm run lint`, and `npm run build` verify in the cumulative project.

## Self-check

- Mutation creates an issue visible via query or REST GET.
- Demo handles loading/error from GraphQL response.
- Full stack runs: client, Express, Mongo, both REST and GraphQL.

## Common gaps

- Mutation resolver skipping service validation.
- Demo hard-coded query string with no variables where variables are taught.
- Skipping final verification checklist in `verification.md`.
