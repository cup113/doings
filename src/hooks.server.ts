import { error } from '@sveltejs/kit';
import { isExceeded, addDownload } from '$lib/server/bandwidth';

export const handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api/') && event.url.pathname !== '/api/bandwidth') {
    if (isExceeded()) {
      error(503, 'Daily bandwidth limit exceeded. Service paused.');
    }
  }

  const response = await resolve(event);

  if (event.url.pathname.startsWith('/api/uploads/')) {
    const cl = response.headers.get('content-length');
    if (cl) addDownload(parseInt(cl));
  }

  return response;
};
