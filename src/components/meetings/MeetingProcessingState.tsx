'use client';

import { Sparkles } from 'lucide-react';
import { MEETING_COPY } from '@/constants/meetings';
import { useElapsedSeconds } from '@/hooks/useElapsedSeconds';
import { formatClock } from '@/lib/timestamp';

interface Props {
  startedAt: string;
  fileName: string;
}

export function MeetingProcessingState({ startedAt, fileName }: Props) {
  const elapsed = useElapsedSeconds(startedAt);
  return (
    <div className="animate-fade-in flex flex-col items-center gap-4 px-6 py-10 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-violet/15" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-violet/30 bg-violet/10 text-violet shadow-[0_0_32px_-8px_var(--color-violet)]">
          <Sparkles size={22} />
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="font-medium text-fg">{MEETING_COPY.processingTitle}</p>
        <p className="font-mono text-sm text-violet tabular-nums">{formatClock(elapsed)} elapsed</p>
        <p className="max-w-sm truncate text-xs text-subtle">{fileName}</p>
      </div>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-elevated">
        <div className="animate-indeterminate h-full w-1/3 rounded-full bg-gradient-to-r from-violet to-accent" />
      </div>
      <p className="max-w-sm text-xs leading-relaxed text-muted">{MEETING_COPY.processingNote}</p>
    </div>
  );
}
