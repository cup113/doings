import { Readable } from 'node:stream';
import { imageEvents, type ImageEvent } from '$lib/server/events';

export function GET({ request }: { request: Request }) {
  let closed = false;

  const nodeStream = new Readable({
    read() {}
  });

  const listener = (event: ImageEvent) => {
    if (!closed) {
      nodeStream.push(`data: ${JSON.stringify(event)}\n\n`);
    }
  };

  imageEvents.on('new_image', listener);

  request.signal.addEventListener('abort', () => {
    closed = true;
    imageEvents.off('new_image', listener);
    nodeStream.destroy();
  });

  const body = Readable.toWeb(nodeStream) as ReadableStream;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
