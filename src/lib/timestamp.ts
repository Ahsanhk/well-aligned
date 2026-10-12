export function timestampToSeconds(timestamp: string) {
  const parts = timestamp.trim().split(':').map(Number);
  if (parts.some((part) => Number.isNaN(part))) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatClock(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

export function formatDurationLabel(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function secondsSince(iso: string, now: number) {
  return Math.max(0, (now - new Date(iso).getTime()) / 1000);
}
