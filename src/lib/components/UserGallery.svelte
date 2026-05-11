<script lang="ts">
  import { currentUid } from '$lib/stores/app';
  import type { ImageRecord } from '$lib/types';
  import RelativeTime from './RelativeTime.svelte';

  let { images, uid, onBack }: {
    images: ImageRecord[];
    uid: string;
    onBack: () => void;
  } = $props();

  function shortUid(uid: string) {
    return uid.slice(0, 3);
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
      <div class="relative aspect-square overflow-hidden rounded-lg">
        <img
          src="/api/uploads/{img.path}"
          alt=""
          loading="lazy"
          class="w-full h-full object-cover"
        />
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4 text-xs text-white opacity-100">
          {#if img.uid === currentUid}
            <span class="text-cyan-300 font-medium">You</span>
          {:else}
            {shortUid(img.uid)}
          {/if}
          &middot; <RelativeTime timestamp={img.created_at} />
        </div>
      </div>
    {/each}
  </div>

  {#if images.length === 0}
    <p class="text-gray-400 text-center py-8">No images yet.</p>
  {/if}
</div>
