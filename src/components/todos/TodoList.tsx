'use client';

import { useMemo, useState } from 'react';
import { ListTodo, NotebookPen, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { COPY } from '@/constants/app';
import { BACKLOG_COPY } from '@/constants/backlog';
import { ANCHOR_HIGHLIGHT_CLASS } from '@/constants/meetings';
import { DEFAULT_TODO_FILTER } from '@/constants/status';
import { useAnchorHighlight } from '@/hooks/useAnchorHighlight';
import { groupTodosByCategory, groupTodosByMeeting } from '@/lib/group-todos';
import { countByStatus, filterTodos } from '@/lib/todo-filter';
import { isOwnedBy } from '@/lib/owner';
import { todosByOrigin } from '@/lib/todo-origin';
import { useTodosStore } from '@/store/todos';
import type { ItemOwner, TodoFilter, TodoOrigin } from '@/types';
import { CategoryGroupSection } from './CategoryGroupSection';
import { MeetingGroupSection } from './MeetingGroupSection';
import { TodoFilters } from './TodoFilters';
import { TodoListSkeleton } from './TodoListSkeleton';

export function TodoList({ owner, origin }: { owner: ItemOwner; origin: TodoOrigin }) {
  const allTodos = useTodosStore((state) => state.todos);
  const status = useTodosStore((state) => state.status);
  const [filter, setFilter] = useState<TodoFilter>(DEFAULT_TODO_FILTER);
  const todos = useMemo(
    () => todosByOrigin(allTodos.filter((todo) => isOwnedBy(todo, owner)), origin),
    [allTodos, owner, origin],
  );
  const counts = useMemo(() => countByStatus(todos), [todos]);
  const visible = useMemo(() => filterTodos(todos, filter), [todos, filter]);
  const meetingGroups = useMemo(() => (origin === 'client' ? groupTodosByMeeting(visible) : []), [origin, visible]);
  const categoryGroups = useMemo(() => (origin === 'self' ? groupTodosByCategory(visible) : []), [origin, visible]);
  const isLoading = (status === 'idle' || status === 'loading') && todos.length === 0;
  const isSelf = origin === 'self';
  useAnchorHighlight(status === 'ready', ANCHOR_HIGHLIGHT_CLASS);

  return (
    <div className="flex flex-col gap-5">
      <TodoFilters value={filter} counts={counts} onChange={setFilter} />
      {isLoading && <TodoListSkeleton />}
      {!isLoading && todos.length === 0 && (
        <EmptyState
          icon={isSelf ? <NotebookPen size={22} /> : <ListTodo size={22} />}
          title={isSelf ? BACKLOG_COPY.emptyTitle : COPY.emptyTodosTitle}
          description={isSelf ? BACKLOG_COPY.emptyDescription : COPY.emptyTodosDescription}
        />
      )}
      {!isLoading && todos.length > 0 && visible.length === 0 && (
        <EmptyState icon={<SearchX size={22} />} title={COPY.emptyFilterTitle} description={COPY.emptyFilterDescription} />
      )}
      {meetingGroups.map((group) => (
        <MeetingGroupSection key={group.meetingDate} group={group} />
      ))}
      {categoryGroups.map((group) => (
        <CategoryGroupSection key={group.category} category={group.category} todos={group.todos} />
      ))}
    </div>
  );
}
