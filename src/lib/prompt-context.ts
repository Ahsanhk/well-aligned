import { NO_LABELS, PROMPT_USER_INTRO, SHARED_TAG, TODO_CATEGORY_LABELS, TODO_SOURCE_LABELS, TODO_SOURCE_TAGS } from '@/constants/prompt';
import type { PromptBuildInput, PromptTodoContext, Todo } from '@/types';

function isMixedSelection(input: PromptBuildInput): boolean {
  return new Set(input.todos.map((entry) => entry.todo.origin)).size > 1;
}

function sourceTag(todo: Todo): string {
  if (todo.origin === 'self' && todo.category) return `${TODO_SOURCE_TAGS.self} · ${TODO_CATEGORY_LABELS[todo.category]}`;
  return TODO_SOURCE_TAGS[todo.origin];
}

export function headingLabels(input: PromptBuildInput, todo: Todo): string[] {
  return [
    ...(todo.groupId && input.group ? [SHARED_TAG(input.group.name)] : []),
    ...(isMixedSelection(input) ? [sourceTag(todo)] : []),
  ].map((label) => `[${label}]`);
}

function todoLines(input: PromptBuildInput, { todo, screenshots }: PromptTodoContext, index: number): string[] {
  const labels = headingLabels(input, todo);
  return [
    `### Todo ${index + 1}`,
    `- Title: ${todo.title}`,
    `- Heading labels: ${labels.length ? labels.join(' ') : NO_LABELS}`,
    `- Source: ${TODO_SOURCE_LABELS[todo.origin]}`,
    ...(todo.origin === 'self' && todo.category ? [`- Type: ${TODO_CATEGORY_LABELS[todo.category]}`] : []),
    `- Notes: ${todo.details || '(none, only the title)'}`,
    ...(screenshots.length ? [`- Screenshots (attached as images in this order):\n${screenshots.map((shot) => `  - ${shot.absolutePath}`).join('\n')}`] : []),
  ];
}

export function collectScreenshotPaths(input: PromptBuildInput): string[] {
  return input.todos.flatMap((entry) => entry.screenshots.map((shot) => shot.absolutePath));
}

export function buildPromptContext(input: PromptBuildInput): string {
  return [PROMPT_USER_INTRO, ...input.todos.map((entry, index) => todoLines(input, entry, index).join('\n'))].join('\n\n');
}

export function screenshotImageLabel(todoIndex: number, absolutePath: string): string {
  return `Screenshot for todo ${todoIndex + 1}, file path: ${absolutePath}`;
}
