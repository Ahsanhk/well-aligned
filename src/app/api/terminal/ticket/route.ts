import { API_ERRORS } from '@/constants/api-errors';
import { TERMINAL_TICKET_TTL_MS, TERMINAL_WS_URL } from '@/constants/claude-link';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { getProject } from '@/lib/db';
import { isLocalRequest } from '@/lib/local-request';
import { getRunRow, isActiveRunStatus, resolveRepoPath, runPromptPath } from '@/lib/runs';
import { terminalTicketSchema } from '@/lib/schemas';
import { terminalFeatureEnabled } from '@/lib/terminal-client';
import { ensureTerminalSecret, signTicket } from '@/lib/terminal-ticket';
import type { TerminalTicket } from '@/types';

export const runtime = 'nodejs';

export const POST = withSession(async ({ supabase, user }: ApiSession, request: Request) => {
  if (!terminalFeatureEnabled()) return jsonError(404, API_ERRORS.terminalUnavailable);
  if (!isLocalRequest(request)) return jsonError(403, API_ERRORS.localOnly);
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = terminalTicketSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const row = await getRunRow(supabase, input.data.runId);
  if (!row || row.mode !== 'terminal') return jsonError(404, API_ERRORS.runNotFound);
  if (!isActiveRunStatus(row.status)) return jsonError(409, API_ERRORS.runNotActive);
  const project = await getProject(supabase, row.project_id);
  const cwd = project ? await resolveRepoPath(project) : null;
  if (!cwd) return jsonError(400, API_ERRORS.repoPathMissing);
  const exp = Date.now() + TERMINAL_TICKET_TTL_MS;
  const ticket = signTicket({ userId: user.id, runId: row.id, cwd, promptFile: runPromptPath(row.id), exp }, ensureTerminalSecret());
  const response: TerminalTicket = { ticket, url: `${TERMINAL_WS_URL}?ticket=${encodeURIComponent(ticket)}`, expiresAt: new Date(exp).toISOString() };
  return Response.json(response, { headers: { 'Cache-Control': 'no-store' } });
});
