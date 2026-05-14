import { json } from '@sveltejs/kit';
import { storeImage } from '$lib/server/imageStore';
import { addUpload } from '$lib/server/bandwidth';

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

  const record = storeImage(uid, buffer);
  return json(record);
}
