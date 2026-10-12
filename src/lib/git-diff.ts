import 'server-only';
import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { GIT_MAX_LINE_COUNT_BYTES, GIT_MAX_UNTRACKED_FILES, GIT_TIMEOUT_MS } from '@/constants/claude-link';
import type { RunFileChange } from '@/types';

const run = promisify(execFile);

async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await run('git', args, { cwd, timeout: GIT_TIMEOUT_MS, maxBuffer: 16 * 1024 * 1024 });
  return stdout;
}

function parseNumstat(output: string): RunFileChange[] {
  return output
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [added = '0', removed = '0', ...rest] = line.split('\t');
      return { path: rest.join('\t'), additions: Number(added) || 0, deletions: Number(removed) || 0 };
    })
    .filter((change) => change.path.length > 0);
}

async function countLines(absolutePath: string): Promise<number> {
  try {
    const info = await stat(absolutePath);
    if (!info.isFile() || info.size > GIT_MAX_LINE_COUNT_BYTES) return 0;
    const content = await readFile(absolutePath, 'utf8');
    if (!content) return 0;
    return content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
  } catch {
    return 0;
  }
}

export async function collectFileChanges(repoPath: string): Promise<RunFileChange[]> {
  try {
    const tracked = parseNumstat(await git(repoPath, ['diff', '--numstat', 'HEAD']).catch(() => git(repoPath, ['diff', '--numstat'])));
    const untrackedPaths = (await git(repoPath, ['ls-files', '--others', '--exclude-standard']))
      .split('\n')
      .filter(Boolean)
      .slice(0, GIT_MAX_UNTRACKED_FILES);
    const untracked = await Promise.all(
      untrackedPaths.map(async (file) => ({ path: file, additions: await countLines(path.join(repoPath, file)), deletions: 0 })),
    );
    return [...tracked, ...untracked];
  } catch {
    return [];
  }
}
