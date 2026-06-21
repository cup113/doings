import { writable } from 'svelte/store';
import { getUid } from '$lib/utils/identity';

const _uid = typeof localStorage !== 'undefined' ? getUid() : '';

export const currentUid = _uid;
export const shortUid = _uid.slice(0, 3);
export const viewingUser = writable<string | null>(null);
export const currentRoom = writable<string>('lobby');
