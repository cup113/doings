import { describe, it, expect } from 'vitest';

describe('createRepo', () => {
  it('creates an in-memory repo that responds to ping', async () => {
    const { createRepo } = await import('./init');
    const { repo } = createRepo(':memory:');
    expect(repo.ping()).toBe(true);
  });

  it('insert and retrieve round-trips', async () => {
    const { createRepo } = await import('./init');
    const { repo } = createRepo(':memory:');
    const r = repo.insertImage('uid1', 'path/test.webp', 'lobby');
    expect(r.id).toBeGreaterThan(0);
    expect(repo.getImageById(r.id)).toEqual(r);
  });
});
