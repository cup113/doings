import { json } from '@sveltejs/kit';
import { repo } from '$lib/server/init';

export function GET() {
  if (repo.ping()) {
    return json({ status: 'ok' });
  }
  return new Response(JSON.stringify({ status: 'error', message: 'Database unreachable' }), {
    status: 500,
    headers: { 'content-type': 'application/json' }
  });
}
