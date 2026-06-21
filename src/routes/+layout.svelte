<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.png';
  import { shortUid } from '$lib/stores/app';
  import UploadButton from '$lib/components/UploadButton.svelte';
  import RoomSelector from '$lib/components/RoomSelector.svelte';
  import HelpPanel from '$lib/components/HelpPanel.svelte';
  import { page } from '$app/stores';

  let { children } = $props();
  let showHelp = $state(false);
  let roomId = $derived($page.params.roomId ?? 'lobby');
</script>

<svelte:head>
  <title>Doings</title>
  <link rel="icon" type="image/png" sizes="512x512" href={favicon} />
  <link rel="icon" type="image/png" sizes="192x192" href={favicon} />
  <link rel="apple-touch-icon" sizes="180x180" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <header class="sticky top-0 bg-white border-b z-40">
    <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-bold">Doings</h1>
        <button
          onclick={() => showHelp = true}
          class="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-300 transition-colors cursor-pointer flex items-center justify-center"
        >?</button>
        <RoomSelector />
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400">You: {shortUid}</span>
        <UploadButton room={roomId} />
      </div>
    </div>
  </header>

  <main class="max-w-2xl mx-auto">
    {@render children()}
  </main>
</div>

{#if showHelp}
  <HelpPanel onClose={() => showHelp = false} />
{/if}
