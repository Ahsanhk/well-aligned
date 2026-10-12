'use client';

import { useEffect } from 'react';
import { MEETING_POLL_INTERVAL_MS } from '@/constants/meetings';
import { isMeetingActive } from '@/lib/meeting-stats';
import { useMeetingsStore } from '@/store/meetings';

export function useMeetingDetail(meetingId: string) {
  const meeting = useMeetingsStore((state) => state.details[meetingId]);
  const status = useMeetingsStore((state) => state.detailStatus[meetingId] ?? 'idle');
  const fetchMeeting = useMeetingsStore((state) => state.fetchMeeting);
  const isActive = meeting ? isMeetingActive(meeting) : false;

  useEffect(() => {
    void fetchMeeting(meetingId);
  }, [meetingId, fetchMeeting]);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => void fetchMeeting(meetingId), MEETING_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isActive, meetingId, fetchMeeting]);

  return { meeting, status };
}
