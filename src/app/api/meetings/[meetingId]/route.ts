import { API_ERRORS } from '@/constants/api-errors';
import { MEETING_API_ERRORS } from '@/constants/meeting';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { deleteMeeting, getMeeting, updateMeetingFields } from '@/lib/meetings-db';
import { normalizeSuggestions } from '@/lib/mappers';
import { removeMeetingFrames } from '@/lib/meeting-frames';
import { deleteRecording } from '@/lib/recordings';
import { meetingPatchSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ meetingId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const meeting = await getMeeting(supabase, (await params).meetingId);
  if (!meeting) return jsonError(404, MEETING_API_ERRORS.meetingNotFound);
  return Response.json(meeting);
});

export const PATCH = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const { meetingId } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = meetingPatchSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const meeting = await updateMeetingFields(supabase, meetingId, {
    ...(input.data.title !== undefined && { title: input.data.title }),
    ...(input.data.meetingDate !== undefined && { meeting_date: input.data.meetingDate }),
  });
  if (!meeting) return jsonError(404, MEETING_API_ERRORS.meetingNotFound);
  return Response.json(meeting);
});

export const DELETE = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const { meetingId } = await params;
  const deleted = await deleteMeeting(supabase, meetingId);
  if (!deleted) return jsonError(404, MEETING_API_ERRORS.meetingNotFound);
  await deleteRecording(meetingId);
  const knownFrames = normalizeSuggestions(deleted.suggestions).flatMap((suggestion) => suggestion.frames.map((frame) => frame.storagePath));
  await removeMeetingFrames(deleted.user_id, meetingId, knownFrames);
  return Response.json({ ok: true });
});
