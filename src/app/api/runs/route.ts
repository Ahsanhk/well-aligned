import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { isClaudeCliAvailable } from '@/lib/claude-cli';
import { getProject } from '@/lib/db';
import { listRuns, startRun } from '@/lib/runs';
import { startRunSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export const GET = withSession(async ({ supabase }: ApiSession, request: Request) => {
  const params = new URL(request.url).searchParams;
  const runs = await listRuns(supabase, params.get('projectId') || null, params.get('active') === '1');
  if (!runs) return jsonError(404, API_ERRORS.projectNotFound);
  return Response.json(runs);
});

export const POST = withSession(async ({ supabase, user }: ApiSession, request: Request) => {
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = startRunSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const project = await getProject(supabase, input.data.projectId);
  if (!project) return jsonError(404, API_ERRORS.projectNotFound);
  if (input.data.mode === 'terminal' && !(await isClaudeCliAvailable())) return jsonError(412, API_ERRORS.claudeCliMissing);
  const result = await startRun(supabase, user.id, project, input.data);
  if ('error' in result) return jsonError(400, API_ERRORS[result.error]);
  return Response.json(result.run, { status: 201 });
});
