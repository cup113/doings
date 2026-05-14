# SSE over WebSockets for real-time push

The app pushes one event type (`new_image`) to all connected clients. Server-Sent Events (`text/event-stream`) was chosen over WebSockets because the communication is strictly one-way (server → client) and SSE is simpler — no handshake protocol, no library, just `EventEmitter` + `Readable.toWeb`.

This decision may change if features like typing indicators, live presence, or bidirectional messaging are added. WebSockets (via `ws` or SvelteKit's built-in WebSocket support) would be a natural migration path, and the EventEmitter pattern in `events.ts` already decouples the event source from the transport.
