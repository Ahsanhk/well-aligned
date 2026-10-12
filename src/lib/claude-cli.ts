import 'server-only';
import { execFile } from 'node:child_process';
import { CLAUDE_CLI_CACHE_MS, CLAUDE_CLI_PROBE_TIMEOUT_MS, TERMINAL_DEFAULT_SHELL } from '@/constants/claude-link';

let lastFoundAt: number | null = null;

function probe(): Promise<boolean> {
  const shell = process.env.SHELL || TERMINAL_DEFAULT_SHELL;
  return new Promise((resolve) => {
    execFile(shell, ['-lc', 'command -v claude'], { timeout: CLAUDE_CLI_PROBE_TIMEOUT_MS }, (error, stdout) => {
      resolve(!error && stdout.trim().length > 0);
    });
  });
}

export async function isClaudeCliAvailable(): Promise<boolean> {
  if (lastFoundAt !== null && Date.now() - lastFoundAt < CLAUDE_CLI_CACHE_MS) return true;
  const found = await probe();
  lastFoundAt = found ? Date.now() : null;
  return found;
}
