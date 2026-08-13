# GearUp Image Loading Audit Report

**Project:** GearUp (B2B Platform)  
**Audit Type:** Investigation only — no code changes applied  
**Date:** June 8, 2026  
**Scope:** Product images, uploads, static assets, frontend rendering, backend serving, deployment

---

## 1. Executive Summary

This audit traced the full image lifecycle (upload → storage → database → API → frontend → browser) across localhost and production (`https://gearup-production-8048.up.railway.app`).

### Database snapshot (verified via read-only MongoDB query)

| Metric | Count |
|--------|------:|
| Total products | 18 |
| Products with no images | 1 |
| Products using `/uploads/` paths | 2 |
| Products using external `http(s)://` URLs | 10 |
| Products using inline `data:` (Base64) images | 5 |
| Products using `/images/` public paths | 0 |

### Local filesystem snapshot (`backend/uploads/`)

| Metric | Count |
|--------|------:|
| Total files in uploads directory | 104 |
| Image files (png/jpg/jpeg/webp/gif) | 34 |
| Files with `product-` prefix | 5 |
| Files with `gearup-` prefix | 21 |
| DB `/uploads/` paths with matching local file | 1 |
| DB `/uploads/` paths missing on local disk | 1 |

### HTTP verification results

| URL tested | Localhost backend (5001) | Localhost frontend (3000) | Production Railway |
|------------|:------------------------:|:-------------------------:|:------------------:|
| `/uploads/product-1781532141186-b5dfcaec.png` (exists locally) | **200** | **404** | **404** |
| `/uploads/product-1781546088061-53400d09.png` (referenced in DB) | **404** | **404** | **404** |
| `/images/gearup-product-placeholder.svg` | N/A (Next.js asset) | **200** | Not tested |
| Production `/api/health` | N/A | N/A | **200** |
| Production `/api/products` | N/A | N/A | **200** (17 products returned) |

### Overall health status: **Degraded**

- **Some images work:** External hotlinked URLs and Base64-encoded images can render when the frontend receives them correctly.
- **Uploaded product images are largely broken in production:** All tested `/uploads/` paths return **404** on Railway.
- **Additional frontend routing bugs** cause `/uploads/` paths to fail on specific pages even when the file exists on the local backend.
- **Impact is partial, not total:** Marketplace list view resolves many images correctly; product detail, manufacturer profile, and orders list do not.

---

## 2. Root Cause Analysis

### RC-1: Ephemeral upload storage on production (Railway)

| Field | Detail |
|-------|--------|
| **Description** | Uploaded files are stored on the backend container filesystem and are not persisted across deploys or included in the Docker image. |
| **Root cause** | `backend/uploads/*` is gitignored; `Dockerfile` only runs `mkdir -p uploads`; Railway deployment has no attached persistent volume or external object storage. |
| **Severity** | **Critical** |
| **Impact** | Every product (and avatar/dispute/ad) image stored as `/uploads/...` returns **404** on production. Verified: file that exists locally (`product-1781532141186-b5dfcaec.png`) also returns **404** on Railway. |
| **Evidence** | `.gitignore` lines 22–24; `Dockerfile` line 10; HTTP test `404` for `https://gearup-production-8048.up.railway.app/uploads/product-1781532141186-b5dfcaec.png`; DB contains `/uploads/` references but production filesystem is empty after deploy. |

---

### RC-2: Missing upload files on local disk (DB/file mismatch)

| Field | Detail |
|-------|--------|
| **Description** | At least one product references an upload path that does not exist on the local filesystem. |
| **Root cause** | Database record outlived the file (manual deletion, failed upload completion, environment sync, or redeploy without matching files). |
| **Severity** | **High** |
| **Impact** | Product **"cricket bat"** (`6a3006887f27cb01ae8ecda1`) references `/uploads/product-1781546088061-53400d09.png` — **404** on both localhost:5001 and production. |
| **Evidence** | Read-only DB query; `Invoke-WebRequest` HEAD → **404** on `http://localhost:5001/uploads/product-1781546088061-53400d09.png`. |

---

### RC-3: Inconsistent frontend URL resolution for `/uploads/` paths

