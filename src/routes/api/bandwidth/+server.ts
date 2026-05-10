import { json } from '@sveltejs/kit';
import { getStatus } from '$lib/server/bandwidth';

export function GET() {
  return json(getStatus());
}
