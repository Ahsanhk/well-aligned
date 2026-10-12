import 'server-only';
import { execFile } from 'node:child_process';
import {
  FOLDER_PICKER_PROMPT,
  FOLDER_PICKER_TIMEOUT_MS,
  OSASCRIPT_BINARY,
  OSASCRIPT_CANCEL_CODE,
  PICKER_PLATFORM,
} from '@/constants/system';
import { expandHome, isAbsolutePath, isDirectory } from './fs-checks';
import { isLocalRequest } from './local-request';

interface ExecResult {
  stdout: string;
  cancelled: boolean;
}

function chooseFolderExpression(withDefault: boolean) {
  const base = `choose folder with prompt "${FOLDER_PICKER_PROMPT}"`;
  return withDefault ? `${base} default location (POSIX file (item 1 of argv))` : base;
}

function buildArgs(startPath: string | null) {
  return [
    '-e',
    'on run argv',
    '-e',
    `return POSIX path of (${chooseFolderExpression(startPath !== null)})`,
    '-e',
    'end run',
    ...(startPath ? [startPath] : []),
  ];
}

function runOsascript(args: string[]) {
  return new Promise<ExecResult>((resolve, reject) => {
    execFile(OSASCRIPT_BINARY, args, { timeout: FOLDER_PICKER_TIMEOUT_MS }, (error, stdout, stderr) => {
      if (!error) {
        resolve({ stdout: String(stdout), cancelled: false });
        return;
      }
      if (String(stderr).includes(OSASCRIPT_CANCEL_CODE)) {
        resolve({ stdout: '', cancelled: true });
        return;
      }
      reject(error);
    });
  });
}

export function normalizePickedPath(raw: string) {
  const trimmed = raw.replace(/\r?\n$/, '');
  return trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed;
}

export function isPickerAllowed(request: Request) {
  return process.platform === PICKER_PLATFORM && isLocalRequest(request);
}

export async function pickFolder(startPath: string | undefined) {
  const expanded = startPath ? expandHome(startPath) : null;
  const usable = expanded && isAbsolutePath(expanded) && (await isDirectory(expanded)) ? expanded : null;
  const result = await runOsascript(buildArgs(usable));
  if (result.cancelled) return null;
  const picked = normalizePickedPath(result.stdout);
  return picked || null;
}
