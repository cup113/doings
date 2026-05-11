import { json } from '@sveltejs/kit';
import { getUserImages } from '$lib/server/db';

export async function GET({ params, url }: { params: { uid: string }; url: URL }) {
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const images = getUserImages(params.uid, limit);
  return json(images);
}
