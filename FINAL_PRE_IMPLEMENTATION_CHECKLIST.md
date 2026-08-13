# GearUp — Final Pre-Implementation Checklist

**Project:** GearUp (B2B Platform)  
**Document type:** Final planning gate before code changes  
**Date:** June 8, 2026  
**Prerequisites reviewed:** `IMAGE_LOADING_AUDIT_REPORT.md`, `IMAGE_FIX_IMPLEMENTATION_PLAN.md`  
**Code changes in this task:** None

---

## Executive Summary

Image loading failures have been **verified** through code review and live HTTP/API tests. The implementation plan is **technically sound** with one optional refinement for Phase 3 (Railway persistent volume as a lower-code alternative to object storage).

This checklist defines:

- What will change (and what must not)
- Mandatory backups before any edit
- Phase-by-phase execution, testing, and rollback
- A final **GO** decision for controlled implementation

**Recommended immediate action:** Proceed with **Phase 0 (backups)** then **Phase 1 (frontend URL resolution)** — very low risk, no API/DB changes. **Phase 3** requires a storage decision before coding begins.

---

## 1. Implementation Plan Verification

Each recommendation from `IMAGE_FIX_IMPLEMENTATION_PLAN.md` was re-validated against the current codebase.

| Recommendation | Verdict | Notes |
|----------------|---------|-------|
| Phase 1: Apply `resolveProductImageUrl()` on product detail, manufacturer profile, wholesaler orders list | **Correct ✅** | Confirmed raw `src` at lines 187, 213 (`product/[id]/page.js`); line 81 + 248 (`manufacturer/[id]/page.js`); lines 434, 547 (`orders/page.js`) |
| Phase 1 optional: Consolidate ad-hoc URL helpers | **Correct ✅** | Inline helpers in chat threads, manufacturer order detail, ad widgets lack `data:` handling |
| Phase 2: Reconcile orphan DB paths | **Correct ✅** | `/uploads/product-1781546088061-53400d09.png` verified **404** on local backend |
| Phase 3: Persistent storage (S3 / Cloudinary / Railway volume) | **Correct ✅** | `uploads/*` gitignored; `Dockerfile` creates empty dir; production **404** for existing local file |
| Phase 4: Normalize Base64 / hotlinks | **Correct ✅** | 5 Base64 + 10 HTTP products in live API; no schema change required |
| Phase 5: Placeholder on product detail error | **Correct ✅** | Cosmetic only |
| Fix order: Phase 1 before Phase 3 for dev; Phase 3 before production upload fix | **Correct ✅** | Frontend fixes do not resolve production 404s |
| Environment variables as primary cause | **Correctly excluded ✅** | `NEXT_PUBLIC_BACKEND_URL=http://localhost:5001` verified working for marketplace |

### Recommended plan adjustment (not a rejection)

| Topic | Original plan | Recommended refinement | Why | Risk if ignored |
|-------|---------------|------------------------|-----|-----------------|
| **Phase 3 approach** | Object storage (S3/Cloudinary) | Add **Path 3A:** Railway persistent volume mounted at `/app/uploads` (minimal code change) vs **Path 3B:** Object storage + CDN (scalable, more code) | Volume path fixes production 404s with deployment-only changes; object storage is better long-term | Wrong path choice delays production fix or over-engineers Phase 1 |
| **Phase 1 scope** | Include all ad-hoc helpers | Split into **1A (required, 3 files)** and **1B (optional, 6 files)** for Base64 edge cases | Upload fix needs only 3 files; expanding scope increases regression surface | Low — optional files can ship in 1B |
| **Phase 2 timing** | After Phase 3 | **Confirmed optimal for production** — re-upload should target persistent storage | Re-upload before storage still loses files on redeploy | Medium |

No recommendation in the original plan is **incorrect**; only scope splitting and Phase 3 path choice are clarified.

---

## 2. Implementation Checklist by Phase

### Phase 0 — Pre-Implementation Backups (Mandatory)

| Field | Detail |
|-------|--------|
| **Objective** | Preserve recoverable state before any code or data change |
| **Why needed** | Enables rollback for Phases 2–4 (data/content) and Phase 3 (infra) |
| **Expected result** | Timestamped backups of DB, uploads folder, env docs, and git branch |
| **Risk level** | **Very Low** (read-only operations) |
| **Estimated time** | 30–60 minutes |
| **Dependencies** | MongoDB access; filesystem access to `backend/uploads/` |
| **Rollback plan** | N/A — this phase *is* the rollback foundation |
| **Regression tests** | Verify backup files exist and are non-empty |
| **Success criteria** | All backup artifacts stored outside repo; team confirms restore procedure |

