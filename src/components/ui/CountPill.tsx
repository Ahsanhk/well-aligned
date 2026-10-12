import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'accent' | 'urgent' | 'quiet';

interface Props {
  count: number;
  tone?: Tone;
  icon?: ReactNode;
  title?: string;
  className?: string;
}

const TONES: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent',
  urgent: 'bg-amber/15 text-amber ring-1 ring-amber/25',
  quiet: 'bg-elevated text-subtle',
};

export function CountPill({ count, tone = 'accent', icon, title, className }: Props) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center gap-1 rounded-full px-1.5 text-[11px] leading-none font-medium tabular-nums',
        TONES[tone],
        className,
      )}
    >
      {tone === 'urgent' && <span className="h-1.5 w-1.5 rounded-full bg-amber" />}
      {icon}
      {count}
    </span>
  );
}
