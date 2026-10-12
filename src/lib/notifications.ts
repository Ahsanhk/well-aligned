import 'server-only';
import { execFile } from 'node:child_process';
import { NOTIFICATION_TIMEOUT_MS, NOTIFICATION_TITLE } from '@/constants/claude-link';

const SCRIPT = ['-e', 'on run argv', '-e', 'display notification (item 1 of argv) with title (item 2 of argv)', '-e', 'end run'];

export function notifyDesktop(message: string, title: string = NOTIFICATION_TITLE): Promise<void> {
  if (process.platform !== 'darwin') return Promise.resolve();
  return new Promise((resolve) => {
    execFile('osascript', [...SCRIPT, message, title], { timeout: NOTIFICATION_TIMEOUT_MS }, () => resolve());
  });
}