| Field | Detail |
|-------|--------|
| **Description** | Several pages render raw database paths (e.g. `/uploads/product-....png`) without prefixing `NEXT_PUBLIC_BACKEND_URL`. Browsers request these from the **Next.js origin** (e.g. `localhost:3000`), not the API server. |
| **Root cause** | `resolveProductImageUrl()` exists in `frontend/src/lib/marketplaceData.js` but is **not used** on all image-rendering pages. |
| **Severity** | **High** |
| **Impact** | Even when a file **exists** on the backend (`200` at `localhost:5001`), the same path returns **404** at `localhost:3000`. Affects product detail, manufacturer profile, and orders list. |
| **Evidence** | HTTP test: `200` on port 5001 vs `404` on port 3000 for the same `/uploads/...` path. Code comparison below. |

**Pages using `resolveProductImageUrl` (correct for `/uploads/`):**
- `frontend/src/app/wholesaler/marketplace/page.js` (at fetch/map time)
- `frontend/src/app/manufacturer/products/page.js`
- `frontend/src/app/wholesaler/cart/page.js`
- `frontend/src/app/wholesaler/orders/[id]/page.js`
- `frontend/src/components/manufacturer/ProductForm.js`
- `frontend/src/components/admin/panels/AdminProductsPanel.js`

**Pages using raw paths (broken for `/uploads/`):**
- `frontend/src/app/wholesaler/marketplace/product/[id]/page.js` — `src={product.images[selectedImage]}`
- `frontend/src/app/wholesaler/manufacturer/[id]/page.js` — `image: p?.images?.[0]` then `src={asset.image}`
- `frontend/src/app/wholesaler/orders/page.js` — `src={order.items[0].product?.images?.[0]}`

---

### RC-4: Mixed and unreliable image source formats in the database

| Field | Detail |
|-------|--------|
| **Description** | Product `images[]` contains three different storage strategies: relative upload paths, third-party hotlinks, and inline Base64 blobs. |
| **Root cause** | Product form supports file upload, manual URL entry (`handleAddImage`), and historical data migration patterns without normalization. |
| **Severity** | **Medium** |
| **Impact** | Behavior varies by product: hotlinks may break when external hosts block hotlinking; Base64 increases API payload size; upload paths fail without persistent storage. |
| **Evidence** | DB audit: 10 HTTP, 5 Base64, 2 `/uploads/` out of 18 products. Sample HTTP path: `https://encrypted-tbn0.gstatic.com/images?q=tbn:...` (HEAD request failed in audit). Sample Base64 entries validated with `base64Length % 4 === 0` (structurally valid). |

---

### RC-5: Product detail page hides broken images instead of showing fallback

| Field | Detail |
|-------|--------|
| **Description** | On product detail, `onError` sets `display: 'none'` rather than substituting `PRODUCT_PLACEHOLDER`. |
| **Root cause** | Error handler in `product/[id]/page.js` only hides the `<img>` element. |
| **Severity** | **Low** |
| **Impact** | Users see an empty gallery area rather than a placeholder when an image fails. |
| **Evidence** | `frontend/src/app/wholesaler/marketplace/product/[id]/page.js` lines 190, 213: `onError={(e) => { e.currentTarget.style.display = 'none'; }}` |

---

### RC-6: Upload directory contains mostly non-product files

| Field | Detail |
|-------|--------|
| **Description** | Local `backend/uploads/` holds 104 files, predominantly PDFs (verification proofs, receipts), while only 5 files use the `product-` prefix. |
| **Root cause** | Multiple upload endpoints (`/api/products/upload-image`, `/api/upload`, auth registration uploads) share one directory. |
| **Severity** | **Low** (operational clarity) |
| **Impact** | Does not directly break rendering, but makes it harder to reconcile DB references with disk contents. Proof PDFs are correctly blocked from direct public access (403). |
| **Evidence** | Directory listing shows files like `1778871199889-7-04-2026.pdf`; `backend/server.js` lines 58–62 return **403** for `proof-` and `.pdf` paths. |

---

## 3. File-Level Findings

### Frontend

