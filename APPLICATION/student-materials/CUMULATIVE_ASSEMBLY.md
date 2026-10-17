# Cumulative assembly guide (for instructors)

Student stage folders are **deltas**, not ten full repositories.

## Recommended workflow

1. Begin with an empty SprintBoard-shaped folder or a classroom template repo.
2. For each stage `N`, copy files from `stages/stage-NN/solution/` into the student project using the same relative paths (`client/...`, `server/...`).
3. Keep unmodified files from earlier stages (for example `Layout.jsx` from Stage 1 when working Stage 3).
4. Stage 1 `solution/client/` is the minimum runnable frontend scaffold.
5. Stage 5 introduces `server/` without MongoDB.
6. Stage 6 replaces Stage 5 health-only backend with the persistent REST API (merge or replace `server/` carefully).
7. Stages 7–8 add/overwrite client integration files on top of Stages 1–3 UI work.
8. Stage 9 adds `server/src/graphql/` and updates `server/src/app.js` and `server/package.json`.
9. Stage 10 adds GraphQL mutation support, `client/src/services/graphql.js`, `GraphQLDemo.jsx`, full `Issues.jsx`, and `/graphql` Vite proxy.

## Runnable snapshots

| Milestone | Runnable without other stages? |
|-----------|--------------------------------|
| Stage 1 solution `client/` only | Yes (`npm install && npm run dev`) |
| Stage 5 solution `server/` only | Yes (health endpoint) |
| Stage 6+ | Needs `.env` + MongoDB |
| Stage 7+ | Needs cumulative client + Stage 6 server |
| Full reference app | Repository root (instructor copy) |

Intermediate snapshots were **generated**, not executed in CI for this materials package. Instructors should spot-check before class.

## Automated tests

Backend tests live in the instructor reference `server/tests/`. They are **not** duplicated in every stage folder. Stage 10 verification references running `npm test` after merging into the full project structure.
