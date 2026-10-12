'use client';

import { useEffect, useMemo } from 'react';
import { WorkspaceBody } from '@/components/workspace/WorkspaceBody';
import { WorkspaceTabs } from '@/components/workspace/WorkspaceTabs';
import { useWorkspaceTab } from '@/hooks/useWorkspaceTab';
import { projectOwner } from '@/lib/owner';
import { useGroupsStore } from '@/store/groups';
import { useMeetingsStore } from '@/store/meetings';
import { useProjectsStore } from '@/store/projects';
import { usePromptPanelStore } from '@/store/prompt-panel';
import { useSelectionStore } from '@/store/selection';
import { useTodosStore } from '@/store/todos';
import type { ProjectTab } from '@/types';
import { ProjectHeader } from './ProjectHeader';
import { ProjectNotFound } from './ProjectNotFound';
import { ProjectViewSkeleton } from './ProjectViewSkeleton';

interface Props {
  projectId: string;
  initialTab: ProjectTab;
}

export function ProjectView({ projectId, initialTab }: Props) {
  const { tab, changeTab } = useWorkspaceTab(initialTab);
  const owner = useMemo(() => projectOwner(projectId), [projectId]);
  const project = useProjectsStore((state) => state.projects.find((item) => item.id === projectId));
  const projectsStatus = useProjectsStore((state) => state.status);
  const syncCounts = useProjectsStore((state) => state.syncCounts);
  const groupId = project?.groupId ?? null;
  const group = useGroupsStore((state) => (groupId ? state.groups.find((item) => item.id === groupId) ?? null : null));
  const syncShared = useGroupsStore((state) => state.syncShared);
  const loadMeetings = useMeetingsStore((state) => state.load);
  const loadTodos = useTodosStore((state) => state.load);
  const todos = useTodosStore((state) => state.todos);
  const scope = useTodosStore((state) => state.scope);
  const todosStatus = useTodosStore((state) => state.status);
  const pruneSelection = useSelectionStore((state) => state.prune);
  const clearSelection = useSelectionStore((state) => state.clear);
  const closePrompt = usePromptPanelStore((state) => state.close);
  const isProjectKnown = Boolean(project);

  useEffect(() => {
    clearSelection();
    closePrompt();
    void loadMeetings(owner);
  }, [owner, loadMeetings, clearSelection, closePrompt]);

  useEffect(() => {
    if (!isProjectKnown) return;
    void loadTodos(owner, groupId);
  }, [owner, groupId, isProjectKnown, loadTodos]);

  useEffect(() => {
    if (scope?.owner.id !== projectId || todosStatus !== 'ready') return;
    syncCounts(projectId, todos);
    if (scope.sharedGroupId) syncShared(scope.sharedGroupId, todos);
    pruneSelection(todos.map((todo) => todo.id));
  }, [todos, scope, todosStatus, projectId, syncCounts, syncShared, pruneSelection]);

  if (!project) {
    return projectsStatus === 'ready' || projectsStatus === 'error' ? <ProjectNotFound /> : <ProjectViewSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ProjectHeader project={project} />
      <WorkspaceTabs owner={owner} value={tab} onChange={changeTab} />
      <WorkspaceBody owner={owner} tab={tab} sharedGroup={group} promptProjectId={projectId} />
    </div>
  );
}
