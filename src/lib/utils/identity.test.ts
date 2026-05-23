/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { getUid } from './identity';

beforeEach(() => {
  localStorage.clear();
});

describe('getUid', () => {
  it('generates and persists a uid', () => {
    const uid = getUid();
    expect(uid).toBeTruthy();
    expect(typeof uid).toBe('string');
    expect(localStorage.getItem('doings_uid')).toBe(uid);
  });

  it('returns the same uid on subsequent calls', () => {
    const uid1 = getUid();
    const uid2 = getUid();
    expect(uid1).toBe(uid2);
  });
});
