<script lang="ts">
  import { currentUid } from '$lib/stores/app';
  import type { ImageRecord } from '$lib/types';
  import { deleteImage } from '$lib/utils/api';
  import RelativeTime from './RelativeTime.svelte';

  let { images, uid, onBack, onImageClick }: {
    images: ImageRecord[];
    uid: string;
    onBack: () => void;
    onImageClick: (img: ImageRecord) => void;
  } = $props();

  function shortUid(uid: string) {
    return uid.slice(0, 3);
  }

  async function handleDelete(img: ImageRecord, e: Event) {
    e.stopPropagation();
    if (!confirm('Delete this image?')) return;
    try {
      await deleteImage(img.id, currentUid);
      images = images.filter((i) => i.id !== img.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }
</script>

<div class="p-4">
  <button
    onclick={onBack}
    class="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
  >
    &larr; Back
  </button>

  <p class="text-sm text-gray-500 mb-3">User: {uid}</p>

  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {#each images as img (img.id)}
      <button
        onclick={() => onImageClick(img)}
        class="relative aspect-square overflow-hidden rounded-lg hover:ring-2 ring-blue-500 transition-all cursor-pointer animate-fadeIn"
      >
        <img
          src="/api/uploads/{img.path}"
          alt=""
          loading="lazy"
          class="w-full h-full object-cover"
        />
        {#if img.uid === currentUid}
          <span
            role="button"
            tabindex="0"
            onclick={(e) => handleDelete(img, e)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDelete(img, e); }}
            class="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/50 text-white text-sm
                   flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer z-10"
            aria-label="Delete image"
          >&times;</span>
        {/if}
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4 text-xs text-white opacity-100">
          {#if img.uid === currentUid}
            <span class="text-cyan-300 font-medium">You</span>
          {:else}
            {shortUid(img.uid)}
          {/if}
          &middot; <RelativeTime timestamp={img.created_at} />
        </div>
      </button>
    {/each}
  </div>

  {#if images.length === 0}
    <p class="text-gray-400 text-center py-8">No images yet.</p>
  {/if}
</div>
