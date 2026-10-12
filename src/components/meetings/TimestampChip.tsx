import { Clock } from 'lucide-react';

export function TimestampChip({ timestamp }: { timestamp: string }) {
  return (
    <span className="inline-flex h-5 shrink-0 items-center gap-1 rounded-md border border-line bg-sunken px-1.5 font-mono text-[11px] text-muted tabular-nums">
      <Clock size={10} />
      {timestamp}
    </span>
  );
}
