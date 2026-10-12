import { NEXT_STATUS, STATUS_META } from '@/constants/status';
import { cn } from '@/lib/cn';
import type { TodoStatus } from '@/types';

interface Props {
  status: TodoStatus;
  onCycle: () => void;
}

export function StatusToggle({ status, onCycle }: Props) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const nextLabel = STATUS_META[NEXT_STATUS[status]].label;
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`${meta.label}. Mark as ${nextLabel}`}
      title={`${meta.label} → ${nextLabel}`}
      className={cn(
        'flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-150 active:scale-90',
        meta.className,
      )}
    >
      <Icon size={18} strokeWidth={status === 'open' ? 1.75 : 2.25} />
    </button>
  );
}