---

### Phase 1A — Frontend URL Resolution (Required)

| Field | Detail |
|-------|--------|
| **Objective** | Prefix `/uploads/` paths with `NEXT_PUBLIC_BACKEND_URL` on all pages that currently use raw DB paths |
| **Why needed** | Browser requests `localhost:3000/uploads/...` → **404**; API at `:5001` returns **200** when file exists |
| **Expected result** | Upload images display on product detail, manufacturer profile, and orders list on **localhost** |
| **Risk level** | **Very Low** |
| **Estimated time** | 2–4 hours |
| **Dependencies** | Phase 0 complete |
| **Rollback plan** | Revert 3 frontend files via git; no backend/DB impact |
| **Regression tests** | See Section 9 — Marketplace, Product Detail, Manufacturer Profile, Orders |
| **Success criteria** | Product `battttt` image loads on product detail at `http://localhost:5001/uploads/...`; HTTP/Base64 products unchanged |

---

### Phase 1B — Consolidate Inline Resolvers (Optional)

| Field | Detail |
|-------|--------|
| **Objective** | Replace duplicate `getProductImage` / inline ternaries with `resolveProductImageUrl()` for consistent `data:` handling |
| **Why needed** | Base64 products break on pages that prefix API URL without checking `data:` |
| **Expected result** | Base64 images render on manufacturer order detail, sponsored widget, chat threads |
| **Risk level** | **Low** |
| **Estimated time** | 2–3 hours |
| **Dependencies** | Phase 1A complete |
| **Rollback plan** | Revert 6 frontend files |
| **Regression tests** | Base64 product on manufacturer order detail; sponsored dashboard widget |
| **Success criteria** | No `http://localhost:5001data:image/...` malformed URLs in network tab |

---

### Phase 2 — Database / File Reconciliation

| Field | Detail |
|-------|--------|
| **Objective** | Fix orphaned `images[]` paths; re-upload missing product images |
| **Why needed** | At least one product references a file that does not exist on disk |
| **Expected result** | Every `/uploads/` path in DB resolves to **200** on backend (local or production) |
| **Risk level** | **Low** (content ops; no schema change) |
| **Estimated time** | 2–6 hours |
| **Dependencies** | **Production:** Phase 3 complete. **Local dev:** can run after Phase 1A |
| **Rollback plan** | Restore product documents from MongoDB backup |
| **Regression tests** | HEAD request for each `/uploads/` path in `products.images` |
| **Success criteria** | Zero orphan `/uploads/` references OR orphans documented and excluded |

---

### Phase 3 — Persistent Upload Storage

| Field | Detail |
|-------|--------|
| **Objective** | Survive Railway redeploys; serve uploaded files in production |
| **Why needed** | All production `/uploads/` URLs return **404** today |
| **Expected result** | New uploads return **200** after deploy and redeploy |
| **Risk level** | **High** |
| **Estimated time** | Path 3A: 4–8 hours · Path 3B: 1–3 days |
| **Dependencies** | Phase 0; storage/volume provisioning; env vars on Railway (+ Vercel if CDN URL used) |
| **Rollback plan** | Revert backend deploy; restore volume snapshot or keep bucket read-only; DB paths unchanged if still `/uploads/` |
| **Regression tests** | Upload product image → view on marketplace → redeploy → image still loads |
| **Success criteria** | `HEAD` on production upload URL → **200** after redeploy |

**Path 3A — Railway volume:** Mount persistent disk at `uploads/`; minimal application code change.  
**Path 3B — Object storage:** S3-compatible bucket; update upload pipeline; optional CDN URL in responses.

---

### Phase 4 — Normalize Image Storage Format

| Field | Detail |
|-------|--------|
| **Objective** | Migrate Base64 and fragile hotlinks to stable stored URLs |
| **Why needed** | Reduce API payload size; improve long-term reliability |
| **Expected result** | Uniform URL strings in `products.images[]` |
| **Risk level** | **Medium** |
| **Estimated time** | 1–2 days |
| **Dependencies** | Phase 3 complete |
| **Rollback plan** | Restore `images[]` arrays from backup per product |
| **Regression tests** | Full product catalog visual pass; API response size check |
| **Success criteria** | Zero new Base64 in `images[]`; hotlinks replaced or validated |

