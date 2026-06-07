import { json } from '@sveltejs/kit';
import { imageStore } from '$lib/server/init';

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
  const record = imageStore.storeImage(uid, buffer);
  return json(record);
}
