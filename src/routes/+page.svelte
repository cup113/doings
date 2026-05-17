<script lang="ts">
  import { untrack } from 'svelte';
  import { viewingUser } from '$lib/stores/app';
  import { fetchRecentImages, fetchUserImages } from '$lib/utils/api';
  import type { ImageRecord } from '$lib/types';
  import Waterfall from '$lib/components/Waterfall.svelte';
  import UserGallery from '$lib/components/UserGallery.svelte';
  import InactivityWarning from '$lib/components/InactivityWarning.svelte';
  import ImageLightbox from '$lib/components/ImageLightbox.svelte';

  let images = $state<ImageRecord[]>([]);
  let userImages = $state<ImageRecord[]>([]);
  let loading = $state(true);
  let fetchError = $state('');
  let isFirstOpen = $state(true);
  let lightboxOpen = $state(false);
  let lightboxImages = $state<ImageRecord[]>([]);
  let lightboxIndex = $state(0);

  $effect(() => {
    loading = true;
    fetchError = '';
    fetchWithRetry(fetchRecentImages).then((result) => {
      if (result.data) images = result.data;
      else fetchError = result.error ?? 'Failed to load images';
    }).finally(() => loading = false);
  });

  $effect(() => {
    const source = new EventSource('/api/events');

    source.onopen = () => {
      if (isFirstOpen) { isFirstOpen = false; return; }
      fetchRecentImages().then((imgs) => (images = imgs));
    };

    source.addEventListener('new_image', (event: MessageEvent) => {
      const data: ImageRecord = JSON.parse(event.data);
      const current = untrack(() => images);
      if (current.some((img) => img.id === data.id)) return;
      images = [data, ...current].slice(0, 12);

      if (data.uid === $viewingUser) {
        const currentUser = untrack(() => userImages);
        if (currentUser.some((img) => img.id === data.id)) return;
        userImages = [data, ...currentUser].slice(0, 12);
      }
    });

    source.addEventListener('delete_image', (event: MessageEvent) => {
      const data: ImageRecord = JSON.parse(event.data);
      const current = untrack(() => images);
      images = current.filter((img) => img.id !== data.id);

      if (data.uid === $viewingUser) {
        const currentUser = untrack(() => userImages);
        userImages = currentUser.filter((img) => img.id !== data.id);
      }
    });

    source.onerror = () => {};

    return () => source.close();
  });

  $effect(() => {
    if ($viewingUser) {
      fetchUserImages($viewingUser).then((imgs) => (userImages = imgs));
    } else {
      userImages = [];
    }
  });

  async function fetchWithRetry<T>(
    fn: () => Promise<T>, retries = 3
  ): Promise<{ data?: T; error?: string }> {
    for (let i = 0; i < retries; i++) {
      try { return { data: await fn() }; }
      catch (e) {
        if (i === retries - 1) return { error: (e as Error).message };
        await new Promise((r) => setTimeout(r, (i + 1) * 1000));
      }
    }
    return { error: 'Unknown error' };
  }

  function handleImageClick(img: ImageRecord, source: ImageRecord[]) {
    lightboxImages = source;
    lightboxIndex = source.indexOf(img);
    lightboxOpen = true;
  }

  function handleUserClick(uid: string) {
    viewingUser.set(uid);
  }

  function handleBack() {
    viewingUser.set(null);
  }
</script>

{#if $viewingUser}
  <UserGallery
    images={userImages}
    uid={$viewingUser}
    onBack={handleBack}
    onImageClick={(img) => handleImageClick(img, userImages)}
  />
{:else if loading}
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
    {#each Array(12) as _, i (i)}
      <div class="aspect-square rounded-lg bg-gray-200 animate-pulse"></div>
    {/each}
  </div>
{:else if fetchError}
  <div class="text-center py-16">
    <p class="text-red-500 mb-4">{fetchError}</p>
    <button
      onclick={() => window.location.reload()}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
    >Retry</button>
  </div>
{:else if images.length === 0}
  <p class="text-center text-gray-400 py-16">No uploads yet. Be the first!</p>
{:else}
  <Waterfall images={images} onImageClick={(img) => handleImageClick(img, images)} />
{/if}

{#if lightboxOpen}
  <ImageLightbox
    images={lightboxImages}
    index={lightboxIndex}
    onClose={() => lightboxOpen = false}
    onUserClick={handleUserClick}
  />
{/if}

<InactivityWarning />