---

### Phase 5 — UX Polish (Optional)

| Field | Detail |
|-------|--------|
| **Objective** | Show placeholder instead of hiding broken images on product detail (and optionally chats) |
| **Why needed** | Empty gallery when `onError` sets `display: none` |
| **Expected result** | Consistent placeholder UX matching marketplace |
| **Risk level** | **Very Low** |
| **Estimated time** | 1–2 hours |
| **Dependencies** | Phase 1A |
| **Rollback plan** | Revert `onError` handlers |
| **Regression tests** | Force invalid URL → placeholder visible |
| **Success criteria** | No blank gallery areas for failed images |

---

## 3. Exact Files That Will Change

> Line estimates reflect **net editable lines** (imports + mapping + `src` + optional `onError`), verified against current source.  
> Files marked **NEW** do not exist today and will be created during implementation.

### Phase 1A — Required (3 files)

| File path | Purpose | Reason for modification | Est. lines affected | Risk |
|-----------|---------|-------------------------|---------------------:|------|
| `frontend/src/app/wholesaler/marketplace/product/[id]/page.js` | Product detail gallery | Missing `resolveProductImageUrl()`; raw `images[]` in `src` (lines 63, 187, 213) | **12–20** | Very Low |
| `frontend/src/app/wholesaler/manufacturer/[id]/page.js` | Manufacturer catalog | Raw `p.images[0]` in map (line 81) and `src` (line 248) | **8–14** | Very Low |
| `frontend/src/app/wholesaler/orders/page.js` | Orders list thumbnails | Raw paths in `src` (lines 434, 547) | **8–12** | Very Low |

### Phase 1B — Optional consolidation (6 files)

| File path | Purpose | Reason for modification | Est. lines affected | Risk |
|-----------|---------|-------------------------|---------------------:|------|
| `frontend/src/app/manufacturer/orders/[id]/page.js` | Manufacturer order detail | Inline `getProductImage()` lacks `data:` check (lines 206–211) | **6–12** | Low |
| `frontend/src/app/wholesaler/chats/[id]/page.js` | Chat thread (wholesaler) | Duplicate `getProductImage()` (lines 129–135) | **8–14** | Low |
| `frontend/src/app/manufacturer/chats/[id]/page.js` | Chat thread (manufacturer) | Duplicate `getProductImage()` (lines 143–155) | **8–14** | Low |
| `frontend/src/components/ads/SponsoredProductsWidget.js` | Dashboard sponsored widget | Inline URL logic without `data:` (line 38) | **4–8** | Low |
| `frontend/src/components/ads/SponsoredProductCard.js` | Sponsored marketplace cards | Duplicate URL ternary (lines 28–32) | **6–10** | Low |
| `frontend/src/components/advertising/PremiumCampaignCard.js` | Campaign cards | Duplicate `getImageUrl()` (lines 25–33) | **6–10** | Low |

**Note:** `frontend/src/components/ads/HomepageFeaturedSlider.js` has working `getMediaUrl()` for uploads. Change only if consolidating to shared helper (optional, **4–8 lines**, Low).

### Phase 2 — Operational (0–1 new script; no required app code)

| File path | Purpose | Reason | Est. lines | Risk |
|-----------|---------|--------|----------:|------|
| `backend/scripts/reconcileProductImages.js` | **NEW** (optional) | Compare DB `/uploads/` paths to disk/storage | **80–150** | Low |

Product updates use **existing** `PUT /api/products/:id` — no controller change required for manual re-upload.

### Phase 3 — Path 3A (Railway volume, minimal code)

| File path | Purpose | Reason | Est. lines | Risk |
|-----------|---------|--------|----------:|------|
| `railway.toml` | Deploy config | Attach volume mount | **5–15** | Medium |
| `Dockerfile` | Container layout | `VOLUME` / mount path alignment | **2–8** | Medium |

### Phase 3 — Path 3B (Object storage, recommended long-term)

