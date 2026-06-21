import { json } from '@sveltejs/kit';
import { roomStore } from '$lib/server/init';

export async function GET() {
  const rooms = roomStore.listPublicRooms();
  return json(rooms);
}

export async function POST({ request }: { request: Request }) {
  const { id, name, isPublic } = await request.json();

  if (!id || !name) {
    return json({ error: 'Missing id or name' }, { status: 400 });
  }

  if (roomStore.isNameTaken(name)) {
    return json({ error: 'Room name already taken' }, { status: 409 });
  }

  const room = roomStore.createRoom(id, name, !!isPublic);
  return json(room);
}
