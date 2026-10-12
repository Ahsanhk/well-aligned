import { STATUS_META } from '@/constants/status';
import type { Todo } from '@/types';

export function SelectedTodoChips({ todos }: { todos: Todo[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {todos.map((todo) => {
        const Icon = STATUS_META[todo.status].icon;
        return (
          <li
            key={todo.id}
            className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-elevated px-2 py-1 text-xs text-muted"
          >
            <Icon size={12} className={STATUS_META[todo.status].className} />
            <span className="truncate">{todo.title}</span>
          </li>
        );
      })}
    </ul>
  );
}
