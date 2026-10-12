'use client';

import { useGroupsStore } from '@/store/groups';
import { useProjectsStore } from '@/store/projects';
import type { ItemOwner, ProjectColor } from '@/types';

export function useOwnerInfo(owner: ItemOwner): { name: string; color: ProjectColor } | null {
  const project = useProjectsStore((state) =>
    owner.kind === 'project' ? state.projects.find((item) => item.id === owner.id) : undefined,
  );
  const group = useGroupsStore((state) =>
    owner.kind === 'group' ? state.groups.find((item) => item.id === owner.id) : undefined,
  );
  const found = project ?? group;
  return found ? { name: found.name, color: found.color } : null;
}
