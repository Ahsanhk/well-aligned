import { MEETING_API_ERRORS, TRANSCRIPT_CONTENT_TYPES, TRANSCRIPT_FILE_SUFFIX } from '@/constants/meeting';
import { jsonError } from '@/lib/api-response';
import { withSession, type ApiSession } from '@/lib/api-session';
import { getMeeting } from '@/lib/meetings-db';
import { transcriptFormatSchema } from '@/lib/schemas';
import { toSlug } from '@/lib/slug';
import { buildTranscriptJson, buildTranscriptMarkdown } from '@/lib/transcript-export';

export const runtime = 'nodejs';

interface Context {
  params: Promise<{ meetingId: string }>;
}

export const GET = withSession(async ({ supabase }: ApiSession, request: Request, { params }: Context) => {
  const meeting = await getMeeting(supabase, (await params).meetingId);
  if (!meeting) return jsonError(404, MEETING_API_ERRORS.meetingNotFound);
  if (meeting.status !== 'ready') return jsonError(409, MEETING_API_ERRORS.notReady);
  const format = transcriptFormatSchema.parse(new URL(request.url).searchParams.get('format'));
  const body = format === 'json' ? buildTranscriptJson(meeting) : buildTranscriptMarkdown(meeting);
  return new Response(body, {
    headers: {
      'Content-Type': TRANSCRIPT_CONTENT_TYPES[format],
      'Content-Disposition': `attachment; filename="${toSlug(meeting.title)}${TRANSCRIPT_FILE_SUFFIX}.${format}"`,
      'Cache-Control': 'no-store',
    },
  });
});
