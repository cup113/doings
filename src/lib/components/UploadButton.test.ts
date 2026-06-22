/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import UploadButton from './UploadButton.svelte';

afterEach(cleanup);

const { mockCompress, mockUpload } = vi.hoisted(() => ({
  mockCompress: vi.fn(),
  mockUpload: vi.fn(),
}));

vi.mock('$lib/utils/compress', () => ({
  compressImage: mockCompress,
}));

vi.mock('$lib/utils/api', () => ({
  uploadImage: mockUpload,
}));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('doings_uid', 'test-uid-abc');
});

describe('UploadButton', () => {
  it('renders the Take Photo button', () => {
    render(UploadButton);
    screen.getByText('Take Photo');
  });

  it('shows Uploading... while processing', async () => {
    mockCompress.mockImplementation(() => new Promise(() => {}));
    render(UploadButton);
    const input = document.querySelector('input[type="file"]')!;
    await fireEvent.change(input, { target: { files: [new File(['test'], 'photo.jpg', { type: 'image/jpeg' })] } });
    screen.getByText('Uploading...');
  });

  it('returns to idle state on failure', async () => {
    mockCompress.mockRejectedValue(new Error('Camera error'));
    render(UploadButton);
    const input = document.querySelector('input[type="file"]')!;
    await fireEvent.change(input, { target: { files: [new File(['test'], 'photo.jpg', { type: 'image/jpeg' })] } });
    await vi.waitFor(() => {
      screen.getByText('Take Photo');
    });
  });

  it('sets last upload timestamp on success', async () => {
    mockCompress.mockResolvedValue(new Blob());
    mockUpload.mockResolvedValue({ id: 1 });
    render(UploadButton);
    const input = document.querySelector('input[type="file"]')!;
    await fireEvent.change(input, { target: { files: [new File(['test'], 'photo.jpg', { type: 'image/jpeg' })] } });
    await vi.waitFor(() => {
      expect(localStorage.getItem('doings_last_upload')).toBeTruthy();
    });
  });
});
