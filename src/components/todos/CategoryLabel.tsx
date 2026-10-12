import { CATEGORY_META, DEFAULT_CATEGORY } from '@/constants/backlog';
import { cn } from '@/lib/cn';
import type { TodoCategory } from '@/types';

interface Props {
  category: TodoCategory | null;
  className?: string;
}

export function CategoryLabel({ category, className }: Props) {
  const meta = CATEGORY_META[category ?? DEFAULT_CATEGORY];
  const Icon = meta.icon;
  return (
    <span className={cn('inline-flex items-center gap-1', meta.className, className)}>
      <Icon size={11} className="shrink-0" />
      {meta.label}
    </span>
  );
}
