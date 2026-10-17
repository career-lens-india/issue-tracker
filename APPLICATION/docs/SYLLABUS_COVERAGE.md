# SprintBoard — Syllabus Coverage Matrix

This matrix maps **Full Stack Development** syllabus topics (Units III–IV and related labs) to SprintBoard. Status meanings:

| Status | Meaning |
|--------|---------|
| **Implemented** | Working code in this repository |
| **Partial** | Concept demonstrated with gaps or different lab example |
| **Separate demo** | Instructor uses files under `docs/demos/` or an external exercise |
| **Not covered** | Requires instructor lecture only |

---

## Unit III

| Syllabus topic | SprintBoard location | Status | How to teach / demonstrate |
|----------------|---------------------|--------|----------------------------|
| Form enhancement and validation | `client/src/pages/CreateIssue.jsx`, `IssueDetail.jsx`, `Users.jsx`; server validation in `server/src/services/*` | **Implemented** | Show client-side messages and matching API errors for short descriptions and duplicate emails |
| Introduction to MERN and its components | README architecture; `client/`, `server/`, MongoDB via Mongoose | **Implemented** | Walk through folder structure and data flow |
| Serverless Hello World | `docs/demos/serverless-hello-world.md` | **Separate demo** | Contrast short-lived functions with `server/src/server.js` |
| React components and Issue Tracker example | `client/src/pages/Issues.jsx`, issue components | **Implemented** | SprintBoard issues replace static lab list; same composition ideas |
| React class components | `docs/demos/ClassGreetingDemo.jsx` | **Separate demo** | Explain SprintBoard uses functional components by design |
| Composing components | `Layout.jsx`, badges, `GraphQLDemo.jsx` | **Implemented** | Trace parent/child tree from `App.jsx` |
| Passing data using props | `Layout` children, `StatusBadge`, `PriorityBadge`, `GraphQLDemo` props | **Implemented** | Change a prop in DevTools and observe UI |
| Children and dynamic composition | `Layout` wraps page content via `children` | **Implemented** | Add a temporary wrapper in `App.jsx` during class |

---

## Unit IV

| Syllabus topic | SprintBoard location | Status | How to teach / demonstrate |
|----------------|---------------------|--------|----------------------------|
| React state and initial state | All pages using `useState` | **Implemented** | Issues filters, create forms |
| Asynchronous state initialization | `Dashboard.jsx`, `Issues.jsx` `useEffect` + API | **Implemented** | Show loading spinners before data arrives |
| Updating state | Issue status dropdown, form edits | **Implemented** | Update issue status from Issues table |
| Lifting state up | `GraphQLDemo` receives `users` from `Issues.jsx` | **Partial** | Discuss shared filter state pattern on Issues page |
| Event handling | Form `onSubmit`, buttons, filter `onChange` | **Implemented** | Trace one submit handler end-to-end |
| Stateless components | `StatusBadge`, `LoadingMessage`, `ErrorMessage` | **Implemented** | Compare with stateful pages |
| Component design and hierarchy | `client/src/components`, `pages` | **Implemented** | Draw component tree on whiteboard |
| State versus props | Pages vs badges | **Implemented** | Quiz: which values belong in state vs props |
| Component communication | Parent refreshes list after child mutation (`onIssueCreated`) | **Implemented** | GraphQL demo callback after create |
| Express and REST APIs | `server/src/routes`, `controllers` | **Implemented** | Use browser Network tab on Issues page |
| GraphQL concepts (field selection, single endpoint) | `GraphQLDemo.jsx`, README GraphQL section | **Implemented** | Toggle fields and compare to REST payload size |
| Strongly typed schemas and introspection | `server/src/graphql/schema/typeDefs.js`, introspection tests | **Implemented** | Run `__schema` query in dev |
| GraphQL libraries and schema file | `graphql`, `graphql-http`, `typeDefs.js`, resolvers | **Implemented** | Open schema file in IDE |
| List API and integration | GraphQL `issues` / `users` queries + REST lists | **Implemented** | Same records via both APIs |
| Custom scalar types | `server/src/graphql/scalars/DateTime.js` | **Implemented** | Query `createdAt` on an issue |
| Create API and integration | GraphQL `createIssue` mutation + REST `POST /api/issues` | **Implemented** | Use demo form with variables |
| Query variables | `GraphQLDemo.jsx`, README examples | **Implemented** | Show variables JSON separate from document |
| Input validation and displaying errors | Services + `graphql.js` client error handling | **Implemented** | Submit invalid GraphQL mutation |

---

## Relevant practical labs

| Lab topic | SprintBoard mapping | Status | Notes |
|-----------|---------------------|--------|-------|
| React Issue Tracker with static data | Evolved to live API data in `Issues.jsx` | **Partial** | Lab starts static; SprintBoard is the integrated version |
| Counter (state updates, async init, inc/dec/double/reset) | `docs/demos/CounterDemo.jsx` | **Separate demo** | Not embedded in main app routing |
| Express REST CRUD with middleware and JSON | `server/src/app.js`, routes, `express.json()` | **Implemented** | Issues/users CRUD via REST |
| MongoDB/Mongoose + Express + React fetch flows | Models, services, `client/src/services/api.js` | **Implemented** | End-to-end create/list/update/delete |

---

## Topics intentionally not in SprintBoard

- Authentication, JWT, passwords, role-based access control
- Redux, WebSockets, payments, deployment pipelines
- Student code-release portal (future deliverable)
- Product catalog lab domain (SprintBoard uses **issues/users** as equivalent CRUD patterns)

---

## Honest gaps for instructors

1. **Class components** — separate demo file only.
2. **Counter lab** — separate demo file only.
3. **Serverless Hello World** — markdown outline only; not deployed from this repo.
4. **Static-to-dynamic Issue Tracker progression** — teach as narrative across student stages 1–7 in `STUDENT_CODING_STAGES.md`.
