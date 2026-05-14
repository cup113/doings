import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { UPLOADS_DIR } from '$lib/server/imageStore';

export async function GET({ params }: { params: { path: string } }) {
  const filePath = join(UPLOADS_DIR, params.path);

  try {
    const data = readFileSync(filePath);
    return new Response(data, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
