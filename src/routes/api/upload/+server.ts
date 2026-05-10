import { json } from '@sveltejs/kit';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { insertImage } from '$lib/server/db';
import { imageEvents } from '$lib/server/events';
import { addUpload } from '$lib/server/bandwidth';

const UPLOADS_DIR = process.env.UPLOADS_DIR || 'uploads';

export const config = {
  body: { size: '1mb' }
};

export async function POST({ request }: { request: Request }) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const uid = formData.get('uid') as string;

  if (!file || !uid) {
    return json({ error: 'Missing file or uid' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  addUpload(buffer.length);

  const userDir = join(UPLOADS_DIR, uid);
  mkdirSync(userDir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const filePath = join(userDir, filename);
  writeFileSync(filePath, buffer);

  const record = insertImage(uid, `${uid}/${filename}`);
  imageEvents.emit('new_image', record);

  return json(record);
}
