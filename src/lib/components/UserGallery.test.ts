/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import UserGallery from './UserGallery.svelte';
import type { ImageRecord } from '$lib/types';

afterEach(cleanup);

vi.mock('$lib/stores/app', () => ({
  currentUid: 'test-uid-abc',
  viewingUser: { subscribe: vi.fn() }
}));

vi.mock('$lib/utils/api', () => ({
  deleteImage: vi.fn(),
}));

const mockImages: ImageRecord[] = [
  { id: 1, uid: 'test-uid-abc', path: 'test-uid-abc/img1.webp', room: 'lobby', created_at: '2025-01-01T12:00:00Z' },
  { id: 2, uid: 'user-bbb', path: 'user-bbb/img2.webp', room: 'lobby', created_at: '2025-01-01T13:00:00Z' },
];

describe('UserGallery', () => {
  it('renders user uid text', () => {
    render(UserGallery, {
      props: { images: mockImages, uid: 'test-uid-abc', onBack: vi.fn(), onImageClick: vi.fn() }
    });
    screen.getByText('User: test-uid-abc');
  });

  it('renders Back button', () => {
    render(UserGallery, {
      props: { images: mockImages, uid: 'test-uid-abc', onBack: vi.fn(), onImageClick: vi.fn() }
    });
    screen.getByText('← Back');
  });

  it('calls onBack when Back clicked', async () => {
    const onBack = vi.fn();
    render(UserGallery, {
      props: { images: mockImages, uid: 'test-uid-abc', onBack, onImageClick: vi.fn() }
    });
    await screen.getByText('← Back').click();
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('shows delete button for own images', () => {
    render(UserGallery, {
      props: { images: mockImages, uid: 'test-uid-abc', onBack: vi.fn(), onImageClick: vi.fn() }
    });
    const deleteBtns = screen.getAllByLabelText('Delete image');
    expect(deleteBtns.length).toBe(1);
  });

  it('shows empty state when no images', () => {
    render(UserGallery, {
      props: { images: [], uid: 'test-uid-abc', onBack: vi.fn(), onImageClick: vi.fn() }
    });
    screen.getByText('No images yet.');
  });
});
