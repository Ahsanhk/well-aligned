export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const SCREENSHOTS_BUCKET = 'screenshots';

export const TABLES = {
  projects: 'projects',
  todos: 'todos',
  screenshots: 'screenshots',
  meetings: 'meetings',
  projectGroups: 'project_groups',
} as const;

export const MEETING_LIST_SELECT =
  'id, user_id, project_id, title, meeting_date, video_name, video_size, status, error, summary, suggestions, segment_count, model, created_at, updated_at';

export const TODO_WITH_SCREENSHOTS_SELECT = '*, screenshots(*)';

export const GROUP_SUMMARY_SELECT = '*, projects(id), todos(status, origin)';

export const PROJECT_WITH_STATUSES_SELECT = '*, todos(status, origin, priority)';

export const STORAGE_REMOVE_BATCH_SIZE = 100;

export const BUCKET_MISSING_CODE = 'NoSuchBucket';

export const BUCKET_MISSING_MESSAGE = 'Bucket not found';

export const DATABASE_NOT_SET_UP_CODES = ['PGRST205', '42P01', '42703', BUCKET_MISSING_CODE];

export const SUPABASE_MISSING_ENV_ERROR = 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.local.';

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const STORAGE_PATH_LOOKUP_BATCH_SIZE = 100;
