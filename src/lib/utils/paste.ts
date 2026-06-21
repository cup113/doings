import type { ImageRecord } from '$lib/types';

export type PasteStatus =
  | { type: 'idle' }
  | { type: 'uploading'; index: number; total: number }
  | { type: 'done'; index: number; total: number }
  | { type: 'error'; message: string };

export interface PasteUploadDeps {
  compressImage: (file: File) => Promise<Blob>;
  uploadImage: (file: Blob, uid: string, room: string) => Promise<ImageRecord>;
  confirm: (message: string) => boolean;
  getUid: () => string;
  recordLastUpload: () => void;
  onStatusChange: (status: PasteStatus) => void;
}

export function extractImagesFromClipboard(event: ClipboardEvent): File[] {
  const files: File[] = [];
  const items = event.clipboardData?.items;
  const clipFiles = event.clipboardData?.files;

  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
  }

  if (files.length === 0 && clipFiles) {
    for (let i = 0; i < clipFiles.length; i++) {
      const file = clipFiles.item(i);
      if (file && file.type.startsWith('image/')) {
        files.push(file);
      }
    }
  }

  return files;
}

export async function processPasteQueue(
  files: File[],
  room: string,
  deps: PasteUploadDeps,
): Promise<void> {
  if (files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    deps.onStatusChange({ type: 'uploading', index: i + 1, total: files.length });

    try {
      const compressed = await deps.compressImage(files[i]);
      const uid = deps.getUid();
      await deps.uploadImage(compressed, uid, room);
      deps.recordLastUpload();

      if (i < files.length - 1) {
        deps.onStatusChange({ type: 'done', index: i + 1, total: files.length });
        await delay(800);

        const remaining = files.length - i - 1;
        const label = remaining === 1 ? '1 image' : `${remaining} images`;
        if (!deps.confirm(`Upload next? (${label} remaining)`)) {
          deps.onStatusChange({ type: 'idle' });
          return;
        }
      }
    } catch (e) {
      deps.onStatusChange({
        type: 'error',
        message: e instanceof Error ? e.message : 'Upload failed',
      });
      await delay(3000);
      deps.onStatusChange({ type: 'idle' });
      return;
    }
  }

  deps.onStatusChange({ type: 'done', index: files.length, total: files.length });
  await delay(1500);
  deps.onStatusChange({ type: 'idle' });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
