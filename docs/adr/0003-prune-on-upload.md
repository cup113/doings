# Prune-on-upload instead of cron-based cleanup

Images accumulate on every upload. Without a cleanup strategy, disk and DB grow unbounded. Three options were considered:

1. **Cron job** — a background process (Vite cron, OS cron, setInterval) that periodically deletes old images. Requires additional infra, a health check to prevent double-runs in multi-replica deploys, and delay between upload and cleanup.

2. **Manual / UI-level delete** — let users delete their own images. Doesn't solve the accumulation problem for anonymous/abandoned users, and the anonymous uid model means anyone can guess uids and delete others' images.

3. **Prune-on-upload** — immediately after inserting a new image, check per-user and global caps and evict the oldest if exceeded. Runs synchronously in the request, no background infra needed.

Prune-on-upload was chosen because:

- **Self-regulating** — caps are enforced inline, no delay, no slack
- **Zero additional infra** — no cron, no workers, no scheduler
- **Predictable storage** — bounded at 100 × active users, max 2,000 total
- **Trivially correct** — SQLite is single-writer, so there's no race condition on the count + delete cycle
- **Fast** — at the expected scale (tens of images per upload, not millions), the overhead is negligible

The limits (100/user, 2,000 total) were chosen as generous guardrails. At ~10KB/image, max storage is ~20MB. The two-tier design prevents a single prolific user from crowding out everyone else.

### Later addition: self-delete (2026-05-17)

User-initiated self-delete was later added as a complementary feature. Unlike prune (which evicts the oldest automatically), self-delete lets users remove any of their own images by id. Ownership is validated server-side (`image.uid === uid`) to address the concern raised in option 2 about uid-guessing. Deletion broadcasts a `delete_image` SSE event so all connected clients update in real time.

The original option 2 (manual delete) was initially rejected because the anonymous uid model made it impossible to authenticate users. The self-delete feature solves this by requiring the delete request to include the uid, which only the device that owns the image knows (matching `localStorage('doings_uid')`). This is not strong auth, but it raises the bar enough for this app's threat model. Prune remains as a safety net for abandoned uploads.
