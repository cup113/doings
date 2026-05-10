<script lang="ts">
  import type { ImageRecord } from '$lib/types';

  let { images, onUserClick }: {
    images: ImageRecord[];
    onUserClick: (uid: string) => void;
  } = $props();
</script>

<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-4">
  {#each images as img (img.id)}
    <button
      onclick={() => onUserClick(img.uid)}
      class="aspect-square overflow-hidden rounded-lg hover:ring-2 ring-blue-500 transition-all cursor-pointer"
    >
      <img
        src="/api/uploads/{img.path}"
        alt=""
        loading="lazy"
        class="w-full h-full object-cover"
      />
    </button>
  {/each}
</div>
