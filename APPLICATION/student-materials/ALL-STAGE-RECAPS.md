# SprintBoard — all stage recaps (copy/paste)


---

## stage-01 / recap-before-solution.md

# Stage 1 — Before you view the solution

Use this after you finish the exercise and pass the verification checklist. The reference solution stays hidden until your instructor marks the stage **Completed**.

## You should be able to explain

- How **React Router** maps URLs (`/`, `/issues`, etc.) to page components.
- Why **Layout** wraps routes and how **children** (or `<Outlet />`) render the active page.
- The difference between **static in-memory data** and loading from an API (this stage uses static data on purpose).
- How a **presentational list** renders issue fields without mutating the source array.

## Self-check (without opening solution files)

- Can you draw the component tree from `main.jsx` down to `Issues`?
- Can you add a fourth static issue by editing one file and see it on `/issues`?
- Does the app run with **no backend** and no failed network requests?

## Common gaps to fix first

- Routes defined but nav links use wrong paths or full page reloads.
- Issue list hard-coded inside `App.jsx` instead of a dedicated page component.
- Missing shared layout so each page duplicates header/nav markup.

When these ideas feel solid, you are ready for your instructor to release the solution — or to move on confidently even before comparing code.

---

## stage-01 / recap-after-solution.md

# Stage 1 — After the solution is released

Your instructor marked this stage **Completed**, so you can open the **Solution** tab. Use it to **compare**, not to replace your own reasoning.

## What the reference solution demonstrates

- A clear **separation of pages** (Dashboard, Issues, Users, Create Issue placeholder) behind one Layout.
- **Centralized routing** in `App.jsx` (or equivalent) so URLs remain the single source of navigation truth.
- **Static seed data** colocated with the Issues view or imported as a module — still no REST calls.

## Compare your work

| Topic | Ask yourself |
|-------|----------------|
| File layout | Did you split pages into `pages/` the same way? Different folder names are fine if imports are consistent. |
| Layout | Does your Layout accept children/outlet the same way? |
| Styling | Global CSS vs modules — focus on structure, not pixel-perfect match. |

## Carry forward to Stage 2

- You will **reuse this client** and add **props** and small badge components.
- Keep routes and Layout stable; Stage 2 builds on this shell, not a rewrite.

If anything in the solution still confuses you, note one question for class — that is the goal of this recap.

---

## stage-02 / recap-before-solution.md

# Stage 2 — Before you view the solution

Complete verification first. Props and small components are the foundation for every later UI stage.

## You should be able to explain

- **Props** flow one way from parent to child; the child does not mutate props.
- **StatusBadge** and **PriorityBadge** as tiny, reusable, mostly stateless components.
- How **Layout** uses `children` so pages do not repeat chrome.
- Why list rendering uses **keys** when mapping issues.

## Self-check

- Can you pass `status` and `priority` from `Issues` into badges without duplicating markup?
- Can you describe what happens if you omit a required prop?
- Is your cumulative app still the Stage 1 routes plus new components?

## Common gaps

- Badge logic copied inline in the list instead of extracted components.
- Prop names inconsistent (`status` vs `issueStatus`) across files.
- Layout broken after merge — fix routing before comparing to the solution.

---

## stage-02 / recap-after-solution.md

# Stage 2 — After the solution is released

## What the reference solution demonstrates

- Badges encapsulate **display rules** (colors/labels) from raw enum-like strings.
- **Issues** stays readable: map issues → row with badge components.
- Layout unchanged in responsibility — only composition improved.

## Compare your work

- Are your badge components pure functions of props?
- Could you add a third badge type without editing five list rows?

## Carry forward to Stage 3

- **Controlled forms** will hold state in the Create Issue page; badges and list patterns stay the same.
- Prefer reusing components you extracted here rather than inlining again.

---

## stage-03 / recap-before-solution.md

# Stage 3 — Before you view the solution

Forms introduce **state** that props alone cannot handle. Solidify this before the solution is published.

## You should be able to explain

- **Controlled inputs**: value + `onChange` tied to React state, not uncontrolled DOM defaults.
- **Validation** before submit — empty title, invalid priority, etc.
- **Local preview** or reset after submit without calling an API yet.

## Self-check

