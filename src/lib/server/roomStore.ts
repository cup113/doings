import type { DatabaseSync } from 'node:sqlite';
import type { Room } from '$lib/types';

export class RoomStore {
  constructor(private db: DatabaseSync) {}

  getRoom(id: string): Room | null {
    const row = this.db.prepare('SELECT id, name, is_public, created_at FROM rooms WHERE id = ?').get(id) as Room | undefined;
    return row ?? null;
  }

  listPublicRooms(): Room[] {
    return this.db.prepare('SELECT id, name, is_public, created_at FROM rooms WHERE is_public = 1 ORDER BY created_at DESC').all() as unknown as Room[];
  }

  createRoom(id: string, name: string, isPublic: boolean): Room {
    this.db.prepare('INSERT INTO rooms (id, name, is_public) VALUES (?, ?, ?)').run(id, name, isPublic ? 1 : 0);
    return this.getRoom(id)!;
  }

  isNameTaken(name: string): boolean {
    const row = this.db.prepare('SELECT 1 FROM rooms WHERE name = ?').get(name);
    return !!row;
  }

  ensureRoom(id: string, name: string, isPublic: boolean): Room {
    const existing = this.getRoom(id);
    if (existing) return existing;
    return this.createRoom(id, name, isPublic);
  }
}
