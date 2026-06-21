import type { DatabaseSync } from 'node:sqlite';

export function migrate(db: DatabaseSync): void {
  db.exec('PRAGMA journal_mode=WAL');

  db.exec(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_public INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT NOT NULL,
    path TEXT NOT NULL,
    room TEXT NOT NULL DEFAULT 'lobby',
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  )`);

  const colCount = db.prepare("SELECT COUNT(*) as cnt FROM pragma_table_info('images') WHERE name = 'room'").get() as { cnt: number };
  if (colCount.cnt === 0) {
    db.exec("ALTER TABLE images ADD COLUMN room TEXT NOT NULL DEFAULT 'lobby'");
  }
  db.exec('CREATE INDEX IF NOT EXISTS idx_images_room_created ON images(room, created_at DESC)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_images_room_uid ON images(room, uid, created_at DESC)');

  db.exec(`INSERT OR IGNORE INTO rooms (id, name, is_public) VALUES ('lobby', 'Lobby', 1)`);
}