| File | Purpose | Findings |
|------|---------|----------|
| `frontend/src/lib/marketplaceData.js` | Central image URL resolver | `resolveProductImageUrl()` correctly prefixes API base URL for `/uploads/` paths; passes through `http`, `data:`, and `/images/` unchanged. |
| `frontend/src/lib/api.js` | API base URL | Requires `NEXT_PUBLIC_BACKEND_URL`; production must be HTTPS. |
| `frontend/src/app/wholesaler/marketplace/page.js` | Marketplace grid | Resolves images at map time; has `onError` fallback to placeholder. |
| `frontend/src/app/wholesaler/marketplace/product/[id]/page.js` | Product detail | **Does not** use `resolveProductImageUrl`; raw `src` breaks `/uploads/` paths. |
| `frontend/src/app/wholesaler/manufacturer/[id]/page.js` | Seller profile | Raw `p.images[0]` assigned to `asset.image`; no URL resolution. |
| `frontend/src/app/wholesaler/orders/page.js` | Orders list | Raw product image paths in table thumbnails. |
| `frontend/src/components/manufacturer/ProductForm.js` | Product create/edit | Uploads via `/api/products/upload-image` (field `image`); also allows pasting external URLs. Default cover `/images/ca-plus-15000-primary-cover.png` exists on disk. |
| `frontend/src/components/ads/SponsoredProductCard.js` | Sponsored cards | Custom URL builder similar to resolver; prepends `getApiBaseUrl()` for non-http paths. |
| `frontend/src/components/advertising/PremiumCampaignCard.js` | Campaign cards | `getImageUrl()` helper correctly resolves `/uploads/` paths. |
| `frontend/src/components/disputes/DisputeModal.js` | Dispute evidence | Upload preview correctly uses `` `${getApiBaseUrl()}${src}` ``; dispute item preview uses raw `disputeItem.image`. |
| `frontend/src/lib/avatarUtils.js` | Avatar resolution | Correctly prefixes `/uploads/` with API base URL. |

### Backend

| File | Purpose | Findings |
|------|---------|----------|
| `backend/server.js` | Static file serving | Serves `uploads/` at `/uploads`; blocks direct access to `proof-` files and `.pdf` with **403**. |
| `backend/middleware/uploadMiddleware.js` | Product image upload | Saves to `backend/uploads/` with `product-{timestamp}-{hex}{ext}` naming; 5 MB limit; JPEG/PNG/WEBP only. |
| `backend/controllers/productController.js` | Product CRUD + upload | `uploadImage` returns `{ path: '/uploads/{filename}' }`; stores path string in product `images[]`. |
| `backend/routes/productRoutes.js` | Routes | `POST /api/products/upload-image` uses `upload.single('image')`. |
| `backend/routes/uploadRoutes.js` | Generic upload | `POST /api/upload` expects field `file`; returns `filePath` and `url`. |
| `backend/models/Product.js` | Schema | `images: [String]` — no validation of path format or file existence. |

### Configuration

| File | Findings |
|------|----------|
| `.gitignore` / `backend/.gitignore` | `uploads/*` excluded from version control — files never ship with deploy artifacts. |
| `Dockerfile` | Creates empty `uploads/` directory only; no COPY of upload files. |
| `railway.toml` | Health check on `/api/health`; no volume or storage configuration. |
| `frontend/next.config.mjs` | No `images.remotePatterns` or asset rewrites — not blocking current `<img>` usage. |
| `frontend/.env.local.example` | Documents `NEXT_PUBLIC_BACKEND_URL` for local (`5001`) and production Railway URL. |

---

## 4. Database Findings

### Image path formats observed (verified)

| Format | Count | Example |
|--------|------:|---------|
| External HTTP(S) URL | 10 | `https://encrypted-tbn0.gstatic.com/images?q=tbn:...` |
| Base64 data URI | 5 | `data:image/jpeg;base64,/9j/4AAQSkZJRg...` |
| `/uploads/` relative path | 2 | `/uploads/product-1781532141186-b5dfcaec.png` |
| Empty / missing | 1 | `images: []` or absent |

### Missing / invalid paths

| Product | Stored path | Local file | Production file |
|---------|-------------|:----------:|:---------------:|
| battttt | `/uploads/product-1781532141186-b5dfcaec.png` | **Exists** | **404** |
| cricket bat | `/uploads/product-1781546088061-53400d09.png` | **Missing** | **404** |

### Base64 integrity (5 products)

All five Base64 entries had valid MIME prefixes and `base64Length % 4 === 0` (no obvious truncation). Sizes range from ~7 KB to ~100 KB encoded payload per product.

