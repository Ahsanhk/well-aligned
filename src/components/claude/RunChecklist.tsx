'use client';

import { Circle, CircleCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { CLAUDE_COPY } from '@/constants/claude';
import { cn } from '@/lib/cn';
import { doneCount, progressFor } from '@/lib/run-progress';
import { useTodosStore } from '@/store/todos';
import type { Run } from '@/types';

export function RunChecklist({ run }: { run: Run }) {
  const todos = useTodosStore((state) => state.todos);
  const done = doneCount(run);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] text-subtle">
        <span className="font-medium tracking-wider uppercase">Tasks</span>
        <span className="tabular-nums">
          {done}/{run.todoIds.length}
        </span>
      </div>
      <ol className="flex max-h-44 flex-col gap-0.5 overflow-y-auto">
        {run.todoIds.map((todoId, index) => {
          const progress = progressFor(run, todoId);
          const status = progress?.status ?? 'pending';
          const title = todos.find((todo) => todo.id === todoId)?.title ?? `${CLAUDE_COPY.pendingTask} ${index + 1}`;
          return (
            <li key={todoId} className="flex items-start gap-2 rounded-md px-1.5 py-1 text-[13px]">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                {status === 'done' ? (
                  <CircleCheck size={15} className="text-success" />
                ) : status === 'working' ? (
                  <Spinner size={13} className="text-violet" />
                ) : (
                  <Circle size={14} className="text-subtle" />
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className={cn('truncate', status === 'done' ? 'text-muted' : 'text-fg')}>{title}</span>
                {progress?.note && <span className="text-xs text-subtle">{progress.note}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
