<script lang="ts">
  import { untrack } from 'svelte';
  import { viewingUser, onUploadCallback } from '$lib/stores/app';
  import { get } from 'svelte/store';
  import { fetchRecentImages, fetchUserImages } from '$lib/utils/api';
  import type { ImageRecord } from '$lib/types';
  import Waterfall from '$lib/components/Waterfall.svelte';
  import UserGallery from '$lib/components/UserGallery.svelte';
  import InactivityWarning from '$lib/components/InactivityWarning.svelte';

  let images = $state<ImageRecord[]>([]);
  let userImages = $state<ImageRecord[]>([]);
  let viewingUserRef: string | null = null;

  $effect(() => {
    fetchRecentImages().then((imgs) => (images = imgs));
  });

  $effect(() => {
    viewingUserRef = get(viewingUser);
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
    const user = get(viewingUser);
    if (user) {
      fetchUserImages(user).then((imgs) => (userImages = imgs));
    } else {
      userImages = [];
    }
  });

  onUploadCallback.set((record: ImageRecord) => {
    images = [record, ...images].slice(0, 10);
    if (record.uid === get(viewingUser)) {
      userImages = [record, ...userImages].slice(0, 10);
    }
  });

  function handleUserClick(uid: string) {
    viewingUser.set(uid);
  }

  function handleBack() {
    viewingUser.set(null);
  }
</script>

{#if $viewingUser}
  <UserGallery images={userImages} uid={$viewingUser} onBack={handleBack} />
{:else}
  {#if images.length === 0}
    <p class="text-center text-gray-400 py-16">No uploads yet. Be the first!</p>
  {:else}
    <Waterfall images={images} onUserClick={handleUserClick} />
  {/if}
{/if}

<InactivityWarning />
