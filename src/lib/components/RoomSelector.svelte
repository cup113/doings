<script lang="ts">
  import { nanoid } from 'nanoid';
  import { fetchPublicRooms, checkRoomName, createRoom } from '$lib/utils/api';
  import { currentRoom } from '$lib/stores/app';
  import { goto } from '$app/navigation';
  import type { Room } from '$lib/types';

  let open = $state(false);
  let rooms = $state<Room[]>([]);
  let createOpen = $state(false);
  let roomName = $state('');
  let isPublic = $state(true);
  let creating = $state(false);
  let nameTaken = $state(false);
  let checkTimeout: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (open) {
      fetchPublicRooms().then((r) => (rooms = r));
    }
  });

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function selectRoom(id: string) {
    close();
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    goto(`/room/${encodeURIComponent(id)}`);
  }

  function openCreate() {
    createOpen = true;
    roomName = '';
    isPublic = true;
    nameTaken = false;
  }

  function closeCreate() {
    createOpen = false;
  }

  function onNameInput() {
    if (checkTimeout) clearTimeout(checkTimeout);
    if (!roomName.trim()) { nameTaken = false; return; }
    checkTimeout = setTimeout(async () => {
      const available = await checkRoomName(roomName.trim());
      nameTaken = !available;
    }, 300);
  }

  function generateRandom() {
    const id = nanoid(8);
    roomName = id;
    nameTaken = false;
  }

  async function handleCreate() {
    const name = roomName.trim();
    if (!name || nameTaken || creating) return;

      creating = true;
      try {
        const id = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const room = await createRoom(id, name, isPublic);
        createOpen = false;
        // eslint-disable-next-line svelte/no-navigation-without-resolve
        goto(`/room/${encodeURIComponent(room.id)}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to create room');
    } finally {
      creating = false;
    }
  }
</script>

<div class="relative">
  <button
    onclick={toggle}
    class="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors cursor-pointer max-w-[160px]"
  >
    <span class="truncate">#{$currentRoom}</span>
    <svg class="w-3 h-3 flex-shrink-0 {open ? 'rotate-180' : ''} transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
  </button>

  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-30"
      onclick={close}
      onkeydown={(e) => { if (e.key === 'Escape') close(); }}
    ></div>

    <div class="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border z-40 py-1 max-h-64 overflow-y-auto">
      {#if rooms.length === 0}
        <p class="px-3 py-2 text-sm text-gray-400">No public rooms</p>
      {:else}
        {#each rooms as room (room.id)}
          <button
            onclick={() => selectRoom(room.id)}
            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
            class:bg-gray-100={room.id === $currentRoom}
          >
            <span class="text-gray-400">#</span>
            <span class="truncate">{room.name}</span>
          </button>
        {/each}
      {/if}
      <hr class="my-1 border-gray-100">
      <button
        onclick={openCreate}
        class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer font-medium"
      >
        + Create / Join Room
      </button>
    </div>
  {/if}
</div>

{#if createOpen}
  <button
    onclick={closeCreate}
    aria-label="Close create room"
    class="fixed inset-0 bg-black/30 z-40 cursor-pointer"
  ></button>

  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90vw] bg-white rounded-xl shadow-xl z-50 p-6">
    <h3 class="text-lg font-bold mb-4">Create / Join Room</h3>

    <div class="space-y-3">
      <div>
        <label for="room-name-input" class="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
        <div class="flex gap-2">
          <input
            id="room-name-input"
            bind:value={roomName}
            oninput={onNameInput}
            placeholder="e.g. gaming, family"
            class="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            class:border-red-400={nameTaken}
          />
          <button
            onclick={generateRandom}
            class="px-3 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition-colors cursor-pointer flex-shrink-0"
            title="Random name"
          >&#x1F3B2;</button>
        </div>
        {#if nameTaken}
          <p class="text-xs text-red-500 mt-1">Name already taken</p>
        {/if}
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">Public room</span>
        <button
          onclick={() => isPublic = !isPublic}
          class="w-10 h-5 rounded-full transition-colors cursor-pointer relative"
          class:bg-blue-600={isPublic}
          class:bg-gray-300={!isPublic}
          role="switch"
          aria-checked={isPublic}
          aria-label="Toggle room visibility"
        >
          <span
            class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-[left]"
            class:left-[22px]={isPublic}
            class:left-0.5={!isPublic}
          ></span>
        </button>
      </div>

      <button
        onclick={handleCreate}
        disabled={!roomName.trim() || nameTaken || creating}
        class="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {creating ? 'Creating...' : 'Enter Room'}
      </button>
    </div>
  </div>
{/if}
