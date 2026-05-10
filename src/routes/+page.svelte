<script lang="ts">
  import { untrack } from 'svelte';
  import { getUid } from '$lib/utils/identity';
  import { fetchRecentImages, fetchUserImages } from '$lib/utils/api';
  import type { ImageRecord } from '$lib/types';
  import UploadButton from '$lib/components/UploadButton.svelte';
  import Waterfall from '$lib/components/Waterfall.svelte';
  import UserGallery from '$lib/components/UserGallery.svelte';
  import InactivityWarning from '$lib/components/InactivityWarning.svelte';

  let images = $state<ImageRecord[]>([]);
  let viewingUser = $state<string | null>(null);
  let userImages = $state<ImageRecord[]>([]);
  let viewingUserRef: string | null = null;

  getUid();

  $effect(() => {
    fetchRecentImages().then((imgs) => (images = imgs));
  });

  $effect(() => {
    viewingUserRef = viewingUser;
  });

  $effect(() => {
    const source = new EventSource('/api/events');

    source.onmessage = (event) => {
      const data: ImageRecord = JSON.parse(event.data);
      const current = untrack(() => images);
      images = [data, ...current].slice(0, 10);

      if (data.uid === viewingUserRef) {
        const currentUser = untrack(() => userImages);
        userImages = [data, ...currentUser].slice(0, 10);
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  });

  $effect(() => {
    const user = viewingUser;
    if (user) {
      fetchUserImages(user).then((imgs) => (userImages = imgs));
    } else {
      userImages = [];
    }
  });

  function handleUpload(record: ImageRecord) {
    images = [record, ...images].slice(0, 10);

    if (record.uid === viewingUser) {
      userImages = [record, ...userImages].slice(0, 10);
    }
  }

  function handleUserClick(uid: string) {
    viewingUser = uid;
  }

  function handleBack() {
    viewingUser = null;
  }
</script>

<div class="min-h-screen bg-gray-50">
  <header class="sticky top-0 bg-white border-b z-40">
    <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-bold">Doings</h1>
      {#if !viewingUser}
        <UploadButton onUpload={handleUpload} />
      {/if}
    </div>
  </header>

  <main class="max-w-2xl mx-auto">
    {#if viewingUser}
      <UserGallery images={userImages} uid={viewingUser} onBack={handleBack} />
    {:else}
      {#if images.length === 0}
        <p class="text-center text-gray-400 py-16">No uploads yet. Be the first!</p>
      {:else}
        <Waterfall images={images} onUserClick={handleUserClick} />
      {/if}
    {/if}
  </main>

  <InactivityWarning />
</div>
