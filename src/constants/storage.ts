import type { ProjectColor, TodoCategory, TodoOrigin, TodoPriority, TodoStatus } from '@/types';

export const DATA_DIR_NAME = 'data';

export const SCREENSHOT_CACHE_DIR_NAME = 'screenshots';

export const EXPORT_VERSION = 1;

export const SCREENSHOT_MAX_BYTES = 8 * 1024 * 1024;

export const SCREENSHOT_FORM_FIELD = 'files';

export const SCREENSHOT_MAX_FILES_PER_UPLOAD = 20;

export const SCREENSHOT_EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
} as const;

export type ScreenshotMimeType = keyof typeof SCREENSHOT_EXTENSIONS;

export const SCREENSHOT_MIME_TYPES = Object.keys(SCREENSHOT_EXTENSIONS) as ScreenshotMimeType[];

export const SCREENSHOT_STORAGE_PATH_PATTERN = /^([0-9a-f-]{36}\/)?[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

export const GROUP_STORAGE_FOLDER = 'groups';

export const GROUP_SCREENSHOT_STORAGE_PATH_PATTERN = /^[0-9a-f-]{36}\/groups\/[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

export const FRAME_STORAGE_PATH_PATTERN = /^[0-9a-f-]{36}\/meetings\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.jpg$/;

export const SCREENSHOT_CACHE_FILE_PATTERN = /^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

export const SCREENSHOT_CACHE_CONTROL = 'private, max-age=31536000, immutable';

export const EXPORT_FILE_SUFFIX = '-todos.json';

export const EXPORT_SLUG_FALLBACK = 'project';

export const PROJECT_COLORS = ['cyan', 'indigo', 'violet', 'teal', 'sky', 'rose'] as const satisfies readonly ProjectColor[];

export const TODO_STATUSES = ['open', 'in_progress', 'done'] as const satisfies readonly TodoStatus[];

export const TODO_ORIGINS = ['client', 'self'] as const satisfies readonly TodoOrigin[];

export const TODO_CATEGORIES = ['bug', 'missing', 'improvement'] as const satisfies readonly TodoCategory[];

export const DEFAULT_TODO_ORIGIN: TodoOrigin = 'client';

export const TODO_PRIORITIES = ['low', 'medium', 'high'] as const satisfies readonly TodoPriority[];

export const DEFAULT_PROJECT_COLOR: ProjectColor = 'cyan';

export const DEFAULT_TODO_PRIORITY: TodoPriority = 'medium';

export const DEFAULT_TODO_STATUS: TodoStatus = 'open';

export const FIELD_LIMITS = {
  projectName: 120,
  projectDescription: 4000,
  repoPath: 1000,
  techStack: 1000,
  todoTitle: 300,
  todoDetails: 20000,
  originalName: 300,
  promptText: 100000,
  modelName: 100,
} as const;
