<script lang="ts">
  import { version } from '../../../package.json';
  let { onClose }: { onClose: () => void } = $props();
</script>

<button
  onclick={onClose}
  aria-label="Close help"
  class="fixed inset-0 bg-black/30 z-40 cursor-pointer"
></button>

<div class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 p-6 overflow-y-auto">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-bold">How to Use</h2>
    <button
      onclick={onClose}
      class="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl leading-none"
    >&times;</button>
  </div>
  <div class="space-y-5 text-sm text-gray-700">
    <p class="text-gray-800 leading-relaxed">
      If you're <strong>feeling unproductive</strong> and want to put yourself <strong>under others' watch</strong>, come here — snap a photo every half hour and let others keep you <strong>accountable</strong>.
    </p>
    <div>
      <strong class="text-gray-900">Rooms</strong>
      <p class="mt-1">Each <strong>room</strong> is a separate space. Visit <code class="bg-gray-100 px-1 rounded">/room/&lt;id&gt;</code> to join a room. Use the dropdown in the header to switch between <strong>public rooms</strong> or create a new one.</p>
    </div>
    <div>
      <strong class="text-gray-900">Take a Photo</strong>
      <p class="mt-1">Tap <strong><em>Take Photo</em></strong> to capture what you're doing right now. Images are <strong>compressed</strong> and <strong>uploaded automatically</strong> to the current room.</p>
    </div>
    <div>
      <strong class="text-gray-900">Browse</strong>
      <p class="mt-1">The main view shows the latest photos from everyone in the current room. Tap any photo to view it <strong>full-screen</strong>; <strong>swipe or use arrows</strong> to browse. Tap <strong><em>View all by</em></strong> to see that person's gallery.</p>
    </div>
    <div>
      <strong class="text-gray-900">Delete</strong>
      <p class="mt-1">In your own gallery, tap <b>&times;</b> to delete an image. Deletion syncs to all viewers in <strong>real time</strong>.</p>
    </div>
  </div>
  <hr class="my-5 border-gray-200">
  <div class="space-y-3 text-sm text-gray-500">
    <p>All uploaded photos are <strong>public</strong> within the room they're posted to. Do not share sensitive or private content.</p>
    <p>This app has <strong>no authentication</strong>. Anyone with basic browser knowledge can manipulate their local identity to impersonate you. Uploaded photos <strong>cannot</strong> serve as evidence of your actions.</p>
    <div class="flex items-center justify-between pt-1">
      <a href="https://github.com/cup113/doings" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">GitHub</a>
      <span>v{version}</span>
    </div>
  </div>
</div>
