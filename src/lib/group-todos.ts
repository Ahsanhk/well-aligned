import { CATEGORY_ORDER, DEFAULT_CATEGORY } from '@/constants/backlog';
import type { MeetingGroup, Todo, TodoCategory } from '@/types';

export function groupTodosByMeeting(todos: Todo[]): MeetingGroup[] {
  const groups = new Map<string, Todo[]>();
  todos.forEach((todo) => {
    const bucket = groups.get(todo.meetingDate);
    if (bucket) bucket.push(todo);
    else groups.set(todo.meetingDate, [todo]);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([meetingDate, items]) => ({ meetingDate, todos: items }));
}

export function groupTodosByCategory(todos: Todo[]): { category: TodoCategory; todos: Todo[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    todos: todos.filter((todo) => (todo.category ?? DEFAULT_CATEGORY) === category),
  })).filter((group) => group.todos.length > 0);
}
