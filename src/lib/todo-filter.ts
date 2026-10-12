import type { StatusCounts, Todo, TodoFilter } from '@/types';

export function filterTodos(todos: Todo[], filter: TodoFilter) {
  return filter === 'all' ? todos : todos.filter((todo) => todo.status === filter);
}

export function countByStatus(todos: Todo[]): StatusCounts {
  return todos.reduce<StatusCounts>(
    (counts, todo) => ({ ...counts, all: counts.all + 1, [todo.status]: counts[todo.status] + 1 }),
    { all: 0, open: 0, in_progress: 0, done: 0 },
  );
}

export function upsertTodo(todos: Todo[], todo: Todo) {
  const exists = todos.some((item) => item.id === todo.id);
  return exists ? todos.map((item) => (item.id === todo.id ? todo : item)) : [todo, ...todos];
}

export function sortTodos(todos: Todo[]) {
  return [...todos].sort(
    (a, b) => b.meetingDate.localeCompare(a.meetingDate) || b.createdAt.localeCompare(a.createdAt),
  );
}

export function openDoneCounts(todos: Todo[]) {
  const done = todos.filter((todo) => todo.status === 'done').length;
  return { open: todos.length - done, done };
}

export function sharedMeetingId(todos: Todo[]) {
  const first = todos[0]?.meetingId ?? null;
  return first && todos.every((todo) => todo.meetingId === first) ? first : null;
}
