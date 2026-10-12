import { API_ERRORS } from '@/constants/api-errors';
import { MEETING_API_ERRORS } from '@/constants/meeting';
import { invalidInput, jsonError, readJsonBody } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { getMeeting, updateMeetingFields } from '@/lib/meetings-db';
import { dismissSuggestionsSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ meetingId: string }>;
}

export const POST = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const { meetingId } = await params;
  const body = await readJsonBody(request);
  if (!body.ok) return jsonError(400, API_ERRORS.invalidJson);
  const input = dismissSuggestionsSchema.safeParse(body.body);
  if (!input.success) return invalidInput(input.error);
  const meeting = await getMeeting(supabase, meetingId);
  if (!meeting) return jsonError(404, MEETING_API_ERRORS.meetingNotFound);
  if (meeting.status !== 'ready') return jsonError(409, MEETING_API_ERRORS.notReady);
  const ids = new Set(input.data.suggestionIds);
  if ([...ids].some((id) => !meeting.suggestions.some((suggestion) => suggestion.id === id))) {
    return jsonError(404, MEETING_API_ERRORS.suggestionNotFound);
  }
  const suggestions = meeting.suggestions.map((suggestion) =>
    ids.has(suggestion.id) && !suggestion.acceptedTodoId ? { ...suggestion, dismissed: true } : suggestion,
  );
  const updated = await updateMeetingFields(supabase, meetingId, { suggestions });
  if (!updated) return jsonError(404, MEETING_API_ERRORS.meetingNotFound);
  return Response.json(updated);
});
