'use client';

import Link from 'next/link';
import { Video } from 'lucide-react';
import { formatMeetingLabel } from '@/lib/date';
import { ownerMeetingRoute, todoOwner } from '@/lib/owner';
import { sharedMeetingId } from '@/lib/todo-filter';
import { useMeetingsStore } from '@/store/meetings';
import type { MeetingGroup } from '@/types';
import { TodoGroup } from './TodoGroup';

export function MeetingGroupSection({ group }: { group: MeetingGroup }) {
  const meetingId = sharedMeetingId(group.todos);
  const meetingTitle = useMeetingsStore((state) =>
    meetingId ? state.meetings.find((meeting) => meeting.id === meetingId)?.title || null : null,
  );
  const first = group.todos[0];

  return (
    <TodoGroup
      todos={group.todos}
      title={
        <>
          <span className="font-medium text-fg/90">{formatMeetingLabel(group.meetingDate)}</span>
          {meetingId && first && (
            <Link
              href={ownerMeetingRoute(todoOwner(first), meetingId)}
              className="inline-flex min-w-0 items-center gap-1 text-subtle transition-colors hover:text-indigo"
            >
              <span>·</span>
              <Video size={11} className="shrink-0" />
              <span className="truncate">{meetingTitle ?? 'Meeting'}</span>
            </Link>
          )}
        </>
      }
    />
  );
}
