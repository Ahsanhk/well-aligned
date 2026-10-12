import { after } from 'next/server';
import { MEETING_API_ERRORS } from '@/constants/meeting';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { processMeeting } from '@/lib/meeting-processor';
import { getMeeting, restartFailedMeeting } from '@/lib/meetings-db';
import { findRecording } from '@/lib/recordings';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ meetingId: string }>;
}

export const POST = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const { meetingId } = await params;
  const meeting = await getMeeting(supabase, meetingId);
  if (!meeting) return jsonError(404, MEETING_API_ERRORS.meetingNotFound);
  if (meeting.status !== 'failed' || !(await findRecording(meetingId))) return jsonError(409, MEETING_API_ERRORS.notRetryable);
  const restarted = await restartFailedMeeting(supabase, meetingId);
  if (!restarted) return jsonError(409, MEETING_API_ERRORS.notRetryable);
  after(() => processMeeting(meetingId));
  return Response.json(restarted);
});
