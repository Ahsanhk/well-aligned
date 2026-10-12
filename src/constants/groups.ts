import type { ProjectTab } from '@/types';

export const GROUP_TAB_LABELS: Record<ProjectTab, string> = {
  todos: 'Shared todos',
  backlog: 'Shared backlog',
  meetings: 'Group meetings',
};

export const NO_GROUP_VALUE = '';

export const NEW_GROUP_VALUE = '__new__';

export const UNGROUPED_KEY = 'ungrouped';

export const SIDEBAR_COLLAPSE_STORAGE_KEY = 'meeting-tasks:sidebar-collapsed-groups';

export const GROUP_COPY = {
  newGroup: 'New group',
  editGroup: 'Edit group',
  ungrouped: 'Ungrouped',
  noGroup: 'No group',
  createGroupOption: '+ New group…',
  groupField: 'Group',
  groupNamePlaceholder: 'Client name or product family',
  groupDescription: 'Projects in a group can share todos, backlog items and meetings.',
  deleteTitle: 'Delete group?',
  deleteMessage: (name: string) =>
    `“${name}” will be deleted. Its projects become ungrouped (they are kept), but shared todos, shared backlog items and group meetings are permanently deleted.`,
  sharedPrefix: 'Shared',
  openGroup: 'Open group',
  projectsHeading: 'Projects',
  noProjects: 'No projects in this group yet. Use “Move to group” on a project, or pick this group in the project form.',
  moveToGroup: 'Move to group',
  moveToProject: 'Move to project',
  notFoundTitle: 'Group not found',
  notFoundDescription: 'It may have been deleted, or the link is wrong.',
  promptRepo: 'Working in repo',
  promptRepoHint: 'Shared items need a project to generate the prompt in.',
  promptNoProjects: 'Add a project to this group to generate prompts.',
  target: 'Target',
  targetShared: 'Shared',
} as const;

export const DELETE_COPY = {
  delete: 'Delete',
  deleteTodo: 'Delete todo',
  bulkTitle: (count: number) => `Delete ${count} todo${count === 1 ? '' : 's'}?`,
  bulkConfirm: (count: number) => `Delete ${count}`,
  bulkMessage: 'They and their screenshots will be permanently deleted.',
} as const;

export const OPEN_PILL_TITLE = (count: number, urgent: boolean) =>
  `${count} open${urgent ? ' · includes high priority' : ''}`;

export const HIGH_PRIORITY_TITLE = (count: number) => `${count} high-priority open`;
