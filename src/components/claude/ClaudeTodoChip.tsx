'use client';

import { Bot } from 'lucide-react';
import { CLAUDE_COPY } from '@/constants/claude';
import { useActiveRuns } from '@/hooks/useActiveRuns';
import { cn } from '@/lib/cn';
import { todoRunState } from '@/lib/run-progress';
import { useRunsStore } from '@/store/runs';

export function ClaudeTodoChip({ todoId }: { todoId: string }) {
  const runs = useActiveRuns();
  const openPanel = useRunsStore((state) => state.openPanel);
  const state = todoRunState(runs, todoId);
  if (!state) return null;
  const run = runs.find((item) => item.todoIds.includes(todoId));
  return (
    <button
      type="button"
      onClick={() => run && openPanel(run.id)}
      className={cn(
        'inline-flex h-[18px] shrink-0 cursor-pointer items-center gap-1 rounded-full px-1.5 text-[10px] font-medium',
        state === 'working' ? 'bg-violet/15 text-violet' : 'bg-accent-soft text-accent',
      )}
    >
      <Bot size={10} className={cn(state === 'working' && 'animate-pulse')} />
      {state === 'working' ? CLAUDE_COPY.chipWorking : CLAUDE_COPY.chipQueued}
    </button>
  );
}
