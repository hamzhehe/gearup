# GearUp

Pakistan's B2B sports marketplace — monorepo with separated **frontend** (Next.js) and **backend** (Express/MongoDB).

## Monorepo structure

```
GearUp/
├── frontend/          # Next.js app → deploy to Vercel
│   ├── package.json
│   ├── next.config.mjs
│   ├── public/
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/
│       ├── context/
│       ├── hooks/
│       └── lib/
├── backend/           # Express API → deploy to Railway
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── .env.example
├── Dockerfile         # Railway: builds backend from repo root
├── railway.toml       # Railway: healthcheck + Docker builder
└── README.md
```

> **Do not use** `frontend-next/` — that folder was renamed to `frontend/`. Delete any local `frontend-next/` copy if it still exists.

## Local development

```bash
# Terminal 1 — Backend (port 5001)
cd backend
cp .env.example .env
npm install
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## Environment variables

### Frontend (Vercel + local `.env.local`)

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | **Yes** (production) | `https://your-app.up.railway.app` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |

### Backend (Railway + local `.env`)

| Variable | Required | Example |
|----------|----------|---------|
| `MONGO_URI` | **Yes** | `mongodb+srv://...` |
| `JWT_SECRET` | **Yes** | strong random string |
| `JWT_EXPIRE` | Yes | `30d` |
| `PORT` | Auto on Railway | `5001` (local) |
| `NODE_ENV` | Yes (production) | `production` |
| `EMAIL_USER` | Optional | Gmail address |
| `EMAIL_PASS` | Optional | App password |
| `DIALOGFLOW_PROJECT_ID` | Optional | Dialogflow project |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | Path to service account JSON |
| `GOOGLE_CREDENTIALS_JSON` | Optional | Full JSON (Railway alternative) |

**Never commit** `.env` files. Use `.env.example` as reference only.

## Deploy to Vercel (frontend only)

1. Import repo: https://github.com/hamzhehe/gearup
2. **Settings → Build & Deployment** (fixes 404 / 328ms fake builds):

| Setting | Value |
|---------|--------|
| Root Directory | **empty** (repo root — `vercel.json` builds `frontend/`) |
| Framework Preset | **Other** |
| Output Directory | **empty** — delete `public` if set |
| Build Command | **empty** |
| Install Command | **empty** |

> Root `package.json` exists only so Vercel detects `next` at repo root. The app still builds from `frontend/`.
> Do **not** set Root Directory to `frontend` — that conflicts with root `vercel.json`.
> If build finishes in under 5 seconds, Vercel is not running `next build`.
> A real build takes ~30–60 seconds and logs `Generating static pages (97/97)`.

3. **Environment Variables:** `NEXT_PUBLIC_API_URL` = your Railway URL
4. Redeploy the **latest** commit (not an old failed deployment)

## Deploy to Railway (backend only)

1. Import repo: https://github.com/hamzhehe/gearup
2. **Root Directory:** leave **empty** (repo root — `Dockerfile` builds `backend/`)
3. **Variables:** copy from `backend/.env.example`
4. Health check: `GET /api/health`
5. Redeploy

## Verify before deploy

```bash
cd frontend && npm install && npm run build   # must succeed
cd backend && npm install && npm start        # must listen on PORT
curl http://localhost:5001/api/health        # {"status":"ok",...}
```

## Production readiness checklist

| Check | Status |
|-------|--------|
| Monorepo: `frontend/` + `backend/` only | Ready |
| `frontend-next/` removed | Done |
| Frontend `npm run build` | Must pass locally before push |
| Backend `GET /api/health` → `status: ok` | Ready |
| Railway `PORT` env (auto-injected) | Ready |
| Vercel Root Directory = empty (uses root `vercel.json`) | **Required in dashboard** |
| `NEXT_PUBLIC_API_URL` on Vercel | **Required** |

### Variable name reference

| Your spec | Actual in codebase |
|-----------|-------------------|
| `MONGODB_URI` | Use **`MONGO_URI`** |
| `FRONTEND_URL` | Optional (not required; CORS is open) |

## Backup recommendation

Before structural changes, create a branch:

```bash
git checkout -b backup/pre-restructure
git push -u origin backup/pre-restructure
```
