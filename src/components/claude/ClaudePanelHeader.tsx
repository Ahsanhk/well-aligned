'use client';

import { CircleCheck, Minus, Square } from 'lucide-react';
import { ProjectDot } from '@/components/projects/ProjectDot';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IconButton } from '@/components/ui/IconButton';
import { CLAUDE_COPY } from '@/constants/claude';
import { useDisclosure } from '@/hooks/useDisclosure';
import { isRunActive } from '@/lib/run-progress';
import { useProjectsStore } from '@/store/projects';
import { useRunsStore } from '@/store/runs';
import type { Run } from '@/types';
import { RunStatusPill } from './RunStatusPill';

export function ClaudePanelHeader({ run }: { run: Run }) {
  const project = useProjectsStore((state) => state.projects.find((item) => item.id === run.projectId));
  const minimise = useRunsStore((state) => state.minimisePanel);
  const complete = useRunsStore((state) => state.complete);
  const cancel = useRunsStore((state) => state.cancel);
  const confirm = useDisclosure();
  const isActive = isRunActive(run);

  return (
    <header className="flex items-center gap-2 border-b border-line px-3 py-2.5">
      {project && <ProjectDot color={project.color} />}
      <h2 className="min-w-0 truncate text-sm font-medium text-fg">{project?.name ?? CLAUDE_COPY.panelTitle}</h2>
      <RunStatusPill status={run.status} />
      <div className="ml-auto flex items-center gap-1">
        {isActive && (
          <>
            <Button variant="ghost" size="sm" onClick={() => void complete(run.id)}>
              <CircleCheck size={13} />
              <span className="hidden sm:inline">{CLAUDE_COPY.markDone}</span>
            </Button>
            <Button variant="danger" size="sm" onClick={confirm.open}>
              <Square size={11} fill="currentColor" />
              {CLAUDE_COPY.stop}
            </Button>
          </>
        )}
        <IconButton label={CLAUDE_COPY.minimise} size="sm" onClick={minimise}>
          <Minus size={15} />
        </IconButton>
      </div>
      <ConfirmModal
        open={confirm.isOpen}
        title={CLAUDE_COPY.stopTitle}
        message={CLAUDE_COPY.stopMessage}
        confirmLabel={CLAUDE_COPY.stop}
        onClose={confirm.close}
        onConfirm={() => {
          confirm.close();
          void cancel(run.id);
        }}
      />
    </header>
  );
}
