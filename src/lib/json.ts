import type { ProjectExport } from '@/types';

export function formatJson(value: unknown, indent: number) {
  return JSON.stringify(value, null, indent);
}

export function parseProjectExport(text: string): ProjectExport | null {
  try {
    const value: unknown = JSON.parse(text);
    if (typeof value !== 'object' || value === null) return null;
    const candidate = value as Partial<ProjectExport>;
    if (typeof candidate.project !== 'object' || !Array.isArray(candidate.todos)) return null;
    return candidate as ProjectExport;
  } catch {
    return null;
  }
}
