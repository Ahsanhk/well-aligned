import type { ProjectGroupSummary, ProjectSection, ProjectSummary } from '@/types';

export function buildProjectSections(projects: ProjectSummary[], groups: ProjectGroupSummary[]): ProjectSection[] {
  const groupIds = new Set(groups.map((group) => group.id));
  const grouped = groups.map((group) => ({ group, projects: projects.filter((project) => project.groupId === group.id) }));
  const ungrouped = projects.filter((project) => !project.groupId || !groupIds.has(project.groupId));
  return ungrouped.length > 0 || groups.length === 0 ? [...grouped, { group: null, projects: ungrouped }] : grouped;
}

export function sectionOpenCount(section: ProjectSection) {
  const projectOpen = section.projects.reduce((total, project) => total + project.openCount, 0);
  return projectOpen + (section.group?.sharedOpenCount ?? 0);
}

export function sectionBacklogCount(section: ProjectSection) {
  const projectBacklog = section.projects.reduce((total, project) => total + (project.backlogOpenCount ?? 0), 0);
  return projectBacklog + (section.group?.sharedBacklogOpenCount ?? 0);
}

export function sectionHasHighPriority(section: ProjectSection) {
  return section.projects.some((project) => (project.highPriorityOpenCount ?? 0) > 0);
}