| File path | Purpose | Reason | Est. lines | Risk |
|-----------|---------|--------|----------:|------|
| `backend/utils/storageService.js` | **NEW** | Central upload/delete to bucket | **80–200** | High |
| `backend/middleware/uploadMiddleware.js` | Product upload multer | Memory buffer or stream to storage | **15–40** | High |
| `backend/controllers/productController.js` | `uploadImage` handler | Return path/URL from storage service | **10–25** | High |
| `backend/routes/uploadRoutes.js` | Generic upload | Same storage integration | **10–20** | High |
| `backend/routes/authRoutes.js` | Auth multer config | Avatar / business license uploads | **10–25** | High |
| `backend/controllers/authController.js` | Profile / verification | Store storage path or URL | **10–30** | High |
| `backend/server.js` | Static `/uploads` | Proxy to bucket or redirect (optional) | **5–30** | Medium |
| `backend/package.json` | Dependencies | Add SDK (e.g. `@aws-sdk/client-s3`) | **2–5** | Medium |
| `Dockerfile` | Deploy | Env/runtime for storage credentials | **2–10** | Medium |
| `railway.toml` | Deploy | Env references | **5–15** | Medium |
| `frontend/.env.local.example` | Documentation | Document any public CDN base URL | **2–8** | Very Low |

**Backward-compat note:** If API continues returning `/uploads/...` and backend proxies to bucket, **frontend Phase 1 files need no further change**.

### Phase 4 — Normalization (optional app + script)

| File path | Purpose | Reason | Est. lines | Risk |
|-----------|---------|--------|----------:|------|
| `backend/scripts/migrateProductImages.js` | **NEW** | Batch convert Base64/hotlinks to stored URLs | **120–250** | Medium |
| `frontend/src/components/manufacturer/ProductForm.js` | Product create/edit | Optional: restrict manual external URL paste (`handleAddImage`, line 436) | **5–20** | Low |

### Phase 5 — UX (1 file minimum)

| File path | Purpose | Reason | Est. lines | Risk |
|-----------|---------|--------|----------:|------|
| `frontend/src/app/wholesaler/marketplace/product/[id]/page.js` | Product detail | Replace `display: none` with placeholder `onError` (lines 190, 213) | **4–10** | Very Low |

### Files explicitly NOT changing in Phase 1

| File | Why unchanged |
|------|---------------|
| `frontend/src/lib/marketplaceData.js` | `resolveProductImageUrl()` already correct — **import only** from other files |
| `frontend/src/app/wholesaler/marketplace/page.js` | Already resolves URLs at fetch |
| `frontend/src/app/manufacturer/products/page.js` | Already correct |
| `frontend/src/app/wholesaler/cart/page.js` | Already correct |
| `frontend/src/app/wholesaler/orders/[id]/page.js` | Already correct |

---

## 4. Files That Must NOT Change

| Area | Files / modules | Why untouched |
|------|-----------------|---------------|
| **Authentication** | `backend/middleware/authMiddleware.js`, `backend/controllers/authController.js` (auth logic only), `backend/routes/authRoutes.js` (routes except multer config in Phase 3B), `frontend/src/context/AuthContext.js`, `frontend/src/lib/authToken.js` | Image fix must not alter login, JWT, session, or suspended-user behavior |
| **Authorization** | `authorize()`, role checks in routes | No permission model changes |
| **Payment / wallet** | `backend/controllers/orderController.js` (payment flows), `backend/routes/walletRoutes.js`, `backend/services/walletService.js`, checkout payment proof logic | Payment proof uploads may *benefit* from Phase 3 storage but payment **business logic** stays same |
| **Orders (business logic)** | Order creation, status transitions, commission — except thumbnail `src` in `wholesaler/orders/page.js` | Prevent order lifecycle regressions |
| **Inventory logic** | `backend/utils/inventory.js`, stock calculations, low-stock alerts | Audit scope is display-only |
| **Marketplace API contract** | `GET /api/products` query filters, pagination, seller exclusion rules in `productController.getProducts` | Only image **display** changes on frontend; API filter logic unchanged |
| **Database models (schema)** | `backend/models/Product.js`, `User.js`, `Order.js`, etc. | `images: [String]` remains sufficient |
| **Admin module (logic)** | `backend/controllers/adminController.js`, admin user suspend/verify | Admin product panel already uses resolver — no admin business rule changes |
| **User module (non-avatar)** | Registration validation, verification workflow (except file **storage** path in Phase 3B) | Avoid registration regressions |
| **Contact / support** | `backend/controllers/contactController.js`, support ticket replies | Unrelated feature |
| **Disputes (logic)** | `backend/controllers/disputeController.js`, dispute state machine | Evidence **display** already prefixes API URL correctly |
| **Routing** | Next.js app router structure, page URLs | No new routes |
| **Commission / MOQ / pricing** | `frontend/src/utils/commission.js`, `frontend/src/utils/moq.js`, bulk packaging validators | Unrelated calculations |

