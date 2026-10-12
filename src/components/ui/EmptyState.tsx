import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-line px-6 py-14 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-elevated text-accent shadow-[0_0_24px_-8px_var(--color-accent)]">
        {icon}
      </div>
      <div className="max-w-sm">
        <p className="font-medium text-fg">{title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
