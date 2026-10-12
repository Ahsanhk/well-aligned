import type { Screenshot } from './screenshot';
import type { GeneratedPrompt } from './prompt';

export type TodoStatus = 'open' | 'in_progress' | 'done';

export type TodoPriority = 'low' | 'medium' | 'high';

export type TodoOrigin = 'client' | 'self';

export type TodoCategory = 'bug' | 'missing' | 'improvement';

export interface Todo {
  id: string;
  projectId: string | null;
  groupId: string | null;
  title: string;
  details: string;
  meetingDate: string;
  status: TodoStatus;
  priority: TodoPriority;
  screenshots: Screenshot[];
  prompt: GeneratedPrompt | null;
  meetingId: string | null;
  origin: TodoOrigin;
  category: TodoCategory | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export type TodoInput = Pick<Todo, 'title' | 'details' | 'meetingDate' | 'priority'> & Partial<Pick<Todo, 'origin' | 'category'>>;

export type TodoPatch = Partial<Pick<Todo, 'title' | 'details' | 'meetingDate' | 'priority' | 'status' | 'category'>>;

export interface MeetingGroup {
  meetingDate: string;
  todos: Todo[];
}
