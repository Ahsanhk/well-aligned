import { API_ERRORS } from '@/constants/api-errors';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { cancelRun, getRunRow, isActiveRunStatus, toRuns } from '@/lib/runs';
import { killTerminalSession } from '@/lib/terminal-client';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ runId: string }>;
}

export const POST = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const row = await getRunRow(supabase, (await params).runId);
  if (!row) return jsonError(404, API_ERRORS.runNotFound);
  if (!isActiveRunStatus(row.status)) return jsonError(409, API_ERRORS.runNotActive);
  const updated = await cancelRun(supabase, row);
  if (row.mode === 'terminal') await killTerminalSession(row.id);
  if (!updated) return jsonError(404, API_ERRORS.runNotFound);
  const [run] = await toRuns([updated]);
  return Response.json(run);
});
