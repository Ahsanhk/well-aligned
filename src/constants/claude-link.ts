export const TERMINAL_HOST = '127.0.0.1';

export const TERMINAL_PORT = 3010;

export const TERMINAL_BASE_URL = `http://${TERMINAL_HOST}:${TERMINAL_PORT}`;

export const TERMINAL_WS_URL = `ws://${TERMINAL_HOST}:${TERMINAL_PORT}/term`;

export const TERMINAL_WS_PATH = '/term';

export const TERMINAL_HEALTH_PATH = '/health';

export const TERMINAL_SESSIONS_PATH = '/sessions';

export const TERMINAL_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

export const TERMINAL_SIGNATURE_HEADER = 'x-terminal-signature';

export const TERMINAL_SECRET_ENV = 'TERMINAL_SECRET';

export const TERMINAL_SECRET_BYTES = 32;

export const TERMINAL_TICKET_TTL_MS = 60 * 1000;

export const TERMINAL_SCROLLBACK_BYTES = 200 * 1024;

export const TERMINAL_IDLE_KILL_MS = 30 * 60 * 1000;

export const TERMINAL_IDLE_SWEEP_MS = 60 * 1000;

export const TERMINAL_REQUEST_TIMEOUT_MS = 800;

export const TERMINAL_DEFAULT_SHELL = '/bin/zsh';

export const TERMINAL_DEFAULT_COLS = 120;

export const TERMINAL_DEFAULT_ROWS = 32;

export const TERMINAL_MAX_COLS = 500;

export const TERMINAL_MAX_ROWS = 300;

export const TERMINAL_SCRUBBED_ENV_PATTERN = /SECRET|SERVICE_ROLE|SUPABASE|GEMINI|API_KEY|TOKEN/i;

export const TERMINAL_CLI_MISSING_MESSAGE =
  '\\033[33mClaude Code CLI not found.\\033[0m Install: curl -fsSL https://claude.ai/install.sh | bash, then run: exec zsh -l and press ↑ to retry\\n';

export const ENV_FILE_NAME = '.env.local';

export const RUNS_DIR_NAME = 'runs';

export const RUN_PROMPT_FILE_PATTERN = /^[0-9a-f-]{36}\.md$/;

export const RUN_PROMPT_MAX_LENGTH = 100000;

export const RUN_MAX_TODOS = 25;

export const RUN_COMPLETE_INSTRUCTION =
  'As you finish each task, call the tasks MCP tool complete_todo with its todo id and a one-line note of what changed.';

export const API_TOKEN_PREFIX = 'mt_';

export const API_TOKEN_BYTES = 32;

export const API_TOKEN_NAME_MAX_LENGTH = 60;

export const MCP_SERVER_NAME = 'tasks';

export const MCP_SERVER_VERSION = '1.0.0';

export const MCP_ADD_COMMAND =
  'claude mcp add --scope user --transport http tasks http://localhost:3000/api/mcp --header "Authorization: Bearer <YOUR_TOKEN>"';

export const CLAUDE_CLI_PROBE_TIMEOUT_MS = 5000;

export const CLAUDE_CLI_CACHE_MS = 60 * 1000;

export const GIT_TIMEOUT_MS = 15000;

export const GIT_MAX_UNTRACKED_FILES = 200;

export const GIT_MAX_LINE_COUNT_BYTES = 2 * 1024 * 1024;

export const NOTIFICATION_TITLE = 'Meeting Tasks';

export const NOTIFICATION_TIMEOUT_MS = 5000;

export const MCP_TOOL_DESCRIPTIONS = {
  currentProject: 'Find the Meeting Tasks project for a working directory.',
  queuedTasks: 'Get the queued tasks for the project in this directory, with screenshots as local file paths. Call this when asked to do the queued tasks.',
  listTodos: 'List todos of a project.',
  getTodo: 'Get one todo in full.',
  startTodo: 'Mark a todo as in progress.',
  completeTodo: 'Mark a todo as done with a one-line note of what changed.',
  getMeeting: 'Get a meeting summary and transcript.',
} as const;

export const MCP_MESSAGES = {
  noProject: 'No Meeting Tasks project for this folder.',
  noQueued: 'No queued tasks for this project.',
  todoNotFound: 'Todo not found.',
  projectNotFound: 'Project not found.',
  meetingNotFound: 'Meeting not found.',
  noTodos: 'No matching todos.',
  started: (title: string) => `Started: ${title}`,
  completed: (title: string) => `Done: ${title}`,
  runFinished: (count: number) => `All ${count} tasks of this run are done.`,
} as const;

export const RUN_NOTIFICATION_TEXT = (title: string) => `✓ ${title} — done`;
