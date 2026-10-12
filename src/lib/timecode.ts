function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function timecodeToSeconds(value: string): number | null {
  const parts = value.trim().replace(/^\[|\]$/g, '').split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  const numbers = parts.map((part) => Number(part));
  if (numbers.some((part) => !Number.isFinite(part) || part < 0)) return null;
  return numbers.reduce((total, part) => total * 60 + part, 0);
}

export function formatTimecode(totalSeconds: number, forceHours = false): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours > 0 || forceHours ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${pad(minutes)}:${pad(rest)}`;
}

export function normalizeTimecode(value: string): string {
  const seconds = timecodeToSeconds(value);
  return seconds === null ? formatTimecode(0) : formatTimecode(seconds);
}
