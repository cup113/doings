/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import InactivityWarning from './InactivityWarning.svelte';

afterEach(cleanup);

const mockRequestPermission = vi.fn().mockResolvedValue('denied');

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  Object.defineProperty(window, 'Notification', {
    writable: true,
    value: vi.fn(() => ({})),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window.Notification as any).permission = 'default';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window.Notification as any).requestPermission = mockRequestPermission;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('InactivityWarning', () => {
  it('renders nothing when recently uploaded', () => {
    localStorage.setItem('doings_last_upload', Date.now().toString());
    const { container } = render(InactivityWarning);
    expect(container.textContent?.trim()).toBe('');
  });

  it('shows early warning at 20-25min', async () => {
    localStorage.setItem('doings_last_upload', (Date.now() - 21 * 60 * 1000).toString());
    render(InactivityWarning);
    await vi.advanceTimersByTimeAsync(100);
    screen.getByText(/min left/);
  });

  it('shows mid warning at 25-28min', async () => {
    localStorage.setItem('doings_last_upload', (Date.now() - 26 * 60 * 1000).toString());
    render(InactivityWarning);
    await vi.advanceTimersByTimeAsync(100);
    screen.getByText('5min until check-in!');
  });

  it('shows late warning at 28-30min', async () => {
    localStorage.setItem('doings_last_upload', (Date.now() - 29 * 60 * 1000).toString());
    render(InactivityWarning);
    await vi.advanceTimersByTimeAsync(100);
    screen.getByText(/running late/);
  });

  it('shows alert overlay after 30min', async () => {
    localStorage.setItem('doings_last_upload', (Date.now() - 31 * 60 * 1000).toString());
    render(InactivityWarning);
    await vi.advanceTimersByTimeAsync(100);
    screen.getByText(/accountability circle/);
  });

  it('shows snooze buttons in alert state', async () => {
    localStorage.setItem('doings_last_upload', (Date.now() - 31 * 60 * 1000).toString());
    render(InactivityWarning);
    await vi.advanceTimersByTimeAsync(100);
    screen.getByText('Snooze 5m');
    screen.getByText('Snooze 10m');
    screen.getByText('Snooze 15m');
  });

  it('hides alert after snooze', async () => {
    localStorage.setItem('doings_last_upload', (Date.now() - 31 * 60 * 1000).toString());
    render(InactivityWarning);
    await vi.advanceTimersByTimeAsync(100);
    await screen.getByText('Snooze 5m').click();
    expect(screen.queryByText(/accountability circle/)).toBeNull();
  });
});
