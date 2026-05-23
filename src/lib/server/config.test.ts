import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

describe('config', () => {
  it('uses defaults when env vars are unset', async () => {
    const mod = await import('./config');
    expect(mod.UPLOADS_DIR).toBe('uploads');
    expect(mod.DB_PATH).toBe('data/doings.db');
  });

  it('reads UPLOADS_DIR from env', async () => {
    vi.stubEnv('UPLOADS_DIR', '/tmp/uploads');
    const mod = await import('./config');
    expect(mod.UPLOADS_DIR).toBe('/tmp/uploads');
    vi.unstubAllEnvs();
  });

  it('reads DB_PATH from env', async () => {
    vi.stubEnv('DB_PATH', '/tmp/test.db');
    const mod = await import('./config');
    expect(mod.DB_PATH).toBe('/tmp/test.db');
    vi.unstubAllEnvs();
  });
});
