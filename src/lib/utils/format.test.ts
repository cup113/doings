import { describe, it, expect } from 'vitest';
import { formatRelativeTime, parseCreatedAt } from './format';

describe('parseCreatedAt', () => {
  it('parses a Z-suffixed ISO string', () => {
    const d = parseCreatedAt('2025-01-15T10:30:00Z');
    expect(d.toISOString()).toBe('2025-01-15T10:30:00.000Z');
  });

  it('appends Z if missing', () => {
    const d = parseCreatedAt('2025-06-01T12:00:00');
    expect(d.toISOString()).toBe('2025-06-01T12:00:00.000Z');
  });
});

describe('formatRelativeTime', () => {
  const base = '2025-06-01T12:00:00Z';
  const baseMs = new Date('2025-06-01T12:00:00Z').getTime();

  it('returns "just now" for <10s', () => {
    expect(formatRelativeTime(base, baseMs + 3000)).toBe('just now');
  });

  it('returns seconds for 10-59s', () => {
    expect(formatRelativeTime(base, baseMs + 30000)).toBe('30s ago');
  });

  it('returns minutes for 1-59m', () => {
    expect(formatRelativeTime(base, baseMs + 5 * 60000)).toBe('5m ago');
  });

  it('returns hours for <24h same day', () => {
    expect(formatRelativeTime(base, baseMs + 3 * 3600000)).toBe('3h ago');
  });

  it('returns date for previous day', () => {
    const nextDay = baseMs + 86400000 + 3600000;
    expect(formatRelativeTime(base, nextDay)).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});
