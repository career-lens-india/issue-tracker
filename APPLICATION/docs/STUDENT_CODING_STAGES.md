# SprintBoard — Ten-Stage Student Implementation Blueprint

Repository-grounded teaching plan for rebuilding the reference application incrementally.  
**Source of truth for behavior:** application code in this repo.  
**Companion docs (not modified here):** [README](../README.md), [SYLLABUS_COVERAGE.md](./SYLLABUS_COVERAGE.md), [WORKSHOP_RUNBOOK.md](./WORKSHOP_RUNBOOK.md).

---

## 1. Project and teaching philosophy

**SprintBoard** is a shared issue-management workspace (no authentication) for 7th-semester ISE students.

**Philosophy:** Keep the UI simple and functional; make operations, data flow, and learning value rich. Every feature should have a clear teaching purpose.

Students progressively build toward the **existing reference implementation**, which includes:

- React 18 + Vite + React Router + plain CSS (`client/`)
- Express REST (`/api/*`) + GraphQL (`POST /graphql`)
- MongoDB via Mongoose; shared logic in `server/src/services/`
- Pages: Dashboard, Issues (with REST table + GraphQL demo), Create Issue, Issue Detail/Edit, Users
- Backend tests in `server/tests/` (34 `test(...)` cases across 5 files — instructor should run `npm test` to confirm current pass/fail)

