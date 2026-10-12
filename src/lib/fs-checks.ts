import 'server-only';
import { stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { HOME_PREFIX } from '@/constants/system';

export async function isDirectory(target: string) {
  try {
    return (await stat(target)).isDirectory();
  } catch {
    return false;
  }
}

export async function pathExists(target: string) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

export function isAbsolutePath(target: string) {
  return path.isAbsolute(target);
}

export function expandHome(target: string) {
  if (target === '~') return os.homedir();
  return target.startsWith(HOME_PREFIX) ? path.join(os.homedir(), target.slice(HOME_PREFIX.length)) : target;
}
