<script lang="ts">
  import type { ImageRecord } from '$lib/types';

  let { images, onUserClick }: {
    images: ImageRecord[];
    onUserClick: (uid: string) => void;
  } = $props();

  function shortUid(uid: string) {
    return uid.slice(0, 3);
  }

  function shortTime(t: string) {
    return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        {shortUid(img.uid)} &middot; {shortTime(img.created_at)}
      </div>
    </button>
  {/each}
</div>
