import { json } from '@sveltejs/kit';
import { roomStore } from '$lib/server/init';

export async function GET({ url }: { url: URL }) {
  const name = url.searchParams.get('name');
  if (!name) {
    return json({ available: false, error: 'Missing name' }, { status: 400 });
  }
  const available = !roomStore.isNameTaken(name);
  return json({ available });
}
