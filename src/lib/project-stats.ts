import type { ProjectSummary, Todo } from '@/types';
import { openCount, todosByOrigin } from './todo-origin';

export function completionPercent(project: Pick<ProjectSummary, 'todoCount' | 'doneCount'>) {
  return project.todoCount === 0 ? 0 : Math.round((project.doneCount / project.todoCount) * 100);
}

export function summarizeTodos(todos: Todo[]) {
  const client = todosByOrigin(todos, 'client');
  const doneCount = client.filter((todo) => todo.status === 'done').length;
  return {
    todoCount: client.length,
    doneCount,
    openCount: client.length - doneCount,
    backlogOpenCount: openCount(todosByOrigin(todos, 'self')),
    highPriorityOpenCount: highPriorityOpenCount(todos),
  };
}

export function highPriorityOpenCount(todos: Todo[]) {
  return todosByOrigin(todos, 'client').filter((todo) => todo.status !== 'done' && todo.priority === 'high').length;
}
