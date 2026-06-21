import { json } from '@sveltejs/kit';
import { imageStore } from '$lib/server/init';

export async function GET({ params, url }: { params: { uid: string }; url: URL }) {
  const room = url.searchParams.get('room') || 'lobby';
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const images = imageStore.getUserImages(params.uid, room, limit);
  return json(images);
}
