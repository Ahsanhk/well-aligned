import { API_ERRORS } from '@/constants/api-errors';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { insertImportedProject } from '@/lib/db';
import { buildImportedProjectRows, discardImportedScreenshots } from '@/lib/project-import';
import { projectExportSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export const POST = withSession(async ({ supabase, user }: ApiSession, request: Request) => {
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const parsed = projectExportSchema.safeParse(body.body);
  if (!parsed.success) return invalidInput(parsed.error);
  const rows = await buildImportedProjectRows(supabase, user.id, parsed.data);
  try {
    return Response.json(await insertImportedProject(supabase, rows.project, rows.todos, rows.screenshots), { status: 201 });
  } catch (error) {
    await discardImportedScreenshots(rows);
    throw error;
  }
});
