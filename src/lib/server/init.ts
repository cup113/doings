import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DB_PATH } from './config';
import { migrate } from './migrate';
import type { ImageRepository } from './repository';
import { SqliteImageRepository } from './SqliteImageRepository';

mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
migrate(db);

export const repo: ImageRepository = new SqliteImageRepository(db);
