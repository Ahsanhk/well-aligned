import type { Project } from './project';
import type { Todo } from './todo';

export interface PromptScreenshotRef {
  absolutePath: string;
  mimeType: string;
  originalName: string;
}

export interface PromptTodoContext {
  todo: Todo;
  screenshots: PromptScreenshotRef[];
}

export interface PromptBuildInput {
  project: Project;
  todos: PromptTodoContext[];
  extraInstructions: string;
  group: PromptGroupContext | null;
}

export interface PromptGroupContext {
  name: string;
}
