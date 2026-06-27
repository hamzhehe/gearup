# GearUp Upload Storage — Railway Deployment (Path 3A)

**Phase:** 3  
**Approach:** Persistent volume mounted at `/app/uploads`

## Prerequisites

1. Railway project with GearUp backend service deployed from root `Dockerfile`.
2. Create a **Volume** in the Railway dashboard named **`gearup-uploads`**.

## Configuration applied

| File | Change |
|------|--------|
| `Dockerfile` | `VOLUME ["/app/uploads"]` |
| `railway.toml` | `[[deploy.volumeMounts]]` → `mountPath = "/app/uploads"`, `volume = "gearup-uploads"` |

## Deploy steps

1. Create volume `gearup-uploads` in Railway (same region as the service).
2. Deploy the backend with updated `railway.toml`.
3. Upload a test product image via `POST /api/products/upload-image`.
4. Verify `HEAD https://<your-railway-host>/uploads/<filename>` → **200**.
5. Trigger a redeploy and repeat step 4 — must still be **200**.

## Rollback

- Remove `volumeMounts` from `railway.toml` and redeploy previous image.
- Volume data remains in Railway until manually deleted.

## Notes

- Frontend continues using `/uploads/...` paths + `NEXT_PUBLIC_BACKEND_URL` — no breaking API change.
- Local development still uses `backend/uploads/` on disk (no volume required).
- One orphan product path may still **404** until re-uploaded — see `ORPHAN_IMAGES_REPORT.md`.
