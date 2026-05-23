import { describe, it, expect, vi } from 'vitest';
import { imageEvents } from './events';

describe('imageEvents', () => {
  it('emits and receives new_image', () => {
    const record = { id: 1, uid: 'abc', path: 'abc/1.webp', created_at: '2025-01-01T00:00:00Z' };
    const handler = vi.fn();
    imageEvents.on('new_image', handler);
    imageEvents.emit('new_image', record);
    expect(handler).toHaveBeenCalledWith(record);
    imageEvents.off('new_image', handler);
  });

  it('emits and receives delete_image', () => {
    const record = { id: 2, uid: 'def', path: 'def/2.webp', created_at: '2025-01-02T00:00:00Z' };
    const handler = vi.fn();
    imageEvents.on('delete_image', handler);
    imageEvents.emit('delete_image', record);
    expect(handler).toHaveBeenCalledWith(record);
    imageEvents.off('delete_image', handler);
  });
});
