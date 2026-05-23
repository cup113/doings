import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { ImageRepository } from './repository';
import type { ImageRecord } from '$lib/types';

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

vi.mock('./init', () => ({ repo: mockRepo }));

const mockEmit = vi.fn();
vi.mock('./events', () => ({ imageEvents: { emit: mockEmit } }));

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

import { join } from 'node:path';

vi.mock('./config', () => ({ UPLOADS_DIR: '/tmp/uploads' }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('storeImage', () => {
  it('creates user directory and writes file', async () => {
    const { mkdirSync, writeFileSync } = await import('node:fs');
    const { storeImage } = await import('./imageStore');

    mockInsertImage.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/123456.webp', created_at: '2025-01-01T00:00:00Z' });
    mockCountImages.mockReturnValue(0);

    storeImage('uid1', Buffer.from('test'));

    expect(mkdirSync).toHaveBeenCalledWith(join('/tmp/uploads', 'uid1'), { recursive: true });
    expect(writeFileSync).toHaveBeenCalledTimes(1);
    const [path, buf] = (writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(path).toContain(join('/tmp/uploads', 'uid1'));
    expect(buf).toEqual(Buffer.from('test'));
  });

  it('inserts record into repo', async () => {
    const { storeImage } = await import('./imageStore');

    mockInsertImage.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/x.webp', created_at: '2025-01-01T00:00:00Z' });
    mockCountImages.mockReturnValue(0);

    storeImage('uid1', Buffer.from('test'));

    expect(mockInsertImage).toHaveBeenCalledWith('uid1', expect.stringMatching(/^uid1\/\d+-[a-z0-9]+\.webp$/));
  });

  it('returns the created record', async () => {
    const { storeImage } = await import('./imageStore');

    const record: ImageRecord = { id: 1, uid: 'uid1', path: 'uid1/x.webp', created_at: '2025-01-01T00:00:00Z' };
    mockInsertImage.mockReturnValue(record);
    mockCountImages.mockReturnValue(0);

    const result = storeImage('uid1', Buffer.from('test'));
    expect(result).toEqual(record);
  });

  it('calls prune with custom limits', async () => {
    const { storeImage } = await import('./imageStore');

    mockInsertImage.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/x.webp', created_at: '2025-01-01T00:00:00Z' });
    mockCountImages.mockReturnValue(0);

    storeImage('uid1', Buffer.from('test'), { maxPerUser: 3, maxGlobal: 5 });

    expect(mockCountImages).toHaveBeenCalledWith({ uid: 'uid1' });
    expect(mockCountImages).toHaveBeenCalledWith({});
  });

  it('emits new_image event', async () => {
    const { storeImage } = await import('./imageStore');

    const record: ImageRecord = { id: 1, uid: 'uid1', path: 'uid1/x.webp', created_at: '2025-01-01T00:00:00Z' };
    mockInsertImage.mockReturnValue(record);
    mockCountImages.mockReturnValue(0);

    storeImage('uid1', Buffer.from('test'));
    expect(mockEmit).toHaveBeenCalledWith('new_image', record);
  });
});

describe('deleteImageRecord', () => {
  it('returns not_found when image missing', async () => {
    const { deleteImageRecord } = await import('./imageStore');
    mockGetImageById.mockReturnValue(null);

    const result = deleteImageRecord(999, 'uid1');
    expect(result).toEqual({ ok: false, reason: 'not_found' });
  });

  it('returns unauthorized when uid mismatches', async () => {
    const { deleteImageRecord } = await import('./imageStore');
    mockGetImageById.mockReturnValue({ id: 1, uid: 'uid2', path: 'uid2/x.webp', created_at: '2025-01-01T00:00:00Z' });

    const result = deleteImageRecord(1, 'uid1');
    expect(result).toEqual({ ok: false, reason: 'unauthorized' });
  });

  it('deletes file and record on success', async () => {
    const { unlinkSync } = await import('node:fs');
    const { deleteImageRecord } = await import('./imageStore');

    mockGetImageById.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/x.webp', created_at: '2025-01-01T00:00:00Z' });

    const result = deleteImageRecord(1, 'uid1');

    expect(unlinkSync).toHaveBeenCalledWith(join('/tmp/uploads', 'uid1/x.webp'));
    expect(mockDeleteImage).toHaveBeenCalledWith(1);
    expect(result).toEqual({ ok: true, record: { id: 1, uid: 'uid1', path: 'uid1/x.webp', created_at: '2025-01-01T00:00:00Z' } });
  });

  it('emits delete_image event', async () => {
    const { deleteImageRecord } = await import('./imageStore');

    const record: ImageRecord = { id: 1, uid: 'uid1', path: 'uid1/x.webp', created_at: '2025-01-01T00:00:00Z' };
    mockGetImageById.mockReturnValue(record);

    deleteImageRecord(1, 'uid1');
    expect(mockEmit).toHaveBeenCalledWith('delete_image', record);
  });

  it('does not throw when file is already gone', async () => {
    const { unlinkSync } = await import('node:fs');
    const { deleteImageRecord } = await import('./imageStore');

    (unlinkSync as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('ENOENT'); });
    mockGetImageById.mockReturnValue({ id: 1, uid: 'uid1', path: 'uid1/x.webp', created_at: '2025-01-01T00:00:00Z' });

    const result = deleteImageRecord(1, 'uid1');
    expect(result.ok).toBe(true);
  });
});
