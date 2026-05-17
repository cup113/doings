import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { insertImage, getImageById, getTotalCount, getUserCount, deleteImage, getOldestImage, getOldestUserImage } from './db';
import { imageEvents } from './events';
import type { ImageRecord } from '$lib/types';

export const UPLOADS_DIR = process.env.UPLOADS_DIR || 'uploads';

export function storeImage(uid: string, buffer: Buffer): ImageRecord {
  const userDir = join(UPLOADS_DIR, uid);
  mkdirSync(userDir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const filePath = join(userDir, filename);
  writeFileSync(filePath, buffer);

  const record = insertImage(uid, `${uid}/${filename}`);

  prune(uid);

  imageEvents.emit('new_image', record);

  return record;
}

export function deleteImageRecord(id: number, uid: string): ImageRecord {
  const img = getImageById(id);
  if (!img) throw new Error('Image not found');
  if (img.uid !== uid) throw new Error('Not authorized');

  try { unlinkSync(join(UPLOADS_DIR, img.path)); } catch { /* file may be gone */ }
  deleteImage(img.id);

  imageEvents.emit('delete_image', img);

  return img;
}

function prune(userUid: string): void {
  let count = getUserCount(userUid);
  while (count > 100) {
    const oldest = getOldestUserImage(userUid);
    if (!oldest) break;
    try { unlinkSync(join(UPLOADS_DIR, oldest.path)); } catch { /* file may be gone */ }
    deleteImage(oldest.id);
    count--;
  }

  let total = getTotalCount();
  while (total > 2000) {
    const oldest = getOldestImage();
    if (!oldest) break;
    try { unlinkSync(join(UPLOADS_DIR, oldest.path)); } catch { /* file may be gone */ }
    deleteImage(oldest.id);
    total--;
  }
}
