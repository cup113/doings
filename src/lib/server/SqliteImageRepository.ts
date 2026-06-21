import type { DatabaseSync, SQLInputValue } from 'node:sqlite';
import type { ImageRecord } from '$lib/types';
import type { GetImagesParams, CountImagesParams, ImageRepository } from './repository';

export class SqliteImageRepository implements ImageRepository {
  constructor(private db: DatabaseSync) {}

  getImages(params: GetImagesParams): ImageRecord[] {
    let sql = 'SELECT id, uid, path, room, created_at FROM images WHERE 1=1';
    const args: SQLInputValue[] = [];

    if (params.room) {
      sql += ' AND room = ?';
      args.push(params.room);
    }

    if (params.uid) {
      sql += ' AND uid = ?';
      args.push(params.uid);
    }

    if (params.after) {
      sql += params.order === 'oldest' ? ' AND id > ?' : ' AND id < ?';
      args.push(params.after);
    }

    if (params.order === 'oldest') {
      sql += ' ORDER BY created_at ASC, id ASC LIMIT ?';
    } else {
      sql += ' ORDER BY created_at DESC, id DESC LIMIT ?';
    }
    args.push(params.limit ?? 12);

    return this.db.prepare(sql).all(...args) as unknown as ImageRecord[];
  }

  countImages(params: CountImagesParams): number {
    let sql = 'SELECT COUNT(*) as count FROM images WHERE 1=1';
    const args: SQLInputValue[] = [];

    if (params.room) {
      sql += ' AND room = ?';
      args.push(params.room);
    }

    if (params.uid) {
      sql += ' AND uid = ?';
      args.push(params.uid);
    }

    const row = this.db.prepare(sql).get(...args) as { count: number };
    return row.count;
  }

  getImageById(id: number): ImageRecord | null {
    const row = this.db.prepare('SELECT id, uid, path, room, created_at FROM images WHERE id = ?').get(id) as ImageRecord | undefined;
    return row ?? null;
  }

  insertImage(uid: string, path: string, room: string): ImageRecord {
    const stmt = this.db.prepare('INSERT INTO images (uid, path, room) VALUES (?, ?, ?)');
    const { lastInsertRowid } = stmt.run(uid, path, room);
    const row = this.db.prepare('SELECT id, uid, path, room, created_at FROM images WHERE id = ?').get(Number(lastInsertRowid)) as unknown as ImageRecord;
    return row;
  }

  deleteImage(id: number): void {
    this.db.prepare('DELETE FROM images WHERE id = ?').run(id);
  }

  ping(): boolean {
    try {
      this.db.prepare('SELECT 1').get();
      return true;
    } catch {
      return false;
    }
  }
}
