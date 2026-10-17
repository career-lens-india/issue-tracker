# Issue Tracker — Repository Overview

This repository contains two related but **separate** projects:

## `APPLICATION/`

The completed **SprintBoard** reference application (React + Vite, Express, MongoDB, REST, GraphQL) and all workshop teaching assets, including:

- `client/` and `server/` source code
- `docs/` (syllabus, runbook, student coding stages blueprint)
- `student-materials/` (ten stage packages and `manifest.json` for the future portal)

**Run all application commands from `APPLICATION/`:**

```powershell
cd APPLICATION
npm install
npm run install:all
npm test
npm run lint
npm run build
npm run dev
```

See [APPLICATION/README.md](./APPLICATION/README.md) for full setup, environment variables, and API documentation.

## `CODE-DELIVERY-PORTAL/`

Reserved for a **future, independent** web application that will distribute student stage code to learners. It is **not implemented yet**.

When built, the portal will read stage metadata and file contents from:

`APPLICATION/student-materials/`

The portal will have its own dependencies, configuration, and startup commands—separate from SprintBoard.

See [CODE-DELIVERY-PORTAL/README.md](./CODE-DELIVERY-PORTAL/README.md).
