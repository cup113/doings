import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { ImageRepository } from './repository';

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

vi.mock('./events', () => ({ imageEvents: { emit: vi.fn() } }));

vi.mock('./config', () => ({ UPLOADS_DIR: '/tmp/uploads' }));

const mockRepo: ImageRepository = {
  insertImage: vi.fn(),
  getImageById: vi.fn(),
  deleteImage: vi.fn(),
  countImages: vi.fn(),
  getImages: vi.fn(),
  ping: vi.fn(),
};

vi.mock('./init', () => ({ repo: mockRepo }));

let realRepo: ImageRepository;
let dbClose: () => void;

beforeEach(async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const { SqliteImageRepository } = await import('./SqliteImageRepository');
  const { migrate } = await import('./migrate');

  const db = new DatabaseSync(':memory:');
  migrate(db);
  realRepo = new SqliteImageRepository(db);
  dbClose = () => { try { db.close(); } catch { /* db may already be closed */ } };

  mockRepo.countImages = vi.fn((p) => realRepo.countImages(p));
  mockRepo.getImages = vi.fn((p) => realRepo.getImages(p));
  mockRepo.deleteImage = vi.fn((id) => realRepo.deleteImage(id));
  mockRepo.insertImage = vi.fn((u, p) => realRepo.insertImage(u, p));
  mockRepo.getImageById = vi.fn((id) => realRepo.getImageById(id));
});

afterEach(() => {
  dbClose();
});

describe('prune', () => {
  it('removes oldest user image when exceeding maxPerUser', async () => {
    const { prune } = await import('./imageStore');

    const first = realRepo.insertImage('uid1', 'uid1/first.webp');
    for (let i = 0; i < 4; i++) {
      realRepo.insertImage('uid1', `uid1/img${i}.webp`);
    }

    prune('uid1', { maxPerUser: 3, maxGlobal: 10 });

    expect(realRepo.getImageById(first.id)).toBeNull();
    expect(realRepo.countImages({ uid: 'uid1' })).toBe(3);
  });

  it('keeps images when count equals maxPerUser', async () => {
    const { prune } = await import('./imageStore');

    for (let i = 0; i < 3; i++) {
      realRepo.insertImage('uid1', `uid1/img${i}.webp`);
    }

    prune('uid1', { maxPerUser: 3, maxGlobal: 10 });

    expect(realRepo.countImages({ uid: 'uid1' })).toBe(3);
  });

  it('removes multiple user images when far over limit', async () => {
    const { prune } = await import('./imageStore');

    for (let i = 0; i < 7; i++) {
      realRepo.insertImage('uid1', `uid1/img${i}.webp`);
    }

    prune('uid1', { maxPerUser: 3, maxGlobal: 10 });

    expect(realRepo.countImages({ uid: 'uid1' })).toBe(3);
  });

  it('removes global oldest when exceeding maxGlobal', async () => {
    const { prune } = await import('./imageStore');

    const first = realRepo.insertImage('uid1', 'uid1/first.webp');
    for (let i = 0; i < 4; i++) {
      realRepo.insertImage('uid2', `uid2/img${i}.webp`);
    }

    prune('uid1', { maxPerUser: 10, maxGlobal: 3 });

    expect(realRepo.getImageById(first.id)).toBeNull();
    expect(realRepo.countImages({})).toBe(3);
  });

  it('enforces both per-user and global caps', async () => {
    const { prune } = await import('./imageStore');

    for (let i = 0; i < 6; i++) {
      realRepo.insertImage('uid1', `uid1/img${i}.webp`);
    }
    for (let i = 0; i < 3; i++) {
      realRepo.insertImage('uid2', `uid2/img${i}.webp`);
    }

    prune('uid1', { maxPerUser: 3, maxGlobal: 5 });

    expect(realRepo.countImages({ uid: 'uid1' })).toBeLessThanOrEqual(3);
    expect(realRepo.countImages({})).toBeLessThanOrEqual(5);
  });

  it('does nothing when under all limits', async () => {
    const { prune } = await import('./imageStore');

    realRepo.insertImage('uid1', 'uid1/a.webp');
    realRepo.insertImage('uid2', 'uid2/b.webp');

    prune('uid1', { maxPerUser: 3, maxGlobal: 5 });

    expect(realRepo.countImages({})).toBe(2);
  });
});
