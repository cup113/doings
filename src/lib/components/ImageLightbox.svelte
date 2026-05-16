<script lang="ts">
  import { currentUid } from '$lib/stores/app';
  import type { ImageRecord } from '$lib/types';
  import RelativeTime from './RelativeTime.svelte';

  let { images, index: initialIndex, onClose, onUserClick }: {
    images: ImageRecord[];
    index: number;
    onClose: () => void;
    onUserClick: (uid: string) => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  let currentIndex = $state(initialIndex);

  function prev() {
    if (currentIndex > 0) currentIndex--;
  }

  function next() {
    if (currentIndex < images.length - 1) currentIndex++;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }

  function shortUid(uid: string) {
    return uid.slice(0, 3);
  }

  const img = $derived(images[currentIndex]);
</script>

<svelte:window onkeydown={handleKeydown} />

<button
  onclick={onClose}
  class="fixed inset-0 bg-black/80 z-50 cursor-pointer"
  aria-label="Close lightbox"
></button>

<div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
  <button
    onclick={onClose}
    class="absolute top-4 right-4 w-10 h-10 rounded-full
           bg-white/20 text-white text-2xl hover:bg-white/40 transition-colors
           flex items-center justify-center cursor-pointer z-20 pointer-events-auto"
    aria-label="Close lightbox"
  >&times;</button>

  {#if currentIndex > 0}
    <button
      onclick={prev}
      class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
             bg-white/20 text-white text-xl hover:bg-white/40 transition-colors
             flex items-center justify-center cursor-pointer z-10 pointer-events-auto"
      aria-label="Previous image"
    >&#8249;</button>
  {/if}

  <img
    src="/api/uploads/{img.path}"
    alt=""
    class="max-h-[85vh] max-w-[85vw] object-contain rounded-lg select-none pointer-events-auto"
  />

  {#if currentIndex < images.length - 1}
    <button
      onclick={next}
      class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
             bg-white/20 text-white text-xl hover:bg-white/40 transition-colors
             flex items-center justify-center cursor-pointer z-10 pointer-events-auto"
      aria-label="Next image"
    >&#8250;</button>
  {/if}
</div>

<div class="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/70 to-transparent
            px-6 pb-6 pt-12 flex items-center justify-between text-white pointer-events-none">
  <button
    onclick={() => { onUserClick(img.uid); onClose(); }}
    class="text-sm underline hover:text-cyan-300 transition-colors cursor-pointer pointer-events-auto"
  >
    View all by {currentUid === img.uid ? 'You' : shortUid(img.uid)}
  </button>
  <span class="text-xs pointer-events-auto">
    <RelativeTime timestamp={img.created_at} />
  </span>
</div>
