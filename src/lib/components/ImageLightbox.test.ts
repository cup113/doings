/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ImageLightbox from './ImageLightbox.svelte';
import type { ImageRecord } from '$lib/types';

afterEach(cleanup);

vi.mock('$lib/stores/app', () => ({
  currentUid: 'test-uid-abc',
  viewingUser: { subscribe: vi.fn() }
}));

const mockImages: ImageRecord[] = [
  { id: 1, uid: 'user-aaa', path: 'user-aaa/img1.webp', room: 'lobby', created_at: '2025-01-01T12:00:00Z' },
  { id: 2, uid: 'user-bbb', path: 'user-bbb/img2.webp', room: 'lobby', created_at: '2025-01-01T13:00:00Z' },
  { id: 3, uid: 'user-ccc', path: 'user-ccc/img3.webp', room: 'lobby', created_at: '2025-01-01T14:00:00Z' },
];

describe('ImageLightbox', () => {
  it('renders current image', () => {
    render(ImageLightbox, {
      props: { images: mockImages, index: 0, onClose: vi.fn(), onUserClick: vi.fn() }
    });
    const img = screen.getByAltText('') as HTMLImageElement;
    expect(img.src).toContain('user-aaa/img1.webp');
  });

  it('shows prev/next buttons when not at ends', () => {
    render(ImageLightbox, {
      props: { images: mockImages, index: 1, onClose: vi.fn(), onUserClick: vi.fn() }
    });
    screen.getByLabelText('Previous image');
    screen.getByLabelText('Next image');
  });

  it('hides prev at first image', () => {
    render(ImageLightbox, {
      props: { images: mockImages, index: 0, onClose: vi.fn(), onUserClick: vi.fn() }
    });
    expect(screen.queryByLabelText('Previous image')).toBeNull();
    screen.getByLabelText('Next image');
  });

  it('hides next at last image', () => {
    render(ImageLightbox, {
      props: { images: mockImages, index: 2, onClose: vi.fn(), onUserClick: vi.fn() }
    });
    expect(screen.queryByLabelText('Next image')).toBeNull();
    screen.getByLabelText('Previous image');
  });

  it('shows View all by link', () => {
    render(ImageLightbox, {
      props: { images: mockImages, index: 0, onClose: vi.fn(), onUserClick: vi.fn() }
    });
    screen.getByText(/View all by/);
  });

  it('calls onClose when Escape pressed', () => {
    const onClose = vi.fn();
    render(ImageLightbox, {
      props: { images: mockImages, index: 0, onClose, onUserClick: vi.fn() }
    });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(ImageLightbox, {
      props: { images: mockImages, index: 0, onClose, onUserClick: vi.fn() }
    });
    const closeBtns = screen.getAllByLabelText('Close lightbox');
    const xButton = closeBtns.find(b => b.textContent === '×');
    await xButton?.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
