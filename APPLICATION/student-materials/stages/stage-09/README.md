# GraphQL schema, queries, scalar, and introspection

## Learning objectives
- GraphQL schema
- issues/issue/users queries
- DateTime scalar
- introspection in dev

## Prerequisites
- Stage 6+ services
- Stage 8 REST working

## Starting state
You should already have the cumulative SprintBoard project from previous stages (see `docs/STUDENT_CODING_STAGES.md`). This stage folder contains **starter** and **solution** files for paths that change in this stage only.

## Coding instructions (order)
1. Read `starter/` files for this stage.
2. Implement the tasks below before peeking at `solution/`.
3. Copy solution files into your cumulative project tree matching paths like `client/src/...` or `server/src/...`.

## Files in this stage package
**Starter:** (see prior stage solution — no new starter files)
**Solution:** solution/server/package.json, solution/server/src/app.js, solution/server/src/config/db.js, solution/server/src/controllers/healthController.js, solution/server/src/controllers/issueController.js, solution/server/src/controllers/userController.js, solution/server/src/graphql/enums.js, solution/server/src/graphql/errors.js, solution/server/src/graphql/index.js, solution/server/src/graphql/mappers.js, solution/server/src/graphql/resolvers/index.js, solution/server/src/graphql/scalars/DateTime.js, solution/server/src/graphql/schema/typeDefs.js, solution/server/src/graphql/setupGraphQL.js, solution/server/src/middleware/errorHandler.js, solution/server/src/middleware/requestLogger.js, solution/server/src/middleware/requireDatabase.js, solution/server/src/middleware/validateObjectId.js, solution/server/src/models/Issue.js, solution/server/src/models/User.js, solution/server/src/routes/healthRoutes.js, solution/server/src/routes/index.js, solution/server/src/routes/issueRoutes.js, solution/server/src/routes/userRoutes.js, solution/server/src/server.js, solution/server/src/services/issueService.js, solution/server/src/services/userService.js, solution/server/src/utils/errors.js

## Commands
- Configure `.env` from `.env.example`, then `npm run dev` from instructor root or run server + client separately

## Expected visible behavior
See `verification.md`.

## Deferred to next stage
createIssue mutation (Stage 10)

## Reference
Instructor reference implementation: repository root (unchanged). Compare your cumulative project with `solution/` paths listed in `stage.json`.
