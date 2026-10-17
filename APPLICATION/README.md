# SprintBoard — Team Issue Management

> **Location:** This application lives in the `APPLICATION/` folder of the Issue Tracker repository. Run `npm` scripts from this directory (not the repository root).

SprintBoard is a shared workspace for managing software-development issues and team members. It is the workshop reference implementation for a full-stack MERN application with **REST** and **GraphQL** APIs over the same MongoDB database.

**Features:** dashboard statistics, issue CRUD (REST), user create/list, search and filters, assignee validation, GraphQL query/mutation demo on the Issues page, automated API tests.

There is **no authentication**; all visitors share one workspace.

## Technology stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 18, Vite, React Router, plain CSS, `fetch` |
| Backend | Node.js, Express, shared services layer |
| APIs | REST (`/api/*`), GraphQL (`/graphql`) via `graphql` + `graphql-http` |
| Database | MongoDB, Mongoose |
| Tests | Jest, Supertest, MongoDB Memory Server (tests only) |

## Architecture

```
client/ (React)
  services/api.js      → REST
  services/graphql.js  → GraphQL
        ↓ proxy in dev (Vite)
server/ (Express)
  routes/              → REST controllers
  graphql/             → schema, resolvers, DateTime scalar
  services/            → shared validation & queries (REST + GraphQL)
  models/              → User, Issue (Mongoose)
        ↓
MongoDB (MONGODB_URI)
```

## Project structure

```
├── client/                 # React UI
├── server/                 # Express API + tests
│   ├── src/graphql/        # GraphQL schema & resolvers
│   ├── src/services/       # Shared business logic
│   └── tests/              # Jest API tests
├── docs/
│   ├── SYLLABUS_COVERAGE.md
│   ├── WORKSHOP_RUNBOOK.md
│   ├── STUDENT_CODING_STAGES.md
│   └── demos/              # Instructor mini-demos (Counter, class component)
├── .env.example
├── package.json            # Root scripts
└── README.md
```

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm
- **MongoDB 6+** (local or Atlas) only when `APP_MODE=student` or `APP_MODE=production` — **not** required for default local dev (`APP_MODE=dev` uses in-memory MongoDB)

## Installation

**Windows PowerShell** (from project root):

```powershell
npm install
npm run install:all
```

Unix/macOS: same commands.

## Environment configuration

```powershell
copy .env.example .env
```

Edit `.env`:

```
# APP_MODE=dev   # default for local development (in-memory database)
# MONGODB_URI=mongodb://127.0.0.1:27017/sprintboard   # required for student/production modes
PORT=5000
NODE_ENV=development
```

**Atlas:** create a cluster, user, and IP allowlist; paste the connection string into `MONGODB_URI`.

> **Tests vs runtime:** `npm test` uses an in-memory database (MongoDB Memory Server). It does **not** prove your local MongoDB instance works. Verify MongoDB separately before workshops.

## Development startup

```powershell
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| REST health | http://localhost:5000/api/health |
| GraphQL | POST http://localhost:5000/graphql |

Separate terminals:

```powershell
npm run dev:server
npm run dev:client
```

With **`APP_MODE=dev`** (default when `NODE_ENV` is not `production`), the server starts an in-memory MongoDB instance; data is lost when the process stops. With **`APP_MODE=student`** or **`APP_MODE=production`**, the server **exits on startup** if `MONGODB_URI` is missing or MongoDB cannot be reached.

## Test, lint, and build

```powershell
npm test
npm run lint
npm run build
```

| Command | Purpose |
|---------|---------|
| `npm test` | Backend Jest suite (Memory Server) |
| `npm run lint` | ESLint on `client/src` |
| `npm run build` | Production build of React app |

If Memory Server fails to install (npm 11+):

```powershell
cd server
npm approve-scripts mongodb-memory-server
cd ..
npm test
```

## REST API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service + DB readiness (503 if DB disconnected) |
| GET | `/api/users` | List users (`?search=`) |
| POST | `/api/users` | Create user |
| GET | `/api/issues` | List issues (`?search=&status=&priority=&assignee=`) |
| GET | `/api/issues/:id` | Get one issue |
| POST | `/api/issues` | Create issue |
| PUT | `/api/issues/:id` | Update issue |
| DELETE | `/api/issues/:id` | Delete issue |

**Success:** `{ "success": true, "data": ... }`  
**Error:** `{ "success": false, "error": { "code", "message", "details" } }`

When MongoDB disconnects at runtime, `/api/*` (except health) and `/graphql` return **503** `DATABASE_UNAVAILABLE`.

## GraphQL API

**Endpoint:** `POST /graphql` with JSON `{ "query": "...", "variables": { ... } }`

REST and GraphQL read/write the **same** MongoDB collections.

**Development:** introspection enabled (`__schema` queries).  
**Production:** introspection disabled when `NODE_ENV=production`.

### Example query

```graphql
query {
  issues {
    id
    title
    status
  }
}
```

### Example mutation with variables

```graphql
mutation CreateIssue($input: CreateIssueInput!) {
  createIssue(input: $input) {
    id
    title
    assignee { name email }
  }
}
```

```json
{
  "input": {
    "title": "Investigate login failure",
    "description": "Investigate the reported authentication problem.",
    "priority": "HIGH"
  }
}
```

Enum mapping: `OPEN`/`IN_PROGRESS`/`CLOSED` ↔ Open / In Progress / Closed; `LOW`/`MEDIUM`/`HIGH` ↔ Low / Medium / High.

GraphQL may return HTTP **200** with an `errors` array — always check `errors` before using `data`.

UI demo: **Issues** page → REST vs GraphQL section.

## Teaching documentation

- [Syllabus coverage matrix](docs/SYLLABUS_COVERAGE.md)
- [Nine-hour workshop runbook](docs/WORKSHOP_RUNBOOK.md)
- [Ten student coding stages](docs/STUDENT_CODING_STAGES.md)
- Instructor demos: [Counter](docs/demos/CounterDemo.jsx), [class component](docs/demos/ClassGreetingDemo.jsx), [serverless notes](docs/demos/serverless-hello-world.md)

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Server won't start | `MONGODB_URI` in `.env`; MongoDB service running; firewall/Atlas IP |
| `/api/health` → 503 | Database down; response includes `database: disconnected` |
| Frontend can't reach API | Backend on port 5000; Vite proxy in `client/vite.config.js` |
| GraphQL validation errors | `errors[0].message` and `extensions.code` |
| Duplicate email | Expected 409 from `POST /api/users` |
| Tests fail after clone | Run `npm run install:all`; approve Memory Server scripts |

## Known limitations

- No authentication, JWT, or role-based permissions
- No user delete API; assignee references validated on issue create/update
- GraphQL: queries + `createIssue` only (updates/deletes via REST)
- Class components, Counter lab, and serverless Hello World are **separate demos**, not mounted in the main app
- No student code-release portal in this repository

## Suggested workflow

1. Configure MongoDB and `.env`.
2. `npm run dev`.
3. Add users on **Users**.
4. Create and manage issues; try the GraphQL demo on **Issues**.
