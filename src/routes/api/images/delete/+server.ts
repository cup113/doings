import { json } from '@sveltejs/kit';
import { deleteImageRecord } from '$lib/server/imageStore';

export async function POST({ request }: { request: Request }) {
  const { id, uid } = await request.json();

  if (typeof id !== 'number' || typeof uid !== 'string') {
    return json({ error: 'Invalid id or uid' }, { status: 400 });
  }

  try {
    deleteImageRecord(id, uid);
    return json({ ok: true });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === 'Image not found') return json({ error: msg }, { status: 404 });
    if (msg === 'Not authorized') return json({ error: msg }, { status: 403 });
    return json({ error: 'Internal error' }, { status: 500 });
  }
}
