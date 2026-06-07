import { Readable } from 'node:stream';
import { imageEvents } from '$lib/server/imageStore';
import type { ImageRecord } from '$lib/types';

export function GET({ request }: { request: Request }) {
  let closed = false;

  const nodeStream = new Readable({
    read() {}
  });

  const newImageListener = (event: ImageRecord) => {
    if (!closed) {
      nodeStream.push(`event: new_image\ndata: ${JSON.stringify(event)}\n\n`);
    }
  };

  const deleteImageListener = (event: ImageRecord) => {
    if (!closed) {
      nodeStream.push(`event: delete_image\ndata: ${JSON.stringify(event)}\n\n`);
    }
  };

  imageEvents.on('new_image', newImageListener);
  imageEvents.on('delete_image', deleteImageListener);

  request.signal.addEventListener('abort', () => {
    closed = true;
    imageEvents.off('new_image', newImageListener);
    imageEvents.off('delete_image', deleteImageListener);
    nodeStream.destroy();
  });

  const body = Readable.toWeb(nodeStream) as ReadableStream;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  });
}
