'use client';

import Link from 'next/link';
import { ChevronRight, FileText, ListChecks, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatMeetingLabel } from '@/lib/date';
import { formatBytes } from '@/lib/images';
import { isMeetingActive, pendingSuggestionCount } from '@/lib/meeting-stats';
import { meetingOwner, ownerMeetingRoute } from '@/lib/owner';
import { useMeetingsStore } from '@/store/meetings';
import type { MeetingListItem } from '@/types';
import { MeetingStatusPill } from './MeetingStatusPill';

export function MeetingCard({ meeting }: { meeting: MeetingListItem }) {
  const retry = useMeetingsStore((state) => state.retry);
  const pending = pendingSuggestionCount(meeting);
  const isReady = meeting.status === 'ready';

  return (
    <li className="group relative rounded-xl border border-line bg-surface transition-[border-color,background-color] duration-150 hover:border-line-strong hover:bg-elevated/30">
      <Link
        href={ownerMeetingRoute(meetingOwner(meeting), meeting.id)}
        className="flex items-start gap-3 p-4 after:absolute after:inset-0 after:rounded-xl"
        aria-label={`Open ${meeting.title || meeting.videoName}`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-medium text-fg">{meeting.title || meeting.videoName}</h3>
            <MeetingStatusPill status={meeting.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>{formatMeetingLabel(meeting.meetingDate)}</span>
            {isReady && (
              <span className={cn('inline-flex items-center gap-1', pending > 0 ? 'text-accent' : 'text-subtle')}>
                <ListChecks size={12} />
                {pending > 0 ? `${pending} to review` : 'All reviewed'}
              </span>
            )}
            {isReady && meeting.segmentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-subtle">
                <FileText size={12} />
                {meeting.segmentCount} lines
              </span>
            )}
            {meeting.videoSize > 0 && <span className="text-subtle">{formatBytes(meeting.videoSize)}</span>}
            {isMeetingActive(meeting) && <span className="text-violet">Gemini is watching…</span>}
          </div>
          {meeting.status === 'failed' && meeting.error && (
            <p className="line-clamp-2 text-xs text-danger/90">{meeting.error}</p>
          )}
        </div>
        <ChevronRight size={16} className="mt-0.5 shrink-0 text-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-fg" />
      </Link>
      {meeting.status === 'failed' && (
        <div className="relative z-10 flex justify-end border-t border-line px-4 py-2">
          <Button variant="secondary" size="sm" onClick={() => void retry(meeting.id)}>
            <RotateCcw size={13} />
            Retry
          </Button>
        </div>
      )}
    </li>
  );
}
