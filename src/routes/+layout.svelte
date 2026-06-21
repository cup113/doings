<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.png';
  import { shortUid } from '$lib/stores/app';
  import UploadButton from '$lib/components/UploadButton.svelte';
  import RoomSelector from '$lib/components/RoomSelector.svelte';
  import HelpPanel from '$lib/components/HelpPanel.svelte';
  import { page } from '$app/stores';
  import { compressImage } from '$lib/utils/compress';
  import { uploadImage } from '$lib/utils/api';
  import { extractImagesFromClipboard, processPasteQueue, type PasteStatus } from '$lib/utils/paste';

  let { children } = $props();
  let showHelp = $state(false);
  let roomId = $derived($page.params.roomId ?? 'lobby');
  let pasteStatus = $state<PasteStatus>({ type: 'idle' });

  $effect(() => {
    const r = roomId;

    function handlePaste(e: ClipboardEvent) {
      const files = extractImagesFromClipboard(e);
      if (files.length === 0) return;
      e.preventDefault();

      processPasteQueue(files, r, {
        compressImage,
        uploadImage,
        confirm: (msg) => confirm(msg),
        getUid: () => localStorage.getItem('doings_uid')!,
        recordLastUpload: () => localStorage.setItem('doings_last_upload', Date.now().toString()),
        onStatusChange: (s) => { pasteStatus = s; },
      });
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });
</script>

<svelte:head>
  <title>Doings</title>
  <link rel="icon" type="image/png" sizes="512x512" href={favicon} />
  <link rel="icon" type="image/png" sizes="192x192" href={favicon} />
  <link rel="apple-touch-icon" sizes="180x180" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <header class="sticky top-0 bg-white border-b z-40">
    <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-bold">Doings</h1>
        <button
          onclick={() => showHelp = true}
          class="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-300 transition-colors cursor-pointer flex items-center justify-center"
        >?</button>
        <RoomSelector />
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400">You: {shortUid}</span>
        <div class="flex items-center gap-2">
          <UploadButton room={roomId} />
          {#if pasteStatus.type === 'uploading'}
            <span class="text-xs text-blue-600 whitespace-nowrap">Pasting {pasteStatus.index}/{pasteStatus.total}...</span>
          {:else if pasteStatus.type === 'done'}
            <span class="text-xs text-green-600 whitespace-nowrap animate-fadeIn">✓ Pasted {pasteStatus.index}</span>
          {:else if pasteStatus.type === 'error'}
            <span class="text-xs text-red-600 whitespace-nowrap">{pasteStatus.message}</span>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-2xl mx-auto">
    {@render children()}
  </main>
</div>

{#if showHelp}
  <HelpPanel onClose={() => showHelp = false} />
{/if}
