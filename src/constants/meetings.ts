import type { MeetingStatus, ProjectTab, TranscriptFormat } from '@/types';

export const MEETING_POLL_INTERVAL_MS = 4000;

export const ELAPSED_TICK_MS = 1000;

export const MEETING_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export const MEETING_FILE_EXTENSIONS: Record<string, string> = {
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  m4v: 'video/x-m4v',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
};

export const MEETING_ACCEPT = ['video/*', 'audio/*', ...Object.keys(MEETING_FILE_EXTENSIONS).map((ext) => `.${ext}`)].join(',');

export const MEETING_FALLBACK_MIME = 'application/octet-stream';

export const ACTIVE_MEETING_STATUSES: MeetingStatus[] = ['uploading', 'processing'];

export const MEETING_STATUS_META: Record<MeetingStatus, { label: string; tone: 'accent' | 'violet' | 'success' | 'danger' }> = {
  uploading: { label: 'Uploading', tone: 'accent' },
  processing: { label: 'Processing', tone: 'violet' },
  ready: { label: 'Ready', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
};

export const PROJECT_TABS: { value: ProjectTab; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'backlog', label: 'My backlog' },
  { value: 'meetings', label: 'Meetings' },
];

export const DEFAULT_PROJECT_TAB: ProjectTab = 'todos';

export const PROJECT_TAB_PARAM = 'tab';

export const TRANSCRIPT_FORMATS: { value: TranscriptFormat; label: string }[] = [
  { value: 'md', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
];

export const SPEAKER_TONE_CLASSES = ['text-cyan', 'text-violet', 'text-indigo', 'text-teal', 'text-sky', 'text-rose'];

export const ANCHOR_FLASH_MS = 1600;

export const MEETING_COPY = {
  uploadTitle: 'Upload a meeting recording',
  uploadDescription: 'Gemini watches the recording, writes a transcript, and suggests the todos your client asked for.',
  dropHint: 'Drop a video or audio file, or click to choose',
  formatsHint: 'MOV, MP4, WEBM, M4A, MP3 · up to 2 GB',
  titlePlaceholder: 'Title (optional, Gemini suggests one)',
  processingTitle: 'Gemini is watching your meeting…',
  processingNote: 'Long recordings take a few minutes. You can leave this page; it keeps processing in the background.',
  emptyTitle: 'No meetings yet',
  emptyDescription: 'Upload a recording of your client call to get a transcript and suggested todos.',
  notFoundTitle: 'Meeting not found',
  notFoundDescription: 'It may have been deleted, or the link is wrong.',
  noSuggestions: 'Gemini didn’t find any concrete action items in this meeting.',
  allReviewed: 'All suggestions reviewed.',
  noTranscript: 'No transcript available.',
  noMatches: 'No lines match your search.',
  searchPlaceholder: 'Search transcript…',
  tooLarge: 'Recordings must be 2 GB or smaller',
  unsupported: 'Choose a video or audio file',
  uploadFailed: 'Upload failed',
  meetingReady: 'Meeting processed — review the suggested todos',
  meetingFailed: 'Meeting processing failed',
  meetingDeleted: 'Meeting deleted',
  meetingRenamed: 'Meeting renamed',
  retryStarted: 'Retrying…',
  dismissed: 'Suggestions dismissed',
  framesLabel: 'From the recording',
  excludeFrame: 'Exclude this frame',
  includeFrame: 'Include this frame',
  frameExcluded: 'Excluded',
  framesKept: (kept: number, total: number) => `${kept} of ${total} will be attached`,
  accepted: (count: number) => `Added ${count} todo${count === 1 ? '' : 's'} to the project`,
} as const;

export const ANCHOR_HIGHLIGHT_CLASS = 'animate-flash';

