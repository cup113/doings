/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { extractImagesFromClipboard, processPasteQueue, type PasteUploadDeps } from './paste';

function createFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type });
}

function makeItem(file: File): DataTransferItem {
  return { kind: 'file', type: file.type, getAsFile: () => file } as DataTransferItem;
}

function makeFileList(files: File[]): FileList {
  const list: Record<string, unknown> = {
    length: files.length,
    item(i: number) { return files[i] ?? null; },
    [Symbol.iterator]() { return files[Symbol.iterator](); },
  };
  for (let i = 0; i < files.length; i++) {
    list[i] = files[i];
  }
  return list as unknown as FileList;
}

function createClipboardEvent(files: File[], extraFiles?: File[]): ClipboardEvent {
  return {
    clipboardData: {
      items: files.length > 0 ? files.map(makeItem) as unknown as DataTransferItemList : (null as unknown as DataTransferItemList),
      files: extraFiles ? makeFileList(extraFiles) : makeFileList(files),
    },
    preventDefault: vi.fn(),
  } as unknown as ClipboardEvent;
}

describe('extractImagesFromClipboard', () => {
  it('returns empty array when clipboard has no items', () => {
    const event = createClipboardEvent([]);
    expect(extractImagesFromClipboard(event)).toEqual([]);
  });

  it('extracts image files from clipboardData.items', () => {
    const png = createFile('img.png', 'image/png');
    const event = createClipboardEvent([png]);
    const result = extractImagesFromClipboard(event);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('img.png');
  });

  it('ignores non-image items', () => {
    const text = new File(['hello'], 'text.txt', { type: 'text/plain' });
    const event = createClipboardEvent([text]);
    expect(extractImagesFromClipboard(event)).toEqual([]);
  });

  it('extracts multiple image files', () => {
    const png = createFile('a.png', 'image/png');
    const jpg = createFile('b.jpg', 'image/jpeg');
    const event = createClipboardEvent([png, jpg]);
    const result = extractImagesFromClipboard(event);
    expect(result).toHaveLength(2);
  });

  it('extracts from clipboardData.files when items has no image', () => {
    const img = createFile('img.png', 'image/png');
    const event = createClipboardEvent([], [img]);
    const result = extractImagesFromClipboard(event);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('img.png');
  });

  it('prefers items over files when both have images', () => {
    const itemFile = createFile('from-items.png', 'image/png');
    const fileListFile = createFile('from-files.png', 'image/png');
    const event = createClipboardEvent([itemFile], [fileListFile]);
    const result = extractImagesFromClipboard(event);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('from-items.png');
  });
});

describe('processPasteQueue', () => {
  const defaultDeps = (overrides: Partial<PasteUploadDeps> = {}): PasteUploadDeps => ({
    compressImage: vi.fn().mockResolvedValue(new Blob()),
    uploadImage: vi.fn().mockResolvedValue({ id: 1, uid: 'test', path: '', room: '', created_at: '' }),
    confirm: vi.fn().mockReturnValue(true),
    getUid: vi.fn().mockReturnValue('test-uid'),
    recordLastUpload: vi.fn(),
    onStatusChange: vi.fn(),
    ...overrides,
  });

  it('uploads a single file and transitions through statuses', async () => {
    const onStatusChange = vi.fn();
    const deps = defaultDeps({ onStatusChange });
    const file = createFile('img.png', 'image/png');

    await processPasteQueue([file], 'lobby', deps);

    expect(deps.compressImage).toHaveBeenCalledTimes(1);
    expect(deps.uploadImage).toHaveBeenCalledTimes(1);
    expect(deps.recordLastUpload).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenCalledWith({ type: 'uploading', index: 1, total: 1 });
    expect(onStatusChange).toHaveBeenCalledWith({ type: 'done', index: 1, total: 1 });
    expect(onStatusChange).toHaveBeenLastCalledWith({ type: 'idle' });
  });

  it('uploads multiple files when confirm returns true', async () => {
    const confirm = vi.fn().mockReturnValue(true);
    const deps = defaultDeps({ confirm });
    const files = [
      createFile('a.png', 'image/png'),
      createFile('b.png', 'image/png'),
      createFile('c.png', 'image/png'),
    ];

    await processPasteQueue(files, 'lobby', deps);

    expect(deps.compressImage).toHaveBeenCalledTimes(3);
    expect(deps.uploadImage).toHaveBeenCalledTimes(3);
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it('stops after current upload when confirm returns false', async () => {
    const confirm = vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
    const deps = defaultDeps({ confirm });
    const files = [
      createFile('a.png', 'image/png'),
      createFile('b.png', 'image/png'),
      createFile('c.png', 'image/png'),
    ];

    await processPasteQueue(files, 'lobby', deps);

    expect(deps.compressImage).toHaveBeenCalledTimes(2);
    expect(deps.uploadImage).toHaveBeenCalledTimes(2);
  });

  it('stops and reports error when upload fails', async () => {
    const onStatusChange = vi.fn();
    const uploadImage = vi.fn().mockRejectedValue(new Error('Network error'));
    const deps = defaultDeps({ uploadImage, onStatusChange });
    const files = [
      createFile('a.png', 'image/png'),
      createFile('b.png', 'image/png'),
    ];

    await processPasteQueue(files, 'lobby', deps);

    expect(deps.uploadImage).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenCalledWith({ type: 'error', message: 'Network error' });
    expect(onStatusChange).toHaveBeenLastCalledWith({ type: 'idle' });
  });

  it('handles empty file array gracefully', async () => {
    const onStatusChange = vi.fn();
    const deps = defaultDeps({ onStatusChange });

    await processPasteQueue([], 'lobby', deps);

    expect(deps.compressImage).not.toHaveBeenCalled();
    expect(onStatusChange).not.toHaveBeenCalled();
  });
});
