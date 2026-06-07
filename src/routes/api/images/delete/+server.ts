import { json } from '@sveltejs/kit';
import { imageStore } from '$lib/server/init';

export async function POST({ request }: { request: Request }) {
  const { id, uid } = await request.json();

  if (typeof id !== 'number' || typeof uid !== 'string') {
    return json({ error: 'Invalid id or uid' }, { status: 400 });
  }

  const result = imageStore.deleteImageRecord(id, uid);

  if (!result.ok) {
    if (result.reason === 'not_found') return json({ error: 'Image not found' }, { status: 404 });
    if (result.reason === 'unauthorized') return json({ error: 'Not authorized' }, { status: 403 });
  }

  return json({ ok: true });
}
