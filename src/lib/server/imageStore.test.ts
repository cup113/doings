import { EventEmitter } from 'node:events';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import type { ImageRepository } from './repository';
import type { ImageRecord } from '$lib/types';
import { imageEvents } from './imageStore';

const mockInsertImage = vi.fn();
const mockGetImageById = vi.fn();
const mockDeleteImage = vi.fn();
const mockCountImages = vi.fn();
const mockGetImages = vi.fn();

const mockRepo: ImageRepository = {
  insertImage: mockInsertImage,
  getImageById: mockGetImageById,
  deleteImage: mockDeleteImage,
  countImages: mockCountImages,
  getImages: mockGetImages,
  ping: vi.fn(),
};

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  (imageEvents as unknown as EventEmitter).removeAllListeners();
});

describe('ImageStore', () => {
  it('creates user directory and writes file', async () => {
    const { mkdirSync, writeFileSync } = await import('node:fs');
    const { ImageStore } = await import('./imageStore');

    const store = new ImageStore(mockRepo, '/tmp/uploads');

    mockInsertImage.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/123456.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' });
    mockCountImages.mockReturnValue(0);

    store.storeImage('uid1', 'lobby', Buffer.from('test'));

    expect(mkdirSync).toHaveBeenCalledWith(join('/tmp/uploads', 'uid1'), { recursive: true });
    expect(writeFileSync).toHaveBeenCalledTimes(1);
    const [path, buf] = (writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(path).toContain(join('/tmp/uploads', 'uid1'));
    expect(buf).toEqual(Buffer.from('test'));
  });

  it('inserts record into repo', async () => {
    const { ImageStore } = await import('./imageStore');

    const store = new ImageStore(mockRepo, '/tmp/uploads');

    mockInsertImage.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/x.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' });
    mockCountImages.mockReturnValue(0);

    store.storeImage('uid1', 'lobby', Buffer.from('test'));

    expect(mockInsertImage).toHaveBeenCalledWith('uid1', expect.stringMatching(/^uid1\/\d+-[a-z0-9]+\.webp$/), 'lobby');
  });

  it('returns the created record', async () => {
    const { ImageStore } = await import('./imageStore');

    const store = new ImageStore(mockRepo, '/tmp/uploads');

    const record: ImageRecord = { id: 1, uid: 'uid1', path: 'uid1/x.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' };
    mockInsertImage.mockReturnValue(record);
    mockCountImages.mockReturnValue(0);

    const result = store.storeImage('uid1', 'lobby', Buffer.from('test'));
    expect(result).toEqual(record);
  });

  it('calls prune with custom limits', async () => {
    const { ImageStore } = await import('./imageStore');

    const store = new ImageStore(mockRepo, '/tmp/uploads');

    mockInsertImage.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/x.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' });
    mockCountImages.mockReturnValue(0);

    store.storeImage('uid1', 'lobby', Buffer.from('test'), { maxPerUser: 3, maxGlobal: 5 });

    expect(mockCountImages).toHaveBeenCalledWith({ room: '', uid: 'uid1' });
    expect(mockCountImages).toHaveBeenCalledWith({ room: '' });
  });

  it('emits new_image event', async () => {
    const { ImageStore } = await import('./imageStore');

    const store = new ImageStore(mockRepo, '/tmp/uploads');

    const record: ImageRecord = { id: 1, uid: 'uid1', path: 'uid1/x.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' };
    mockInsertImage.mockReturnValue(record);
    mockCountImages.mockReturnValue(0);

    const handler = vi.fn();
    imageEvents.on('new_image', handler);

    store.storeImage('uid1', 'lobby', Buffer.from('test'));

    expect(handler).toHaveBeenCalledWith(record);

    imageEvents.off('new_image', handler);
  });

  describe('deleteImageRecord', () => {
    it('returns not_found when image missing', async () => {
      const { ImageStore } = await import('./imageStore');

      const store = new ImageStore(mockRepo, '/tmp/uploads');

      mockGetImageById.mockReturnValue(null);

      const result = store.deleteImageRecord(999, 'uid1');
      expect(result).toEqual({ ok: false, reason: 'not_found' });
    });

    it('returns unauthorized when uid mismatches', async () => {
      const { ImageStore } = await import('./imageStore');

      const store = new ImageStore(mockRepo, '/tmp/uploads');

      mockGetImageById.mockReturnValue({ id: 1, uid: 'uid2', path: 'uid2/x.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' });

      const result = store.deleteImageRecord(1, 'uid1');
      expect(result).toEqual({ ok: false, reason: 'unauthorized' });
    });

    it('deletes file and record on success', async () => {
      const { unlinkSync } = await import('node:fs');
      const { ImageStore } = await import('./imageStore');

      const store = new ImageStore(mockRepo, '/tmp/uploads');

      mockGetImageById.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/x.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' });

      const result = store.deleteImageRecord(1, 'uid1');

      expect(unlinkSync).toHaveBeenCalledWith(join('/tmp/uploads', 'uid1', 'x.webp'));
      expect(mockDeleteImage).toHaveBeenCalledWith(1);
      expect(result).toEqual({ ok: true, record: { id: 1, uid: 'uid1', path: 'uid1/x.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' } });
    });

    it('emits delete_image event', async () => {
      const { ImageStore } = await import('./imageStore');

      const store = new ImageStore(mockRepo, '/tmp/uploads');

      const record: ImageRecord = { id: 1, uid: 'uid1', path: 'uid1/x.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' };
      mockGetImageById.mockReturnValue(record);

      const handler = vi.fn();
      imageEvents.on('delete_image', handler);

      store.deleteImageRecord(1, 'uid1');

      expect(handler).toHaveBeenCalledWith(record);

      imageEvents.off('delete_image', handler);
    });

    it('does not throw when file is already gone', async () => {
      const { unlinkSync } = await import('node:fs');
      const { ImageStore } = await import('./imageStore');

      const store = new ImageStore(mockRepo, '/tmp/uploads');

      (unlinkSync as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('ENOENT'); });
      mockGetImageById.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/x.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' });

      const result = store.deleteImageRecord(1, 'uid1');
      expect(result.ok).toBe(true);
    });
  });

  describe('getRecentImages', () => {
    it('returns images from repo with defaults', async () => {
      const { ImageStore } = await import('./imageStore');

      const store = new ImageStore(mockRepo, '/tmp/uploads');
      const records = [{ id: 1, uid: 'uid1', path: 'uid1/a.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' }];
      mockGetImages.mockReturnValue(records);

      const result = store.getRecentImages('lobby');

      expect(mockGetImages).toHaveBeenCalledWith({ room: 'lobby', limit: 12, order: 'newest' });
      expect(result).toEqual(records);
    });

    it('passes custom limit', async () => {
      const { ImageStore } = await import('./imageStore');

      const store = new ImageStore(mockRepo, '/tmp/uploads');
      mockGetImages.mockReturnValue([]);

      store.getRecentImages('lobby', 5);

      expect(mockGetImages).toHaveBeenCalledWith({ room: 'lobby', limit: 5, order: 'newest' });
    });
  });

  describe('getUserImages', () => {
    it('returns images filtered by uid', async () => {
      const { ImageStore } = await import('./imageStore');

      const store = new ImageStore(mockRepo, '/tmp/uploads');
      const records = [{ id: 1, uid: 'uid1', path: 'uid1/a.webp', room: 'lobby', created_at: '2025-01-01T00:00:00Z' }];
      mockGetImages.mockReturnValue(records);

      const result = store.getUserImages('uid1', 'lobby');

      expect(mockGetImages).toHaveBeenCalledWith({ uid: 'uid1', room: 'lobby', limit: 12, order: 'newest' });
      expect(result).toEqual(records);
    });

    it('passes custom limit', async () => {
      const { ImageStore } = await import('./imageStore');

      const store = new ImageStore(mockRepo, '/tmp/uploads');
      mockGetImages.mockReturnValue([]);

      store.getUserImages('uid1', 'lobby', 3);

      expect(mockGetImages).toHaveBeenCalledWith({ uid: 'uid1', room: 'lobby', limit: 3, order: 'newest' });
    });
  });
});
