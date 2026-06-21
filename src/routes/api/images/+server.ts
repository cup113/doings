import { json } from '@sveltejs/kit';
import { imageStore } from '$lib/server/init';

export async function GET({ url }: { url: URL }) {
  const room = url.searchParams.get('room') || 'lobby';
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const images = imageStore.getRecentImages(room, limit);
  return json(images);
}