| Product name | MIME | Encoded length |
|--------------|------|---------------:|
| JD Srilankan Wood Bat | image/jpeg | 21,368 |
| Professional FOOTBALL | image/webp | 52,864 |
| PERIMUM PROTECTIVE GEAR | image/webp | 7,572 |
| hand crack | image/jpeg | 100,388 |
| cricket bat | image/webp | 52,864 |

### Other DB notes

- No duplicate path records identified in sample set.
- No bare filenames (without `/`) found in product `images[]`.
- No `/images/` paths stored in product records (defaults are applied at form level, not necessarily persisted).

---

## 5. Backend Findings

### Upload configuration

- **Product images:** `POST /api/products/upload-image` → `backend/uploads/product-*.{jpg,png,webp}`
- **Generic files:** `POST /api/upload` → `backend/uploads/gearup-*` or `proof-*`
- **Auth uploads:** Registration/profile → `/uploads/{timestamp}-{originalname}`

### Static middleware

```javascript
// backend/server.js (lines 58–63)
app.use('/uploads', (req, res, next) => {
    if (req.url.includes('proof-') || req.url.includes('.pdf')) {
        return res.status(403).json({ success: false, error: 'Direct access to proofs is forbidden.' });
    }
    next();
}, express.static(path.join(__dirname, 'uploads')));
```

- Product images are publicly served (no auth) when the file exists.
- Proof documents correctly return **403** on direct `/uploads/` access.

### API responses

- `GET /api/products` returns raw `images[]` strings from MongoDB without transforming to absolute URLs.
- Frontend is responsible for URL resolution — inconsistently applied.

### Storage location

- Single local directory: `backend/uploads/`
- **No cloud storage** (S3, Cloudinary, etc.) configured in codebase.

### Permission issues

- No filesystem permission errors observed during audit.
- Failures are **404 Not Found**, not **403 Forbidden** (except proof/PDF blocking).

---

## 6. Frontend Findings

### Image rendering logic

Central resolver (`resolveProductImageUrl`):

```javascript
// frontend/src/lib/marketplaceData.js
if (image.startsWith('http') || image.startsWith('data:')) return image;
if (image.startsWith('/images/')) return image;
return `${getApiBaseUrl()}${separator}${image}`;
```

### Broken image sources (by page)

| Page | Issue |
|------|-------|
| Product detail | `/uploads/...` requested from Next.js origin → **404** |
| Manufacturer profile | Same |
| Orders list | Same |
| Marketplace | Resolved correctly, but still **404** if backend file missing |
| Cart | Pre-resolved at load — same backend dependency |

### Fallback behavior

- Marketplace, inventory, admin panels: fallback to `PRODUCT_PLACEHOLDER` on error.
- Product detail: image hidden on error (no placeholder).
- Placeholder asset `/images/gearup-product-placeholder.svg` exists and returns **200**.

### Relative vs absolute paths

- `/images/*` and `/assets/*` → served by Next.js (verified **200** for logo and default cover).
- `/uploads/*` → must be served by backend; requires absolute URL with API host.

### Lazy loading

- No Next.js `<Image>` component usage detected for product photos; standard `<img>` tags used throughout. Not a confirmed failure source.

---

## 7. Deployment Findings

### Localhost vs production

| Aspect | Localhost | Production (Railway) |
|--------|-----------|----------------------|
| API health | OK (`localhost:5001`) | OK |
| Upload persistence | Files persist on developer machine | **Not persisted** — empty after deploy |
| `/uploads/` serving | Works when file exists locally | **404 for all tested upload paths** |
| Shared MongoDB | Same DB paths referenced in both environments | Same broken `/uploads/` references |
| Frontend hosting | Next.js dev server (`localhost:3000`) | Vercel (per `.env.local.example` comment) — not directly tested in this audit |
| Env var | `NEXT_PUBLIC_BACKEND_URL=http://localhost:5001` | Expected HTTPS Railway URL |

### Why both environments show issues

1. **Production:** Files never deployed → all `/uploads/` paths fail regardless of frontend resolution.
2. **Localhost:** Shared DB may reference files uploaded on another machine or deleted locally; frontend resolution gaps cause additional **404**s even when backend has the file.

### Build / static asset handling

