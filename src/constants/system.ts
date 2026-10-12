export const FOLDER_PICKER_PROMPT = 'Choose the project repository';

export const FOLDER_PICKER_TIMEOUT_MS = 5 * 60 * 1000;

export const OSASCRIPT_BINARY = 'osascript';

export const OSASCRIPT_CANCEL_CODE = '-128';

export const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]', '::1'];

export const PICKER_PLATFORM = 'darwin';

export const SYSTEM_ERRORS = {
  pickerUnavailable: 'Folder picker only works when the app runs locally on macOS.',
  pickerFailed: 'Could not open the folder picker.',
  pathNotAbsolute: 'Path must be absolute.',
  pathNotDirectory: 'Folder not found',
  notLocal: 'Folder inspection only works when the app runs locally.',
} as const;

export const FOLDER_PICKER_COPY = {
  browse: 'Browse…',
  picking: 'Choose a folder in the dialog that opened. Check your Dock if you don’t see it.',
  gitRepo: 'Git repo ✓',
  notGitRepo: 'Not a git repo',
  detecting: 'Detecting stack…',
  detectedPrefix: 'Detected:',
  nothingDetected: 'No stack detected',
  useDetected: 'Use detected',
} as const;

export const HOME_PREFIX = '~/';