---

## 5. Database Impact

### Schema changes

**No database schema changes required.**

`Product.images` remains `[String]`. No new collections or fields are mandatory for Phases 1, 1B, or 5.

### Data operations

| Operation | Required? | Phase | Details |
|-----------|:---------:|-------|---------|
| **Data migration** | Optional | Phase 4 | Convert Base64/hotlinks to URL strings in existing documents |
| **Backup** | **Mandatory** | Phase 0 | Full `products` collection (+ `users` avatars if Phase 3B) before Phase 2/4 |
| **Image cleanup** | Optional | Phase 2 | Remove orphan path references or re-upload via existing `PUT /api/products/:id` |
| **New collections** | No | — | — |
| **New fields** | No | — | — |
| **Existing field modifications** | **Value-only** | Phase 2/4 | Update `images[]` string values only; same field type |

### Phase 2 example (verified orphan)

| Product | Current `images[0]` | Action |
|---------|---------------------|--------|
| `cricket bat` (`6a3006887f27cb01ae8ecda1`) | `/uploads/product-1781546088061-53400d09.png` | Re-upload image; update `images[]` via existing product update API |

---

## 6. API Impact

### Phase 1, 1B, 5 — No API modification

All product/order GET responses unchanged. Frontend-only display fix.

---

### APIs that do NOT need modification (explicit)

| Endpoint | Current behavior | Change needed? |
|----------|------------------|:--------------:|
| `GET /api/products` | Returns raw `images[]` strings | **No** |
| `GET /api/products/:id` | Returns raw `images[]` strings | **No** |
| `POST /api/products` | Accepts `images` array in body | **No** |
| `PUT /api/products/:id` | Updates product including `images` | **No** (used in Phase 2) |
| `GET /api/orders` | Populated product images | **No** |
| `GET /api/chats` | Product image on thread | **No** |

---

### APIs potentially affected — Phase 3 only

| Endpoint | Current behavior | Request change? | Response change? | Breaking? | Backward compatibility |
|----------|------------------|:---------------:|:----------------:|:---------:|------------------------|
| `POST /api/products/upload-image` | Saves to disk; returns `{ success, path: "/uploads/..." }` | **No** | **Maybe** — path may become full URL if chosen | **No** if frontend uses `resolveProductImageUrl()` | Keep returning `/uploads/...` + proxy = fully compatible |
| `POST /api/upload` | Generic upload; `{ filePath, url }` | **No** | **Maybe** same as above | **No** with proxy pattern | Dispute/ad flows use `getApiBaseUrl() + path` — still works |
| `PUT /api/auth/profile` (avatar) | Stores `/uploads/...` on user | **No** | **No** if path format preserved | **No** | `avatarUtils.js` already prefixes API base |
| `POST /api/auth/register` (business license) | Stores `/uploads/...` | **No** | **No** | **No** | Admin proof route uses filename — unchanged |
| `GET /uploads/*` (static) | `express.static` local disk | **No** | Serves file from volume or proxies to bucket | **No** if URL path unchanged | **Yes** — maintain `/uploads/` URL pattern |

**Summary:** No breaking API contract changes if implementation keeps `/uploads/` path strings and serves files at the same URL pattern.

---

## 7. UI Impact

| Page / area | Phase | Visible change | Hidden logic | UX impact |
|-------------|-------|----------------|--------------|-----------|
| **Marketplace** | None in Phase 1 | None | None | Unchanged |
| **Product detail** | 1A, 5 | Upload images appear; optional placeholder on failure | URL resolved at map/render | **High positive** for upload products |
| **Manufacturer profile** | 1A | Product cards show upload images | Map uses resolver | **High positive** |
| **Orders list (wholesaler)** | 1A | Thumbnails show upload images | `src` uses resolver | **Medium positive** |
| **Order detail (both roles)** | 1B optional | Base64 may fix on mfg. side | Helper consolidation | Low |
| **Inventory console** | None | None | None | Unchanged |
| **Cart** | None | None | None | Unchanged |
| **Admin products panel** | None | None | None | Unchanged |
| **Chats** | 1B optional | Base64 edge case fix | Helper consolidation | Low |
| **Advertisements** | 1B optional | Possible Base64 fix in widget | Helper consolidation | Low |
| **Disputes** | 3 only | Evidence images persist in production | Storage backend | **High** after Phase 3 |
| **Product upload form** | None (Phase 4 optional) | None | Optional URL restriction | Unchanged in Phase 1 |
| **Profile avatars** | 3 only | Avatars survive redeploy in production | Storage backend | **High** after Phase 3 |

