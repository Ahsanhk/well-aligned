import { CATEGORY_META } from '@/constants/backlog';
import { cn } from '@/lib/cn';
import type { Todo, TodoCategory } from '@/types';
import { TodoGroup } from './TodoGroup';

interface Props {
  category: TodoCategory;
  todos: Todo[];
}

export function CategoryGroupSection({ category, todos }: Props) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <TodoGroup
      todos={todos}
      title={
        <span className="inline-flex items-center gap-1.5 font-medium text-fg/90">
          <Icon size={12} className={cn('shrink-0', meta.className)} />
          {meta.groupLabel}
        </span>
      }
    />
  );
}
