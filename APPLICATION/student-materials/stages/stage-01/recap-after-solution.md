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
