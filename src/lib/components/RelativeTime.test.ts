/**
 * @vitest-environment jsdom
 */
import { describe, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import RelativeTime from './RelativeTime.svelte';

afterEach(cleanup);

describe('RelativeTime', () => {
  it('renders a relative time string', () => {
    render(RelativeTime, { props: { timestamp: '2025-01-01T12:00:00Z' } });
    screen.getByText(/ago|just now|\d{2}-\d{2}/);
  });

  it('renders "just now" for recent timestamp', () => {
    const recent = new Date(Date.now() - 3000).toISOString();
    render(RelativeTime, { props: { timestamp: recent } });
    screen.getByText('just now');
  });
});
