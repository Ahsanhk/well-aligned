import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { deleteGroup, getGroup, updateGroup } from '@/lib/groups-db';
import { projectGroupPatchSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ groupId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const group = await getGroup(supabase, (await params).groupId);
  if (!group) return jsonError(404, API_ERRORS.groupNotFound);
  return Response.json(group);
});

export const PATCH = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const { groupId } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = projectGroupPatchSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const group = await updateGroup(supabase, groupId, input.data);
  if (!group) return jsonError(404, API_ERRORS.groupNotFound);
  return Response.json(group);
});

export const DELETE = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  if (!(await deleteGroup(supabase, (await params).groupId))) return jsonError(404, API_ERRORS.groupNotFound);
  return Response.json({ ok: true });
});
