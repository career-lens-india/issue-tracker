# SprintBoard Student Materials

Packages for the SprintBoard workshop and the **Code Delivery Portal**. **Do not replace the instructor reference app** — merge stage `solution/` files into a cumulative student project.

**Single source of truth:** this folder (`APPLICATION/student-materials/`). The portal copies it into `CODE-DELIVERY-PORTAL/server/student-materials` at deploy time (`npm run sync:materials` / `vercel-build`); edit content here only.

- [manifest.json](./manifest.json) — portal metadata
- [stages/](./stages/) — ten stage folders
- Build scripts (instructor only): `scripts/build-stages.mjs`, `scripts/generate-docs.mjs`

See [docs/STUDENT_CODING_STAGES.md](../docs/STUDENT_CODING_STAGES.md) for pedagogy and timetable.
