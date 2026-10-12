'use client';

import { useEffect, useRef, useState } from 'react';
import type { ClaudeSendRequest, RunMode } from '@/types';
import { usePromptGeneration } from './usePromptGeneration';
import { useStartRun } from './useStartRun';

export function useSendToClaude(request: ClaudeSendRequest, projectOptions: { id: string; name: string }[]) {
  const { startRun, isStarting } = useStartRun();
  const [projectId, setProjectId] = useState(request.projectId ?? projectOptions[0]?.id ?? '');
  const [mode, setMode] = useState<RunMode>(request.mode);
  const generation = usePromptGeneration(projectId, request.todoIds, { silent: true });
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!projectId || requestedFor.current === projectId) return;
    requestedFor.current = projectId;
    void generation.generate();
  }, [projectId, generation]);

  const isReady = Boolean(projectId) && generation.status === 'done' && generation.text.trim().length > 0;

  const send = async () => {
    if (!isReady) return;
    await startRun({ projectId, todoIds: request.todoIds, mode, prompt: generation.text });
  };

  return { projectId, setProjectId, mode, setMode, generation, isReady, isStarting, send };
}
