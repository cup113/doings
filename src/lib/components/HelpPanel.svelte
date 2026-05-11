<script lang="ts">
  let { onClose }: { onClose: () => void } = $props();
</script>

<button
  onclick={onClose}
  aria-label="Close help"
  class="fixed inset-0 bg-black/30 z-40 cursor-default"
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
      If you're feeling unproductive and want to put yourself under others' watch, come here — snap a photo every half hour and let others keep you accountable.
    </p>
    <div>
      <strong class="text-gray-900">Take a Photo</strong>
      <p class="mt-1">Tap <em>Take Photo</em> to capture what you're doing right now. Images are compressed and uploaded automatically.</p>
    </div>
    <div>
      <strong class="text-gray-900">Browse</strong>
      <p class="mt-1">The main view shows the latest photos from everyone. Tap any photo to see all uploads from that person.</p>
    </div>
  </div>
</div>