**Unaffected pages (Phase 1):** Marketplace grid, cart, inventory, admin panel, wholesaler order detail, login, dashboard KPIs, contact, support.

---

## 8. Backup Plan (Mandatory)

### 8.1 Database backup (MongoDB)

**Procedure:**

```bash
# From machine with mongosh/mongoexport and MONGO_URI
mongoexport --uri="$MONGO_URI" --collection=products --out=backup/products_YYYYMMDD.json
mongoexport --uri="$MONGO_URI" --collection=users --out=backup/users_YYYYMMDD.json
# Optional if Phase 3 affects ads/disputes evidence paths:
mongoexport --uri="$MONGO_URI" --collection=advertisements --out=backup/advertisements_YYYYMMDD.json
mongoexport --uri="$MONGO_URI" --collection=disputes --out=backup/disputes_YYYYMMDD.json
```

**Store:** Outside repo (encrypted drive or cloud storage).  
**Verify:** JSON files non-empty; spot-check one product document.

---

### 8.2 Uploads backup

**Procedure:**

```powershell
# Windows — from project root
$date = Get-Date -Format "yyyyMMdd"
Compress-Archive -Path "backend\uploads\*" -DestinationPath "backups\uploads_$date.zip"
```

**Current state:** 104 files in `backend/uploads/` (includes PDFs and 34 images).  
**Store:** Same backup location as DB export.

---

### 8.3 Environment backup

**Document (do not commit secrets):**

| Variable | Location | Local value (verified) |
|----------|----------|------------------------|
| `NEXT_PUBLIC_BACKEND_URL` | `frontend/.env.local` | `http://localhost:5001` |
| `MONGO_URI` | `backend/.env` | Present (used in audit queries) |
| Production Railway URL | `.env.local.example` comment | `https://gearup-production-8048.up.railway.app` |

**Action:** Copy `.env` and `.env.local` to secure backup vault; screenshot Railway/Vercel env dashboards before Phase 3.

**Note:** `UPLOAD_PATH` and `IMAGE_BASE_URL` **do not exist** in project today.

---

### 8.4 Git backup

**Procedure (if git is initialized):**

```bash
git checkout -b backup/pre-image-fix-YYYYMMDD
git push -u origin backup/pre-image-fix-YYYYMMDD
```

**Current workspace note:** Git executable was unavailable in the audit environment; initialize or use manual zip of project before Phase 1 if git is not configured.

**Alternative:** Zip entire project excluding `node_modules/` and `.next/`.

---

### 8.5 Rollback strategy

| Failure scenario | Rollback steps | Recovery time |
|------------------|----------------|---------------|
| Phase 1 breaks rendering | Revert 3 (or 9) frontend files | **< 15 minutes** |
| Phase 2 wrong image on product | Restore single product doc from `products_YYYYMMDD.json` | **< 30 minutes** |
| Phase 3 upload pipeline broken | Redeploy previous Railway release; restore volume snapshot | **1–4 hours** |
| Phase 4 migration corrupts data | Restore `products` collection from backup | **1–2 hours** |
| Production outage | Railway rollback to last healthy deployment | **15–60 minutes** |

**Order of rollback:** Stop deploy → revert code → restore data if needed → verify health `GET /api/health` → smoke test marketplace.

---

## 9. Testing Plan (Regression Checklist)

### Marketplace (`/wholesaler/marketplace`)

| | Before Phase 1 | After Phase 1 | After Phase 3 |
|--|----------------|---------------|---------------|
| Upload product (`battttt`) | Works (resolved URL) | **Same** | **200** on production |
| Base64 product | Works | **Same** | **Same** |
| External URL product | Mostly works | **Same** | **Same** |
| Missing file product | Placeholder | **Same** | Fixed after Phase 2 re-upload |

