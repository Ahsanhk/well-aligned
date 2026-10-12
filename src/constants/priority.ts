import type { TodoPriority } from '@/types';

export const PRIORITY_OPTIONS: { value: TodoPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_TONES: Record<TodoPriority, 'neutral' | 'sky' | 'amber'> = {
  low: 'neutral',
  medium: 'sky',
  high: 'amber',
};

export const DEFAULT_PRIORITY: TodoPriority = 'medium';

export const PRIORITY_FLAG_CLASSES: Record<TodoPriority, string | null> = {
  low: null,
  medium: 'text-sky/70',
  high: 'text-amber',
};
