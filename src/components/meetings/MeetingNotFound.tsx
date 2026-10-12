import Link from 'next/link';
import { VideoOff } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ownerTabRoute } from '@/lib/owner';
import type { ItemOwner } from '@/types';
import { MEETING_COPY } from '@/constants/meetings';

export function MeetingNotFound({ owner }: { owner: ItemOwner }) {
  return (
    <EmptyState
      className="py-20"
      icon={<VideoOff size={22} />}
      title={MEETING_COPY.notFoundTitle}
      description={MEETING_COPY.notFoundDescription}
      action={
        <Link
          href={ownerTabRoute(owner, 'meetings')}
          className="inline-flex h-9 items-center rounded-lg border border-line bg-elevated px-3.5 text-sm font-medium text-fg transition-colors hover:border-line-strong"
        >
          Back to meetings
        </Link>
      }
    />
  );
}
