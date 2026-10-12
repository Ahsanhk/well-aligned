import { CircleAlert, CircleCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { MEETING_STATUS_META } from '@/constants/meetings';
import { isMeetingActive } from '@/lib/meeting-stats';
import type { MeetingStatus } from '@/types';

export function MeetingStatusPill({ status }: { status: MeetingStatus }) {
  const meta = MEETING_STATUS_META[status];
  const icon = isMeetingActive({ status }) ? (
    <Spinner size={10} />
  ) : status === 'failed' ? (
    <CircleAlert size={10} />
  ) : (
    <CircleCheck size={10} />
  );
  return (
    <Badge tone={meta.tone} icon={icon}>
      {meta.label}
    </Badge>
  );
}
