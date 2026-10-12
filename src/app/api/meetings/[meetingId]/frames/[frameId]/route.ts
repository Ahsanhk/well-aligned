import { API_ERRORS } from '@/constants/api-errors';
import { FRAME_CACHE_CONTROL, FRAME_MIME_TYPE, MEETING_API_ERRORS } from '@/constants/meeting';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { getMeeting } from '@/lib/meetings-db';
import { downloadScreenshotObject } from '@/lib/uploads';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ meetingId: string; frameId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, _request: Request, { params }: Context) => {
  const { meetingId, frameId } = await params;
  const meeting = await getMeeting(supabase, meetingId);
  if (!meeting) return jsonError(404, MEETING_API_ERRORS.meetingNotFound);
  const frame = meeting.suggestions.flatMap((suggestion) => suggestion.frames).find((item) => item.id === frameId);
  if (!frame) return jsonError(404, MEETING_API_ERRORS.frameNotFound);
  const blob = await downloadScreenshotObject(frame.storagePath);
  if (!blob) return jsonError(404, API_ERRORS.screenshotFileMissing);
  return new Response(blob.stream(), {
    headers: {
      'Content-Type': FRAME_MIME_TYPE,
      'Content-Length': String(blob.size),
      'Cache-Control': FRAME_CACHE_CONTROL,
      'Content-Disposition': `inline; filename="${frame.id}.jpg"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
