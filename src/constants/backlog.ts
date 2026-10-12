import { Blocks, Bug, Sparkles, type LucideIcon } from 'lucide-react';
import type { TodoCategory, TodoOrigin } from '@/types';

interface CategoryMeta {
  label: string;
  groupLabel: string;
  icon: LucideIcon;
  className: string;
}

export const CATEGORY_META: Record<TodoCategory, CategoryMeta> = {
  bug: { label: 'Bug', groupLabel: 'Bugs', icon: Bug, className: 'text-rose' },
  missing: { label: 'Missing', groupLabel: 'Missing', icon: Blocks, className: 'text-indigo' },
  improvement: { label: 'Improvement', groupLabel: 'Improvements', icon: Sparkles, className: 'text-teal' },
};

export const CATEGORY_ORDER: TodoCategory[] = ['bug', 'missing', 'improvement'];

export const DEFAULT_CATEGORY: TodoCategory = 'bug';

export const DEFAULT_ORIGIN: TodoOrigin = 'client';

export const TAB_ORIGINS: Record<'todos' | 'backlog', TodoOrigin> = { todos: 'client', backlog: 'self' };

export const COMPOSER_COPY: Record<
  TodoOrigin,
  { titlePlaceholder: string; detailsPlaceholder: string; dateLabel: string; submitLabel: string; titleLabel: string }
> = {
  client: {
    titlePlaceholder: 'What did the client ask for?',
    detailsPlaceholder: 'Raw meeting notes, context, acceptance details…',
    dateLabel: 'Meeting date',
    submitLabel: 'Add todo',
    titleLabel: 'Todo title',
  },
  self: {
    titlePlaceholder: 'What did you notice?',
    detailsPlaceholder: 'Steps, what you expected, what happened',
    dateLabel: 'Noticed',
    submitLabel: 'Add to backlog',
    titleLabel: 'Backlog item title',
  },
};

export const BACKLOG_COPY = {
  emptyTitle: 'Nothing noted yet',
  emptyDescription: 'Jot down bugs and gaps you notice while testing — they won’t get mixed up with client requests.',
  inBacklog: (count: number) => `${count} in backlog`,
  categoryField: 'Category',
} as const;
