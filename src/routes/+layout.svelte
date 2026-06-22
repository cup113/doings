<script lang="ts">
  import './layout.css';
  import Header from '$lib/components/Header.svelte';

  let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50">
  <Header />
  <main class="max-w-2xl mx-auto">
    {@render children()}
  </main>
</div>