**Realistic expectation for nine contact hours:** Most classes will **not** type the entire reference repo from scratch. This blueprint defines the **ideal dependency order**; [Section 8](#8-nine-hour-workshop-timetable) states what to code live, what to supply as starter code, and what to demonstrate only.

---

## 2. Audited architecture summary

### 2.1 Frontend (`client/src`)

| Area | Responsibility |
|------|----------------|
| `main.jsx` | Mounts `App` inside `BrowserRouter`; loads `styles/global.css` |
| `App.jsx` | Routes: `/`, `/issues`, `/issues/new`, `/issues/:id`, `/users`; wraps all pages in `Layout` via `children` |
| `components/Layout.jsx` | Shell, brand, `NavLink` navigation; renders `{children}` in `<main>` |
| `components/StatusBadge.jsx`, `PriorityBadge.jsx` | Presentational; receive `status` / `priority` props |
| `components/LoadingMessage.jsx`, `ErrorMessage.jsx` | Reusable feedback; `ErrorMessage` optional `onRetry` |
| `components/GraphQLDemo.jsx` | Field-selectable `issues` query; `createIssue` mutation with variables; props: `users`, `onIssueCreated` |
| `pages/Dashboard.jsx` | `api.getIssues()` → computes stats client-side; recent 5 issues |
| `pages/Issues.jsx` | REST list, filters object → `api.getIssues(filters)`; quick status `api.updateIssue`; delete with confirm; loads `users` for assignee filter; embeds `GraphQLDemo` |
| `pages/CreateIssue.jsx` | Controlled form; `api.getUsers()` for assignee; `api.createIssue()` |
| `pages/IssueDetail.jsx` | `api.getIssue(id)` + `api.updateIssue` / `api.deleteIssue`; reopen closed issues |
| `pages/Users.jsx` | `api.getUsers({ search })` with debounced search; `api.createUser()` |
| `services/api.js` | `fetch` wrapper; expects `{ success, data }` / `{ success: false, error }` |
| `services/graphql.js` | `graphqlRequest(query, variables)`; throws if `body.errors` present |
| `styles/global.css` | Layout, cards, forms, tables, GraphQL demo styles |

**State patterns:** Page-level `useState`; `Issues` uses `useCallback` for `loadIssues` depending on `filters`; async load via `useEffect`.

**Dev proxy:** `client/vite.config.js` proxies `/api` and `/graphql` to `http://localhost:5000`.

### 2.2 Backend (`server/src`)

| Area | Responsibility |
|------|----------------|
| `server.js` | Loads `.env`; requires `MONGODB_URI`; `connectDatabase()` then `listen`; SIGINT/SIGTERM shutdown |
| `app.js` | `cors`, `express.json()`, `requestLogger`, `/api` routes, `setupGraphQL`, 404 + error handlers |
| `config/db.js` | `connectDatabase`, `disconnectDatabase`, `getConnectionState()` (mongoose `readyState === 1`) |
| `middleware/requireDatabase.js` | 503 `DATABASE_UNAVAILABLE` if not ready |
| `middleware/errorHandler.js` | JSON errors; no stack traces to client |
| `middleware/validateObjectId.js` | Invalid `:id` → 400 `INVALID_ID` |
| `routes/index.js` | `/health` **without** `requireDatabase`; then `requireDatabase`; `/users`, `/issues` |
| `controllers/*` | Thin HTTP layer; issues delegate to `issueService` |
| `services/issueService.js` | Filters, validation, assignee check, `listIssues`, `getIssueById`, `createIssueRecord` |
| `services/userService.js` | `listUsers({ search })` |
| `models/User.js`, `Issue.js` | Schemas, enums, `assignee` ref to User |
| `graphql/` | `typeDefs.js`, resolvers, `DateTime` scalar, enum mapping (`OPEN` ↔ `Open`), `setupGraphQL.js` |

**GraphQL surface (reference):** Queries `issues`, `issue`, `users`; Mutation `createIssue` only. Updates/deletes remain REST.

**Introspection:** Enabled when `NODE_ENV !== 'production'` (`NoSchemaIntrospectionCustomRule` in production). Verified in `server/tests/introspection.test.js`.

### 2.3 Tests (`server/tests/`)

| File | Focus |
|------|--------|
| `setup.js` | MongoDB Memory Server; clears collections between tests |
| `users.test.js` | User create, email normalize, duplicate, search |
| `issues.test.js` | Issue CRUD, filters, assignee, health when connected |
| `graphql.test.js` | Queries, mutation, filters, REST/GraphQL consistency |
| `health.test.js` | 503 health, blocked REST/GraphQL when DB unavailable (mocked) |
| `introspection.test.js` | Schema introspection rules |

Root scripts: `npm test`, `npm run lint`, `npm run build`, `npm run dev` (see root `package.json`).

---

## 3. Repository structure relevant to teaching

```
Issue tracker/                    # project root
├── package.json                  # dev, test, lint, build
├── .env.example                  # MONGODB_URI, PORT
├── client/
│   ├── src/main.jsx, App.jsx
│   ├── src/pages/                # 5 screens
│   ├── src/components/           # Layout, badges, GraphQLDemo, feedback
│   ├── src/services/api.js, graphql.js
│   └── vite.config.js            # proxy
├── server/
│   ├── src/server.js, app.js
│   ├── src/models/, services/, controllers/, routes/, middleware/
│   ├── src/graphql/
│   └── tests/
└── docs/
    ├── STUDENT_CODING_STAGES.md  # this file
    ├── SYLLABUS_COVERAGE.md
    ├── WORKSHOP_RUNBOOK.md
    └── demos/                    # Counter, class component, serverless notes
```

---

## 4. Data-flow reference (actual paths)

| # | Workflow | Frontend | API | Backend chain | Visible result |
|---|----------|----------|-----|---------------|----------------|
| 1 | Dashboard stats | `Dashboard.jsx` → `api.getIssues()` | `GET /api/issues` | `issueController.listIssues` → `issueService.listIssues` → `Issue` | Stat cards + recent list |
| 2 | Filter issues | `Issues.jsx` `filters` → `api.getIssues(filters)` | `GET /api/issues?search&status&priority&assignee` | `buildIssueFilter` in `issueService` | Table rows match filters |
| 3 | Create issue (REST) | `CreateIssue.jsx` → `api.createIssue` | `POST /api/issues` | `createIssueRecord` | Navigate to detail; issue in DB |
| 4 | Assign issue | `CreateIssue` / `IssueDetail` assignee select | `POST` or `PUT` with `assignee` id | `assertValidAssignee` | Assignee name in list |
| 5 | Edit / status / delete | `IssueDetail.jsx`, `Issues.jsx` quick status | `PUT` / `DELETE` | `issueController` + service | Updated row or removed |
| 6 | Users search/create | `Users.jsx` | `GET/POST /api/users` | `userController` + `userService` / `User` model | Table updates; 409 on duplicate email |
| 7 | GraphQL list | `GraphQLDemo.jsx` → `graphqlRequest` | `POST /graphql` query `issues` | resolvers → `issueService` | JSON with selected fields only |
| 8 | GraphQL create | `GraphQLDemo` mutation + variables | `POST /graphql` `createIssue` | `createIssueRecord` | Success message; REST refresh via `onIssueCreated` |
| 9 | Validation error | Forms / `api.js` / `graphql.js` | 400 or GraphQL `errors` | `AppError` / `toGraphQLError` | Inline or alert message |
| 10 | DB unavailable | Any data fetch | `503` on `/api/*` (except health), `/graphql` | `requireDatabase` / health 503 | Error UI or failed fetch message |

---

## 5. Dependencies between stages

```
Stage 1 (static UI, routes, Layout)
  → 2 (props, badges, children)
    → 3 (controlled forms, client validation)
      → 4 (Counter demo — parallel React state literacy)
        → 5 (Express + health; no DB required yet)
          → 6 (Mongoose + REST CRUD + services)
            → 7 (api.js + load Issues/Dashboard)
              → 8 (Users, create/edit, filters, assignee, dashboard polish)
                → 9 (GraphQL schema, queries, DateTime, introspection)
                  → 10 (mutation, GraphQLDemo, errors, npm test)
```

**Teaching dependencies (code-grounded):**

- `App.jsx` routes assume `Layout` + pages exist (Stage 1 before 7–8).
- `api.getIssues(filters)` requires query support in `issueService.buildIssueFilter` (Stage 6 before 8).
- Assignee dropdown requires `GET /api/users` (Stage 6–7).
- `GraphQLDemo` requires `users` from parent and working `/graphql` (Stages 7–9 before 10).
- GraphQL enums differ from REST strings (`OPEN` vs `Open`) — teach when introducing Stage 9.

---

## 6. Existing assets, gaps, and coupling notes

| Asset | Use |
|-------|-----|
| Reference repo | Solution mapping per stage |
| `docs/demos/CounterDemo.jsx` | Counter lab (not in main router) |
| `docs/demos/ClassGreetingDemo.jsx` | Class components |
| `docs/demos/serverless-hello-world.md` | Serverless contrast lecture |
| `server/tests/*` | Instructor verification; students run in Stage 10 |
| `SYLLABUS_COVERAGE.md` | High-level topic map |

**Gaps / not in main app:** class components, Counter, serverless deployment, user delete API, GraphQL update/delete, authentication.

**Coupled areas (hard to split):** `Issues.jsx` combines REST table, filters, user load, and `GraphQLDemo` — Stage 8 and 10 may be instructor-led integration. Shared `issueService` is correct architecturally but bundles validation used by both REST and GraphQL.

**Students unlikely to finish in 9h:** Full GraphQL layer + full test suite + all pages. See timetable minimum viable scope.

---

## 7. Ten student coding stages

---

### Stage 1 — Application shell, routing, and static issue list

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~60 minutes |
| **Schedule** | Day 1, 9:00–10:00 AM |
| **Prerequisites** | HTML/CSS/JS basics; Node installed |
| **Objectives** | Vite React app structure; routes; composition with `Layout` and `children` |
| **Syllabus** | React components, Issue Tracker example, composing components, children |

#### Starting point

Empty or template Vite React app. No backend. No API calls.

#### Exact coding work

**Create/modify (students):**

1. `client/index.html`, `client/src/main.jsx` — mount app (instructor may scaffold Vite).
2. `client/src/App.jsx` — `Routes` for `/`, `/issues`, `/issues/new`, `/users` (detail route can be stubbed).
3. `client/src/components/Layout.jsx` — header, `navItems`, `{children}` in `<main>`.
4. `client/src/pages/Issues.jsx` — **hardcoded array** of 3 issues (`title`, `status`, `priority`).
5. `client/src/styles/global.css` — minimal `.app-shell`, `.card`, `.main-nav`.
6. Placeholder pages: `Dashboard.jsx`, `CreateIssue.jsx`, `Users.jsx` with heading only.

**Order:** Layout → App routes → static Issues list → CSS.

**Deferred:** Badges, API, backend.

#### Expected behavior

- `http://localhost:5173/issues` shows three static issues.
- Navigation links change URL; Layout persists.

#### Verification checklist

- [ ] Brand shows “SprintBoard” / subtitle
- [ ] Four nav links render
- [ ] Issues list is not empty without any server running

#### Completion criteria

Routing and static Issues page work; no console errors.

#### Likely mistakes

- Forgetting `BrowserRouter` in `main.jsx` → blank page.
- Not wrapping routes with `Layout` → missing nav.

#### Reference mapping

`client/src/main.jsx`, `App.jsx`, `components/Layout.jsx`, `pages/Issues.jsx` (replace static array with API in Stage 7), `styles/global.css`.

#### Incremental checkpoint

Demo: navigate all routes; static issues visible only on `/issues`.

---

### Stage 2 — Props, presentational components, and children

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~50 minutes |
| **Schedule** | Day 1, 10:00–10:50 AM |
| **Prerequisites** | Stage 1 |
| **Objectives** | Props; stateless child components; `Layout` children pattern |
| **Syllabus** | Props, children, dynamic composition, stateless components |

#### Starting point

Static issue list with inline status/priority text.

#### Exact coding work

1. **Create** `client/src/components/StatusBadge.jsx` — prop `status`; CSS classes `status-open`, `status-in-progress`, `status-closed` (match reference `global.css`).
2. **Create** `client/src/components/PriorityBadge.jsx` — prop `priority`.
3. **Modify** `Issues.jsx` — map issues to rows using badges.
4. **Optional:** Extract row snippet into `IssueRow.jsx` (proposed teaching file; reference inlines in table).

**Reuse:** `Layout` unchanged; still static data.

#### Expected behavior

Changing a prop in parent updates badge label/color.

#### Verification checklist

- [ ] Each issue shows `StatusBadge` and `PriorityBadge`
- [ ] `Layout` still renders page via `children`
- [ ] No duplicate badge markup in list loop

#### Completion criteria

Badges used for every issue; props typed correctly (`status` strings: `Open`, `In Progress`, `Closed`).

#### Likely mistakes

- CSS class mismatch (`In Progress` vs `in-progress` slug in reference).
- Passing wrong prop name (`issueStatus` vs `status`).

#### Reference mapping

`components/StatusBadge.jsx`, `PriorityBadge.jsx`, `Issues.jsx`, `global.css` badge rules.

#### Incremental checkpoint

Show one issue with different props in DevTools.

---

### Stage 3 — Controlled forms and client-side validation

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~55 minutes |
| **Schedule** | Day 1, 10:50 AM–12:00 PM (incl. buffer) |
| **Prerequisites** | Stage 2 |
| **Objectives** | Controlled inputs; validation messages; prevent invalid submit |
| **Syllabus** | Form enhancement and validation, event handling |

#### Starting point

Static issues; `CreateIssue` is a stub.

#### Exact coding work

1. **Modify** `client/src/pages/CreateIssue.jsx`:
   - `useState` for `title`, `description`, `priority`, `status`.
   - Validate: title required; description min length 10.
   - `fieldErrors` object; `onSubmit` `preventDefault`.
2. **Modify** `global.css` — `.field-error`, `.form-card`.
3. **No API yet** — on valid submit, `alert` or append to local state list (proposed: temporary `console.log`).

**Deferred:** Assignee dropdown (needs users API, Stage 8).

#### Expected behavior

Short description blocks submit; errors appear under fields.

#### Verification checklist

- [ ] Empty title shows error
- [ ] Description `"short"` rejected
- [ ] Valid form runs submit handler once

#### Completion criteria

Create Issue form fully controlled with client validation only.

#### Likely mistakes

- Uncontrolled inputs (no `value` + `onChange`).
- Validating only on server later — no client feedback.

#### Reference mapping

`pages/CreateIssue.jsx` (full version adds `api.createIssue`, `api.getUsers`, navigate).

#### Incremental checkpoint

Submit valid form locally; invalid form shows errors.

---

### Stage 4 — React state, events, and Counter exercise (parallel literacy)

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~40 minutes (student); +15 min instructor tie-in |
| **Schedule** | Day 1, 2:00–2:40 PM (start of afternoon) |
| **Prerequisites** | Stage 3 |
| **Objectives** | State updates; async init; events — **separate from SprintBoard routes** |
| **Syllabus** | State, updating state, async initialization, events |

#### Starting point

SprintBoard pages from Stages 1–3.

#### Exact coding work

**Separate instructor-led demo (not mounted in reference `App.jsx`):**

- Follow or copy `docs/demos/CounterDemo.jsx` in a **new mini Vite app** or temporary route `proposed: /counter-lab` (not in reference repo).

Students implement: `useState(0)`; `useEffect` + 500ms delay before showing counter; buttons increment, decrement, double, reset.

**SprintBoard:** No file changes required in reference app for this stage.

#### Expected behavior

Counter lab works in isolation; students can explain functional state updates.

#### Verification checklist

- [ ] All four operations change displayed count
- [ ] Loading message appears before counter
- [ ] Students can relate Counter state to `CreateIssue` form state

#### Completion criteria

Counter demo complete; students articulate difference between local UI state and server-backed state (preview Stage 7).

#### Likely mistakes

- Mutating state directly (`count++` without setter).
- Missing `useEffect` cleanup for timer.

#### Reference mapping

`docs/demos/CounterDemo.jsx` (reference copy for instructors).

#### Incremental checkpoint

Live Counter only — do not block afternoon backend on this.

---

### Stage 5 — Express application, middleware, and health endpoint

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~65 minutes |
| **Schedule** | Day 1, 2:40–3:45 PM |
| **Prerequisites** | Stage 4; basic HTTP/JSON |
| **Objectives** | Express app factory; JSON body; logging; health JSON |
| **Syllabus** | Express, REST fundamentals, middleware |

#### Starting point

Frontend-only project; **proposed:** add `server/` folder.

#### Exact coding work

1. **Create** `server/package.json`, `server/src/app.js` — `express()`, `cors()`, `express.json()`, `requestLogger`.
2. **Create** `server/src/middleware/requestLogger.js`.
3. **Create** `server/src/utils/errors.js` — `sendSuccess`, `sendError`, `AppError`.
4. **Create** `server/src/routes/healthRoutes.js`, `healthController.js` — `GET /api/health` returns `{ success: true, data: { service: 'ok' } }` (DB fields added in Stage 6).
5. **Create** `server/src/server.js` — listen on `PORT` (**MongoDB connection deferred to Stage 6** for teaching split, or instructor provides full `server.js` early).

**Instructor scaffolding option:** Provide `createApp()` from reference without DB so students focus on middleware first.

#### Expected behavior

`curl http://localhost:5000/api/health` returns JSON success.

#### Verification checklist

- [ ] `express.json()` parses POST body in a test route (optional `POST /api/echo` teaching route — **proposed**, not in reference)
- [ ] Invalid JSON handled (reference: `errorHandler` SyntaxError → 400)
- [ ] Logger prints method and path

#### Completion criteria

Server starts; health endpoint returns consistent `{ success, data }` shape.

#### Likely mistakes

- Missing `express.json()` → `req.body` undefined.
- Wrong path prefix (`/health` vs `/api/health`).

#### Reference mapping

`server/src/app.js`, `middleware/requestLogger.js`, `routes/healthRoutes.js`, `controllers/healthController.js`, `utils/errors.js`, `middleware/errorHandler.js`.

#### Incremental checkpoint

Health check only — no issues yet.

---

### Stage 6 — Mongoose models, shared services, and REST CRUD

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~90 minutes (often split across Day 1 end + Day 2 start) |
| **Schedule** | Day 1, 3:45–5:00 PM (partial); Day 2, 9:00–10:15 AM |
| **Prerequisites** | Stage 5; MongoDB running; `.env` with `MONGODB_URI` |
| **Objectives** | Models; persistence; assignee validation; REST issue/user endpoints |
| **Syllabus** | MERN MongoDB layer, Mongoose, Express REST CRUD lab |

#### Starting point

Express with health only.

#### Exact coding work

1. **Create** `server/src/config/db.js`; **update** `server.js` to `connectDatabase` before listen (exits on failure).
2. **Create** `models/User.js`, `models/Issue.js` (match enums and `assignee` ref).
3. **Create** `services/issueService.js`, `userService.js` — filters, `assertValidAssignee`, `createIssueRecord`, `listUsers`.
4. **Create** controllers and routes: `userRoutes`, `issueRoutes`, wire in `routes/index.js`.
5. **Add** `middleware/validateObjectId.js`, `requireDatabase` on routes after health (reference: `routes/index.js`).
6. **Update** `healthController` — 503 when `!db.ready`.

**Order:** models → services → routes → connect DB.

#### Expected behavior

- `POST /api/users` creates user; duplicate email → 409 `DUPLICATE_EMAIL`.
- `POST /api/issues` with description &lt; 10 chars → 400.
- `GET /api/issues?status=Open` filters correctly.
- Invalid assignee → 400 `INVALID_ASSIGNEE`.

#### Verification checklist

- [ ] `npm test` — `users.test.js`, `issues.test.js` pass (instructor runs)
- [ ] `GET /api/issues` returns `{ success: true, data: [...] }`
- [ ] Populated assignee includes `name`, `email` on GET issue

#### Completion criteria

Full REST CRUD for issues and create/list for users; MongoDB required to start server.

#### Likely mistakes

- Wrong `MONGODB_URI` or MongoDB not running → server exit on startup.
- Skipping `requireDatabase` → confusing errors vs 503 when DB down.
- Assignee passed as name string instead of ObjectId.

#### Reference mapping

`models/*`, `services/*`, `controllers/issueController.js`, `userController.js`, `routes/*`, `config/db.js`, `middleware/requireDatabase.js`, tests `users.test.js`, `issues.test.js`, `health.test.js`.

#### Incremental checkpoint

Postman/create issue and list via REST only — frontend still static.

---

### Stage 7 — REST API client and data-driven Dashboard / Issues

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~75 minutes |
| **Schedule** | Day 2, 10:15–11:30 AM |
| **Prerequisites** | Stage 6; Vite proxy configured |
| **Objectives** | `fetch` service layer; loading/error; replace static data |
| **Syllabus** | Async state initialization, API integration lab |

#### Starting point

REST API works; frontend still static.

#### Exact coding work

1. **Create** `client/src/services/api.js` — `parseResponse`, `api.getIssues`, `getIssue`, `createIssue`, etc. (match reference exports).
2. **Create** `LoadingMessage.jsx`, `ErrorMessage.jsx`.
3. **Modify** `Issues.jsx` — remove static array; `useEffect` + `loadIssues`; loading/error UI.
4. **Modify** `Dashboard.jsx` — `api.getIssues()`; compute `stats` and `recent` like reference.
5. **Modify** `client/vite.config.js` — proxy `/api` to port 5000.

#### Expected behavior

Issues and Dashboard reflect database; spinner then data; error shows retry.

#### Verification checklist

- [ ] Network tab shows `GET /api/issues` from port 5173 (proxied)
- [ ] Dashboard totals match issue count
- [ ] Stopping backend shows error state (not fake data)

#### Completion criteria

No hardcoded issue list in `Issues.jsx` or `Dashboard.jsx`.

#### Likely mistakes

- Forgetting proxy → CORS or wrong host.
- Not handling `success: false` in `parseResponse`.

#### Reference mapping

`services/api.js`, `pages/Dashboard.jsx`, `pages/Issues.jsx` (without filters/GraphQL sections yet), `components/LoadingMessage.jsx`, `ErrorMessage.jsx`, `vite.config.js`.

#### Incremental checkpoint

Create issue via Postman; refresh browser — new issue appears.

---

### Stage 8 — Users, create/edit flows, filters, assignment, and issue actions

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~90 minutes (minimum viable: 60 with instructor starter for `IssueDetail`) |
| **Schedule** | Day 2, 11:30 AM–12:00 PM (partial); **overflow: homework / extended lab** |
| **Prerequisites** | Stage 7 |
| **Objectives** | Full REST UX; filters; assignee; delete confirm; user management |
| **Syllabus** | Lifting state (users passed to child later), component communication, validation |

#### Starting point

Dashboard + Issues load from API; Create Issue has client validation only.

#### Exact coding work

1. **Modify** `Issues.jsx` — `filters` state; `useCallback` `loadIssues(filters)`; filter UI; `handleQuickStatus` → `api.updateIssue`; delete with `window.confirm`.
2. **Modify** `CreateIssue.jsx` — `api.getUsers()`, assignee select; `api.createIssue`; navigate to `/issues/:id`.
3. **Implement** `IssueDetail.jsx` — load by `useParams().id`; save, delete, reopen.
4. **Implement** `Users.jsx` — search debounce; add user form; `api.createUser`.
5. **Wire** route `/issues/:id` in `App.jsx` if not done.

#### Expected behavior

End-to-end REST workflow: add user → create assigned issue → filter list → edit status → delete.

#### Verification checklist

- [ ] `GET /api/issues?search=...` matches UI search box
- [ ] Duplicate user email shows API error message
- [ ] Assignee column shows `name (email)` when populated
- [ ] Delete requires confirmation

#### Completion criteria

All five routes functional with REST; GraphQL section not required yet.

#### Likely mistakes

- Filter state reset on every keystroke incorrectly (reference keeps single `filters` object).
- `assignee` empty string vs `null` — reference sends `null` for unassigned.
- Stale list after create — missing reload/navigation.

#### Reference mapping

`pages/Issues.jsx`, `CreateIssue.jsx`, `IssueDetail.jsx`, `Users.jsx`, `api.js` methods used by each.

#### Incremental checkpoint

Full REST demo without GraphQL block.

**Workshop note:** This stage often **exceeds** remaining Day 2 morning time — assign `IssueDetail` + `Users` as homework using reference files.

---

### Stage 9 — GraphQL schema, queries, DateTime scalar, and introspection

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~75 minutes (instructor-heavy) |
| **Schedule** | **Typically post-workshop lab** or flipped content; if in class: extend Day 2 with optional session |
| **Prerequisites** | Stage 6 services (shared logic) |
| **Objectives** | Schema types; resolvers; enum mapping; DateTime; introspection |
| **Syllabus** | GraphQL schema, list API, custom scalar, introspection, strongly typed schema |

#### Starting point

REST full stack working.

#### Exact coding work

1. **Add dependencies** (instructor): `graphql`, `graphql-http`, `@graphql-tools/schema`.
2. **Create** `graphql/schema/typeDefs.js`, `resolvers/index.js`, `scalars/DateTime.js`, `enums.js`, `mappers.js`, `errors.js`, `setupGraphQL.js`, `graphql/index.js`.
3. **Modify** `app.js` — `setupGraphQL(app)`; proxy `/graphql` in Vite.
4. Resolvers call **`issueService` / `userService`** — no duplicate business rules.

Students: implement Query `issues`, `issue`, `users`; wire DateTime; test introspection in dev.

**Deferred:** Mutation to Stage 10.

#### Expected behavior

POST GraphQL query returns only requested fields; `createdAt` as ISO string; `__schema` works when `NODE_ENV` not `production`.

#### Verification checklist

- [ ] `server/tests/graphql.test.js` list/subset field tests (instructor)
- [ ] `server/tests/introspection.test.js` passes
- [ ] Same issue `id` from REST and GraphQL matches title/description

#### Completion criteria

GraphQL queries operational; shared DB with REST.

#### Likely mistakes

- GraphQL enum `IN_PROGRESS` vs REST `"In Progress"` — must use `enums.js` mapping.
- Forgetting `requireDatabase` on `/graphql` → 503 when DB down (expected).

#### Reference mapping

Entire `server/src/graphql/` tree; `setupGraphQL.js`; `tests/graphql.test.js`, `introspection.test.js`.

#### Incremental checkpoint

GraphQL Playground/Postman query `issues { id title }` only.

---

### Stage 10 — GraphQL mutation, frontend demo, errors, and regression tests

#### Identity

| Field | Value |
|-------|--------|
| **Duration** | ~60 minutes |
| **Schedule** | Post-workshop or capstone lab |
| **Prerequisites** | Stages 8–9 |
| **Objectives** | Mutation with variables; `GraphQLDemo`; error display; `npm test` / lint / build |
| **Syllabus** | Create API, query variables, validation/errors, REST vs GraphQL |

#### Starting point

GraphQL queries work; REST Issues page without demo section.

#### Exact coding work

1. **Mutation** `createIssue` in resolvers (already in reference `typeDefs`) — students wire input validation via `issueService.createIssueRecord`.
2. **Create** `client/src/services/graphql.js`.
3. **Create** `components/GraphQLDemo.jsx` — field toggles, `graphqlRequest`, mutation variables, `onIssueCreated` → parent `loadIssues`.
4. **Modify** `Issues.jsx` — import demo; pass `users` prop.
5. **CSS** — `.graphql-demo` section in `global.css`.

#### Expected behavior

GraphQL create shows success JSON; REST table refreshes; validation error from GraphQL shows `form-error` / `listError` without silent success.

#### Verification checklist

- [ ] `npm test` — full suite (`users`, `issues`, `graphql`, `health`, `introspection`)
- [ ] `npm run lint` and `npm run build` (root scripts)
- [ ] Mutation with invalid short description returns GraphQL `errors[0].extensions.code` `VALIDATION_ERROR`

#### Completion criteria

Reference parity for teaching scope: REST CRUD + GraphQL query/mutation demo.

#### Likely mistakes

- Treating HTTP 200 as success when `errors` array present — `graphql.js` must throw.
- Wrong variable shape (`input` wrapper required).
- Building query string without selected fields — syntax error in GraphQL document.

#### Reference mapping

`GraphQLDemo.jsx`, `services/graphql.js`, `Issues.jsx`, `graphql/resolvers` Mutation, `tests/graphql.test.js`.

#### Incremental checkpoint

Side-by-side: Network `GET /api/issues` vs minimal GraphQL query payload size (qualitative).

---

## 8. Nine-hour workshop timetable

**Total contact time:** 9 hours (540 minutes).  
**Planned instructional time in stages:** ~660 minutes — **does not fit** without compression.

### Recommended live scope (minimum viable in 9h)

| In class (students type) | Instructor demo / starter code |
|--------------------------|--------------------------------|
| Stages 1–3 (frontend) | Vite scaffold |
| Stage 4 Counter | `docs/demos/CounterDemo.jsx` |
| Stage 5–6 (partial) | Full `issueService`, tests explained |
| Stage 7 (api + Dashboard + basic Issues) | — |
| Stage 8 (partial) | Provide `IssueDetail.jsx`, `Users.jsx` as read-and-extend |
| Stages 9–10 | Live demo reference GraphQL; students run queries |

**Expected student outcome after 9h:** Working React UI + REST integration + create/list issues and users; GraphQL understood via demo, not necessarily fully implemented.

### Consolidated schedule

| Time block | Stage(s) | Instructor | Live code | Student work | Test/debug |
|------------|----------|------------|-----------|--------------|------------|
| **Day 1 9:00–10:00** | 1 | 15m MERN intro | 20m Layout/routes | 25m static Issues | — |
| **10:00–10:50** | 2 | 10m props/children | 15m badges | 25m integrate | — |
| **10:50–12:00** | 3 | 10m validation | 15m CreateIssue form | 35m exercise | 10m share |
| **12:00–14:00** | — | Break | | | |
| **14:00–14:40** | 4 | Counter demo | Walkthrough `CounterDemo.jsx` | Pair practice | — |
| **14:40–15:45** | 5 | Express architecture | `app.js` + health | Students replicate health | `curl` health |
| **15:45–17:00** | 6 (start) | Mongoose models | Models + one POST route | Wire `POST /api/issues` | Postman; intro `npm test` |
| **Day 2 9:00–10:15** | 6 (cont.) | Services pattern | `issueService` filters | REST CRUD pairs | `npm test` users+issues |
| **10:15–11:30** | 7 | `api.js` pattern | Proxy + Dashboard | Connect Issues list | Browser Network tab |
| **11:30–12:00** | 8 (start) | Filters + users | Demo full REST flow | Start filters OR homework | Recap |

**Buffer:** 10–15 minutes per half-day for MongoDB/login issues (see README troubleshooting).

**If time short:** Demo Stages 9–10 from reference repo; assign mutation + `GraphQLDemo` as take-home using Stage 10 checklist.

---

## 9. Separate syllabus demonstrations (not extra stages)

| Topic | Asset | When | Connection to SprintBoard | Student role |
|-------|-------|------|---------------------------|--------------|
| **Class components** | `docs/demos/ClassGreetingDemo.jsx` | Day 1 morning after Stage 2 | Contrast with functional `Layout` / badges | Type along in separate file; not imported by `App.jsx` |
| **Counter lab** | `docs/demos/CounterDemo.jsx` | Day 1 afternoon Stage 4 | Same state ideas as forms/filters | Implement in mini app |
| **Serverless Hello World** | `docs/demos/serverless-hello-world.md` | Day 1 Express intro or Day 2 wrap | Compare to persistent `server.js` + MongoDB | Observe instructor demo; no serverless in SprintBoard |

**Do not** describe SprintBoard as serverless.

---

## 10. Syllabus coverage mapping (summary)

Full matrix: [SYLLABUS_COVERAGE.md](./SYLLABUS_COVERAGE.md).

| Unit | Covered in stages | Separate demo only |
|------|---------------------|--------------------|
| III — components, props, children, forms | 1–3 | Class components (demo) |
| III — MERN intro | 5–6 | Serverless (lecture) |
| IV — state, events, async | 3–4, 7–8 | Counter |
| IV — Express REST | 5–8 | — |
| IV — GraphQL | 9–10 | — |

---

## 11. Instructor preparation checklist

- [ ] MongoDB local or Atlas verified **before class** (reference README; live connection not verified in doc-only audits unless instructor runs it)
- [ ] `npm run install:all`, `npm test`, `npm run dev` on instructor machine
- [ ] `.env` template copied; no real credentials in slides
- [ ] Postman collection or sample `curl` for issues/users
- [ ] GraphQL sample query + mutation variables prepared
- [ ] Counter and class demos open in editor
- [ ] Decide homework: Stage 8 completion + Stage 10 for advanced section
- [ ] Clone/tag reference commit for diff against student work

---

## 12. Student completion checklist

- [ ] Navigate all routes; UI matches teaching stage reached
- [ ] Can explain one props flow and one `useEffect` data load
- [ ] Created user and issue via REST with validation
- [ ] Can read Network tab for `/api/issues` and describe JSON shape
- [ ] Saw GraphQL field selection vs REST (demo or own Stage 10)
- [ ] Knows `npm test` validates backend (even if not written by student)
- [ ] Documents own `MONGODB_URI` setup steps

---

## 13. Known limitations and unverified assumptions

| Item | Status |
|------|--------|
| Live MongoDB in workshop room | **Requires instructor verification** — app `server.js` exits if connection fails |
| Exact `npm test` pass count | Repository contains **34** test cases in `server/tests/`; run `npm test` to confirm all pass before teaching |
| Rebuilding entire GraphQL layer in 9h | **Unrealistic** for most groups — use reference + targeted exercises |
| User delete / orphan assignees | No user DELETE API in reference; assignee validated on write only |
| `WORKSHOP_RUNBOOK.md` stage timing | Older runbook is session-themed; this document’s timetable supersedes for **stage allocation** (runbook still useful for logistics) |
| Student portal / staged code drops | **Not implemented** — stages are documentation only |

---

## 14. Documentation vs code discrepancies

| Documentation | Code truth |
|---------------|------------|
| Prior short `STUDENT_CODING_STAGES.md` | Replaced by this blueprint; stage count remains **10** |
| README test count | Matches 34 tests in `server/tests/*.test.js` (static count; execute to verify pass) |
| SYLLABUS “lifting state up” | Only partial via `GraphQLDemo` props — filters are local to `Issues.jsx` |
| GraphQL status values | API uses `OPEN` / `IN_PROGRESS` / `CLOSED`; REST uses `Open`, `In Progress`, `Closed` — mapping in `server/src/graphql/enums.js` |

---

*End of blueprint. Application source, tests, and dependencies were not modified to produce this document.*
