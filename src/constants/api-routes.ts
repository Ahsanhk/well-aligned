export const API_ROUTES = {
  projects: '/api/projects',
  project: (projectId: string) => `/api/projects/${projectId}`,
  projectTodos: (projectId: string) => `/api/projects/${projectId}/todos`,
  projectExport: (projectId: string) => `/api/projects/${projectId}/export`,
  todo: (todoId: string) => `/api/todos/${todoId}`,
  todoScreenshots: (todoId: string) => `/api/todos/${todoId}/screenshots`,
  screenshot: (screenshotId: string) => `/api/screenshots/${screenshotId}`,
  prompts: '/api/prompts',
  import: '/api/import',
  groups: '/api/groups',
  group: (groupId: string) => `/api/groups/${groupId}`,
  groupTodos: (groupId: string) => `/api/groups/${groupId}/todos`,
  groupMeetings: (groupId: string) => `/api/groups/${groupId}/meetings`,
  todoMove: (todoId: string) => `/api/todos/${todoId}/move`,
  runs: '/api/runs',
  run: (runId: string) => `/api/runs/${runId}`,
  runComplete: (runId: string) => `/api/runs/${runId}/complete`,
  runCancel: (runId: string) => `/api/runs/${runId}/cancel`,
  terminalTicket: '/api/terminal/ticket',
  tokens: '/api/tokens',
  token: (tokenId: string) => `/api/tokens/${tokenId}`,
  integrationStatus: '/api/integrations/status',
  pickFolder: '/api/system/pick-folder',
  inspectFolder: '/api/system/inspect-folder',
  projectMeetings: (projectId: string) => `/api/projects/${projectId}/meetings`,
  meeting: (meetingId: string) => `/api/meetings/${meetingId}`,
  meetingRetry: (meetingId: string) => `/api/meetings/${meetingId}/retry`,
  meetingAccept: (meetingId: string) => `/api/meetings/${meetingId}/accept`,
  meetingDismiss: (meetingId: string) => `/api/meetings/${meetingId}/dismiss`,
  meetingFrame: (meetingId: string, frameId: string) => `/api/meetings/${meetingId}/frames/${frameId}`,
  meetingTranscript: (meetingId: string, format: string) => `/api/meetings/${meetingId}/transcript?format=${format}`,
} as const;

export const MEETING_UPLOAD_HEADERS = {
  fileName: 'X-File-Name',
  contentType: 'Content-Type',
} as const;

export const MEETING_UPLOAD_QUERY = {
  meetingDate: 'meetingDate',
  title: 'title',
} as const;

export const SCREENSHOT_UPLOAD_FIELD = 'files';
