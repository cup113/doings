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

export async function fetchBandwidth(): Promise<BandwidthStatus> {
  const res = await fetch('/api/bandwidth');
  if (!res.ok) throw new Error('Failed to fetch bandwidth');
  return res.json();
}
