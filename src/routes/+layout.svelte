<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();
</script>

<svelte:head>
	<title>Doings</title>
	<link rel="icon" type="image/png" sizes="512x512" href={favicon} />
	<link rel="icon" type="image/png" sizes="192x192" href={favicon} />
	<link rel="apple-touch-icon" sizes="180x180" href={favicon} />
</svelte:head>
{@render children()}
