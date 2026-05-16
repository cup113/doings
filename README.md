# Doings

A real-time photo-sharing app built with SvelteKit. Snap a photo, share instantly — see everyone's uploads in a live waterfall.

## Features

- Camera capture → compress to 256px WebP → upload
- Real-time SSE feed — new photos appear instantly
- Image lightbox with prev/next navigation
- Per-user gallery view
- Inactivity reminders (staged, 20–30 min)
- Bandwidth limiter (2GB/day)
- Inactivity detection with notification warning

## Tech Stack

- **Runtime**: Node 22+ with `--experimental-sqlite`
- **Framework**: SvelteKit 2 + Svelte 5 (SPA mode, `ssr=false`)
- **Styling**: Tailwind CSS v4 (Vite plugin)
- **Database**: SQLite via `node:sqlite` (`DatabaseSync`)
- **Deploy**: Docker → Coolify

## Development

```bash
pnpm dev          # cross-env NODE_OPTIONS=--experimental-sqlite vite dev
pnpm build        # same flag, outputs to build/
pnpm check        # svelte-check (types)
pnpm lint         # ESLint
```

## Docker

```bash
docker compose up --build
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `UPLOADS_DIR` | `uploads` | Image storage directory |
| `DB_PATH` | `data/doings.db` | SQLite database path |
| `ORIGIN` | (required) | App origin URL (SvelteKit CSRF) |

## Coolify Deployment (Traefik)

SSE uses `text/event-stream` for real-time push. **Traefik's compression must exclude this content type** or events will be buffered.

In the Coolify dashboard, go to your application → **Container Labels**:

1. Uncheck **Readonly labels**
2. Add this line:
   ```
   traefik.http.middlewares.gzip.excludedcontenttypes=text/event-stream
   ```
3. Save and redeploy

If something breaks, click **Reset Labels to Defaults** and re-enable Readonly labels.

The SSE endpoint also sends `X-Accel-Buffering: no` and `Cache-Control: no-store` headers as additional protection against proxy buffering.

## Project Structure

```
src/
├── hooks.server.ts              Bandwidth gating (503) + download tracking
├── lib/
│   ├── server/
│   │   ├── bandwidth.ts         Byte counter + daily reset
│   │   ├── db.ts                SQLite queries
│   │   ├── events.ts            EventEmitter for SSE
│   │   └── imageStore.ts        File storage logic
│   ├── components/
│   │   ├── HelpPanel.svelte
│   │   ├── InactivityWarning.svelte
│   │   ├── RelativeTime.svelte
│   │   ├── UploadButton.svelte
│   │   ├── UserGallery.svelte
│   │   └── Waterfall.svelte
│   ├── stores/
│   │   └── app.ts               Current UID, viewing user
│   ├── utils/
│   │   ├── api.ts               Fetch wrappers
│   │   ├── compress.ts          Canvas WebP compression
│   │   ├── format.ts            Relative time formatting
│   │   └── identity.ts          nanoid identity
│   ├── assets/
│   │   └── favicon.png
│   └── types.ts
├── routes/
│   ├── +layout.svelte           Root layout (favicon, title)
│   ├── +layout.ts               ssr = false
│   ├── +page.svelte             Main orchestrator
│   ├── layout.css               @import 'tailwindcss'
│   └── api/
│       ├── bandwidth/+server.ts GET bandwidth usage
│       ├── events/+server.ts    SSE endpoint
│       ├── health/+server.ts    Health check
│       ├── images/+server.ts    GET all images
│       ├── images/[uid]/+server.ts  GET user images
│       ├── upload/+server.ts    POST upload handler
│       └── uploads/[...path]/+server.ts  Serve files
├── app.html
└── app.d.ts
```
