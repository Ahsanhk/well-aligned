import 'server-only';
import { after } from 'next/server';
import { API_ERRORS } from '@/constants/api-errors';
import { MEETING_API_ERRORS, MEETING_TITLE_MAX_LENGTH, RECORDING_FILE_NAME_HEADER, RECORDING_MAX_BYTES } from '@/constants/meeting';
import type { ItemOwner, Meeting } from '@/types';
import { invalidInput, jsonError } from './api-response';
import type { ApiSession } from './api-session';
import { ownerExists } from './db';
import { newId } from './ids';
import { ownerInsertColumns } from './mappers';
import { processMeeting } from './meeting-processor';
import { createMeeting } from './meetings-db';
import {
  defaultMeetingTitle,
  deleteRecording,
  RecordingTooLargeError,
  resolveRecordingMedia,
  sanitizeRecordingName,
  saveRecordingStream,
} from './recordings';
import { meetingUploadQuerySchema } from './schemas';

function readFileName(request: Request): string | null {
  try {
    return sanitizeRecordingName(decodeURIComponent(request.headers.get(RECORDING_FILE_NAME_HEADER) ?? ''));
  } catch {
    return null;
  }
}

export function ownerNotFound(owner: ItemOwner): Response {
  return jsonError(404, owner.kind === 'project' ? API_ERRORS.projectNotFound : API_ERRORS.groupNotFound);
}

export async function handleMeetingUpload({ supabase, user }: ApiSession, request: Request, owner: ItemOwner): Promise<Response> {
  const searchParams = new URL(request.url).searchParams;
  const query = meetingUploadQuerySchema.safeParse({
    meetingDate: searchParams.get('meetingDate') ?? undefined,
    title: searchParams.get('title') ?? undefined,
  });
  if (!query.success) return invalidInput(query.error);
  if (!(await ownerExists(supabase, owner))) return ownerNotFound(owner);

  const videoName = readFileName(request);
  if (!videoName) return jsonError(400, MEETING_API_ERRORS.invalidFileName);
  const media = resolveRecordingMedia(request.headers.get('content-type'), videoName);
  if (!media) return jsonError(415, MEETING_API_ERRORS.unsupportedMedia);
  const declaredSize = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredSize) && declaredSize > RECORDING_MAX_BYTES) return jsonError(413, MEETING_API_ERRORS.tooLarge);
  if (!request.body) return jsonError(400, MEETING_API_ERRORS.missingBody);

  const meetingId = newId();
  let videoSize: number;
  try {
    videoSize = await saveRecordingStream(request.body, meetingId, media.extension, RECORDING_MAX_BYTES);
  } catch (error) {
    if (error instanceof RecordingTooLargeError) return jsonError(413, MEETING_API_ERRORS.tooLarge);
    if (request.signal.aborted) return jsonError(400, MEETING_API_ERRORS.uploadAborted);
    throw error;
  }
  if (videoSize === 0) {
    await deleteRecording(meetingId);
    return jsonError(400, MEETING_API_ERRORS.missingBody);
  }

  let meeting: Meeting;
  try {
    meeting = await createMeeting(supabase, {
      id: meetingId,
      user_id: user.id,
      ...ownerInsertColumns(owner),
      title: (query.data.title || defaultMeetingTitle(videoName, query.data.meetingDate)).slice(0, MEETING_TITLE_MAX_LENGTH),
      meeting_date: query.data.meetingDate,
      video_name: videoName,
      video_size: videoSize,
      status: 'processing',
    });
  } catch (error) {
    await deleteRecording(meetingId);
    throw error;
  }

  after(() => processMeeting(meetingId));
  return Response.json(meeting, { status: 201 });
}
