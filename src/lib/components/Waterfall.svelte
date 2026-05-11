<script lang="ts">
  import { currentUid } from '$lib/stores/app';
  import type { ImageRecord } from '$lib/types';
  import RelativeTime from './RelativeTime.svelte';

  let { images, onUserClick }: {
    images: ImageRecord[];
    onUserClick: (uid: string) => void;
  } = $props();

  function shortUid(uid: string) {
    return uid.slice(0, 3);
  }
</script>

<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
  {#each images as img (img.id)}
    <button
      onclick={() => onUserClick(img.uid)}
      class="relative aspect-square overflow-hidden rounded-lg hover:ring-2 ring-blue-500 transition-all cursor-pointer"
    >
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
    </button>
  {/each}
</div>
