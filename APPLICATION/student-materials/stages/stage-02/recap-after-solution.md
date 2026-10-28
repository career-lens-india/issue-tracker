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
