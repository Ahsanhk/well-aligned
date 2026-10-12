import { API_ERRORS } from '@/constants/api-errors';
import { EXPORT_FILE_SUFFIX, EXPORT_VERSION } from '@/constants/storage';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { getProject, listTodos } from '@/lib/db';
import { nowIso } from '@/lib/ids';
import { toSlug } from '@/lib/slug';
import type { ProjectExport } from '@/types';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ projectId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const { projectId } = await params;
  const [project, todos] = await Promise.all([getProject(supabase, projectId), listTodos(supabase, projectId)]);
  if (!project || !todos) return jsonError(404, API_ERRORS.projectNotFound);
  const payload: ProjectExport = { version: EXPORT_VERSION, exportedAt: nowIso(), project, todos };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${toSlug(project.name)}${EXPORT_FILE_SUFFIX}"`,
      'Cache-Control': 'no-store',
    },
  });
});
