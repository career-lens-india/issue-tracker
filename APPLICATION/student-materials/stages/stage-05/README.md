# Express application, middleware, and health endpoint

## Learning objectives
- Express app factory
- JSON + logging middleware
- GET /api/health

## Prerequisites
- HTTP/JSON basics

## Starting state
You should already have the cumulative SprintBoard project from previous stages (see `docs/STUDENT_CODING_STAGES.md`). This stage folder contains **starter** and **solution** files for paths that change in this stage only.

## Coding instructions (order)
1. Read `starter/` files for this stage.
2. Implement the tasks below before peeking at `solution/`.
3. Copy solution files into your cumulative project tree matching paths like `client/src/...` or `server/src/...`.

## Files in this stage package
**Starter:** (see prior stage solution — no new starter files)
**Solution:** solution/.env.example, solution/server/package.json, solution/server/src/app.js, solution/server/src/controllers/healthController.js, solution/server/src/middleware/errorHandler.js, solution/server/src/middleware/requestLogger.js, solution/server/src/routes/healthRoutes.js, solution/server/src/routes/index.js, solution/server/src/server.js, solution/server/src/utils/errors.js

## Commands
- `cd server && npm install && npm run dev` (no MongoDB required)

## Expected visible behavior
See `verification.md`.

## Deferred to next stage
MongoDB (Stage 6)

## Reference
Instructor reference implementation: repository root (unchanged). Compare your cumulative project with `solution/` paths listed in `stage.json`.
