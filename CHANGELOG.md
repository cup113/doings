# Changelog

## 2026-05-16

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
