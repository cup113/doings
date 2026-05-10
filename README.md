# Doings

A real-time photo-sharing app built with SvelteKit. Snap a photo, share instantly — see everyone's uploads in a live waterfall.

## Features

- Camera capture → compress to 192px WebP → upload
- Real-time SSE feed — new photos appear instantly
- Per-user gallery view
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
| `BODY_SIZE_LIMIT` | `1048576` | Max upload body size (bytes) |

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
├── hooks.server.ts              Bandwidth middleware
├── routes/
│   ├── +layout.svelte           Root layout (favicon, title)
│   ├── +layout.ts               ssr = false
│   ├── +page.svelte             Main orchestrator
│   └── api/
│       ├── upload/+server.ts    POST upload handler
│       ├── images/+server.ts    GET all images
│       ├── images/[uid]/+server.ts  GET user images
│       ├── events/+server.ts    SSE endpoint
│       ├── uploads/[...path]/+server.ts  Serve files
│       └── bandwidth/+server.ts GET bandwidth usage
├── lib/
│   ├── server/
│   │   ├── db.ts                SQLite queries
│   │   ├── events.ts            EventEmitter for SSE
│   │   └── bandwidth.ts         Byte counter + daily reset
│   ├── components/
│   │   ├── UploadButton.svelte
│   │   ├── Waterfall.svelte
│   │   ├── UserGallery.svelte
│   │   └── InactivityWarning.svelte
│   ├── utils/
│   │   ├── identity.ts          nanoid identity
│   │   ├── compress.ts          Canvas WebP compression
│   │   └── api.ts               Fetch wrappers
│   ├── assets/
│   │   └── favicon.png
│   └── types.ts
├── app.html
├── app.d.ts
└── layout.css
```
