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
│   │   ├── db.ts                 SQLite via node:sqlite (DatabaseSync)
│   │   ├── events.ts             EventEmitter for SSE broadcast
│   │   └── bandwidth.ts          In-memory byte counter + daily reset
│   ├── components/
│   │   ├── UploadButton.svelte   Camera → compress (192px, 0.5 WebP) → upload + onUpload callback
│   │   ├── Waterfall.svelte      Grid of all users' latest 10 images
│   │   ├── UserGallery.svelte    Single user's latest 10 images
│   │   └── InactivityWarning.svelte  30min idle → red overlay + Notification API
│   ├── utils/
│   │   ├── identity.ts           nanoid generation, persisted in localStorage
│   │   ├── compress.ts            Browser Canvas API resize + WebP encode
│   │   └── api.ts                Typed fetch wrappers for all endpoints
│   ├── assets/
│   │   └── favicon.png           512×512 favicon
│   └── types.ts
├── routes/
│   ├── +layout.svelte            Root layout: title, favicon (svelte:head)
│   ├── +layout.ts                ssr = false (SPA)
│   ├── +page.svelte              Orchestrator: waterfall ↔ user gallery, SSE + onUpload fallback
│   └── api/
│       ├── upload/+server.ts     POST multipart → save to uploads/ + SQLite + SSE emit
│       ├── images/+server.ts     GET all recent images
│       ├── images/[uid]/+server.ts  GET user's recent images
│       ├── events/+server.ts     SSE stream (Readable.toWeb)
│       ├── uploads/[...path]/+server.ts  Serve image files
│       └── bandwidth/+server.ts  GET current bandwidth usage
├── app.html
├── app.d.ts
└── layout.css                   @import 'tailwindcss'
```

## Data Flow

```
[Camera] → [Canvas compress (192px, 0.5 WebP)] → POST /api/upload
→ save file to uploads/{uid}/{ts}.webp
→ INSERT into SQLite (uid, path, created_at)
→ EventEmitter.emit('new_image') → SSE /api/events pushes to all clients
→ onUpload callback updates images immediately (SSE fallback)
→ Waterfall / UserGallery update via untrack(() => images)
```

## Identity

- On first visit, `nanoid()` is generated and stored in `localStorage('doings_uid')`.
- `localStorage('doings_last_upload')` records last upload timestamp for 30min inactivity check.

## Bandwidth Limiter

- In-memory counters: `uploadBytes` + `downloadBytes`
- Daily reset: checks every 60s if clock crossed midnight
- 2GB limit: `hooks.server.ts` returns 503 for any `/api/*` route (except `/api/bandwidth`)
- Download tracking: `hooks.server.ts` reads `content-length` on `/api/uploads/*` responses

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
- `BODY_SIZE_LIMIT` — 1MB default for upload endpoint

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
