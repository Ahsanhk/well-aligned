import { cn } from '@/lib/cn';

interface Props {
  percent: number;
  barClassName?: string;
  className?: string;
}

export function ProgressBar({ percent, barClassName, className }: Props) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1 w-full overflow-hidden rounded-full bg-elevated', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-300 ease-out', barClassName ?? 'bg-accent')}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
