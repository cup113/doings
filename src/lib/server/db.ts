import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { ImageRecord } from '$lib/types';

const DB_PATH = process.env.DB_PATH || 'data/doings.db';

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode=WAL');
db.exec(`CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
)`);
db.exec('CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at DESC)');
db.exec('CREATE INDEX IF NOT EXISTS idx_images_uid ON images(uid, created_at DESC)');

export function getRecentImages(limit = 12): ImageRecord[] {
  const stmt = db.prepare('SELECT id, uid, path, created_at FROM images ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit) as unknown as ImageRecord[];
}

export function getUserImages(uid: string, limit = 12): ImageRecord[] {
  const stmt = db.prepare('SELECT id, uid, path, created_at FROM images WHERE uid = ? ORDER BY created_at DESC LIMIT ?');
  return stmt.all(uid, limit) as unknown as ImageRecord[];
}

export function getTotalCount(): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM images').get() as { count: number };
  return row.count;
}

export function getUserCount(uid: string): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM images WHERE uid = ?').get(uid) as { count: number };
  return row.count;
}

export function deleteImage(id: number): void {
  db.prepare('DELETE FROM images WHERE id = ?').run(id);
}

export function getOldestImage(): ImageRecord | null {
  const row = db.prepare('SELECT id, uid, path, created_at FROM images ORDER BY created_at ASC LIMIT 1').get() as ImageRecord | undefined;
  return row ?? null;
}

export function getOldestUserImage(uid: string): ImageRecord | null {
  const row = db.prepare('SELECT id, uid, path, created_at FROM images WHERE uid = ? ORDER BY created_at ASC LIMIT 1').get(uid) as ImageRecord | undefined;
  return row ?? null;
}

export function insertImage(uid: string, path: string): ImageRecord {
  const stmt = db.prepare('INSERT INTO images (uid, path) VALUES (?, ?)');
  const { lastInsertRowid } = stmt.run(uid, path);
  const row = db.prepare('SELECT id, uid, path, created_at FROM images WHERE id = ?').get(Number(lastInsertRowid)) as unknown as ImageRecord;
  return row;
}
