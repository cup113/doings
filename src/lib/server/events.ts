import { EventEmitter } from 'node:events';
import type { ImageRecord } from './db.js';

export const imageEvents = new EventEmitter();

export type ImageEvent = ImageRecord;
