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
| `Manifest not found` / materials missing on Vercel | Ensure full monorepo clone; `installCommand` runs `sync:materials`. Clear **Output Directory** in Vercel (must not be `public`). |
| 503 on `/api/stages` | Database not connected (check `APP_MODE` and `MONGODB_URI` for external modes) |
| Admin login fails | `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env` |
| CORS in custom setup | Set `CLIENT_ORIGIN` to your UI origin |

## Deploy on Vercel (separate frontend + API)

Student content lives in **`APPLICATION/student-materials/`** (shared with the SprintBoard workshop app). Vercel serverless functions do not see sibling folders unless they are bundled.

### API project

1. Connect the **full monorepo** (not a sparse checkout).
2. **Root Directory:** `CODE-DELIVERY-PORTAL/server`
3. **Framework Preset:** Other (not Vite/Next). **Output Directory:** leave **empty** — do not use `public` (API-only project).
4. **Install** runs `npm install && npm run sync:materials` via `vercel.json` (copies `APPLICATION/student-materials` into `server/student-materials` and bundles it).
5. **Environment variables:** `MONGODB_URI`, `APP_MODE=production`, `NODE_ENV=production`, `SESSION_SECRET`, `ADMIN_*`, `STUDENT_ACCESS_PASSWORD`, **`CLIENT_ORIGIN`** = your frontend URL (exact origin, no trailing slash).

Local check before deploy:

```bash
cd CODE-DELIVERY-PORTAL/server
npm run vercel-build
npm start
```

### Frontend project

1. **Root Directory:** `CODE-DELIVERY-PORTAL/client`
2. **Build Command:** `npm run build`
3. **Environment:** `VITE_API_URL` = your API origin (e.g. `https://your-api.vercel.app`) — required because the UI is on a different host than `/api`.

### Path resolution (local vs Vercel)

The API resolves materials automatically:

1. `STUDENT_MATERIALS_PATH` if set and `manifest.json` exists
2. `server/student-materials/` (sync copy for Vercel)
3. `../APPLICATION/student-materials` (monorepo local dev)

Run `npm run sync:materials` from `CODE-DELIVERY-PORTAL/` to refresh the bundled copy without deploying.

## Known limitations

- Stage packages are **cumulative deltas**; not every stage runs standalone (see `CUMULATIVE_ASSEMBLY.md` in student materials).
- No student accounts, ZIP bundles, or password reset in v1.
- Workshop security model — not a production SaaS hardening pass.

## How content is consumed

1. On startup the server parses `manifest.json` (exactly ten stages, orders 1–10).
2. MongoDB seeds missing `StageRelease` rows as Coming Soon without overwriting existing statuses.
3. Markdown docs and trees are read from disk per request according to release status.
