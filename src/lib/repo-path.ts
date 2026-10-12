export function looksLikeAbsolutePath(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith('/') || trimmed === '~' || trimmed.startsWith('~/');
}
