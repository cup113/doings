import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

describe('bandwidth', () => {
  it('starts at zero', async () => {
    const bw = await import('./bandwidth');
    const s = bw.getStatus();
    expect(s.uploadBytes).toBe(0);
    expect(s.downloadBytes).toBe(0);
    expect(s.isExceeded).toBe(false);
  });

  it('tracks upload bytes', async () => {
    const bw = await import('./bandwidth');
    bw.addUpload(100);
    bw.addUpload(200);
    expect(bw.getStatus().uploadBytes).toBe(300);
  });

  it('tracks download bytes', async () => {
    const bw = await import('./bandwidth');
    bw.addDownload(500);
    expect(bw.getStatus().downloadBytes).toBe(500);
  });

  it('isExceeded after crossing 2GB limit', async () => {
    const bw = await import('./bandwidth');
    const limit = 2 * 1024 * 1024 * 1024;
    bw.addUpload(limit + 1);
    expect(bw.getStatus().isExceeded).toBe(true);
  });

  it('isExceeded returns false under limit', async () => {
    const bw = await import('./bandwidth');
    bw.addUpload(1024);
    expect(bw.getStatus().isExceeded).toBe(false);
  });
});
