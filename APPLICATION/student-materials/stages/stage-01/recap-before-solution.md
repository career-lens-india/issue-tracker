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
