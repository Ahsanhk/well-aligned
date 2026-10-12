'use client';

import { useMemo } from 'react';
import { GROUP_COPY } from '@/constants/groups';
import { useGroupsStore } from '@/store/groups';
import { useProjectsStore } from '@/store/projects';
import type { MoveOption, Todo } from '@/types';

export function useTodoMoveOptions(todo: Todo) {
  const projects = useProjectsStore((state) => state.projects);
  const groups = useGroupsStore((state) => state.groups);

  return useMemo<{ heading: string; options: MoveOption[] }>(() => {
    if (todo.projectId) {
      const groupId = projects.find((project) => project.id === todo.projectId)?.groupId ?? null;
      const group = groupId ? groups.find((item) => item.id === groupId) : null;
      if (!groupId) return { heading: GROUP_COPY.moveToGroup, options: [] };
      return {
        heading: GROUP_COPY.moveToGroup,
        options: [{ key: groupId, label: group ? `${GROUP_COPY.sharedPrefix} · ${group.name}` : GROUP_COPY.moveToGroup, target: { groupId } }],
      };
    }
    const siblings = projects.filter((project) => project.groupId && project.groupId === todo.groupId);
    return {
      heading: GROUP_COPY.moveToProject,
      options: siblings.map((project) => ({ key: project.id, label: project.name, target: { projectId: project.id } })),
    };
  }, [todo.projectId, todo.groupId, projects, groups]);
}
