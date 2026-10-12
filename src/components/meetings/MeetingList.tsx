'use client';

import { Video } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { MEETING_COPY } from '@/constants/meetings';
import { useMeetingsPolling } from '@/hooks/useMeetingsPolling';
import { useMeetingsStore } from '@/store/meetings';
import { MeetingCard } from './MeetingCard';
import { MeetingListSkeleton } from './MeetingListSkeleton';

export function MeetingList() {
  const meetings = useMeetingsStore((state) => state.meetings);
  const status = useMeetingsStore((state) => state.status);
  const error = useMeetingsStore((state) => state.error);
  useMeetingsPolling();

  if ((status === 'idle' || status === 'loading') && meetings.length === 0) return <MeetingListSkeleton />;
  if (status === 'error' && meetings.length === 0) return <p className="text-sm text-danger">{error}</p>;
  if (meetings.length === 0) {
    return <EmptyState icon={<Video size={22} />} title={MEETING_COPY.emptyTitle} description={MEETING_COPY.emptyDescription} />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </ul>
  );
}
