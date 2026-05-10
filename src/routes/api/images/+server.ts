import { json } from '@sveltejs/kit';
import { getRecentImages } from '$lib/server/db';

export async function GET({ url }: { url: URL }) {
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const images = getRecentImages(limit);
  return json(images);
}
