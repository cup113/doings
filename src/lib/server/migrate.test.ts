import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from './migrate';

function createMigratedDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  migrate(db);
  return db;
}

describe('migrate', () => {
  it('creates images table', () => {
    const db = createMigratedDb();
    const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='images'").all() as { name: string }[];
    expect(rows.length).toBe(1);
  });

  it('creates indexes', () => {
    const db = createMigratedDb();
    const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_images_%'").all() as { name: string }[];
    expect(rows.length).toBe(2);
  });

  it('allows inserting and selecting', () => {
    const db = createMigratedDb();
    db.prepare("INSERT INTO images (uid, path) VALUES ('uid1', 'p1')").run();
    const row = db.prepare('SELECT uid, path FROM images').get() as { uid: string; path: string };
    expect(row.uid).toBe('uid1');
    expect(row.path).toBe('p1');
  });
});
