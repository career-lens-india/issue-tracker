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
