# Changelog

## 2.0.0 — 2026-06-21

- **Rooms**: add room isolation (`/room/:id`), each a separate space with SSE filtering, room creation UI, public/private toggle
- **ImageStore**: refactor to class with injected repository, absorb events, higher-level read methods
- **CSRF**: nest inside `kit` config
- **Fix**: Public Room switch knob alignment
- **Docs**: sync ADR 0002, README, AGENTS.md with codebase

## 1.0.3 — 2026-05-23

- **Tests**: add test suites for all components and server modules
- **Config**: migrate to Vite 8 + Tailwind CSS v4 Vite plugin
- **Chore**: update dependencies, remove unused files

## 1.0.2 — 2026-05-22

- **HelpPanel**: add version display, privacy/security notices, GitHub link, and UI polish
- **CSRF**: migrate from `checkOrigin: false` to `trustedOrigins: ['*']` (SvelteKit 2.57+)

## 1.0.1 — 2026-05-17

- **Fix**: resolve `each_key_duplicate` Svelte error (skeleton key + SSE dedup)

## 1.0.0 — 2026-05-16

- **Lightbox**: click any image for full-screen viewer with prev/next navigation, keyboard support (Escape/arrows), and "View all by" link
- **Skeleton loading**: show pulse-animated grid placeholders while initial images load
- **Upload feedback**: button shows "✓ Done" for 1.5s after successful upload
- **Fetch retry**: auto-retry 3x on image fetch failure, then show error + Retry button
- **SSE auto-catchup**: on reconnect, automatically fetch missed images (no more stale feed)
- **Snooze persistence**: snooze timer survives page reload via localStorage
- **New image animation**: fadeIn + scale entry animation for SSE-pushed images
- **Docs**: update HelpPanel, AGENTS.md, README.md

## 2026-05-16

- Add upload pruning (100/user, 2000 total), bump image size to 256px

## 2026-05-14

- Fix bandwidth reset, extract imageStore, add ADRs

## 2026-05-11

- Add health check endpoint, Docker HEALTHCHECK, Svelte 5 runes, image limit to 12

## 2026-05-10

- Initial release: camera upload, SSE feed, user galleries, inactivity reminders, bandwidth limiter
