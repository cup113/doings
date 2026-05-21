import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { repo } from './init';
import { imageEvents } from './events';
import { UPLOADS_DIR } from './config';
import type { ImageRecord } from '$lib/types';
import type { DeleteResult } from './repository';

export function storeImage(uid: string, buffer: Buffer): ImageRecord {
  const userDir = join(UPLOADS_DIR, uid);
  mkdirSync(userDir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const filePath = join(userDir, filename);
  writeFileSync(filePath, buffer);

  const record = repo.insertImage(uid, `${uid}/${filename}`);

  prune(uid);

  imageEvents.emit('new_image', record);

  return record;
}

export function deleteImageRecord(id: number, uid: string): DeleteResult {
  const img = repo.getImageById(id);
  if (!img) return { ok: false, reason: 'not_found' };
  if (img.uid !== uid) return { ok: false, reason: 'unauthorized' };

  try { unlinkSync(join(UPLOADS_DIR, img.path)); } catch { /* file may be gone */ }
  repo.deleteImage(img.id);

  imageEvents.emit('delete_image', img);

  return { ok: true, record: img };
}

function prune(userUid: string): void {
  let count = repo.countImages({ uid: userUid });
  while (count > 100) {
    const oldest = getOldestUserImage(userUid);
    if (!oldest) break;
    try { unlinkSync(join(UPLOADS_DIR, oldest.path)); } catch { /* file may be gone */ }
    repo.deleteImage(oldest.id);
    count--;
  }

  let total = repo.countImages({});
  while (total > 2000) {
    const oldest = getOldestImage();
    if (!oldest) break;
    try { unlinkSync(join(UPLOADS_DIR, oldest.path)); } catch { /* file may be gone */ }
    repo.deleteImage(oldest.id);
    total--;
  }
}

function getOldestImage(): ImageRecord | null {
  return repo.getImages({ order: 'oldest', limit: 1 })[0] ?? null;
}

function getOldestUserImage(uid: string): ImageRecord | null {
  return repo.getImages({ uid, order: 'oldest', limit: 1 })[0] ?? null;
}
