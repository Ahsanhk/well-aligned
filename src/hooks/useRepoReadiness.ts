'use client';

import { CLAUDE_COPY, SEND_COPY } from '@/constants/claude';
import { useProjectsStore } from '@/store/projects';

export function useRepoReadiness(projectId: string) {
  const repoPath = useProjectsStore((state) => state.projects.find((project) => project.id === projectId)?.repoPath ?? '');
  if (!projectId) return { isReady: false, reason: SEND_COPY.pickRepo };
  if (!repoPath.trim()) return { isReady: false, reason: CLAUDE_COPY.repoMissing };
  return { isReady: true, reason: null };
}
