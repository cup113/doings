import { writable } from 'svelte/store';
import type { PasteStatus } from '$lib/utils/paste';

export const pasteStatus = writable<PasteStatus>({ type: 'idle' });
