# Stage 9 — Before you view the solution

GraphQL adds a **second API surface** on the same domain services. Understand schema before comparing resolvers.

## You should be able to explain

- **Schema types** for Issue, User, and list queries.
- **`issues` / `issue` / `users`** query shapes and when to use each.
- **DateTime scalar** — why REST used ISO strings and GraphQL wraps them.
- **Introspection** in development and why it is restricted in production.

## Self-check

- GraphQL playground or POST `/graphql` returns data with a valid query document.
- Resolver errors map to GraphQL errors, not silent nulls without reason.
- REST routes still work — nothing removed for workshop progression.

## Common gaps

- Resolvers bypassing services and hitting models directly with duplicated logic.
- N+1 queries (acceptable to note in class; optimization optional).
- Schema/types out of sync with Mongoose models.
