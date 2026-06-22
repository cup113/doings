<script lang="ts">
  import favicon from '$lib/assets/favicon.png';
  import UploadButton from '$lib/components/UploadButton.svelte';
  import RoomSelector from '$lib/components/RoomSelector.svelte';
  import HelpPanel from '$lib/components/HelpPanel.svelte';
  import PasteMonitor from '$lib/components/PasteMonitor.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  let showHelp = $state(false);
  let roomId = $derived($page.params.roomId ?? 'lobby');
  let pageTitle = $derived(roomId === 'lobby' ? 'Doings' : `Doings — #${roomId}`);
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <link rel="icon" type="image/png" sizes="512x512" href={favicon} />
  <link rel="icon" type="image/png" sizes="192x192" href={favicon} />
  <link rel="apple-touch-icon" sizes="180x180" href={favicon} />
</svelte:head>

<header class="sticky top-0 bg-white border-b z-40">
  <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button
        onclick={() => {
          // eslint-disable-next-line svelte/no-navigation-without-resolve
          goto('/room/lobby');
        }}
        class="text-lg font-bold hover:text-gray-600 transition-colors cursor-pointer"
      >Doings</button>
      <button
        onclick={() => showHelp = true}
        class="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-300 transition-colors cursor-pointer flex items-center justify-center"
      >?</button>
      <RoomSelector />
    </div>
    <div class="flex items-center gap-2">
      <UploadButton room={roomId} />
    </div>
  </div>
</header>

<PasteMonitor />

{#if showHelp}
  <HelpPanel onClose={() => showHelp = false} />
{/if}
