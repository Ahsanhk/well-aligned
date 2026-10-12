export type RunMode = 'terminal' | 'queue';

export type RunStatus = 'queued' | 'working' | 'done' | 'cancelled';

export interface RunFileChange {
  path: string;
  additions: number;
  deletions: number;
}

export interface RunTodoProgress {
  todoId: string;
  status: 'pending' | 'working' | 'done';
  note: string | null;
  updatedAt: string;
}

export interface Run {
  id: string;
  projectId: string;
  mode: RunMode;
  status: RunStatus;
  todoIds: string[];
  progress: RunTodoProgress[];
  summary: string | null;
  filesChanged: RunFileChange[];
  terminalAlive: boolean;
  startedAt: string;
  endedAt: string | null;
  updatedAt: string;
}

export interface StartRunRequest {
  projectId: string;
  todoIds: string[];
  mode: RunMode;
  prompt: string;
}

export interface TerminalTicket {
  ticket: string;
  url: string;
  expiresAt: string;
}

export interface ApiToken {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreatedApiToken extends ApiToken {
  token: string;
}

export interface IntegrationStatus {
  mcpAddCommand: string;
  claudeCliFound: boolean;
  terminalServerOnline: boolean;
}
