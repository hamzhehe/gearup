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

## Deploy to Vercel (frontend)

1. Import repo: https://github.com/hamzhehe/gearup
2. **Settings → Build & Deployment** — set:
   - **Root Directory:** `frontend-next` (recommended), OR leave empty and use root `vercel.json`
   - **Framework Preset:** Next.js
   - **Output Directory:** leave **empty** (delete `public` if set)
   - **Build Command:** leave empty (uses `vercel.json` / `vercel-build` script)
3. **Settings → Environment Variables** add:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL (e.g. `https://gearup-production.up.railway.app`)
4. Redeploy

## Deploy to Railway (backend)

1. New project → Deploy from GitHub → select `gearup`
2. Leave **Root Directory** empty (repo root) — `Dockerfile` + `railway.toml` build `backend/` automatically
3. **Variables** tab — add from `backend/.env.example`:
   - `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `NODE_ENV=production`
   - `EMAIL_USER`, `EMAIL_PASS` (optional)
   - For Dialogflow: set `GOOGLE_CREDENTIALS_JSON` to the full service-account JSON (one line), or `GOOGLE_APPLICATION_CREDENTIALS` if using a mounted file
4. Redeploy — health check: `/api/health`

## Health check

After Railway deploy: `https://YOUR-RAILWAY-URL/api/health`
