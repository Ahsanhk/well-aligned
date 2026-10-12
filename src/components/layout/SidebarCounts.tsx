import { NotebookPen } from 'lucide-react';
import { CountPill } from '@/components/ui/CountPill';
import { BACKLOG_COPY } from '@/constants/backlog';
import { OPEN_PILL_TITLE } from '@/constants/groups';

interface Props {
  open: number;
  backlog: number;
  urgent: boolean;
}

export function SidebarCounts({ open, backlog, urgent }: Props) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {open > 0 && <CountPill count={open} tone={urgent ? 'urgent' : 'accent'} title={OPEN_PILL_TITLE(open, urgent)} />}
      {backlog > 0 && (
        <CountPill count={backlog} tone="quiet" icon={<NotebookPen size={9} />} title={BACKLOG_COPY.inBacklog(backlog)} />
      )}
    </span>
  );
}
