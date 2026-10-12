import { Circle, CircleCheck, CircleDot, type LucideIcon } from 'lucide-react';
import type { TodoFilter, TodoStatus } from '@/types';

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  className: string;
}

export const STATUS_META: Record<TodoStatus, StatusMeta> = {
  open: { label: 'Open', icon: Circle, className: 'text-subtle hover:text-fg' },
  in_progress: { label: 'In progress', icon: CircleDot, className: 'text-indigo hover:text-indigo' },
  done: { label: 'Done', icon: CircleCheck, className: 'text-success hover:text-success' },
};

export const NEXT_STATUS: Record<TodoStatus, TodoStatus> = {
  open: 'in_progress',
  in_progress: 'done',
  done: 'open',
};

export const STATUS_OPTIONS: TodoStatus[] = ['open', 'in_progress', 'done'];

export const TODO_FILTERS: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export const DEFAULT_TODO_FILTER: TodoFilter = 'all';

export const SELECTION_COPY = {
  select: 'Select',
  done: 'Done',
  selectRow: 'Select for prompt',
  selectGroup: 'Select all in this group',
} as const;
