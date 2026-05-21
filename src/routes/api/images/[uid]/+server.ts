import { json } from '@sveltejs/kit';
import { repo } from '$lib/server/init';

export async function GET({ params, url }: { params: { uid: string }; url: URL }) {
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const after = url.searchParams.get('after');
  const images = repo.getImages({ uid: params.uid, limit, after: after ? parseInt(after) : undefined });
  return json(images);
}
