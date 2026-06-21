import type { ImageRecord } from '$lib/types';

export interface GetImagesParams {
  room?: string;
  uid?: string;
  limit?: number;
  after?: number;
  order?: 'newest' | 'oldest';
}

export interface CountImagesParams {
  room?: string;
  uid?: string;
}

export type DeleteResult =
  | { ok: true; record: ImageRecord }
  | { ok: false; reason: 'not_found' | 'unauthorized' };

export interface ImageRepository {
  getImages(params: GetImagesParams): ImageRecord[];
  countImages(params: CountImagesParams): number;
  getImageById(id: number): ImageRecord | null;
  insertImage(uid: string, path: string, room: string): ImageRecord;
  deleteImage(id: number): void;
  ping(): boolean;
}
