# GearUp — Project Structure

This repo has **two apps**: a Node/Express API and a Next.js frontend. They stay in separate folders; the frontend calls the API over HTTP.

## Top level

```
GearUp/
├── backend/          # Express API, MongoDB, file uploads
├── frontend-next/    # Next.js website (App Router)
├── PROJECT_STRUCTURE.md
└── CLEANUP_AUDIT.md  # Cleanup history / notes
```

## Backend (`backend/`)

| Folder / file | Purpose |
|---------------|---------|
| `server.js` | App entry — mounts routes, serves `/uploads` |
| `config/` | DB connection, service credentials |
| `controllers/` | Request handlers (business logic) |
| `routes/` | Express route definitions → controllers |
| `models/` | Mongoose schemas |
| `middleware/` | Auth, etc. |
| `services/` | Shared server logic (e.g. wallet) |
| `utils/` | Server-only helpers |
| `templates/` | Email/HTML templates |
| `uploads/` | User-uploaded files (runtime; not source code) |
| `scripts/` | Maintained CLI scripts (`npm run create-admin`) |

**Run:** `cd backend && npm run dev` (port **5001** by default)

## Frontend (`frontend-next/`)

| Folder | Purpose |
|--------|---------|
| `src/app/` | Pages and route layouts (Next.js App Router) |
| `src/components/layout/` | Shell UI: `DashboardLayout` (manufacturer/wholesaler), `AdminDashboardLayout` (admin), `Sidebar`, `Topbar` |
| `src/components/shared/` | Cross-cutting UI: `Profile`, `ProtectedRoute`, `PublicLayout`, etc. |
| `src/components/dashboard/` | Dashboard widgets (charts, tables, cards) |
| `src/components/common/` | Reusable UI primitives |
| `src/lib/` | API base URL, formatting, shared dashboard helpers |
| `src/utils/` | Client-side business rules (inventory, MOQ, commission) |
| `src/context/` | React context (`AuthContext`) |
| `src/hooks/` | Custom hooks |

**Run:** `cd frontend-next && npm run dev` (port **3000**)

Set `NEXT_PUBLIC_API_URL` if the API is not at `http://localhost:5001`.

## Layout components (important)

| Component | Used by |
|-----------|---------|
| `layout/DashboardLayout.js` | Manufacturer & wholesaler routes (via `app/*/layout.js`) |
| `layout/AdminDashboardLayout.js` | Admin routes (via `app/admin/layout.js`) |

Do **not** wrap manufacturer pages again with `AdminDashboardLayout` — the route layout already provides the shell.

## API flow

```
Browser (Next.js)  --fetch-->  Express (backend)  --mongoose-->  MongoDB
                              uploads/ on disk
```

There is **no** `frontend-next/src/app/api` — all API logic lives in `backend/`.

## Regenerable folders (safe to delete locally)

- `frontend-next/.next/`
- `frontend-next/node_modules/` (reinstall with `npm install`)
- `backend/node_modules/`
- Root `node_modules/` if it appears (no root `package.json` — do not use)
