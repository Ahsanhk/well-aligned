import 'server-only';
import { TERMINAL_BASE_URL, TERMINAL_HEALTH_PATH, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_SESSIONS_PATH, TERMINAL_SIGNATURE_HEADER } from '@/constants/claude-link';
import { readTerminalSecret, signAdminAction } from './terminal-ticket';

export function terminalFeatureEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.platform === 'darwin';
}

async function request(pathname: string, init: RequestInit = {}): Promise<Response | null> {
  try {
    return await fetch(`${TERMINAL_BASE_URL}${pathname}`, { ...init, signal: AbortSignal.timeout(TERMINAL_REQUEST_TIMEOUT_MS), cache: 'no-store' });
  } catch {
    return null;
  }
}

export async function isTerminalServerOnline(): Promise<boolean> {
  if (!terminalFeatureEnabled()) return false;
  return (await request(TERMINAL_HEALTH_PATH))?.ok ?? false;
}

export async function listLiveSessions(): Promise<Set<string>> {
  const secret = terminalFeatureEnabled() ? readTerminalSecret() : null;
  if (!secret) return new Set();
  const response = await request(TERMINAL_SESSIONS_PATH, { headers: { [TERMINAL_SIGNATURE_HEADER]: signAdminAction('list', secret) } });
  if (!response?.ok) return new Set();
  const body = (await response.json().catch(() => null)) as { runIds?: unknown } | null;
  return new Set(Array.isArray(body?.runIds) ? body.runIds.filter((id): id is string => typeof id === 'string') : []);
}

export async function killTerminalSession(runId: string): Promise<void> {
  const secret = terminalFeatureEnabled() ? readTerminalSecret() : null;
  if (!secret) return;
  await request(`${TERMINAL_SESSIONS_PATH}/${encodeURIComponent(runId)}/kill`, {
    method: 'POST',
    headers: { [TERMINAL_SIGNATURE_HEADER]: signAdminAction(`kill:${runId}`, secret) },
  });
}
