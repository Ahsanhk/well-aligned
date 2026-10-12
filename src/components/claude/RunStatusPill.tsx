import { CircleCheck, CircleSlash } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { RUN_STATUS_META } from '@/constants/claude';
import type { RunStatus } from '@/types';

export function RunStatusPill({ status }: { status: RunStatus }) {
  const meta = RUN_STATUS_META[status];
  const icon =
    status === 'done' ? <CircleCheck size={10} /> : status === 'cancelled' ? <CircleSlash size={10} /> : <Spinner size={10} />;
  return (
    <Badge tone={meta.tone} icon={icon}>
      {meta.label}
    </Badge>
  );
}
