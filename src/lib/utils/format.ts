export function parseCreatedAt(t: string): Date {
  return new Date(t.endsWith('Z') ? t : t + 'Z');
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function formatRelativeTime(t: string, now?: number): string {
  const date = parseCreatedAt(t);
  const diff = (now ?? Date.now()) - date.getTime();

  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24 && isToday(date)) return `${hours}h ago`;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hh}:${mm}`;
}
