import { json } from '@sveltejs/kit';
import { imageStore } from '$lib/server/init';

export async function POST({ request }: { request: Request }) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const uid = formData.get('uid') as string;
  const room = formData.get('room') as string || 'lobby';

  if (!file || !uid) {
    return json({ error: 'Missing file or uid' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const record = imageStore.storeImage(uid, room, buffer);
  return json(record);
}
