<script lang="ts">
  import { formatRelativeTime } from '$lib/utils/format';

  let { timestamp }: { timestamp: string } = $props();
  let now = $state(Date.now());

  $effect(() => {
    const t = setInterval(() => { now = Date.now(); }, 30000);
    return () => clearInterval(t);
  });
</script>

{formatRelativeTime(timestamp, now)}