- Can you trace one field from keystroke → state update → re-render?
- Does submit with invalid data show errors and avoid updating the list?
- Is validation duplicated in one place (function or schema) vs scattered in JSX?

## Common gaps

- Mixing controlled and uncontrolled inputs on the same form.
- Mutating state objects instead of copying/updating immutably.
- Adding issues to global list without the shape the Issues page expects.

---

## stage-03 / recap-after-solution.md

# Stage 3 — After the solution is released

## What the reference solution demonstrates

- A single **form state object** (or grouped fields) with clear validation helpers.
- Submit handler that either resets or shows preview consistent with workshop rules.
- Create Issue route integrated into existing nav without breaking Stage 1–2 pages.

## Compare your work

- Error messages: inline vs summary — both OK if validation rules match.
- Did you keep issue shape `{ title, status, priority, ... }` stable for later API stages?

## Carry forward to Stage 4

- Short **Counter** exercise reinforces `useState` updates; form patterns reuse the same mental model.

---

## stage-04 / recap-before-solution.md

# Stage 4 — Before you view the solution

The Counter lab isolates **state updates** and **effects** you will reuse when loading data in Stage 7.

## You should be able to explain

- Functional updates `setCount(c => c + 1)` vs reading stale state in rapid clicks.
- **useEffect** for one-time or async init (and cleanup if you added it).
- How this exercise relates to form submit and future `fetch` loading flags.

## Self-check

- Counter increments/decrements reliably on fast clicks.
- You can articulate when state should live in a leaf component vs lifted later.

## Common gaps

- Direct mutation of state objects.
- Missing dependency array on effects causing double runs or stale closures.

---

## stage-04 / recap-after-solution.md

# Stage 4 — After the solution is released

## What the reference solution demonstrates

- Predictable state transitions and optional async init pattern used elsewhere in SprintBoard.
- Separation of the Counter demo from production pages so the main app routes stay clean.

## Carry forward to Stage 5

- You shift to the **server**: Express factory, middleware chain, health check — client skills still matter for Stage 7+.

---

## stage-05 / recap-before-solution.md

# Stage 5 — Before you view the solution

Backend stages start here. Verify **health** and middleware order before comparing solutions.

## You should be able to explain

- **Express app factory** (`createApp`) vs listening in `server.js`.
- Order of **middleware**: JSON parser, logging, routes, error handler.
- What **GET /api/health** returns and why it exists (deployments, workshops, tests).

## Self-check

- `curl` or browser to `/api/health` returns JSON success without Mongo (this stage).
- Invalid JSON body does not crash the process.
- You know which file owns route registration vs server bootstrap.

## Common gaps

- Calling `listen` inside the factory (harder to test).
- Missing centralized error middleware.
- Port/env not read from `process.env`.

---

## stage-05 / recap-after-solution.md

# Stage 5 — After the solution is released

## What the reference solution demonstrates

- Testable app export and thin entrypoint.
- Consistent JSON error shape you will extend in Stage 6.

## Carry forward to Stage 6

- **Mongoose**, models, services, and REST CRUD plug into the same Express skeleton.

---

## stage-06 / recap-before-solution.md

# Stage 6 — Before you view the solution

This is the largest backend stage. Confirm CRUD and validation manually before opening solution files.

## You should be able to explain

- **User** and **Issue** Mongoose schemas and required fields.
- **Service layer** (`issueService`, `userService`) vs route handlers — why split?
- REST verbs on `/api/issues` and `/api/users` and status codes (201, 404, 400).

## Self-check

- Mongo running; `MONGODB_URI` set; seed or create via POST works.
- Invalid payloads return structured errors, not stack traces to clients.
- You can create → read → update → delete one issue via HTTP client.

## Common gaps

- Business logic duplicated in routes instead of services.
- Missing validation on assignee/reporter references.
- GraphQL or extra routes added too early (Stage 9+).

---

## stage-06 / recap-after-solution.md

# Stage 6 — After the solution is released

## What the reference solution demonstrates

- Services callable from both REST routes and later GraphQL resolvers.
- Validation helpers shared across create/update paths.
- Route files mounted under `/api` consistent with workshop tests.

## Compare your work

- Match behavior, not necessarily identical function names.
- Ensure issue list filters you add later (Stage 8) can reuse service queries.

