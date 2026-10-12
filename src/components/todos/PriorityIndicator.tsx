import { Flag } from 'lucide-react';
import { PRIORITY_FLAG_CLASSES, PRIORITY_LABELS } from '@/constants/priority';
import { cn } from '@/lib/cn';
import type { TodoPriority } from '@/types';

export function PriorityIndicator({ priority }: { priority: TodoPriority }) {
  const className = PRIORITY_FLAG_CLASSES[priority];
  if (!className) return null;
  const label = `${PRIORITY_LABELS[priority]} priority`;
  return (
    <span title={label} aria-label={label} className={cn('inline-flex shrink-0 items-center gap-1 text-[11px] font-medium', className)}>
      <Flag size={11} fill={priority === 'high' ? 'currentColor' : 'none'} />
      {priority === 'high' && PRIORITY_LABELS[priority]}
    </span>
  );
}
