/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import HelpPanel from './HelpPanel.svelte';

afterEach(cleanup);

describe('HelpPanel', () => {
  it('renders the help panel with title', () => {
    render(HelpPanel, { props: { onClose: vi.fn() } });
    screen.getByText('How to Use');
  });

  it('renders GitHub link', () => {
    render(HelpPanel, { props: { onClose: vi.fn() } });
    const link = screen.getByText('GitHub');
    expect(link?.getAttribute('href')).toBe('https://github.com/cup113/doings');
  });

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn();
    render(HelpPanel, { props: { onClose } });
    const backdrop = screen.getAllByLabelText('Close help')[0];
    await backdrop.click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
