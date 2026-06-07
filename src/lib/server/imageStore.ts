import { EventEmitter } from 'node:events';
import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import type { ImageRecord } from '$lib/types';
import type { ImageRepository, DeleteResult } from './repository';

type ImageEventMap = {
  new_image: [ImageRecord];
  delete_image: [ImageRecord];
};

export const imageEvents = new EventEmitter() as {
  emit<K extends keyof ImageEventMap>(event: K, ...args: ImageEventMap[K]): boolean;
  on<K extends keyof ImageEventMap>(event: K, listener: (...args: ImageEventMap[K]) => void): EventEmitter;
  off<K extends keyof ImageEventMap>(event: K, listener: (...args: ImageEventMap[K]) => void): EventEmitter;
};

export interface PruneLimits {
  maxPerUser: number;
  maxGlobal: number;
}

const DEFAULT_LIMITS: PruneLimits = { maxPerUser: 100, maxGlobal: 2000 };

export class ImageStore {
  constructor(
    private repo: ImageRepository,
    private uploadsDir: string
  ) {}

  getRecentImages(limit = 12): ImageRecord[] {
    return this.repo.getImages({ limit, order: 'newest' });
  }

  getUserImages(uid: string, limit = 12): ImageRecord[] {
    return this.repo.getImages({ uid, limit, order: 'newest' });
  }

  storeImage(uid: string, buffer: Buffer, limits: PruneLimits = DEFAULT_LIMITS): ImageRecord {
    const userDir = join(this.uploadsDir, uid);
    mkdirSync(userDir, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const filePath = join(userDir, filename);
    writeFileSync(filePath, buffer);

    const record = this.repo.insertImage(uid, `${uid}/${filename}`);

    this.prune(uid, limits);

    imageEvents.emit('new_image', record);

    return record;
  }

  deleteImageRecord(id: number, uid: string): DeleteResult {
    const img = this.repo.getImageById(id);
    if (!img) return { ok: false, reason: 'not_found' };
    if (img.uid !== uid) return { ok: false, reason: 'unauthorized' };

    try { unlinkSync(join(this.uploadsDir, img.path)); } catch { /* file may be gone */ }
    this.repo.deleteImage(img.id);

    imageEvents.emit('delete_image', img);

    return { ok: true, record: img };
  }

  prune(userUid: string, limits: PruneLimits): void {
    let count = this.repo.countImages({ uid: userUid });
    while (count > limits.maxPerUser) {
      const oldest = this.getOldestUserImage(userUid);
      if (!oldest) break;
      try { unlinkSync(join(this.uploadsDir, oldest.path)); } catch { /* file may be gone */ }
      this.repo.deleteImage(oldest.id);
      count--;
    }

    let total = this.repo.countImages({});
    while (total > limits.maxGlobal) {
      const oldest = this.getOldestImage();
      if (!oldest) break;
      try { unlinkSync(join(this.uploadsDir, oldest.path)); } catch { /* file may be gone */ }
      this.repo.deleteImage(oldest.id);
      total--;
    }
  }

  private getOldestImage(): ImageRecord | null {
    return this.repo.getImages({ order: 'oldest', limit: 1 })[0] ?? null;
  }

  private getOldestUserImage(uid: string): ImageRecord | null {
    return this.repo.getImages({ uid, order: 'oldest', limit: 1 })[0] ?? null;
  }
}
