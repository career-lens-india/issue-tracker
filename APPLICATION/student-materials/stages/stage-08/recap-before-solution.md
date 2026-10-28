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
