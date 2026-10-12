export function todoAnchorId(todoId: string) {
  return `todo-${todoId}`;
}

export const APP_META = {
  name: 'Meeting Tasks',
  title: 'Meeting Tasks',
  description: 'Track client-meeting todos per project, attach screenshots, and turn them into Claude Code prompts.',
} as const;

export const ROUTES = {
  home: '/',
  project: (projectId: string) => `/projects/${projectId}`,
  projectTab: (projectId: string, tab: string) => `/projects/${projectId}?tab=${tab}`,
  projectTodo: (projectId: string, todoId: string) => `/projects/${projectId}#${todoAnchorId(todoId)}`,
  meeting: (projectId: string, meetingId: string) => `/projects/${projectId}/meetings/${meetingId}`,
  settings: '/settings',
  group: (groupId: string) => `/groups/${groupId}`,
  groupTab: (groupId: string, tab: string) => `/groups/${groupId}?tab=${tab}`,
  groupTodo: (groupId: string, todoId: string) => `/groups/${groupId}#${todoAnchorId(todoId)}`,
  groupMeeting: (groupId: string, meetingId: string) => `/groups/${groupId}/meetings/${meetingId}`,
} as const;

export const SCREENSHOT_MAX_BYTES = 8 * 1024 * 1024;

export const IMAGE_ACCEPT = 'image/*';

export const IMPORT_ACCEPT = 'application/json,.json';

export const COPY_FEEDBACK_MS = 1800;

export const DETAILS_PREVIEW_LINES = 2;

export const THUMBNAIL_PREVIEW_LIMIT = 4;

export const JSON_INDENT = 2;

export const COPY = {
  repoPathHint: 'Used in prompts so Claude knows where it is',
  repoPathPlaceholder: '/Users/me/code/app',
  emptyProjectsTitle: 'Track what your clients ask for',
  emptyProjectsDescription:
    'Create a project for each client codebase. Capture todos after every meeting, attach screenshots, and turn them into prompts for Claude Code.',
  emptyTodosTitle: 'No todos yet',
  emptyTodosDescription: 'Capture what the client asked for in today’s meeting using the composer above.',
  emptyFilterTitle: 'Nothing here',
  emptyFilterDescription: 'No todos match this filter.',
  projectNotFoundTitle: 'Project not found',
  projectNotFoundDescription: 'It may have been deleted, or the link is wrong.',
  composerTitlePlaceholder: 'What did the client ask for?',
  composerDetailsPlaceholder: 'Raw meeting notes, context, acceptance details…',
  composerDropHint: 'Drop screenshots to attach',
  composerPasteHint: 'Paste, drop, or attach screenshots',
  extraInstructionsPlaceholder: 'Optional: constraints, files to look at, things to avoid…',
  promptEmpty: 'Generate an enhanced prompt from the selected todos, then paste it into Claude Code.',
} as const;
