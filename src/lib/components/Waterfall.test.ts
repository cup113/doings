/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import Waterfall from './Waterfall.svelte';
import type { ImageRecord } from '$lib/types';

afterEach(cleanup);

vi.mock('$lib/stores/app', () => ({
  currentUid: 'test-uid-abc',
  shortUid: 'tes',
  viewingUser: { subscribe: vi.fn() }
}));

const mockImages: ImageRecord[] = [
  { id: 1, uid: 'user-aaa', path: 'user-aaa/img1.webp', room: 'lobby', created_at: '2025-01-01T12:00:00Z' },
  { id: 2, uid: 'user-bbb', path: 'user-bbb/img2.webp', room: 'lobby', created_at: '2025-01-01T13:00:00Z' },
];

describe('Waterfall', () => {
  it('renders all images', () => {
    render(Waterfall, { props: { images: mockImages, onImageClick: vi.fn() } });
    const imgs = screen.getAllByAltText('') as HTMLImageElement[];
    expect(imgs.length).toBe(2);
  });

  it('marks current user images as You', () => {
    const mixed = [
      { id: 3, uid: 'test-uid-abc', path: 'test-uid-abc/img.webp', room: 'lobby', created_at: '2025-01-01T14:00:00Z' },
      ...mockImages,
    ];
    render(Waterfall, { props: { images: mixed, onImageClick: vi.fn() } });
    screen.getByText('You');
  });

  it('renders empty grid when no images', () => {
    const { container } = render(Waterfall, { props: { images: [], onImageClick: vi.fn() } });
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(0);
  });
});
