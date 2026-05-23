import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DB_PATH } from './config';
import { migrate } from './migrate';
import type { ImageRepository } from './repository';
import { SqliteImageRepository } from './SqliteImageRepository';

export function createRepo(dbPath?: string): ImageRepository {
  const path = dbPath ?? DB_PATH;
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  migrate(db);
  return new SqliteImageRepository(db);
}

export const repo: ImageRepository = createRepo();
