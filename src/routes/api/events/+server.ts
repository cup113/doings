import { imageEvents, type ImageEvent } from '$lib/server/events';

export function GET({ request }: { request: Request }) {
  let closed = false;

  const body = new ReadableStream({
    start(controller) {
      const listener = (event: ImageEvent) => {
        if (!closed) {
          controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
        }
      };

      imageEvents.on('new_image', listener);

      request.signal.addEventListener('abort', () => {
        closed = true;
        imageEvents.off('new_image', listener);
      });
    }
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
