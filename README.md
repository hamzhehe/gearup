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
2. **Settings → General → Root Directory → `frontend-next`**
3. **Settings → Environment Variables** add:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL (e.g. `https://gearup-production.up.railway.app`)
4. Redeploy

## Deploy to Railway (backend)

1. New project → Deploy from GitHub → select `gearup`
2. **Settings → Root Directory → `backend`**
3. **Variables** tab — add from `backend/.env.example`:
   - `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `NODE_ENV=production`
   - `EMAIL_USER`, `EMAIL_PASS` (optional)
   - For Dialogflow: upload service account JSON as a Railway secret file, or set `GOOGLE_APPLICATION_CREDENTIALS`
4. Redeploy

## Health check

After Railway deploy: `https://YOUR-RAILWAY-URL/api/health`
