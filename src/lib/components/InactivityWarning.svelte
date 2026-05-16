<script lang="ts">
  import favicon from '$lib/assets/favicon.png';

  let stage = $state<'hidden' | 'early' | 'mid' | 'late' | 'alert'>('hidden');
  let snoozeUntil = $state(
    parseInt(localStorage.getItem('doings_snooze_until') || '0')
  );
  let elapsed = $state(0);
  let notified = $state(false);

  $effect(() => {
    const check = () => {
      const last = localStorage.getItem('doings_last_upload');
      if (!last) {
        stage = 'hidden';
        elapsed = 0;
        return;
      }

      const now = Date.now();
      if (snoozeUntil > now) return;
      if (snoozeUntil > 0) localStorage.removeItem('doings_snooze_until');

      const diff = now - parseInt(last);
      elapsed = Math.floor(diff / 60000);

      if (diff > 30 * 60 * 1000) {
        stage = 'alert';

        if ('Notification' in window && !notified) {
          if (Notification.permission === 'default') {
            Notification.requestPermission().then((perm) => {
              if (perm === 'granted') {
                new Notification('Time to check in!', {
                  body: "Your accountability circle is waiting — time to share what you're doing!",
                  icon: favicon
                });
                notified = true;
              }
            });
          } else if (Notification.permission === 'granted') {
            new Notification('Time to check in!', {
              body: "Your accountability circle is waiting — time to share what you're doing!",
              icon: favicon
            });
            notified = true;
          }
        }
      } else if (diff > 28 * 60 * 1000) {
        stage = 'late';
      } else if (diff > 25 * 60 * 1000) {
        stage = 'mid';
      } else if (diff > 20 * 60 * 1000) {
        stage = 'early';
      } else {
        stage = 'hidden';
        notified = false;
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  });

  function snooze(minutes: number) {
    snoozeUntil = Date.now() + minutes * 60 * 1000;
    localStorage.setItem('doings_snooze_until', snoozeUntil.toString());
    stage = 'hidden';
    notified = false;
  }
</script>

{#if stage === 'early'}
  <div class="fixed bottom-4 right-4 bg-gray-800/80 text-gray-200 text-xs px-3 py-2 rounded-lg shadow-lg z-40">
    Last upload: {elapsed}m &middot; {30 - elapsed}min left
  </div>
{/if}

{#if stage === 'mid'}
  <div class="fixed bottom-4 right-4 bg-amber-600/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-40">
    5min until check-in!
  </div>
{/if}

{#if stage === 'late'}
  <div class="fixed bottom-4 right-4 bg-orange-500/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-40 animate-pulse">
    Upload now — running late!
  </div>
{/if}

{#if stage === 'alert'}
  <div class="fixed inset-0 bg-red-500/30 z-50"></div>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex flex-col items-center gap-3">
    <p class="text-sm text-center">Time to check in — your accountability circle is waiting!</p>
    <div class="flex gap-2">
      <button
        onclick={() => snooze(5)}
        class="px-3 py-1.5 bg-white text-red-600 rounded text-sm font-medium cursor-pointer hover:bg-red-50 transition-colors"
      >Snooze 5m</button>
      <button
        onclick={() => snooze(10)}
        class="px-3 py-1.5 bg-white text-red-600 rounded text-sm font-medium cursor-pointer hover:bg-red-50 transition-colors"
      >Snooze 10m</button>
      <button
        onclick={() => snooze(15)}
        class="px-3 py-1.5 bg-white text-red-600 rounded text-sm font-medium cursor-pointer hover:bg-red-50 transition-colors"
      >Snooze 15m</button>
    </div>
  </div>
{/if}
