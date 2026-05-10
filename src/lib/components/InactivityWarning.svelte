<script lang="ts">
  let isWarning = $state(false);
  let dismissed = $state(false);

  $effect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const check = () => {
      const last = localStorage.getItem('doings_last_upload');
      if (last && !dismissed) {
        const elapsed = Date.now() - parseInt(last);
        if (elapsed > 30 * 60 * 1000) {
          isWarning = true;
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Time to check in!', {
              body: "You haven't uploaded in 30 minutes.",
              icon: '/favicon.svg'
            });
          }
        }
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  });

  function dismiss() {
    isWarning = false;
    dismissed = true;
    setTimeout(() => { dismissed = false; }, 5 * 60 * 1000);
  }
</script>

{#if isWarning}
  <div class="fixed inset-0 bg-red-500/30 pointer-events-none z-50"></div>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-4">
    <span>Haven't uploaded in 30 minutes!</span>
    <button
      onclick={dismiss}
      class="px-3 py-1 bg-white text-red-600 rounded text-sm font-medium cursor-pointer"
    >
      Dismiss
    </button>
  </div>
{/if}
