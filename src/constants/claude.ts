import type { RunMode, RunStatus } from '@/types';

export const RUN_POLL_INTERVAL_MS = 2000;

export const RECONNECT_DELAYS_MS = [500, 1000, 2000, 4000, 8000];

export const DOCK_WIDTH = { min: 360, max: 960, initial: 520 } as const;

export const DOCK_WIDTH_STORAGE_KEY = 'meeting-tasks:claude-dock-width';

export const TERMINAL_FONT = { family: 'var(--font-jetbrains-mono), ui-monospace, Menlo, monospace', size: 12.5 } as const;

export const TERMINAL_SCROLLBACK = 5000;

export const ACTIVE_RUN_STATUSES: RunStatus[] = ['queued', 'working'];

export const QUEUE_PHRASE = 'do my queued tasks';

export const RUN_STATUS_META: Record<RunStatus, { label: string; tone: 'accent' | 'violet' | 'success' | 'neutral' }> = {
  queued: { label: 'Queued', tone: 'accent' },
  working: { label: 'Working', tone: 'violet' },
  done: { label: 'Done', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const SEND_MODE_OPTIONS: { value: RunMode; label: string; description: string }[] = [
  { value: 'terminal', label: 'Run in app terminal', description: 'Claude Code starts in a terminal docked here' },
  { value: 'queue', label: 'Queue for Cursor', description: 'Ask Claude in Cursor to “do my queued tasks”' },
];

export const DEFAULT_SEND_MODE: RunMode = 'terminal';

export const TERMINAL_THEME_VARS = {
  background: '--term-background',
  foreground: '--term-foreground',
  cursor: '--cyan',
  cursorAccent: '--term-background',
  selectionBackground: '--term-selection',
  black: '--term-black',
  red: '--term-red',
  green: '--term-green',
  yellow: '--term-yellow',
  blue: '--term-blue',
  magenta: '--term-magenta',
  cyan: '--term-cyan',
  white: '--term-white',
  brightBlack: '--term-bright-black',
  brightRed: '--term-bright-red',
  brightGreen: '--term-bright-green',
  brightYellow: '--term-bright-yellow',
  brightBlue: '--term-bright-blue',
  brightMagenta: '--term-bright-magenta',
  brightCyan: '--term-bright-cyan',
  brightWhite: '--term-bright-white',
} as const;

export const CLAUDE_COPY = {
  sendToClaude: 'Send to Claude',
  sendTitle: 'Send to Claude',
  startRun: 'Start in terminal',
  queueRun: 'Add to queue',
  starting: 'Starting…',
  preparingPrompt: 'Preparing the prompt…',
  promptPreview: 'Prompt preview',
  promptPreviewHint: 'Edit before sending if you want',
  panelTitle: 'Claude',
  minimise: 'Minimise',
  markDone: 'Mark done',
  stop: 'Stop',
  stopTitle: 'Stop this run?',
  stopMessage: 'The terminal session is closed. Todos Claude hasn’t started go back to open.',
  connecting: 'Connecting to terminal…',
  reconnecting: 'Reconnecting…',
  offline: 'Terminal server is offline. Start it with npm run dev, then reopen the panel.',
  reconnect: 'Reconnect',
  queuedTitle: 'Queued for Claude in Cursor',
  queuedHint: 'Open Cursor in this repo and ask Claude to',
  copyPhrase: 'Copy phrase',
  runDoneToast: (title: string) => `Claude finished ${title}`,
  runDoneTitle: 'Done',
  filesChanged: 'Files changed',
  noFilesChanged: 'No file changes detected',
  activeRun: 'Claude is working',
  queuedRun: 'Queued for Claude',
  openPanel: 'Open panel',
  chipWorking: 'Claude · working',
  chipQueued: 'Queued',
  claudeNote: 'Claude’s note',
  repoMissing: 'This project has no repo path. Add one in Edit project to send work to Claude.',
  pendingTask: 'Todo',
} as const;

export const SETTINGS_COPY = {
  title: 'Settings',
  claudeLink: 'Claude link',
  claudeLinkDescription: 'Let Claude Code read your queued todos and mark them done through a local MCP server.',
  checks: 'Status',
  cliFound: 'Claude CLI found',
  cliMissing: 'Claude CLI not found on your login shell PATH',
  terminalOnline: 'Terminal server online',
  terminalOffline: 'Terminal server offline (start it with npm run dev)',
  tokens: 'Access tokens',
  tokenName: 'Token name',
  tokenNamePlaceholder: 'Cursor on MacBook',
  createToken: 'Create token',
  creating: 'Creating…',
  tokenOnceWarning: 'Copy this token now. It is shown only once and can’t be recovered.',
  copyToken: 'Copy token',
  noTokens: 'No tokens yet.',
  lastUsed: 'Last used',
  neverUsed: 'Never used',
  revoke: 'Revoke',
  revokeTitle: 'Revoke token?',
  revokeMessage: (name: string) => `Claude sessions using “${name}” will stop working immediately.`,
  setup: 'Setup',
  stepCreate: 'Create a token above.',
  stepCommand: 'Run this command in your terminal. It registers the tasks MCP server with Claude Code.',
  stepCommandTokenFilled: 'Your new token is already filled in.',
  stepRestart: 'Restart Claude in Cursor or the terminal.',
  stepTry: 'In a project folder, ask Claude:',
  copyCommand: 'Copy command',
  privacy:
    'Runs on this Mac only. Nothing is added to your repositories. Todo content you send to Claude is processed under whichever account Claude Code is logged into.',
  displayOnly: 'This app never changes Claude Code’s configuration. You run the command yourself.',
  tokenPlaceholder: '<YOUR_TOKEN>',
} as const;

export const SEND_COPY = {
  pickRepo: 'Pick the repo you’re working in above to send this to Claude.',
} as const;

export const CLI_MISSING_STATUS = 412;

export const CLI_INSTALL_COMMAND = 'curl -fsSL https://claude.ai/install.sh | bash';

export const CLI_COPY = {
  title: 'Claude Code CLI isn’t installed on this Mac',
  then: 'Then open a new terminal and run',
  thenSuffix: 'once to log in.',
  loginCommand: 'claude',
  checkAgain: 'Check again',
  checking: 'Checking…',
  copyCommand: 'Copy',
  terminalUnavailable: 'Install the Claude Code CLI to run in the app terminal',
  queueStillWorks: 'You can still queue tasks for Claude in Cursor.',
} as const;
