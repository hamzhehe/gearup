# GearUp

Pakistan's B2B sports marketplace — Next.js frontend + Express/MongoDB backend.

## Project structure

| Folder | Purpose |
|--------|---------|
| `frontend-next/` | Next.js app (deploy to **Vercel**) |
| `backend/` | Express API (deploy to **Railway**) |

## Local setup

```bash
# Backend
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev

# Frontend (separate terminal)
cd frontend-next
cp .env.local.example .env.local
npm install
npm run dev
```

## Deploy to Vercel (frontend) — follow exactly

1. Import repo: https://github.com/hamzhehe/gearup
2. **Settings → Build & Deployment:**
   - **Root Directory:** `frontend-next` ← required
   - **Framework Preset:** Next.js
   - **Output Directory:** leave empty (remove `public` if set)
   - **Build / Install commands:** leave empty
3. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = your Railway URL (e.g. `https://gearup-production.up.railway.app`)
4. Redeploy

> If Root Directory is wrong, Vercel shows: *"No Next.js version detected"*.

## Deploy to Railway (backend)

1. New project → Deploy from GitHub → select `gearup`
2. Leave **Root Directory** empty — `Dockerfile` builds `backend/`
3. **Variables** — add from `backend/.env.example`
4. Redeploy — health check: `/api/health`
