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
