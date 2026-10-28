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