---

### Product detail (`/wholesaler/marketplace/product/[id]`)

| | Before | After Phase 1A | After Phase 3 |
|--|--------|----------------|---------------|
| Upload product | **Broken** (`localhost:3000/uploads/...`) | **Loads** from `:5001` | **Loads** on production |
| Base64 / HTTP | Works | **Same** | **Same** |
| Error UX | Hidden image | Hidden (Phase 5: placeholder) | Placeholder optional |

---

### Manufacturer profile (`/wholesaler/manufacturer/[id]`)

| | Before | After Phase 1A |
|--|--------|----------------|
| Upload product card | **Broken** wrong origin | **Loads** from API base |
| Other formats | Works | **Same** |

---

### Orders list (`/wholesaler/orders`)

| | Before | After Phase 1A |
|--|--------|----------------|
| Order with upload product thumbnail | **Broken** | **Loads** |

---

### Order detail (`/wholesaler/orders/[id]`)

| | Before | After all phases |
|--|--------|------------------|
| Line item images | Already resolved | **Unchanged** (regression: must still work) |

---

### Inventory (`/manufacturer/products`)

| | Before | After Phase 1 |
|--|--------|---------------|
| Product images | Resolved | **Regression only — must not break** |

---

### Admin products panel

| | Before | After Phase 1 |
|--|--------|---------------|
| Thumbnails | Resolved | **Regression only** |

---

### Chat (list + thread)

| | Before | After Phase 1B |
|--|--------|----------------|
| Upload images | Works on threads | **Same** |
| Base64 on mfg. order detail / widget | May break | **Fixed** if 1B done |

---

### Advertisements (sponsored cards, slider, widget)

| | Before | After Phase 1B / 3 |
|--|--------|----------------------|
| Custom media uploads | Broken on prod | **Phase 3** fixes persistence |
| Product image fallback | Works locally | **Same** |

---

### Disputes

| | Before | After Phase 3 |
|--|--------|---------------|
| Evidence upload preview | Works locally | **Persists** on production |
| Dispute item preview (from order detail) | Pre-resolved | **Unchanged** |

---

### Product upload (`ProductForm`)

| | Before | After Phase 1 |
|--|--------|---------------|
| Preview after upload | Works | **Regression only** |
| Save product | Works | **Regression only** |

---

### Image upload API

| Test | Command / action | Expected after Phase 3 |
|------|------------------|------------------------|
| Product image upload | `POST /api/products/upload-image` | **201** + valid path |
| File reachable | `HEAD {API}{path}` | **200** |
| Survives redeploy | Redeploy Railway → re-HEAD | **200** |

---

### Profile images

| | Before | After Phase 3 |
|--|--------|---------------|
| Avatar upload | Works locally; lost on prod redeploy | **Persists** |

---

## 10. Final Implementation Order

### Original plan sequence

1 → 3 → 2 → 4 → 5

### Revised safest execution order

| Step | Phase | Rationale |
|------|-------|-----------|
| **0** | **Backups** | Mandatory gate — no code before this |
| **1** | **Phase 1A** | Zero backend risk; immediate localhost fix; validates approach |
| **2** | **Phase 3 planning** | Choose Path 3A (volume) or 3B (object storage); provision credentials **before** coding |
| **3** | **Phase 3 implementation** | Unblocks production — frontend-only work cannot fix prod 404s |
| **4** | **Phase 2** | Re-upload orphans **into** persistent storage |
| **5** | **Phase 1B** | Optional consolidation; safe after 1A proven stable |
| **6** | **Phase 4** | Long-term hygiene; requires stable storage |
| **7** | **Phase 5** | Polish last |

**Why not Phase 2 before Phase 3 on production?** Re-uploading to ephemeral disk does not survive the next deploy. Local Phase 2 can run after 1A for developer testing only.

**Why Phase 1 before Phase 3?** Decouples low-risk frontend deploy from high-risk infra; team can ship and test resolver pattern while storage is provisioned.

---

## 11. Risk Analysis by Phase

### Phase 0 — Backups

| | |
|--|--|
| **Worst case** | Incomplete backup; rollback impossible |
| **Probability** | Low |
| **Impact** | Critical if later phases corrupt data |
| **Recovery time** | N/A |
| **Rollback complexity** | N/A |

---

