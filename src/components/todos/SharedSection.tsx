'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';
import { ROUTES } from '@/constants/app';
import { GROUP_COPY } from '@/constants/groups';
import { groupOwner, isOwnedBy } from '@/lib/owner';
import { todosByOrigin } from '@/lib/todo-origin';
import { useTodosStore } from '@/store/todos';
import type { ProjectGroupSummary, TodoOrigin } from '@/types';
import { TodoGroup } from './TodoGroup';

interface Props {
  group: ProjectGroupSummary;
  origin: TodoOrigin;
}

export function SharedSection({ group, origin }: Props) {
  const allTodos = useTodosStore((state) => state.todos);
  const todos = useMemo(
    () =>
      todosByOrigin(
        allTodos.filter((todo) => isOwnedBy(todo, groupOwner(group.id))),
        origin,
      ).filter((todo) => todo.status !== 'done'),
    [allTodos, group.id, origin],
  );
  if (todos.length === 0) return null;

  return (
    <TodoGroup
      todos={todos}
      collapsible
      tone="shared"
      title={
        <Link
          href={ROUTES.groupTab(group.id, origin === 'self' ? 'backlog' : 'todos')}
          className="inline-flex min-w-0 items-center gap-1.5 font-medium text-indigo transition-colors hover:text-fg"
        >
          <Layers size={12} className="shrink-0" />
          <span className="truncate">
            {GROUP_COPY.sharedPrefix} · {group.name}
          </span>
        </Link>
      }
    />
  );
}
