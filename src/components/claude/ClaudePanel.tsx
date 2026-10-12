'use client';

import type { PointerEvent } from 'react';
import { isRunActive } from '@/lib/run-progress';
import type { Run } from '@/types';
import { ClaudePanelHeader } from './ClaudePanelHeader';
import { ClaudeTerminal } from './ClaudeTerminal';
import { QueueInstructions } from './QueueInstructions';
import { RunChecklist } from './RunChecklist';
import { RunResult } from './RunResult';

interface Props {
  run: Run;
  width: number;
  onResizeStart: (event: PointerEvent<HTMLElement>) => void;
}

export function ClaudePanel({ run, width, onResizeStart }: Props) {
  const isActive = isRunActive(run);
  const showTerminal = run.mode === 'terminal' && run.status !== 'cancelled';

  return (
    <aside
      aria-label="Claude panel"
      style={{ '--dock-width': `${width}px` } as React.CSSProperties}
      className="animate-slide-up fixed inset-x-0 bottom-0 z-40 flex h-[78dvh] flex-col rounded-t-2xl border-t border-line-strong bg-surface shadow-2xl shadow-black/60 lg:inset-x-auto lg:top-0 lg:right-0 lg:h-dvh lg:w-[var(--dock-width)] lg:rounded-none lg:border-t-0 lg:border-l"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        onPointerDown={onResizeStart}
        className="absolute inset-y-0 -left-1 hidden w-2 cursor-col-resize transition-colors hover:bg-accent/30 lg:block"
      />
      <ClaudePanelHeader run={run} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <RunChecklist run={run} />
        {run.status === 'done' && <RunResult run={run} />}
        {run.mode === 'queue' && isActive && <QueueInstructions />}
        {showTerminal && <ClaudeTerminal runId={run.id} />}
      </div>
    </aside>
  );
}
