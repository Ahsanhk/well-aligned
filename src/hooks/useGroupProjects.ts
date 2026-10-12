'use client';

import { useMemo } from 'react';
import { useProjectsStore } from '@/store/projects';

export function useGroupProjects(groupId: string | null) {
  const projects = useProjectsStore((state) => state.projects);
  return useMemo(() => (groupId ? projects.filter((project) => project.groupId === groupId) : []), [projects, groupId]);
}