### Phase 1A

| | |
|--|--|
| **Worst case** | Double-prefixed URL if resolver applied twice |
| **Probability** | Very Low (`resolveProductImageUrl` passes through `http`/`data:`) |
| **Impact** | Low — broken images on 3 pages |
| **Recovery time** | < 15 min |
| **Rollback complexity** | **Very Low** — 3-file revert |

---

### Phase 1B

| | |
|--|--|
| **Worst case** | Regression on sponsored/chat pages |
| **Probability** | Low |
| **Impact** | Medium on affected widgets |
| **Recovery time** | < 30 min |
| **Rollback complexity** | **Low** — 6-file revert |

---

### Phase 2

| | |
|--|--|
| **Worst case** | Wrong image assigned to product |
| **Probability** | Low |
| **Impact** | Medium — data integrity |
| **Recovery time** | 30–60 min per product |
| **Rollback complexity** | **Low** — restore document from JSON export |

---

### Phase 3

| | |
|--|--|
| **Worst case** | All uploads fail; avatars/proofs/disputes broken |
| **Probability** | Medium without staging test |
| **Impact** | **Critical** on production |
| **Recovery time** | 1–4 hours |
| **Rollback complexity** | **High** — redeploy + volume/bucket state |

---

### Phase 4

| | |
|--|--|
| **Worst case** | Migration truncates or corrupts Base64 |
| **Probability** | Low–Medium |
| **Impact** | High for affected products |
| **Recovery time** | 1–2 hours |
| **Rollback complexity** | **Medium** — collection restore |

---

### Phase 5

| | |
|--|--|
| **Worst case** | Incorrect placeholder loop on error |
| **Probability** | Very Low |
| **Impact** | Low — cosmetic |
| **Recovery time** | < 15 min |
| **Rollback complexity** | **Very Low** |

---

## 12. Final GO / NO-GO Decision

## ✅ GO

**The project is ready to begin implementation** subject to the mandatory pre-flight steps below.

### Why GO

1. **Root causes are verified** with code references and live HTTP/API evidence (not assumptions).
2. **Phase 1A is isolated** — 3 frontend files, no API/DB/deploy changes, very low rollback cost.
3. **Scope is bounded** — protected modules (auth, payments, orders logic, schema) are explicitly excluded.
4. **Backup and rollback procedures** are defined before any code edit.
5. **Production path is clear** — Phase 3 storage decision is the only open **infrastructure** choice, not an analysis gap.

### Mandatory pre-flight before first code commit

- [ ] Complete **Phase 0 backups** (MongoDB export, uploads zip, env documentation)
- [ ] Create **backup branch or project zip**
- [ ] Confirm **Phase 3 path** (3A Railway volume vs 3B object storage) and assign owner
- [ ] Agree to ship **Phase 1A first** and validate before Phase 3 merge

### Not blocking GO (but required before production upload fix)

- [ ] Railway volume or object storage credentials provisioned
- [ ] Production `NEXT_PUBLIC_BACKEND_URL` verified on Vercel (HTTPS Railway URL)
- [ ] Staging smoke test plan for Phase 3 upload + redeploy

### Would trigger NO-GO (none currently apply)

- Missing MongoDB access for backup
- No ability to deploy or rollback Railway
- Unverified production frontend env (`NEXT_PUBLIC_BACKEND_URL`) — **verify before Phase 3 prod deploy**, not before Phase 1A local/staging

---

## Appendix A — Quick Reference: Verified Failure Evidence

| Test | Result |
|------|--------|
| `HEAD localhost:5001/uploads/product-1781532141186-b5dfcaec.png` | **200** |
| `HEAD localhost:3000/uploads/product-1781532141186-b5dfcaec.png` | **404** |
| `HEAD railway.app/uploads/product-1781532141186-b5dfcaec.png` | **404** |
| `GET localhost:5001/api/products` | 17 products: 10 HTTP, 5 Base64, 2 `/uploads/` |

---

## Appendix B — Estimated Total Effort

| Scope | Effort |
|-------|--------|
| Phase 0 + 1A only (localhost upload display fix) | **Half day** |
| Phase 0 + 1A + 3A (production persistence, volume) | **1–2 days** |
| Full roadmap (1A + 1B + 3B + 2 + 4 + 5) | **3–5 days** |

---

*End of final pre-implementation checklist. No code was modified during this task.*
