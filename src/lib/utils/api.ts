import type { ImageRecord, BandwidthStatus, Room } from '$lib/types';

export async function uploadImage(file: Blob, uid: string, room: string): Promise<ImageRecord> {
  const formData = new FormData();
  formData.append('file', file, 'image.webp');
  formData.append('uid', uid);
  formData.append('room', room);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function fetchRecentImages(room: string, limit = 12): Promise<ImageRecord[]> {
  const res = await fetch(`/api/images?room=${encodeURIComponent(room)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch images');
  return res.json();
}

export async function fetchUserImages(uid: string, room: string, limit = 12): Promise<ImageRecord[]> {
  const res = await fetch(`/api/images/${uid}?room=${encodeURIComponent(room)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch user images');
  return res.json();
}

export async function deleteImage(id: number, uid: string): Promise<void> {
  const res = await fetch('/api/images/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, uid }),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || 'Delete failed');
  }
}

export async function fetchBandwidth(): Promise<BandwidthStatus> {
  const res = await fetch('/api/bandwidth');
  if (!res.ok) throw new Error('Failed to fetch bandwidth');
  return res.json();
}

export async function fetchPublicRooms(): Promise<Room[]> {
  const res = await fetch('/api/rooms');
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}

export async function checkRoomName(name: string): Promise<boolean> {
  const res = await fetch(`/api/rooms/check?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to check room name');
  const data = await res.json();
  return data.available;
}

export async function createRoom(id: string, name: string, isPublic: boolean): Promise<Room> {
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, isPublic }),
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}
