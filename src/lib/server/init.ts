import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DB_PATH, UPLOADS_DIR } from './config';
import { migrate } from './migrate';
import type { ImageRepository } from './repository';
import { SqliteImageRepository } from './SqliteImageRepository';
import { ImageStore } from './imageStore';

export function createRepo(dbPath?: string): ImageRepository {
  const path = dbPath ?? DB_PATH;
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  migrate(db);
  return new SqliteImageRepository(db);
}

const repo: ImageRepository = createRepo();
export const imageStore = new ImageStore(repo, UPLOADS_DIR);
export { repo };
