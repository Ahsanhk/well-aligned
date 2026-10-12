import type { ProjectColor } from './project';

export interface ProjectGroup {
  id: string;
  name: string;
  description: string;
  color: ProjectColor;
  createdAt: string;
  updatedAt: string;
}

export type ProjectGroupInput = Pick<ProjectGroup, 'name' | 'description' | 'color'>;

export interface ProjectGroupSummary extends ProjectGroup {
  projectIds: string[];
  sharedOpenCount: number;
  sharedBacklogOpenCount: number;
}

export type TodoMoveTarget = { projectId: string; groupId?: never } | { groupId: string; projectId?: never };
