# SprintBoard — Nine-Hour Workshop Runbook

**Audience:** 7th-semester ISE students  
**Project:** SprintBoard (Issue Tracker) — MERN + REST + GraphQL  
**Total contact time:** 9 hours (Day 1: 9:00–12:00, 14:00–17:00; Day 2: 9:00–12:00)

---

## 1. Learning objectives

By the end of the workshop, students should be able to:

- Explain the MERN layers and how SprintBoard routes data from React to Express to MongoDB.
- Build and modify React components using props, state, events, and composition.
- Call REST endpoints with `fetch` and handle loading, success, and error states.
- Describe Mongoose models, validation, and relationships (issue assignee → user).
- Contrast REST fixed responses with GraphQL field selection and a single endpoint.
- Run automated API tests and interpret failures safely.
- Troubleshoot common local setup issues (MongoDB, ports, proxy).

---

## 2. Prerequisites and software

| Tool | Version |
|------|---------|
| Node.js | 18+ (20+ recommended) |
| npm | Bundled with Node |
| MongoDB | Local 6+ **or** Atlas cluster |
| Editor | VS Code or Cursor |
| Browser | Chrome/Edge/Firefox |

Optional: Postman or Apollo Sandbox for GraphQL experiments.

**Instructor pre-flight:** Verify MongoDB is reachable **before** the session. Automated tests in this repo use MongoDB Memory Server; the **running app requires a real `MONGODB_URI`**.

---

## 3. Verified startup procedure (Windows PowerShell)

From the project root (adjust path):

```powershell
cd "C:\Users\ADMIN\Downloads\Career Lens\Issue tracker"
copy .env.example .env
# Edit .env — set MONGODB_URI

npm install
npm run install:all
npm test
npm run build
npm run dev
```

- Frontend: http://localhost:5173  
- REST: http://localhost:5000/api/health  
- GraphQL: POST http://localhost:5000/graphql  

Unix/macOS: use `cp .env.example .env` instead of `copy`.

---

## 4. Architecture (15-minute overview)

```
Browser (React + Vite)
   |  REST /api/*
   |  GraphQL /graphql
   v
Express (server/src)
   |  services (shared validation)
   v
Mongoose models → MongoDB
```

Emphasize: **one database**, two API styles for teaching comparison.

---

## 5. Schedule

### Day 1 — Morning (9:00–12:00)

| Time | Topic | Activity |
|------|-------|----------|
| 9:00–9:30 | Setup & objectives | Students clone/open project, install deps, instructor verifies MongoDB |
| 9:30–10:15 | React UI tour | Dashboard, Issues, Users; component tree on board |
| 10:15–10:30 | Break | |
| 10:30–11:15 | Props, composition, forms | Walk `Layout`, badges, Create Issue validation |
| 11:15–12:00 | State & events | Issues filters; optional `docs/demos/CounterDemo.jsx` live coding |

**Participation:** Ask students to predict what happens when filters change; one volunteer traces a form submit.

### Day 1 — Afternoon (14:00–17:00)

| Time | Topic | Activity |
|------|-------|----------|
| 14:00–15:00 | Express & REST | `server/src/routes`, Postman/`curl` for `GET/POST /api/issues` |
| 15:00–15:45 | Mongoose models | User/Issue schemas, assignee validation in services |
| 15:45–16:00 | Break | |
| 16:00–17:00 | Frontend integration | `api.js`, loading/error states, create user + issue live |

**Participation:** Break students into pairs; one calls REST, one watches Network tab.

### Day 2 — Morning (9:00–12:00)

| Time | Topic | Activity |
|------|-------|----------|
| 9:00–10:00 | GraphQL concepts | Schema file, enums, DateTime scalar |
| 10:00–10:45 | GraphQL in UI | Issues page demo: field toggles + `createIssue` variables |
| 10:45–11:00 | REST vs GraphQL | Side-by-side: `GET /api/issues` vs minimal `issues { id title }` query |
| 11:00–12:00 | Testing & debugging | Run `npm test`; read a failing test together; health check `/api/health` |

**Participation:** Students write one GraphQL query selecting only `title` and `status`.

---

## 6. REST vs GraphQL demonstration script

1. Open Issues page — explain REST table load.
2. Scroll to GraphQL section — run query with only `id`, `title`, `status`.
3. Show Network payload difference (qualitative, not “GraphQL is always faster”).
4. Create issue via GraphQL mutation; refresh REST table to prove shared MongoDB data.

---

## 7. Testing demonstration

```powershell
npm test
```

Point out:

- Memory Server isolation (safe for laptops).
- GraphQL + REST suites.
- Health tests for disconnected database behavior.

---

## 8. Common failures and troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Server exits immediately | `MONGODB_URI` missing/invalid | Copy `.env.example`, start MongoDB or fix Atlas URI |
| `ECONNREFUSED` on API | Backend not running | `npm run dev:server` |
| Frontend API errors | Backend down or proxy issue | Confirm port 5000; check `client/vite.config.js` proxy |
| Empty issues after create | Wrong database | Ensure single `MONGODB_URI` for dev |
| GraphQL errors with `errors` array | Validation | Read `message` and `extensions.code`; HTTP may still be 200 |
| Tests fail on Memory Server download | npm 11 script approval | `cd server; npm approve-scripts mongodb-memory-server` |
| `/api/health` returns 503 | DB disconnected mid-session | Restart MongoDB and Express |

---

## 9. Closing recap (last 15 minutes)

- MERN flow demonstrated end-to-end.
- REST for full CRUD in SprintBoard; GraphQL for query/mutation teaching subset.
- Point students to `docs/STUDENT_CODING_STAGES.md` for self-paced rebuild.
- Assign: add one user, two issues, one GraphQL query with custom fields.

---

## 10. Instructor checklist

- [ ] MongoDB verified live (not assumed from tests alone)
- [ ] `npm test` passes on instructor machine
- [ ] `npm run dev` starts both processes
- [ ] Sample GraphQL query prepared in clipboard
- [ ] Separate demos ready if teaching class components or Counter
