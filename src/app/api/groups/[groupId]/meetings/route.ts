import { API_ERRORS } from '@/constants/api-errors';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { handleMeetingUpload } from '@/lib/meeting-upload-handler';
import { listOwnerMeetings } from '@/lib/meetings-db';
import { groupOwner } from '@/lib/owner';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ groupId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const meetings = await listOwnerMeetings(supabase, groupOwner((await params).groupId));
  if (!meetings) return jsonError(404, API_ERRORS.groupNotFound);
  return Response.json(meetings);
});

export const POST = withSession(async (session: ApiSession, request: Request, { params }: Context) =>
  handleMeetingUpload(session, request, groupOwner((await params).groupId)),
);
