'use client';

import type { PointerEvent } from 'react';
import { useRunsStore } from '@/store/runs';
import { ClaudePanel } from './ClaudePanel';

interface Props {
  width: number;
  onResizeStart: (event: PointerEvent<HTMLElement>) => void;
}

export function ClaudePanelHost({ width, onResizeStart }: Props) {
  const run = useRunsStore((state) => (state.panelRunId ? state.runs[state.panelRunId] : undefined));
  const isOpen = useRunsStore((state) => state.isPanelOpen);
  if (!run || !isOpen) return null;
  return <ClaudePanel key={run.id} run={run} width={width} onResizeStart={onResizeStart} />;
}
