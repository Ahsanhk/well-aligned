const DAY_MS = 24 * 60 * 60 * 1000;

const RELATIVE_DAY_LABELS: Record<number, string> = {
  0: 'Today',
  [-1]: 'Yesterday',
  1: 'Tomorrow',
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function dayOffsetFromToday(key: string) {
  const today = parseDateKey(todayKey());
  return Math.round((parseDateKey(key).getTime() - today.getTime()) / DAY_MS);
}

export function formatDateKey(key: string) {
  const date = parseDateKey(key);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}

export function formatMeetingLabel(key: string) {
  return RELATIVE_DAY_LABELS[dayOffsetFromToday(key)] ?? formatDateKey(key);
}

export function formatRelativeTime(iso: string) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatMeetingLabel(toDateKey(new Date(iso)));
}
