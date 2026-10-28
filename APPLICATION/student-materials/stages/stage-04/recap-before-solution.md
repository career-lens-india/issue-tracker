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
