'use client';

import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CLAUDE_COPY } from '@/constants/claude';
import { useActiveRuns } from '@/hooks/useActiveRuns';
import { useRunsStore } from '@/store/runs';
import { RunPulseDot } from './RunPulseDot';

export function ActiveRunButton({ projectId }: { projectId: string }) {
  const run = useActiveRuns().find((item) => item.projectId === projectId);
  const openPanel = useRunsStore((state) => state.openPanel);
  if (!run) return null;
  return (
    <Button variant="secondary" onClick={() => openPanel(run.id)} className="border-violet/40">
      <RunPulseDot />
      <Bot size={14} className="text-violet" />
      {run.status === 'queued' ? CLAUDE_COPY.queuedRun : CLAUDE_COPY.activeRun}
    </Button>
  );
}
