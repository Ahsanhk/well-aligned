import type { HighlightPart } from '@/types';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function splitHighlight(text: string, query: string): HighlightPart[] {
  const needle = query.trim();
  if (!needle) return [{ text, match: false }];
  const pattern = new RegExp(`(${escapeRegExp(needle)})`, 'gi');
  return text
    .split(pattern)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, match: part.toLowerCase() === needle.toLowerCase() }));
}

export function matchesQuery(values: string[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return values.some((value) => value.toLowerCase().includes(needle));
}