- Frontend public assets (`/images/`, `/assets/`) are bundled with Next.js and work independently of the backend.
- Backend upload files are **not** part of any build artifact.

---

## 8. Console & Network Errors

### Verified HTTP errors

| Error | URL pattern | Where observed |
|-------|-------------|----------------|
| **404 Not Found** | `/uploads/product-*.png` | Production Railway; localhost frontend; one path on localhost backend |
| **404 Not Found** | `/uploads/product-*.png` via Next.js origin | `localhost:3000/uploads/...` |
| **403 Forbidden** | `/uploads/proof-*` and `/uploads/*.pdf` | Expected backend security behavior |

### Not observed in this audit

- **500** errors on image routes (not triggered during tests)
- **CORS** errors on static `/uploads/` GET requests
- **MIME type** misconfiguration (static middleware uses express defaults)
- **Network timeout** on tested endpoints

### Frontend / backend console logs

- Active `npm run dev` terminal showed normal Next.js page renders only; **no image-specific errors logged**.
- Backend console was not running during HTTP tests; errors inferred from HTTP status codes only.

### External URL reliability

- Sample Google encrypted thumbnail URL: **failed** HEAD request in audit environment.
- Sample Yahoo image URL: **200**.
- External product images may fail unpredictably depending on referrer policies and URL expiry.

---

## 9. Affected Pages

| Page | Route / component | Affected image types | Severity |
|------|-------------------|----------------------|----------|
| Marketplace | `/wholesaler/marketplace` | `/uploads/` (missing files); some external URLs | Partial |
| Product detail | `/wholesaler/marketplace/product/[id]` | **All `/uploads/`** (resolution bug); missing files | High |
| Manufacturer profile | `/wholesaler/manufacturer/[id]` | **All `/uploads/`** (resolution bug) | High |
| Orders list | `/wholesaler/orders` | **All `/uploads/`** (resolution bug) | Medium |
| Order detail | `/wholesaler/orders/[id]` | `/uploads/` when file missing on backend | Partial |
| Inventory console | `/manufacturer/products` | `/uploads/` when file missing | Partial |
| Cart | `/wholesaler/cart` | `/uploads/` when file missing | Partial |
| Product form preview | Manufacturer product create/edit | `/uploads/` when file missing | Partial |
| Admin products panel | Admin dashboard | `/uploads/` when file missing | Partial |
| Sponsored / ads cards | Marketplace hero & sponsored sections | `/uploads/` custom media when file missing | Partial |
| Dispute modal | Order disputes | Uploaded evidence (after upload, if file later missing) | Partial |

### Scope of impact

- **Not all images:** Base64 and some external URLs can still display.
- **Primarily uploaded images:** `/uploads/` strategy is the most broken category.
- **Production:** All upload-based images affected.
- **Localhost:** Upload-based images affected on specific pages + any DB references to missing files.

---

## 10. Risk Assessment

| Issue | UX | Performance | Data integrity | Production stability |
|-------|:--:|:-----------:|:--------------:|:-------------------:|
| Ephemeral Railway storage | **High** | Low | **High** (DB references orphaned files) | **High** |
| DB/file mismatch | **High** | Low | **Medium** | Medium |
| Missing URL resolver on key pages | **High** | Low | Low | Medium |
| Base64 in MongoDB | Low | **Medium** (large API payloads) | Medium | Low |
| External hotlinks | **Medium** | Low | Low | Low |
| Hidden broken images on detail page | **Medium** | Low | Low | Low |

### SEO

- Minimal impact; product pages are authenticated B2B views, not public SEO landing pages.

---

## 11. Recommended Fixes

> **These are recommendations only. No fixes were implemented during this audit.**

### Fix 1: Move uploads to persistent object storage (Critical)

- **What:** Store uploaded files in S3, Cloudinary, Railway Volume, or similar; save full URL or stable key in MongoDB.
- **Why:** Container filesystem is wiped on every Railway deploy; gitignored files never reach production.
- **Likely files:** `backend/middleware/uploadMiddleware.js`, `backend/routes/uploadRoutes.js`, `backend/controllers/productController.js`, deployment config, environment variables.

### Fix 2: Attach persistent volume or sync strategy on Railway (Critical alternative/complement)

