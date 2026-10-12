export const RECORDINGS_DIR_NAME = 'recordings';

export const RECORDING_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export const RECORDING_FILE_NAME_HEADER = 'x-file-name';

export const RECORDING_DEFAULT_NAME = 'recording';

export const RECORDING_PART_SUFFIX = '.part';

export const GENERIC_BINARY_MIME = 'application/octet-stream';

export const RECORDING_EXTENSION_PATTERN = /^[a-z0-9]{1,5}$/;

export const RECORDING_MIME_EXTENSIONS: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-m4v': 'm4v',
  'video/webm': 'webm',
  'video/x-matroska': 'mkv',
  'video/mpeg': 'mpeg',
  'video/x-msvideo': 'avi',
  'video/3gpp': '3gp',
  'video/x-flv': 'flv',
  'video/x-ms-wmv': 'wmv',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/aac': 'aac',
  'audio/flac': 'flac',
  'audio/webm': 'weba',
  'audio/aiff': 'aiff',
  'audio/x-aiff': 'aiff',
};

export const RECORDING_EXTENSION_MIMES: Record<string, string> = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  mpeg: 'video/mpeg',
  mpg: 'video/mpeg',
  avi: 'video/x-msvideo',
  '3gp': 'video/3gpp',
  flv: 'video/x-flv',
  wmv: 'video/x-ms-wmv',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  flac: 'audio/flac',
  weba: 'audio/webm',
  aiff: 'audio/aiff',
  aif: 'audio/aiff',
};

export const MEETING_TITLE_MAX_LENGTH = 200;

export const MEETING_ERROR_MAX_LENGTH = 2000;

export const STALE_PROCESSING_MS = 30 * 60 * 1000;

export const GEMINI_FILE_POLL_INTERVAL_MS = 5000;

export const GEMINI_FILE_ACTIVE_TIMEOUT_MS = 10 * 60 * 1000;

export const MEETING_ANALYSIS_TIMEOUT_MS = 10 * 60 * 1000;

export const MEETING_MAX_OUTPUT_TOKENS = 65536;

export const SUGGESTION_QUOTE_PREFIX = 'Client said';

export const TRANSCRIPT_FILE_SUFFIX = '-transcript';

export const TRANSCRIPT_FORMAT_VALUES = ['md', 'json'] as const;

export const TRANSCRIPT_CONTENT_TYPES = {
  md: 'text/markdown; charset=utf-8',
  json: 'application/json; charset=utf-8',
} as const;

export const MEETING_ERRORS = {
  missingKey: 'GEMINI_API_KEY is not set. Add it to .env.local, restart the server, then retry.',
  rateLimited: 'Gemini is busy or the free quota is used up. Wait a minute, then retry.',
  timeout: 'Gemini took too long to analyse the recording. Retry, or upload a shorter clip.',
  fileFailed: 'Gemini could not process this recording file. Try a different format such as MP4 or M4A.',
  truncated: 'The meeting was too long for Gemini to transcribe in one pass, even condensed. Try splitting the recording.',
  failed: 'Gemini could not analyse the recording. Retry in a moment.',
  recordingMissing: 'The uploaded recording is no longer on the server. Upload it again.',
  interrupted: 'Processing was interrupted',
} as const;

export const MEETING_API_ERRORS = {
  meetingNotFound: 'Meeting not found.',
  missingBody: 'Send the recording as the raw request body.',
  unsupportedMedia: 'Only video and audio recordings are supported.',
  tooLarge: 'Recordings must be 2 GB or smaller.',
  uploadAborted: 'The upload was interrupted before it finished.',
  invalidFileName: 'X-File-Name must be URI-encoded.',
  notRetryable: 'Only failed meetings whose recording is still on the server can be retried.',
  notReady: 'This meeting has not finished processing yet.',
  suggestionNotFound: 'Some suggestions were not found in this meeting.',
  suggestionAlreadyAccepted: 'Some suggestions were already added as todos.',
  frameNotFound: 'Frame not found.',
  unknownFrame: 'Some selected frames do not belong to that suggestion.',
  invalidTarget: 'Each suggestion must go to a project in this group, or be shared with the group.',
} as const;

