# PG Examinations Portal — Architecture

## Purpose
A concise architecture overview and diagram for the PG Examinations Portal repository. This document explains what the project does, how its parts fit together, and quick commands to run/inspect the system and generated graphs.

## What the project does
- Provides a web application for postgraduate examination management (coordinators, HODs, faculty, students).
- Frontend: React app (Create React App) that provides pages for login, seating plans, duty assignment, claims, letters, and user management.
- Backend: Express.js server with REST routes, Mongoose models, authentication, and seeding scripts to populate the MongoDB database.
- Data: Uses MongoDB (Mongoose) for persistence, file uploads for documents (in `backend/uploads/`), and scripts to seed initial users/faculty/rooms.
- Developer utilities: graph generation for code relationships (in `backend/scripts/graphgen`) and various seed scripts under `backend/scripts`.


## Major folders & responsibilities
- `frontend/` — React SPA (pages, components, assets, tailwind + helpers). Responsible for the UI and calling backend APIs.
- `backend/` — Express server:
  - `models/` — Mongoose models (User, Session, Seating, Course, Faculty, etc.).
  - `routes/` — Express routes for domain endpoints.
  - `middleware/` — e.g., `auth.js` for protecting routes.
  - `scripts/` and `seed/` — seeders and utilities (create initial users, coordinator, rooms, etc.).
  - `uploads/` — persisted uploaded files used in letters and claims.
  - `scripts/graphgen/` — generator that parses source code, builds DOT graphs and renders SVGs.

## How authentication works (brief)
- Passwords are hashed with `bcrypt` when created via seeds or registration.
- Login endpoints compare submitted password with stored hash via `bcrypt.compare`.
- Protected routes use the `auth` middleware which validates user session/token.

## How to run locally (dev)
1. Start MongoDB (local) on `mongodb://127.0.0.1:27017/exam-management`.
2. Start backend:

```powershell
cd backend
npm install
node server.js
```

3. Seed initial data (optional):

```powershell
cd backend
node scripts/seedSpecialUsers.js
node scripts/seedUsers.js
node seed.js
```

4. Start frontend:

```powershell
cd frontend
npm install
npm start
```

## Graphs and code relationships
- The project contains a generator at `backend/scripts/graphgen/generate_all.js` which produces DOT and SVG files in:
  - `backend/scripts/graphgen/output/frontend-backend.svg`
  - `backend/scripts/graphgen/output/frontend-internal.svg`
  - `backend/scripts/graphgen/output/backend-internal.svg`

Run the generator locally:

```powershell
cd backend/scripts/graphgen
node generate_all.js
```

If you prefer the `dependency-cruiser` view (package-level dependency map) use:

```powershell
# install locally (repo root)
npm install --save-dev dependency-cruiser
npx depcruise --config .dependency-cruiser.js --output-type dot frontend/src backend > backend/scripts/graphgen/output/depgraph.dot
# render via Graphviz
dot -Tsvg -o backend/scripts/graphgen/output/depgraph.svg backend/scripts/graphgen/output/depgraph.dot
```

## Quick notes & next steps you might want
- The `graphgen` output can be adjusted (group-by-folder, function-to-function). If you want an alternate view (coarser or per-folder), tell me which folders to prioritize and I will add it.
- Consider adding an npm script to regenerate the graphs and to run seeds for easier reproducibility.

---
Generated on: 2026-06-06
