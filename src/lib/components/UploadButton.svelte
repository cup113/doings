<script lang="ts">
  import { compressImage } from '$lib/utils/compress';
  import { uploadImage } from '$lib/utils/api';
  import type { ImageRecord } from '$lib/types';

  let { onUpload }: {
    onUpload?: (record: ImageRecord) => void;
  } = $props();

  let inputEl = $state<HTMLInputElement>();
  let uploading = $state(false);
  let error = $state('');

  async function handleFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;
    error = '';

    try {
      const compressed = await compressImage(file);
      const uid = localStorage.getItem('doings_uid')!;
      const record = await uploadImage(compressed, uid);
      localStorage.setItem('doings_last_upload', Date.now().toString());
      onUpload?.(record);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Upload failed';
    } finally {
      uploading = false;
      input.value = '';
    }
  }

  function triggerUpload() {
    inputEl?.click();
  }
</script>

<input
  type="file"
  accept="image/*"
  capture="environment"
  class="hidden"
  bind:this={inputEl}
  onchange={handleFile}
/>

<button
  onclick={triggerUpload}
  disabled={uploading}
  class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
>
  {uploading ? 'Uploading...' : 'Take Photo'}
</button>

{#if error}
  <p class="text-red-500 text-sm mt-2">{error}</p>
{/if}
