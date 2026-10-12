'use client';

import { useMeetingDetail } from '@/hooks/useMeetingDetail';
import { isMeetingActive } from '@/lib/meeting-stats';
import type { ItemOwner } from '@/types';
import { MeetingDetailHeader } from './MeetingDetailHeader';
import { MeetingDetailSkeleton } from './MeetingDetailSkeleton';
import { MeetingFailedState } from './MeetingFailedState';
import { MeetingNotFound } from './MeetingNotFound';
import { MeetingProcessingState } from './MeetingProcessingState';
import { MeetingSummary } from './MeetingSummary';
import { SuggestionReview } from './SuggestionReview';
import { TranscriptViewer } from './TranscriptViewer';

interface Props {
  owner: ItemOwner;
  meetingId: string;
}

export function MeetingDetailView({ owner, meetingId }: Props) {
  const { meeting, status } = useMeetingDetail(meetingId);

  if (!meeting) {
    if (status === 'missing' || status === 'error') return <MeetingNotFound owner={owner} />;
    return <MeetingDetailSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <MeetingDetailHeader meeting={meeting} />
      {isMeetingActive(meeting) && (
        <div className="rounded-xl border border-line bg-surface">
          <MeetingProcessingState startedAt={meeting.createdAt} fileName={meeting.videoName} />
        </div>
      )}
      {meeting.status === 'failed' && <MeetingFailedState meeting={meeting} />}
      {meeting.status === 'ready' && (
        <>
          <MeetingSummary summary={meeting.summary} />
          <SuggestionReview key={meeting.id} meeting={meeting} />
          <TranscriptViewer meeting={meeting} />
        </>
      )}
    </div>
  );
}