- **What:** Mount a Railway persistent volume at `/app/uploads` or migrate to external storage.
- **Why:** Current `Dockerfile` creates an empty directory on each deploy.
- **Likely files:** `Dockerfile`, `railway.toml`, deployment docs.

### Fix 3: Use `resolveProductImageUrl()` on all product image renders (High)

- **What:** Apply the existing resolver on product detail, manufacturer profile, orders list, and any other raw `images[0]` usage.
- **Why:** Verified **404** on Next.js origin vs **200** on API origin for the same `/uploads/` path.
- **Likely files:**  
  - `frontend/src/app/wholesaler/marketplace/product/[id]/page.js`  
  - `frontend/src/app/wholesaler/manufacturer/[id]/page.js`  
  - `frontend/src/app/wholesaler/orders/page.js`

### Fix 4: Reconcile database with filesystem (High)

- **What:** Identify products whose `images[]` reference missing files; re-upload or migrate to stable storage.
- **Why:** At least one product (`cricket bat`) references a non-existent file locally and in production.
- **Likely files:** One-time migration script or admin tooling (not present today).

### Fix 5: Normalize image storage format (Medium)

- **What:** Standardize on one approach (object storage URLs); migrate Base64 and fragile hotlinks.
- **Why:** Mixed formats create inconsistent behavior and large API responses.
- **Likely files:** `ProductForm.js`, `productController.js`, migration script.

### Fix 6: Improve product detail error handling (Low)

- **What:** Replace `display: 'none'` with placeholder fallback (consistent with marketplace).
- **Why:** Better UX when images fail.
- **Likely file:** `frontend/src/app/wholesaler/marketplace/product/[id]/page.js`

---

## 12. Final Conclusion

### Primary root cause

**Uploaded images are stored on a non-persistent local filesystem that is excluded from deployment.** Production (Railway) serves `/uploads/` from an empty container directory, producing **404** for every upload-based product image. This alone explains why the issue appears on live deployment.

### Secondary issues

1. **Frontend URL resolution is inconsistent** — product detail, manufacturer profile, and orders list request `/uploads/` from the wrong origin on localhost.
2. **Database references files that do not exist on disk** — at least one confirmed orphaned path.
3. **Heterogeneous image data** (hotlinks + Base64 + uploads) creates uneven reliability across products.

### Overall project health

The platform has a working upload pipeline and static serving middleware for development, but **production image delivery for user-uploaded content is not viable** without persistent or external storage. Static Next.js assets (logo, placeholder) work correctly.

### Estimated fix complexity

| Fix area | Complexity |
|----------|------------|
| Object storage integration | **High** (1–2 days+) |
| Frontend resolver consistency | **Low** (hours) |
| DB/file reconciliation | **Medium** (depends on product count) |
| Base64/hotlink migration | **Medium** |

---

## Appendix A: Image Upload Flow Trace

```
User selects file (ProductForm)
        ↓
POST /api/products/upload-image  (field: "image")
        ↓
multer → backend/uploads/product-{ts}-{hex}.{ext}
        ↓
Response: { path: "/uploads/product-....png" }
        ↓
Stored in MongoDB product.images[]
        ↓
GET /api/products returns raw path string
        ↓
Frontend mapping (if resolveProductImageUrl used)
        ↓
Browser GET {NEXT_PUBLIC_BACKEND_URL}/uploads/product-....png
        ↓
express.static serves file — IF file exists on server filesystem
```

**Failure points identified:**
1. File not on production filesystem (deploy)
2. File missing locally (DB orphan)
3. Frontend skips URL resolver → requests wrong host
4. External/Base64 sources fail independently of upload pipeline

---

## Appendix B: Investigation Methods

- Static code review of frontend, backend, config, and deployment files
- Read-only MongoDB query (18 products, image format classification)
- Local filesystem inspection (`backend/uploads/`)
- HTTP HEAD/GET tests on localhost (ports 3000, 5001) and production Railway
- Review of `.gitignore`, `Dockerfile`, and `railway.toml`

## Appendix C: Verification Limitations

- Production **frontend** (Vercel) was not directly tested; findings for production focus on the Railway API and `/uploads/` static serving.
- Not every product image URL was individually fetched; samples represent each storage format.
- Browser DevTools console/network capture was not performed in a live browser session during this audit.
- Temporary read-only audit queries were run against MongoDB; no records were modified.

---

*End of report.*
