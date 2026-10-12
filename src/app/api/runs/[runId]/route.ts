import { API_ERRORS } from '@/constants/api-errors';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { getRunRow, toRuns } from '@/lib/runs';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ runId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const row = await getRunRow(supabase, (await params).runId);
  if (!row) return jsonError(404, API_ERRORS.runNotFound);
  const [run] = await toRuns([row]);
  return Response.json(run);
});
