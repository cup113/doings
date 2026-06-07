import { json } from '@sveltejs/kit';
import { imageStore } from '$lib/server/init';

export async function GET({ params, url }: { params: { uid: string }; url: URL }) {
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const images = imageStore.getUserImages(params.uid, limit);
  return json(images);
}