export const MEETING_SYSTEM_INSTRUCTION = [
  'You are a senior software engineer reviewing a recorded meeting between a developer and their client. Produce a faithful transcript, a short summary, and the list of concrete action items the developer must do.',
  '',
  'LANGUAGE',
  '- The transcript and quotes stay in the language actually spoken. Title, summary, suggestion titles and details are written in English.',
  '',
  'TRANSCRIPT',
  '- Transcribe what is actually said, faithfully, in the spoken language. Do not paraphrase, embellish, or invent words. Remove only filler sounds (um, uh) and false starts.',
  '- speaker: the person\'s name when it is said, otherwise "Client" or "Developer".',
  '- start: the time the segment starts, as mm:ss for recordings under an hour and h:mm:ss beyond that (e.g. "04:31", "1:02:07").',
  '- Merge very short consecutive segments from the same speaker into one segment. Start a new segment when the speaker changes or after a long pause or topic change. Aim for segments of one to four sentences.',
  '- If a stretch has no speech, skip it. If audio is unintelligible, write [inaudible] rather than guessing.',
  '',
  'TITLE',
  '- A short, specific title for the meeting (at most 8 words), e.g. "Checkout redesign feedback and launch blockers".',
  '',
  'SUMMARY',
  '- 3 to 6 short sentences, each on its own line starting with "- ". Cover the decisions made, the main problems raised, and deadlines mentioned. No preamble.',
  '',
  'SUGGESTIONS',
  '- Include ONLY concrete action items the developer was asked to do, or agreed to do, before the next meeting. Exclude discussion points, open questions, ideas without agreement, things the client will do, and things already done.',
  '- Each suggestion must stand alone: someone who did not attend should understand what to build or fix.',
  '- title: an imperative task title of at most 12 words, e.g. "Fix login button misalignment on mobile".',
  '- details: 1 to 4 sentences with every concrete specific that was said: page or screen, expected behaviour, copy text, colours, numbers, deadlines, and who asked. If the video shows the screen (designs, bugs, code, URLs), describe what is visible that clarifies the task. Do not invent requirements; if something is ambiguous, say what needs confirming.',
  '- priority: "high" when urgency words appear (urgent, ASAP, blocker, broken, today, before launch, by <near date>) or the issue blocks users; "low" for nice-to-haves (if there is time, later, eventually, minor); otherwise "medium".',
  '- quote: the exact transcript words that support this task (one or two sentences), as spoken.',
  '- timestamp: the start time of that quote, in the same format as the transcript.',
  '- frameTimestamps: 0 to 3 moments (same time format) where the SCREEN in the recording best shows what this task is about: the page, table, form, design or bug being discussed or pointed at. These are often not the quote time; pick the moment the relevant thing is clearly visible and not mid-transition. Use an empty list when the recording is audio-only, the screen is not shared, or nothing relevant is visible.',
  '- suggestedProject: only when the context lists "Projects in this group". Use the exact name of the one project the task belongs to, judged from what is said and shown (screens, features, platform such as web vs mobile). Use "shared" when the task applies to several or all of the projects, or when it is unclear. When no group projects are listed, use an empty string.',
  '- Merge duplicates: if the same request comes up several times, output one suggestion using the clearest quote.',
  '- If there are no action items, return an empty suggestions list.',
  '',
  'Return only JSON matching the response schema.',
].join('\n');

export const MEETING_CONDENSED_INSTRUCTION = [
  'IMPORTANT: your previous answer was too long and got cut off.',
  'This time keep the transcript condensed: merge consecutive segments much more aggressively (one segment per speaker turn or topic, up to six sentences), and shorten long monologues to their essential sentences while keeping the speaker\'s own words.',
  'Keep every action item and its exact supporting quote.',
].join('\n');

export const MEETING_USER_PROMPT_INTRO = 'Analyse this meeting recording.';

export const FFMPEG_CANDIDATES = ['ffmpeg', '/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg'];

export const FFPROBE_CANDIDATES = ['ffprobe', '/opt/homebrew/bin/ffprobe', '/usr/local/bin/ffprobe'];

export const FFMPEG_VERSION_TIMEOUT_MS = 5000;

export const FFPROBE_TIMEOUT_MS = 30000;

export const FRAME_EXTRACT_TIMEOUT_MS = 60000;

export const FRAME_EXTRACT_CONCURRENCY = 3;

export const FRAME_MAX_PER_SUGGESTION = 3;

export const FRAME_MIN_GAP_SECONDS = 2;

export const FRAME_END_MARGIN_SECONDS = 0.25;

export const FRAME_MAX_WIDTH = 1600;

export const FRAME_JPEG_QUALITY = 3;

export const FRAME_MIME_TYPE = 'image/jpeg';

export const FRAME_EXTENSION = 'jpg';

export const FRAME_STORAGE_FOLDER = 'meetings';

export const FRAME_TEMP_DIR_NAME = 'frames-tmp';

export const FRAME_LIST_LIMIT = 1000;

export const FRAME_ORIGINAL_NAME_PREFIX = 'frame-';

export const FRAME_CACHE_CONTROL = 'private, max-age=31536000, immutable';

export const SHARED_PROJECT_KEYWORD = 'shared';
