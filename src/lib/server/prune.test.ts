import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import type { ImageRepository } from './repository';

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

let realRepo: ImageRepository;
let db: import('node:sqlite').DatabaseSync;

beforeEach(async () => {
  const { SqliteImageRepository } = await import('./SqliteImageRepository');
  const { migrate } = await import('./migrate');

  db = new DatabaseSync(':memory:');
  migrate(db);
  realRepo = new SqliteImageRepository(db);
});

afterEach(() => {
  try { db.close(); } catch { /* ok */ }
});

describe('prune', () => {
  it('removes oldest user image when exceeding maxPerUser', async () => {
    const { ImageStore } = await import('./imageStore');
    const store = new ImageStore(realRepo, '/tmp/uploads');

    const first = realRepo.insertImage('uid1', 'uid1/first.webp');
    for (let i = 0; i < 4; i++) {
      realRepo.insertImage('uid1', `uid1/img${i}.webp`);
    }

    store.prune('uid1', { maxPerUser: 3, maxGlobal: 10 });

    expect(realRepo.getImageById(first.id)).toBeNull();
    expect(realRepo.countImages({ uid: 'uid1' })).toBe(3);
  });

  it('keeps images when count equals maxPerUser', async () => {
    const { ImageStore } = await import('./imageStore');
    const store = new ImageStore(realRepo, '/tmp/uploads');

    for (let i = 0; i < 3; i++) {
      realRepo.insertImage('uid1', `uid1/img${i}.webp`);
    }

    store.prune('uid1', { maxPerUser: 3, maxGlobal: 10 });

    expect(realRepo.countImages({ uid: 'uid1' })).toBe(3);
  });

  it('removes multiple user images when far over limit', async () => {
    const { ImageStore } = await import('./imageStore');
    const store = new ImageStore(realRepo, '/tmp/uploads');

    for (let i = 0; i < 7; i++) {
      realRepo.insertImage('uid1', `uid1/img${i}.webp`);
    }

    store.prune('uid1', { maxPerUser: 3, maxGlobal: 10 });

    expect(realRepo.countImages({ uid: 'uid1' })).toBe(3);
  });

  it('removes global oldest when exceeding maxGlobal', async () => {
    const { ImageStore } = await import('./imageStore');
    const store = new ImageStore(realRepo, '/tmp/uploads');

    const first = realRepo.insertImage('uid1', 'uid1/first.webp');
    for (let i = 0; i < 4; i++) {
      realRepo.insertImage('uid2', `uid2/img${i}.webp`);
    }

    store.prune('uid1', { maxPerUser: 10, maxGlobal: 3 });

    expect(realRepo.getImageById(first.id)).toBeNull();
    expect(realRepo.countImages({})).toBe(3);
  });

  it('enforces both per-user and global caps', async () => {
    const { ImageStore } = await import('./imageStore');
    const store = new ImageStore(realRepo, '/tmp/uploads');

    for (let i = 0; i < 6; i++) {
      realRepo.insertImage('uid1', `uid1/img${i}.webp`);
    }
    for (let i = 0; i < 3; i++) {
      realRepo.insertImage('uid2', `uid2/img${i}.webp`);
    }

    store.prune('uid1', { maxPerUser: 3, maxGlobal: 5 });

    expect(realRepo.countImages({ uid: 'uid1' })).toBeLessThanOrEqual(3);
    expect(realRepo.countImages({})).toBeLessThanOrEqual(5);
  });

  it('does nothing when under all limits', async () => {
    const { ImageStore } = await import('./imageStore');
    const store = new ImageStore(realRepo, '/tmp/uploads');

    realRepo.insertImage('uid1', 'uid1/a.webp');
    realRepo.insertImage('uid2', 'uid2/b.webp');

    store.prune('uid1', { maxPerUser: 3, maxGlobal: 5 });

    expect(realRepo.countImages({})).toBe(2);
  });
});
