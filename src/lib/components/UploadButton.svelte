<script lang="ts">
  import { compressImage } from '$lib/utils/compress';
  import { uploadImage } from '$lib/utils/api';
  import { pasteStatus } from '$lib/stores/paste';

  let { room }: { room: string } = $props();

  let inputEl = $state<HTMLInputElement>();
  let uploading = $state(false);
  let done = $state(false);

  let buttonLabel = $derived.by(() => {
    if (uploading) return 'Uploading...';
    if (done) return '✓ Done';
    const p = $pasteStatus;
    if (p.type === 'uploading') return `Pasting ${p.index}/${p.total}...`;
    if (p.type === 'done') return '✓ Done';
    if (p.type === 'error') return 'Failed';
    return 'Take Photo';
  });

  async function handleFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;
    done = false;

    try {
      const compressed = await compressImage(file);
      const uid = localStorage.getItem('doings_uid')!;
      await uploadImage(compressed, uid, room);
      localStorage.setItem('doings_last_upload', Date.now().toString());
      done = true;
      setTimeout(() => done = false, 1500);
    } catch {
      // error — button returns to idle state
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
  disabled={uploading || $pasteStatus.type === 'uploading'}
  class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
>
  {buttonLabel}
</button>
