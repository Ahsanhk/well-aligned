'use client';

import { Bot } from 'lucide-react';
import { CLAUDE_COPY } from '@/constants/claude';
import { useAllRuns } from '@/hooks/useActiveRuns';
import { latestNoteFor } from '@/lib/run-progress';

export function ClaudeNote({ todoId }: { todoId: string }) {
  const runs = useAllRuns();
  const note = latestNoteFor(runs, todoId);
  if (!note) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-violet/25 bg-violet/5 px-3 py-2">
      <Bot size={13} className="mt-0.5 shrink-0 text-violet" />
      <p className="text-[13px] leading-relaxed text-fg/90">
        <span className="mr-1.5 text-[10px] font-medium tracking-wider text-violet uppercase">{CLAUDE_COPY.claudeNote}</span>
        {note}
      </p>
    </div>
  );
}
