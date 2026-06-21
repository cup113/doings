import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DB_PATH, UPLOADS_DIR } from './config';
import { migrate } from './migrate';
import type { ImageRepository } from './repository';
import { SqliteImageRepository } from './SqliteImageRepository';
import { ImageStore } from './imageStore';
import { RoomStore } from './roomStore';

export function createRepo(dbPath?: string): { repo: ImageRepository; db: DatabaseSync } {
  const path = dbPath ?? DB_PATH;
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  migrate(db);
  return { repo: new SqliteImageRepository(db), db };
}

const { repo, db } = createRepo();
export const imageStore = new ImageStore(repo, UPLOADS_DIR);
export const roomStore = new RoomStore(db);
export { repo, db };
