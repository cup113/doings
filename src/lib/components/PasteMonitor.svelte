<script lang="ts">
  import { pasteStatus } from '$lib/stores/paste';
  import { extractImagesFromClipboard, processPasteQueue } from '$lib/utils/paste';
  import { compressImage } from '$lib/utils/compress';
  import { uploadImage } from '$lib/utils/api';
  import { page } from '$app/stores';

  let roomId = $derived($page.params.roomId ?? 'lobby');

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
        onStatusChange: (s) => { pasteStatus.set(s); },
      });
    }

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });
</script>
