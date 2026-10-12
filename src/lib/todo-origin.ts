import { DEFAULT_ORIGIN } from '@/constants/backlog';
import type { Todo, TodoOrigin } from '@/types';

export function originOf(todo: Pick<Todo, 'origin'>): TodoOrigin {
  return todo.origin ?? DEFAULT_ORIGIN;
}

export function isSelfItem(todo: Pick<Todo, 'origin'>) {
  return originOf(todo) === 'self';
}

export function todosByOrigin(todos: Todo[], origin: TodoOrigin) {
  return todos.filter((todo) => originOf(todo) === origin);
}

export function openCount(todos: Todo[]) {
  return todos.filter((todo) => todo.status !== 'done').length;
}
