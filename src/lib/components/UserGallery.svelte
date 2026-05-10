<script lang="ts">
  import type { ImageRecord } from '$lib/types';

  let { images, uid, onBack }: {
    images: ImageRecord[];
    uid: string;
    onBack: () => void;
  } = $props();
</script>

<div class="p-4">
  <button
    onclick={onBack}
    class="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
  >
    Back
  </button>

  <p class="text-sm text-gray-500 mb-3">User: {uid}</p>

  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
    {#each images as img (img.id)}
      <div class="aspect-square overflow-hidden rounded-lg">
        <img
          src="/api/uploads/{img.path}"
          alt=""
          loading="lazy"
          class="w-full h-full object-cover"
        />
        <p class="text-xs text-gray-400 mt-1">{img.created_at}</p>
      </div>
    {/each}
  </div>

  {#if images.length === 0}
    <p class="text-gray-400 text-center py-8">No images yet.</p>
  {/if}
</div>
