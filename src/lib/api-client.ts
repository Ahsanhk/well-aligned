import { API_ROUTES, SCREENSHOT_UPLOAD_FIELD } from '@/constants/api-routes';
import { TOAST_COPY } from '@/constants/toast';
import { ownerMeetingsApi, ownerTodosApi } from '@/lib/owner';
import type {
  AcceptSuggestionsRequest,
  ApiToken,
  CreatedApiToken,
  IntegrationStatus,
  Run,
  StartRunRequest,
  TerminalTicket,
  ItemOwner,
  ProjectGroup,
  ProjectGroupInput,
  ProjectGroupSummary,
  TodoMoveTarget,
  AcceptSuggestionsResponse,
  ApiErrorBody,
  DismissSuggestionsRequest,
  FolderInspection,
  PickFolderResponse,
  Meeting,
  MeetingListItem,
  Project,
  ProjectExport,
  ProjectInput,
  ProjectSummary,
  PromptRequest,
  PromptResponse,
  Todo,
  TodoInput,
  TodoPatch,
  TranscriptFormat,
} from '@/types';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && typeof (value as ApiErrorBody).error === 'string';
}

async function readError(response: Response) {
  try {
    const body: unknown = await response.json();
    if (isApiErrorBody(body)) return body.error;
  } catch {
    return `${TOAST_COPY.genericError} (${response.status})`;
  }
  return `${TOAST_COPY.genericError} (${response.status})`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { cache: 'no-store', ...init });
  if (!response.ok) throw new ApiError(await readError(response), response.status);
  return (await response.json()) as T;
}

function sendJson<T>(path: string, method: string, body: unknown) {
  return request<T>(path, { method, headers: JSON_HEADERS, body: JSON.stringify(body) });
}

export const api = {
  listProjects: () => request<ProjectSummary[]>(API_ROUTES.projects),
  getProject: (projectId: string) => request<Project>(API_ROUTES.project(projectId)),
  createProject: (input: ProjectInput) => sendJson<Project>(API_ROUTES.projects, 'POST', input),
  updateProject: (projectId: string, patch: Partial<ProjectInput>) =>
    sendJson<Project>(API_ROUTES.project(projectId), 'PATCH', patch),
  deleteProject: (projectId: string) => request<{ ok: true }>(API_ROUTES.project(projectId), { method: 'DELETE' }),
  listTodos: (owner: ItemOwner) => request<Todo[]>(ownerTodosApi(owner)),
  createTodo: (owner: ItemOwner, input: TodoInput) => sendJson<Todo>(ownerTodosApi(owner), 'POST', input),
  moveTodo: (todoId: string, target: TodoMoveTarget) => sendJson<Todo>(API_ROUTES.todoMove(todoId), 'POST', target),
  createRun: (body: StartRunRequest) => sendJson<Run>(API_ROUTES.runs, 'POST', body),
  listActiveRuns: (projectId?: string) => {
    const query = new URLSearchParams({ active: '1' });
    if (projectId) query.set('projectId', projectId);
    return request<Run[]>(`${API_ROUTES.runs}?${query.toString()}`);
  },
  getRun: (runId: string) => request<Run>(API_ROUTES.run(runId)),
  completeRun: (runId: string, summary?: string) => sendJson<Run>(API_ROUTES.runComplete(runId), 'POST', summary ? { summary } : {}),
  cancelRun: (runId: string) => request<Run>(API_ROUTES.runCancel(runId), { method: 'POST' }),
  terminalTicket: (runId: string) => sendJson<TerminalTicket>(API_ROUTES.terminalTicket, 'POST', { runId }),
  listTokens: () => request<ApiToken[]>(API_ROUTES.tokens),
  createToken: (name: string) => sendJson<CreatedApiToken>(API_ROUTES.tokens, 'POST', { name }),
  deleteToken: (tokenId: string) => request<{ ok: true }>(API_ROUTES.token(tokenId), { method: 'DELETE' }),
  integrationStatus: () => request<IntegrationStatus>(API_ROUTES.integrationStatus),
  listGroups: () => request<ProjectGroupSummary[]>(API_ROUTES.groups),
  createGroup: (input: ProjectGroupInput) => sendJson<ProjectGroup>(API_ROUTES.groups, 'POST', input),
  updateGroup: (groupId: string, patch: Partial<ProjectGroupInput>) =>
    sendJson<ProjectGroup>(API_ROUTES.group(groupId), 'PATCH', patch),
  deleteGroup: (groupId: string) => request<{ ok: true }>(API_ROUTES.group(groupId), { method: 'DELETE' }),
  updateTodo: (todoId: string, patch: TodoPatch) => sendJson<Todo>(API_ROUTES.todo(todoId), 'PATCH', patch),
  deleteTodo: (todoId: string) => request<{ ok: true }>(API_ROUTES.todo(todoId), { method: 'DELETE' }),
  uploadScreenshots: (todoId: string, files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append(SCREENSHOT_UPLOAD_FIELD, file, file.name));
    return request<Todo>(API_ROUTES.todoScreenshots(todoId), { method: 'POST', body: form });
  },
  deleteScreenshot: (screenshotId: string) =>
    request<Todo>(API_ROUTES.screenshot(screenshotId), { method: 'DELETE' }),
  generatePrompt: (body: PromptRequest) => sendJson<PromptResponse>(API_ROUTES.prompts, 'POST', body),
  importProject: (data: ProjectExport) => sendJson<Project>(API_ROUTES.import, 'POST', data),
  listMeetings: (owner: ItemOwner) => request<MeetingListItem[]>(ownerMeetingsApi(owner)),
  getMeeting: (meetingId: string) => request<Meeting>(API_ROUTES.meeting(meetingId)),
  updateMeeting: (meetingId: string, patch: { title?: string; meetingDate?: string }) =>
    sendJson<Meeting>(API_ROUTES.meeting(meetingId), 'PATCH', patch),
  deleteMeeting: (meetingId: string) => request<{ ok: true }>(API_ROUTES.meeting(meetingId), { method: 'DELETE' }),
  retryMeeting: (meetingId: string) => request<Meeting>(API_ROUTES.meetingRetry(meetingId), { method: 'POST' }),
  acceptSuggestions: (meetingId: string, body: AcceptSuggestionsRequest) =>
    sendJson<AcceptSuggestionsResponse>(API_ROUTES.meetingAccept(meetingId), 'POST', body),
  pickFolder: (startPath: string) =>
    sendJson<PickFolderResponse>(API_ROUTES.pickFolder, 'POST', startPath ? { startPath } : {}),
  inspectFolder: (path: string) => sendJson<FolderInspection>(API_ROUTES.inspectFolder, 'POST', { path }),
  dismissSuggestions: (meetingId: string, body: DismissSuggestionsRequest) =>
    sendJson<Meeting>(API_ROUTES.meetingDismiss(meetingId), 'POST', body),
};

export function frameUrl(meetingId: string, frameId: string) {
  return API_ROUTES.meetingFrame(meetingId, frameId);
}

export function transcriptUrl(meetingId: string, format: TranscriptFormat) {
  return API_ROUTES.meetingTranscript(meetingId, format);
}

export function screenshotUrl(screenshotId: string) {
  return API_ROUTES.screenshot(screenshotId);
}

export function exportUrl(projectId: string) {
  return API_ROUTES.projectExport(projectId);
}

export function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : TOAST_COPY.genericError;
}

export function errorStatus(error: unknown) {
  return error instanceof ApiError ? error.status : null;
}
