# Doings

## Architecture

- **Runtime**: Node 22+ with `--experimental-sqlite` flag, injected via `cross-env NODE_OPTIONS`
- **Framework**: SvelteKit 2 with Svelte 5 runes, SPA mode (`ssr=false`)
- **Styling**: Tailwind CSS v4 (Vite plugin, not PostCSS)
- **Deploy**: Docker Compose to Coolify

## Directory Structure

```
src/
├── hooks.server.ts               Bandwidth middleware (daily 2GB limit)
├── lib/
│   ├── server/
│   │   ├── bandwidth.ts          In-memory byte counter + daily reset
│   │   ├── config.ts             Environment config (UPLOADS_DIR, DB_PATH)
│   │   ├── events.ts             Typed EventEmitter for SSE broadcast
│   │   ├── imageStore.ts         Write file + insert DB + prune + emit event
│   │   ├── init.ts               Composition root: connect DB → migrate → create repo
│   │   ├── migrate.ts            Schema DDL (CREATE TABLE, indexes, PRAGMAs)
│   │   ├── repository.ts         ImageRepository interface + DeleteResult type
│   │   └── SqliteImageRepository.ts  SQLite adapter implementing ImageRepository
│   ├── components/
│   │   ├── HelpPanel.svelte      How-to overlay panel
│   │   ├── ImageLightbox.svelte  Full-screen image viewer with prev/next navigation
│   │   ├── InactivityWarning.svelte  30min idle → red overlay + Notification API
│   │   ├── RelativeTime.svelte   Live-updating relative timestamp
│   │   ├── UploadButton.svelte   Camera → compress (384px, 0.75 WebP) → upload
│   │   ├── UserGallery.svelte    Single user's latest 12 images
│   │   └── Waterfall.svelte      Grid of all users' latest 12 images
│   ├── stores/
│   │   └── app.ts                currentUid, shortUid, viewingUser store
│   ├── utils/
│   │   ├── api.ts                Typed fetch wrappers for all endpoints
│   │   ├── compress.ts           Browser Canvas API resize + WebP encode
│   │   ├── format.ts             Relative time formatter
│   │   └── identity.ts           nanoid generation, persisted in localStorage
│   ├── assets/
│   │   └── favicon.png           512×512 favicon
│   └── types.ts
├── routes/
│   ├── +layout.svelte            Root layout: title, favicon (svelte:head)
│   ├── +layout.ts                ssr = false (SPA)
│   ├── +page.svelte              Orchestrator: waterfall ↔ user gallery, SSE-driven updates
│   ├── layout.css                @import 'tailwindcss'
│   └── api/
│       ├── bandwidth/+server.ts  GET current bandwidth usage
│       ├── events/+server.ts     SSE stream (Readable.toWeb)
│       ├── health/+server.ts     GET DB health check
│       ├── images/+server.ts     GET all recent images
│       ├── images/[uid]/+server.ts  GET user's recent images
│       ├── images/delete/+server.ts  POST delete (ownership validated) → SSE emit
│       ├── upload/+server.ts     POST multipart → storeImage → SSE emit
│       └── uploads/[...path]/+server.ts  Serve image files
├── app.html
├── app.d.ts
```

## Data Flow

```
[Camera] → [Canvas compress (384px, 0.75 WebP)] → POST /api/upload
→ storeImage() writes uploads/{uid}/{ts}-{random}.webp
→ INSERT into SQLite (uid, path, created_at)
→ prune() caps at 100/user & 2,000 total (deletes oldest file + row)
→ EventEmitter.emit('new_image') → SSE /api/events pushes to all clients
→ Waterfall / UserGallery update via untrack(() => images)
```

## Pruning

- On each upload, `imageStore.prune()` enforces two limits synchronously:
  - **Per-user**: max 100 images (deletes the user's oldest)
  - **Global**: max 2,000 images total (deletes global oldest)
- File deletion via `fs.unlinkSync`; DB deletion via `DELETE FROM images WHERE id = ?`
- No cron, no background process — runs inline in the upload request

## Self-delete

- Users can delete their own images from their User Gallery (self-uid only)
- `POST /api/images/delete` validates `image.uid === uid` server-side
- On success: `fs.unlinkSync` file + `DELETE FROM images WHERE id = ?` + `imageEvents.emit('delete_image')`
- `deleteImageRecord()` returns `DeleteResult` discriminated union (`{ ok: true, record } | { ok: false, reason }`) instead of throwing strings; routes map `reason` directly to HTTP status codes
- SSE `delete_image` event is dispatched; all connected clients filter out the deleted image from both waterfall and user gallery views
- Independent of prune — both mechanisms coexist (user removes specific images; prune caps overall counts)

## Identity

- On first visit, `nanoid()` is generated and stored in `localStorage('doings_uid')`.
- `localStorage('doings_last_upload')` records last upload timestamp for 30min inactivity check.
- `localStorage('doings_snooze_until')` persists snooze expiry across page reloads (set by InactivityWarning snooze buttons).

## Bandwidth Limiter

- In-memory counters: `uploadBytes` + `downloadBytes`
- Daily reset: checked on each bandwidth operation (no polling)
- 2GB limit: `hooks.server.ts` returns 503 for any `/api/*` route (except `/api/bandwidth`)
- Upload tracking: `hooks.server.ts` reads request `content-length` on `POST /api/upload`
- Download tracking: `hooks.server.ts` reads response `content-length` on `/api/uploads/*`

## Key Commands

```bash
pnpm dev          # cross-env NODE_OPTIONS=--experimental-sqlite vite dev
pnpm build        # same flag, outputs to build/
pnpm check        # svelte-check (types)
pnpm lint         # ESLint
```

## Docker (Coolify)

```bash
docker compose up --build
```

Environment variables:
- `UPLOADS_DIR` (default: `uploads`)
- `DB_PATH` (default: `data/doings.db`)
- `ORIGIN` — required by SvelteKit for CSRF protection
- `BODY_SIZE_LIMIT` (default: `1048576`) — max upload body size in bytes (1 MB)

### Coolify + Traefik: SSE Fix

Coolify's Traefik compresses `text/event-stream` by default, which buffers SSE data. To fix, add this to the application's **Container Labels** (after unchecking "Readonly labels"):

```
traefik.http.middlewares.gzip.excludedcontenttypes=text/event-stream
```

Or via Docker Compose label shorthand:

```yaml
labels:
  - "coolify.traefik.middlewares=doings-sse"
  - "traefik.http.middlewares.doings-sse.excludedcontenttypes=text/event-stream"
```

The SSE endpoint also sends `X-Accel-Buffering: no` and `Cache-Control: no-store` as additional protection.
