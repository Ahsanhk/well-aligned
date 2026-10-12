import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'neutral' | 'accent' | 'indigo' | 'violet' | 'success' | 'danger' | 'amber' | 'sky';

interface Props {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-elevated text-muted border-line',
  accent: 'bg-accent/10 text-accent border-accent/25',
  indigo: 'bg-indigo/10 text-indigo border-indigo/25',
  violet: 'bg-violet/10 text-violet border-violet/25',
  success: 'bg-success/10 text-success border-success/25',
  danger: 'bg-danger/10 text-danger border-danger/25',
  amber: 'bg-amber/10 text-amber border-amber/25',
  sky: 'bg-sky/10 text-sky border-sky/25',
};

export function Badge({ tone = 'neutral', icon, children, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-md border px-1.5 text-[11px] font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
