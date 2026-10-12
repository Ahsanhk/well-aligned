import type { Todo, TodoPriority } from './todo';

export type MeetingStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface TranscriptSegment {
  start: string;
  speaker: string;
  text: string;
}

export interface SuggestionFrame {
  id: string;
  timestamp: string;
  storagePath: string;
  width: number;
  height: number;
}

export interface SuggestedTodo {
  id: string;
  title: string;
  details: string;
  priority: TodoPriority;
  timestamp: string;
  quote: string;
  frames: SuggestionFrame[];
  suggestedProjectId: string | null;
  acceptedTodoId: string | null;
  dismissed: boolean;
}

export interface Meeting {
  id: string;
  projectId: string | null;
  groupId: string | null;
  title: string;
  meetingDate: string;
  videoName: string;
  videoSize: number;
  status: MeetingStatus;
  error: string | null;
  summary: string;
  transcript: TranscriptSegment[];
  suggestions: SuggestedTodo[];
  model: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MeetingListItem = Omit<Meeting, 'transcript'> & { segmentCount: number };

export interface SuggestionEdit {
  id: string;
  title: string;
  details: string;
  priority: TodoPriority;
  frameIds: string[];
  targetProjectId: string | null;
}

export interface AcceptSuggestionsRequest {
  suggestions: SuggestionEdit[];
}

export interface AcceptSuggestionsResponse {
  meeting: Meeting;
  todos: Todo[];
}

export interface DismissSuggestionsRequest {
  suggestionIds: string[];
}
