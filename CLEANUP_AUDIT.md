# GearUp Cleanup Audit

**Last updated:** 2026-06-02  
**Status:** Cleanup applied (see changelog below)

---

## Changelog — what was done

### Structure & behavior (site preserved; build verified)

- Moved admin shell: `shared/DashboardLayout.js` → `layout/AdminDashboardLayout.js`
- Fixed **double sidebar** on 5 manufacturer pages (inventory, purchases, sales, profit, top-products)
- Fixed `manufacturers` page API URL to use `getApiBaseUrl()` (was hardcoded port 5000)
- Deduplicated `isOrderInTimeRange` → single source in `lib/dashboardUtils.js`
- Added `PROJECT_STRUCTURE.md` and `backend/.gitignore`

### Removed (safe / unused)

| Item | Reason |
|------|--------|
| Root `node_modules/` | Orphan (no root package.json) |
| `frontend-next/.next/` | Regenerable cache |
| `update.py`, `build_log.txt` | One-off / log files |
| `backend/scratch/`, dev `*.js` at backend root | Not used by server |
| 12 unused frontend components | Never imported |

### Not removed (keeps site working)

- `backend/uploads/` — runtime user files
- `backend/.env`, Dialogflow credentials
- `backend/node_modules/`, `frontend-next/node_modules/`
- All controllers, routes, models, pages

---

## How to run after cleanup

```bash
# Terminal 1 — API
cd backend
npm run dev

# Terminal 2 — Website
cd frontend-next
npm run dev
```

First frontend start recreates `.next/` automatically.

---

## Folder guide

See **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** for the full directory map.

---

*For manual review of uploads or credentials, edit files locally — they were intentionally kept.*
