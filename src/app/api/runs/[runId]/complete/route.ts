import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { getProject } from '@/lib/db';
import { completeRun, getRunRow, isActiveRunStatus, toRuns } from '@/lib/runs';
import { completeRunSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ runId: string }>;
}

export const POST = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const body = await readJsonBody(request);
  const input = completeRunSchema.safeParse(body.ok ? (body.body ?? {}) : {});
  if (!input.success) return invalidInput(input.error);
  const row = await getRunRow(supabase, (await params).runId);
  if (!row) return jsonError(404, API_ERRORS.runNotFound);
  if (!isActiveRunStatus(row.status)) return jsonError(409, API_ERRORS.runNotActive);
  const updated = await completeRun(supabase, row, await getProject(supabase, row.project_id), input.data.summary || null);
  if (!updated) return jsonError(404, API_ERRORS.runNotFound);
  const [run] = await toRuns([updated]);
  return Response.json(run);
});
