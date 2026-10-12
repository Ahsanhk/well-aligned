import type { SuggestionEdit } from './meeting';
import type { ItemOwner } from './owner';

export type ProjectTab = 'todos' | 'backlog' | 'meetings';

export type MeetingUploadPhase = 'idle' | 'uploading' | 'processing' | 'error';

export interface SuggestionDraft extends SuggestionEdit {
  selected: boolean;
}

export type TranscriptFormat = 'md' | 'json';

export interface HighlightPart {
  text: string;
  match: boolean;
}

export interface MeetingUploadParams {
  owner: ItemOwner;
  file: File;
  meetingDate: string;
  title: string;
  onProgress: (fraction: number) => void;
}