## Carry forward to Stage 7

- Client **fetch** replaces static lists; API contract you built here is the contract the UI must honor.

---

## stage-07 / recap-before-solution.md

# Stage 7 — Before you view the solution

Connecting UI to API introduces **async UI states**. Master loading/error before viewing reference code.

## You should be able to explain

- **`api.js` client** — base URL, JSON headers, error parsing.
- **Loading / error / success** rendering on Dashboard and Issues.
- Why Dashboard stats come from the same API as Issues (counts, aggregates).

## Self-check

- With server running, Issues list reflects database content.
- Broken server or wrong port shows user-visible error, not blank screen.
- No duplicate fetch logic in every component — shared client helpers.

## Common gaps

- Fetch in render instead of `useEffect` or event handlers.
- CORS/port mismatch between Vite proxy and Express port.
- Forgetting to handle non-JSON error responses.

---

## stage-07 / recap-after-solution.md

# Stage 7 — After the solution is released

## What the reference solution demonstrates

- Central API module used by pages; environment-aware base URL.
- Dashboard derived from live issue/user data.

## Carry forward to Stage 8

- Full **CRUD UI**, filters, and assignee flows build on this data layer — keep `api.js` stable and extend it.

---

## stage-08 / recap-before-solution.md

# Stage 8 — Before you view the solution

Full workflows tie UI, validation, and API together. Use verification to prove each path works.

## You should be able to explain

- **Users** CRUD screens and how they call REST endpoints.
- **Issue** create/edit/delete from UI with validation feedback.
- **Filters** (status, assignee, etc.) and where filter state lives.
- Assignee linking issues to users without breaking referential intent.

## Self-check

- End-to-end: create user → assign issue → filter list → edit → delete.
- Optimistic UI optional; at minimum consistent reload after mutations.
- Forms reuse Stage 3 validation habits.

## Common gaps

- Filter state lost on navigation.
- Edit forms not prefilled from selected issue.
- DELETE without confirmation or error handling.

---

## stage-08 / recap-after-solution.md

# Stage 8 — After the solution is released

## What the reference solution demonstrates

- Coherent UX across Users and Issues with shared API client.
- Filter/query parameters or client-side filter — understand which approach you used vs reference.

## Carry forward to Stage 9

- **GraphQL** reads the same services; REST UI you built remains valid while GraphQL is added in parallel.

---

## stage-09 / recap-before-solution.md

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

---

## stage-09 / recap-after-solution.md

# Stage 9 — After the solution is released

## What the reference solution demonstrates

- Resolvers delegating to **issueService** / **userService** from Stage 6.
- Scalar coercion and consistent field naming with REST JSON.

## Carry forward to Stage 10

- **Mutations** (`createIssue`) and a small **GraphQLDemo** UI — queries you wrote here are prerequisites.

---

## stage-10 / recap-before-solution.md

# Stage 10 — Before you view the solution

Final stage connects **mutations**, demo UI, and project quality gates.

## You should be able to explain

- **`createIssue` mutation** — arguments, validation, returned fields.
- How **GraphQLDemo** differs from the main REST-driven Issues page (purpose, not duplicate app).
- **REST vs GraphQL** tradeoffs you experienced in this workshop.
- What `npm test`, `npm run lint`, and `npm run build` verify in the cumulative project.

## Self-check

- Mutation creates an issue visible via query or REST GET.
- Demo handles loading/error from GraphQL response.
- Full stack runs: client, Express, Mongo, both REST and GraphQL.

## Common gaps

- Mutation resolver skipping service validation.
- Demo hard-coded query string with no variables where variables are taught.
- Skipping final verification checklist in `verification.md`.

---

## stage-10 / recap-after-solution.md

# Stage 10 — After the solution is released

## What the reference solution demonstrates

- End-to-end SprintBoard: MERN + GraphQL mutation path aligned with services.
- Workshop-quality error handling and project scripts passing.

## Workshop completion

- You can explain **one user journey** across REST UI and GraphQL demo.
- You know **where** models, services, REST routes, and GraphQL resolvers live.
- Keep your repo as the portfolio artifact; use this recap to study for interviews or the capstone demo.

Congratulations on finishing all ten stages — revisit any **Before solution** recap if a topic still feels weak.
