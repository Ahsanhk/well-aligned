import { DEFAULT_TODO_ORIGIN } from '@/constants/storage';
import type {
  ItemOwner,
  ProjectGroup,
  ProjectGroupInput,
  ProjectGroupInsert,
  ProjectGroupRow,
  ProjectGroupSummary,
  TodoOrigin,
  TodoPriority,
  SuggestedTodo,
  TranscriptSegment,
  Meeting,
  MeetingListItem,
  MeetingListRow,
  MeetingRow,
  Project,
  ProjectInput,
  ProjectInsert,
  ProjectRow,
  ProjectSummary,
  Screenshot,
  ScreenshotRow,
  Todo,
  TodoInput,
  TodoInsert,
  TodoPatch,
  TodoStatus,
  TodoWithScreenshotsRow,
} from '@/types';

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    repoPath: row.repo_path,
    techStack: row.tech_stack,
    color: row.color,
    groupId: row.group_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toProjectSummary(
  row: ProjectRow & { todos: { status: TodoStatus; origin?: TodoOrigin | null; priority?: TodoPriority | null }[] },
): ProjectSummary {
  const clientTodos = row.todos.filter((todo) => todo.origin !== 'self');
  const doneCount = clientTodos.filter((todo) => todo.status === 'done').length;
  const backlogOpenCount = row.todos.filter((todo) => todo.origin === 'self' && todo.status !== 'done').length;
  const highPriorityOpenCount = clientTodos.filter((todo) => todo.priority === 'high' && todo.status !== 'done').length;
  return { ...toProject(row), todoCount: clientTodos.length, openCount: clientTodos.length - doneCount, doneCount, backlogOpenCount, highPriorityOpenCount };
}

export function toProjectInsert(userId: string, input: ProjectInput): ProjectInsert {
  return {
    user_id: userId,
    name: input.name,
    description: input.description,
    repo_path: input.repoPath,
    tech_stack: input.techStack,
    color: input.color,
    ...(input.groupId && { group_id: input.groupId }),
  };
}

export function toProjectUpdate(patch: Partial<ProjectInput>): Partial<Omit<ProjectInsert, 'user_id'>> {
  return {
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.repoPath !== undefined && { repo_path: patch.repoPath }),
    ...(patch.techStack !== undefined && { tech_stack: patch.techStack }),
    ...(patch.color !== undefined && { color: patch.color }),
    ...(patch.groupId !== undefined && { group_id: patch.groupId }),
  };
}

export function toScreenshot(row: ScreenshotRow): Screenshot {
  return {
    id: row.id,
    todoId: row.todo_id,
    fileName: row.storage_path,
    originalName: row.original_name,
    mimeType: row.mime_type,
    size: row.size,
    createdAt: row.created_at,
  };
}

export function toTodo(row: TodoWithScreenshotsRow): Todo {
  return {
    id: row.id,
    projectId: row.project_id ?? null,
    groupId: row.group_id ?? null,
    title: row.title,
    details: row.details,
    meetingDate: row.meeting_date,
    status: row.status,
    priority: row.priority,
    screenshots: [...row.screenshots].sort((a, b) => a.created_at.localeCompare(b.created_at)).map(toScreenshot),
    prompt: row.prompt,
    meetingId: row.meeting_id ?? null,
    origin: row.origin ?? DEFAULT_TODO_ORIGIN,
    category: row.origin === 'self' ? (row.category ?? null) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

export function ownerInsertColumns(owner: ItemOwner): { project_id?: string | null; group_id?: string | null } {
  return owner.kind === 'project' ? { project_id: owner.id } : { project_id: null, group_id: owner.id };
}

export function ownerUpdateColumns(owner: ItemOwner): Required<Pick<TodoInsert, 'project_id' | 'group_id'>> {
  return owner.kind === 'project' ? { project_id: owner.id, group_id: null } : { project_id: null, group_id: owner.id };
}

export function toTodoInsert(owner: ItemOwner, input: TodoInput): TodoInsert {
  return {
    ...ownerInsertColumns(owner),
    title: input.title,
    details: input.details,
    meeting_date: input.meetingDate,
    priority: input.priority,
    origin: input.origin ?? DEFAULT_TODO_ORIGIN,
    category: input.origin === 'self' ? (input.category ?? null) : null,
  };
}

export function toTodoUpdate(patch: TodoPatch): Partial<TodoInsert> {
  return {
    ...(patch.title !== undefined && { title: patch.title }),
    ...(patch.details !== undefined && { details: patch.details }),
    ...(patch.meetingDate !== undefined && { meeting_date: patch.meetingDate }),
    ...(patch.priority !== undefined && { priority: patch.priority }),
    ...(patch.status !== undefined && { status: patch.status }),
    ...(patch.category !== undefined && { category: patch.category }),
  };
}

export function normalizeTranscript(segments: TranscriptSegment[] | null | undefined): TranscriptSegment[] {
  return segments ?? [];
}

type LegacySuggestion = Omit<SuggestedTodo, 'frames' | 'suggestedProjectId'> & {
  frames?: SuggestedTodo['frames'] | null;
  suggestedProjectId?: string | null;
};

export function normalizeSuggestions(suggestions: LegacySuggestion[] | null | undefined): SuggestedTodo[] {
  return (suggestions ?? []).map((suggestion) => ({
    ...suggestion,
    frames: suggestion.frames ?? [],
    suggestedProjectId: suggestion.suggestedProjectId ?? null,
  }));
}

export function toMeetingListItem(row: MeetingListRow): MeetingListItem {
  return {
    id: row.id,
    projectId: row.project_id ?? null,
    groupId: row.group_id ?? null,
    title: row.title,
    meetingDate: row.meeting_date,
    videoName: row.video_name,
    videoSize: Number(row.video_size),
    status: row.status,
    error: row.error,
    summary: row.summary,
    suggestions: normalizeSuggestions(row.suggestions),
    segmentCount: row.segment_count,
    model: row.model,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toMeeting(row: MeetingRow): Meeting {
  const { segmentCount: _segmentCount, ...rest } = toMeetingListItem(row);
  return { ...rest, transcript: normalizeTranscript(row.transcript) };
}

export function toProjectGroup(row: ProjectGroupRow): ProjectGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toProjectGroupSummary(
  row: ProjectGroupRow & { projects: { id: string }[]; todos: { status: TodoStatus; origin?: TodoOrigin | null }[] },
): ProjectGroupSummary {
  const open = row.todos.filter((todo) => todo.status !== 'done');
  return {
    ...toProjectGroup(row),
    projectIds: row.projects.map((project) => project.id),
    sharedOpenCount: open.filter((todo) => todo.origin !== 'self').length,
    sharedBacklogOpenCount: open.filter((todo) => todo.origin === 'self').length,
  };
}

export function toProjectGroupInsert(userId: string, input: ProjectGroupInput): ProjectGroupInsert {
  return { user_id: userId, name: input.name, description: input.description, color: input.color };
}

export function toProjectGroupUpdate(patch: Partial<ProjectGroupInput>): Partial<Omit<ProjectGroupInsert, 'user_id'>> {
  return {
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.color !== undefined && { color: patch.color }),
  };
}
