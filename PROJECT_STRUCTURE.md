# GearUp — Project Structure

Professional monorepo: **frontend** and **backend** are fully separated. No shared `package.json` at repo root.

## Current structure (canonical)

```
GearUp/
├── frontend/                 # Vercel deployment root
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.mjs
│   ├── jsconfig.json
│   ├── eslint.config.mjs
│   ├── vercel.json
│   ├── public/
│   └── src/
│       ├── app/              # Next.js App Router pages
│       ├── components/
│       ├── context/          # AuthContext
│       ├── hooks/
│       ├── lib/              # API helpers, utils
│       └── utils/
├── backend/                  # Railway deployment (via root Dockerfile)
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── uploads/
│   └── .env.example
├── Dockerfile                # Railway: copies backend/ into container
├── railway.toml              # Railway: Docker builder + /api/health
├── .gitignore
└── README.md
```

## Removed / deprecated

| Item | Status |
|------|--------|
| `frontend-next/` | **Renamed** → `frontend/`. Delete local copy if present. |
| Root `package.json` | **Removed** — not needed; each app has its own |
| Root `vercel.json` | **Removed** — Vercel Root Directory = `frontend` |

## Deployment mapping

| Platform | Root Directory | Build | Start |
|----------|----------------|-------|-------|
| **Vercel** | `frontend` | `npm run build` | Next.js serverless |
| **Railway** | *(repo root)* | `Dockerfile` | `npm start` → `node server.js` |

## API flow (unchanged)

```
Browser (frontend)  --HTTP-->  backend (Express)  --Mongoose-->  MongoDB
```

No `frontend/src/app/api` routes — all API logic lives in `backend/`.
