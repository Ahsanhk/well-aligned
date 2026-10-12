'use client';

import { useEffect, useMemo } from 'react';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { ProjectViewSkeleton } from '@/components/projects/ProjectViewSkeleton';
import { WorkspaceBody } from '@/components/workspace/WorkspaceBody';
import { WorkspaceTabs } from '@/components/workspace/WorkspaceTabs';
import { GROUP_COPY, GROUP_TAB_LABELS } from '@/constants/groups';
import { useGroupProjects } from '@/hooks/useGroupProjects';
import { useWorkspaceTab } from '@/hooks/useWorkspaceTab';
import { groupOwner } from '@/lib/owner';
import { useGroupsStore } from '@/store/groups';
import { useMeetingsStore } from '@/store/meetings';
import { usePromptPanelStore } from '@/store/prompt-panel';
import { useSelectionStore } from '@/store/selection';
import { useTodosStore } from '@/store/todos';
import type { ProjectTab } from '@/types';
import { GroupHeader } from './GroupHeader';
import { GroupNotFound } from './GroupNotFound';

interface Props {
  groupId: string;
  initialTab: ProjectTab;
}

export function GroupView({ groupId, initialTab }: Props) {
  const { tab, changeTab } = useWorkspaceTab(initialTab);
  const owner = useMemo(() => groupOwner(groupId), [groupId]);
  const group = useGroupsStore((state) => state.groups.find((item) => item.id === groupId));
  const groupsStatus = useGroupsStore((state) => state.status);
  const syncShared = useGroupsStore((state) => state.syncShared);
  const projects = useGroupProjects(groupId);
  const promptOptions = useMemo(() => projects.map((project) => ({ id: project.id, name: project.name })), [projects]);
  const loadTodos = useTodosStore((state) => state.load);
  const loadMeetings = useMeetingsStore((state) => state.load);
  const todos = useTodosStore((state) => state.todos);
  const scope = useTodosStore((state) => state.scope);
  const todosStatus = useTodosStore((state) => state.status);
  const clearSelection = useSelectionStore((state) => state.clear);
  const pruneSelection = useSelectionStore((state) => state.prune);
  const closePrompt = usePromptPanelStore((state) => state.close);

  useEffect(() => {
    clearSelection();
    closePrompt();
    void loadTodos(owner);
    void loadMeetings(owner);
  }, [owner, loadTodos, loadMeetings, clearSelection, closePrompt]);

  useEffect(() => {
    if (scope?.owner.id !== groupId || todosStatus !== 'ready') return;
    syncShared(groupId, todos);
    pruneSelection(todos.map((todo) => todo.id));
  }, [todos, scope, todosStatus, groupId, syncShared, pruneSelection]);

  if (!group) {
    return groupsStatus === 'ready' || groupsStatus === 'error' ? <GroupNotFound /> : <ProjectViewSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <GroupHeader group={group} projectCount={projects.length} />
      <section className="flex flex-col gap-2.5">
        <h2 className="text-[11px] font-medium tracking-wider text-subtle uppercase">{GROUP_COPY.projectsHeading}</h2>
        {projects.length > 0 ? (
          <ProjectGrid projects={projects} />
        ) : (
          <p className="rounded-xl border border-dashed border-line px-4 py-5 text-sm text-muted">{GROUP_COPY.noProjects}</p>
        )}
      </section>
      <WorkspaceTabs owner={owner} value={tab} onChange={changeTab} labels={GROUP_TAB_LABELS} />
      <WorkspaceBody owner={owner} tab={tab} sharedGroup={null} promptProjectId={null} promptProjectOptions={promptOptions} />
    </div>
  );
}
