import { MEETING_UPLOAD_HEADERS, MEETING_UPLOAD_QUERY } from '@/constants/api-routes';
import { MEETING_COPY } from '@/constants/meetings';
import type { ApiErrorBody, Meeting, MeetingUploadParams } from '@/types';
import { mediaMimeType } from './media';
import { ownerMeetingsApi } from './owner';

function uploadUrl({ owner, meetingDate, title }: MeetingUploadParams) {
  const query = new URLSearchParams({ [MEETING_UPLOAD_QUERY.meetingDate]: meetingDate });
  if (title.trim()) query.set(MEETING_UPLOAD_QUERY.title, title.trim());
  return `${ownerMeetingsApi(owner)}?${query.toString()}`;
}

function readXhrError(xhr: XMLHttpRequest) {
  try {
    const body = JSON.parse(xhr.responseText) as Partial<ApiErrorBody>;
    if (typeof body.error === 'string') return body.error;
  } catch {
    return `${MEETING_COPY.uploadFailed} (${xhr.status})`;
  }
  return `${MEETING_COPY.uploadFailed} (${xhr.status})`;
}

export function uploadMeeting(params: MeetingUploadParams) {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<Meeting>((resolve, reject) => {
    xhr.open('POST', uploadUrl(params));
    xhr.setRequestHeader(MEETING_UPLOAD_HEADERS.contentType, mediaMimeType(params.file));
    xhr.setRequestHeader(MEETING_UPLOAD_HEADERS.fileName, encodeURIComponent(params.file.name));
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) params.onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(readXhrError(xhr)));
        return;
      }
      try {
        resolve(JSON.parse(xhr.responseText) as Meeting);
      } catch {
        reject(new Error(MEETING_COPY.uploadFailed));
      }
    };
    xhr.onerror = () => reject(new Error(MEETING_COPY.uploadFailed));
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'));
    xhr.send(params.file);
  });
  return { promise, abort: () => xhr.abort() };
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
