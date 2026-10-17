# SprintBoard Code Delivery Portal

Standalone workshop portal for releasing the ten SprintBoard student coding stages. It reads content from `../APPLICATION/student-materials/` and stores **release status only** in MongoDB.

The SprintBoard reference app (`../APPLICATION/client` and `../APPLICATION/server`) is not required to run this portal.

## Architecture

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite, React Router, plain CSS |
| Backend | Node.js, Express |
| Persistence | MongoDB + Mongoose (`StageRelease` model) |
| Sessions | `express-session` + `connect-mongo`, HTTP-only cookie `portal.sid` |
| Content | `APPLICATION/student-materials/manifest.json` and stage folders on disk |

```
code-delivery-portal/
├── client/          # Student + admin UI
└── server/          # REST API, auth, file delivery
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas) only for `APP_MODE=student` or `APP_MODE=production` — default **`APP_MODE=dev`** uses in-memory MongoDB
- Student materials at `APPLICATION/student-materials/` (default path)

## Installation

```bash
cd code-delivery-portal
npm install
npm run install:all
cp .env.example .env   # Windows: copy .env.example .env
```

Edit `.env`:

- `MONGODB_URI` — required
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — admin login (plain password in env; never sent to clients)
- `SESSION_SECRET` — 32+ random characters in production
- `STUDENT_MATERIALS_PATH` — default `../APPLICATION/student-materials`

## Run (development)

```bash
# Default APP_MODE=dev — no external MongoDB required
npm run dev
```

- API: `http://localhost:4000`
- UI: `http://localhost:5173` (proxies `/api` to the API)

Production-style single process (optional): build the client, set `SERVE_CLIENT=true`, start the server.

## Student release behavior

| Status | Student API |
|--------|-------------|
| **Coming Soon** | Card metadata only (number, title, status). No README, files, or solutions. |
| **Live** | Instructions, verification, challenge, starter file tree and contents. **No solution.** |
| **Completed** | Everything in Live plus solution file tree and contents. |

The UI hides solution tabs for Live stages; the server **rejects** solution file requests unless status is `COMPLETED`.

## Admin stage transitions

Authenticated admins can:

- **Publish as Live** (`publish_live`) — stage N Live; orders &lt; N Completed; orders &gt; N Coming Soon.
- **Mark Completed** (`mark_completed`) — that stage Completed (removes Live if it was Live).
- **Return to Coming Soon** (`coming_soon`) — stage hidden again.

Rules enforced on the server:

1. Seed leaves existing DB statuses intact (`$setOnInsert` only).
2. At most one Live stage after `publish_live`.
3. Invalid stage IDs and actions return 400/404.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Service ok; 503 if DB disconnected |
| GET | `/api/stages` | — | All stages with release status |
| GET | `/api/stages/:stageId` | — | Stage detail (403 if Coming Soon) |
| GET | `/api/stages/:stageId/files/*` | — | File content (403 solution if not Completed) |
| POST | `/api/admin/login` | — | Rate-limited login |
| POST | `/api/admin/logout` | — | Destroy session |
| GET | `/api/admin/session` | — | Session state |
| GET | `/api/admin/stages` | Admin | Stages + status for dashboard |
| PATCH | `/api/admin/stages/:stageId/status` | Admin | Body: `{ "action": "publish_live" \| "mark_completed" \| "coming_soon" }` |

Responses: `{ success, data }` or `{ success: false, error: { code, message } }`.

## Security boundaries

- Admin password and session secret only on the server.
- File reads resolved under `student-materials/stages/<stageId>/`; path traversal blocked.
- Symlinks skipped when listing trees.
- Public errors omit stack traces and secrets.
- Production startup fails if `SESSION_SECRET` or `ADMIN_PASSWORD` are weak/missing.

## Tests

```bash
npm test
```

Uses `mongodb-memory-server` for API tests (persistence verified in-memory). Manifest tests read the real `APPLICATION/student-materials` tree.

Also:

```bash
npm run lint
npm run build
```

## Troubleshooting

| Issue | Check |
|-------|--------|
| `MONGODB_URI is required` | Create `.env` from `.env.example` |
| `Manifest not found` | `STUDENT_MATERIALS_PATH` points at `APPLICATION/student-materials` |
| 503 on `/api/stages` | Database not connected (check `APP_MODE` and `MONGODB_URI` for external modes) |
| Admin login fails | `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env` |
| CORS in custom setup | Set `CLIENT_ORIGIN` to your UI origin |

## Known limitations

- Stage packages are **cumulative deltas**; not every stage runs standalone (see `CUMULATIVE_ASSEMBLY.md` in student materials).
- No student accounts, ZIP bundles, or password reset in v1.
- Workshop security model — not a production SaaS hardening pass.

## How content is consumed

1. On startup the server parses `manifest.json` (exactly ten stages, orders 1–10).
2. MongoDB seeds missing `StageRelease` rows as Coming Soon without overwriting existing statuses.
3. Markdown docs and trees are read from disk per request according to release status.
