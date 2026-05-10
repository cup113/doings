import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DB_PATH || 'data/doings.db';

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode=WAL');
db.exec(`CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
)`);
db.exec('CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at DESC)');
db.exec('CREATE INDEX IF NOT EXISTS idx_images_uid ON images(uid, created_at DESC)');

export interface ImageRecord {
  id: number;
  uid: string;
  path: string;
  created_at: string;
}

export function getRecentImages(limit = 10): ImageRecord[] {
  const stmt = db.prepare('SELECT id, uid, path, created_at FROM images ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit) as unknown as ImageRecord[];
}

export function getUserImages(uid: string, limit = 10): ImageRecord[] {
  const stmt = db.prepare('SELECT id, uid, path, created_at FROM images WHERE uid = ? ORDER BY created_at DESC LIMIT ?');
  return stmt.all(uid, limit) as unknown as ImageRecord[];
}

export function insertImage(uid: string, path: string): ImageRecord {
  const stmt = db.prepare('INSERT INTO images (uid, path) VALUES (?, ?)');
  const { lastInsertRowid } = stmt.run(uid, path);
  const row = db.prepare('SELECT id, uid, path, created_at FROM images WHERE id = ?').get(Number(lastInsertRowid)) as unknown as ImageRecord;
  return row;
}
