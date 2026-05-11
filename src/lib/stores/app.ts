import { writable } from 'svelte/store';
import { getUid } from '$lib/utils/identity';
import type { ImageRecord } from '$lib/types';

const _uid = typeof localStorage !== 'undefined' ? getUid() : '';

export const currentUid = _uid;
export const shortUid = _uid.slice(0, 3);
export const viewingUser = writable<string | null>(null);
export const onUploadCallback = writable<((record: ImageRecord) => void) | null>(null);
