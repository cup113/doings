import { EventEmitter } from 'node:events';
import type { ImageRecord } from '$lib/types';

type ImageEventMap = {
  new_image: [ImageRecord];
  delete_image: [ImageRecord];
};

export const imageEvents = new EventEmitter() as {
  emit<K extends keyof ImageEventMap>(event: K, ...args: ImageEventMap[K]): boolean;
  on<K extends keyof ImageEventMap>(event: K, listener: (...args: ImageEventMap[K]) => void): EventEmitter;
  off<K extends keyof ImageEventMap>(event: K, listener: (...args: ImageEventMap[K]) => void): EventEmitter;
};
