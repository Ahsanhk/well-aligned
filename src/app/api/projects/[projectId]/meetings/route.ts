import { API_ERRORS } from '@/constants/api-errors';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { handleMeetingUpload } from '@/lib/meeting-upload-handler';
import { listMeetings } from '@/lib/meetings-db';
import { projectOwner } from '@/lib/owner';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ projectId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const meetings = await listMeetings(supabase, (await params).projectId);
  if (!meetings) return jsonError(404, API_ERRORS.projectNotFound);
  return Response.json(meetings);
});

export const POST = withSession(async (session: ApiSession, request: Request, { params }: Context) =>
  handleMeetingUpload(session, request, projectOwner((await params).projectId)),
);
