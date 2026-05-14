import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { insertImage } from './db';
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
  imageEvents.emit('new_image', record);

  return record;
}
