import { error } from '@sveltejs/kit';
import { isExceeded, addUpload, addDownload } from '$lib/server/bandwidth';

export const handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api/') && event.url.pathname !== '/api/bandwidth') {
    if (isExceeded()) {
      error(503, 'Daily bandwidth limit exceeded. Service paused.');
    }
  }

  if (event.url.pathname === '/api/upload' && event.request.method === 'POST') {
    const cl = event.request.headers.get('content-length');
    if (cl) addUpload(parseInt(cl));
  }

  const response = await resolve(event);

  if (event.url.pathname.startsWith('/api/uploads/')) {
    const cl = response.headers.get('content-length');
    if (cl) addDownload(parseInt(cl));
  }

  return response;
};
