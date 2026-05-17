import type { ImageRecord, BandwidthStatus } from '$lib/types';

export async function uploadImage(file: Blob, uid: string): Promise<ImageRecord> {
  const formData = new FormData();
  formData.append('file', file, 'image.webp');
  formData.append('uid', uid);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function fetchRecentImages(limit = 12): Promise<ImageRecord[]> {
  const res = await fetch(`/api/images?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch images');
  return res.json();
}

export async function fetchUserImages(uid: string, limit = 12): Promise<ImageRecord[]> {
  const res = await fetch(`/api/images/${uid}?limit=${limit}`);
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
