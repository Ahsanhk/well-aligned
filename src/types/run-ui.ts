import type { RunMode } from './run';

export type TerminalConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'offline';

export interface ClaudeSendRequest {
  todoIds: string[];
  mode: RunMode;
  projectId: string | null;
}

export type TodoRunState = 'queued' | 'working' | null;
