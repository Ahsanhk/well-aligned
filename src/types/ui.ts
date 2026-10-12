import type { ProjectGroupSummary } from './group';
import type { ProjectSummary } from './project';
import type { TodoStatus } from './todo';

export type ToastTone = 'default' | 'success' | 'danger';

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: ToastAction;
}

export type TodoFilter = 'all' | TodoStatus;

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

export type StatusCounts = Record<TodoFilter, number>;

export type PromptView = 'prompt' | 'json';

export type PromptGenerationStatus = 'idle' | 'loading' | 'done' | 'error';

export interface LightboxImage {
  id: string;
  src: string;
  name: string;
  meta: string;
}

export interface ProjectSection {
  group: ProjectGroupSummary | null;
  projects: ProjectSummary[];
}
