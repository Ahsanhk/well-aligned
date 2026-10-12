import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { createProject, listProjectSummaries } from '@/lib/db';
import { getGroup } from '@/lib/groups-db';
import { projectInputSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export const GET = withSession(async ({ supabase }: ApiSession) => Response.json(await listProjectSummaries(supabase)));

export const POST = withSession(async ({ supabase, user }: ApiSession, request: Request) => {
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = projectInputSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  if (input.data.groupId && !(await getGroup(supabase, input.data.groupId))) return jsonError(400, API_ERRORS.invalidGroup);
  return Response.json(await createProject(supabase, user.id, input.data), { status: 201 });
});
