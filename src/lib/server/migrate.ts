import type { DatabaseSync } from 'node:sqlite';

export function migrate(db: DatabaseSync): void {
  db.exec('PRAGMA journal_mode=WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  )`);
  db.exec('CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at DESC)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_images_uid ON images(uid, created_at DESC)');
}
