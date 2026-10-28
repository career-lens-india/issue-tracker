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
