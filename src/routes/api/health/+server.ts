import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export function GET() {
  try {
    db.prepare('SELECT 1').get();
    return json({ status: 'ok' });
  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', message: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
