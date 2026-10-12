'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MEETING_COPY, MEETING_MAX_BYTES } from '@/constants/meetings';
import { errorMessage } from '@/lib/api-client';
import { todayKey } from '@/lib/date';
import { isMeetingActive } from '@/lib/meeting-stats';
import { isMediaFile } from '@/lib/media';
import { isAbortError, uploadMeeting } from '@/lib/meeting-upload';
import { useMeetingsStore } from '@/store/meetings';
import { toastError } from '@/store/toast';
import type { ItemOwner, MeetingUploadPhase } from '@/types';

export function useMeetingUpload(owner: ItemOwner) {
  const addUploaded = useMeetingsStore((state) => state.addUploaded);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(todayKey);
  const [phase, setPhase] = useState<MeetingUploadPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const processingMeeting = useMeetingsStore((state) =>
    meetingId ? state.meetings.find((meeting) => meeting.id === meetingId) ?? null : null,
  );

  useEffect(() => () => abortRef.current?.(), []);

  const reset = useCallback(() => {
    setFile(null);
    setTitle('');
    setProgress(0);
    setError(null);
    setMeetingId(null);
    setPhase('idle');
  }, []);

  useEffect(() => {
    if (phase !== 'processing') return;
    if (!processingMeeting || !isMeetingActive(processingMeeting)) reset();
  }, [phase, processingMeeting, reset]);

  const pick = useCallback((files: File[]) => {
    const candidate = files.find(isMediaFile);
    if (!candidate) {
      toastError(MEETING_COPY.unsupported);
      return;
    }
    if (candidate.size > MEETING_MAX_BYTES) {
      toastError(MEETING_COPY.tooLarge);
      return;
    }
    setFile(candidate);
    setError(null);
    setPhase('idle');
  }, []);

  const start = useCallback(async () => {
    if (!file || !meetingDate || phase === 'uploading') return;
    setPhase('uploading');
    setProgress(0);
    setError(null);
    const upload = uploadMeeting({ owner, file, meetingDate, title, onProgress: setProgress });
    abortRef.current = upload.abort;
    try {
      const meeting = await upload.promise;
      abortRef.current = null;
      setProgress(1);
      setMeetingId(meeting.id);
      addUploaded(meeting);
      setPhase('processing');
    } catch (caught) {
      abortRef.current = null;
      if (isAbortError(caught)) {
        setPhase('idle');
        setProgress(0);
        return;
      }
      const message = errorMessage(caught);
      setError(message);
      setPhase('error');
      toastError(message);
    }
  }, [file, meetingDate, phase, owner, title, addUploaded]);

  const cancel = useCallback(() => abortRef.current?.(), []);

  return {
    file,
    pick,
    clearFile: reset,
    title,
    setTitle,
    meetingDate,
    setMeetingDate,
    phase,
    progress,
    error,
    processingMeeting,
    start,
    cancel,
    reset,
  };
}
