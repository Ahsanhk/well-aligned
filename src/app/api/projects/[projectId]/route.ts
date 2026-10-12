import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { deleteProject, getProject, updateProject } from '@/lib/db';
import { getGroup } from '@/lib/groups-db';
import { projectPatchSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ projectId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const project = await getProject(supabase, (await params).projectId);
  if (!project) return jsonError(404, API_ERRORS.projectNotFound);
  return Response.json(project);
});

export const PATCH = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const { projectId } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = projectPatchSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const { groupId, ...rest } = input.data;
  const current = await getProject(supabase, projectId);
  if (!current) return jsonError(404, API_ERRORS.projectNotFound);
  const changesGroup = groupId !== undefined && groupId !== current.groupId;
  if (changesGroup && groupId && !(await getGroup(supabase, groupId))) return jsonError(400, API_ERRORS.invalidGroup);
  const project = await updateProject(supabase, projectId, changesGroup ? { ...rest, groupId } : rest);
  if (!project) return jsonError(404, API_ERRORS.projectNotFound);
  return Response.json(project);
});

export const DELETE = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  if (!(await deleteProject(supabase, (await params).projectId))) return jsonError(404, API_ERRORS.projectNotFound);
  return Response.json({ ok: true });
});
