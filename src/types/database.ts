import type { Project } from './project';
import type { Todo } from './todo';

export interface ProjectExport {
  version: 1;
  exportedAt: string;
  project: Project;
  todos: Todo[];
}
