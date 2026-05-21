import type { ImageRecord } from '$lib/types';

export interface GetImagesParams {
  uid?: string;
  limit?: number;
  after?: number;
  order?: 'newest' | 'oldest';
}

export interface CountImagesParams {
  uid?: string;
}

export type DeleteResult =
  | { ok: true; record: ImageRecord }
  | { ok: false; reason: 'not_found' | 'unauthorized' };

export interface ImageRepository {
  getImages(params: GetImagesParams): ImageRecord[];
  countImages(params: CountImagesParams): number;
  getImageById(id: number): ImageRecord | null;
  insertImage(uid: string, path: string): ImageRecord;
  deleteImage(id: number): void;
  ping(): boolean;
}
