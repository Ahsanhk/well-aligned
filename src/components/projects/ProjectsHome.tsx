'use client';

import { useMemo } from 'react';
import { CircleAlert, FolderPlus, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { GROUP_COPY, UNGROUPED_KEY } from '@/constants/groups';
import { GREETING_COPY } from '@/constants/greeting';
import { useFirstName } from '@/hooks/useFirstName';
import { useHydrated } from '@/hooks/useHydrated';
import { homeGreeting, ownedLabel, workSummary } from '@/lib/greeting';
import { buildProjectSections } from '@/lib/sidebar-sections';
import { useGroupsStore } from '@/store/groups';
import { useLayoutStore } from '@/store/layout';
import { useProjectsStore } from '@/store/projects';
import { ImportProjectButton } from './ImportProjectButton';
import { ProjectGrid } from './ProjectGrid';
import { ProjectGridSkeleton } from './ProjectGridSkeleton';
import { ProjectSectionBlock } from './ProjectSectionBlock';
import { ProjectsEmptyState } from './ProjectsEmptyState';

export function ProjectsHome() {
  const projects = useProjectsStore((state) => state.projects);
  const status = useProjectsStore((state) => state.status);
  const error = useProjectsStore((state) => state.error);
  const load = useProjectsStore((state) => state.load);
  const openProjectForm = useLayoutStore((state) => state.openProjectForm);
  const openGroupForm = useLayoutStore((state) => state.openGroupForm);
  const groups = useGroupsStore((state) => state.groups);
  const sections = useMemo(() => buildProjectSections(projects, groups), [projects, groups]);
  const name = useFirstName();
  const isHydrated = useHydrated();
  const isLoading = status === 'idle' || status === 'loading';

  if (status === 'error') {
    return (
      <EmptyState
        icon={<CircleAlert size={22} />}
        title="Couldn’t load projects"
        description={error ?? ''}
        action={<Button variant="secondary" onClick={() => void load()}>Try again</Button>}
      />
    );
  }

  if (!isLoading && projects.length === 0 && groups.length === 0) return <ProjectsEmptyState />;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={ownedLabel(name, GREETING_COPY.projectsSuffix, GREETING_COPY.projectsFallback)}
        description={
          isHydrated && !isLoading ? homeGreeting(name, new Date(), workSummary(projects, groups)) : GREETING_COPY.neutralSubtitle
        }
        actions={
          <>
            <ImportProjectButton />
            <Button variant="secondary" onClick={() => openGroupForm()}>
              <FolderPlus size={15} />
              {GROUP_COPY.newGroup}
            </Button>
            <Button onClick={() => openProjectForm()}>
              <Plus size={15} />
              New project
            </Button>
          </>
        }
      />
      {isLoading && projects.length === 0 && <ProjectGridSkeleton />}
      {!(isLoading && projects.length === 0) &&
        (groups.length > 0 ? (
          sections.map((section) => <ProjectSectionBlock key={section.group?.id ?? UNGROUPED_KEY} section={section} />)
        ) : (
          <ProjectGrid projects={projects} />
        ))}
    </div>
  );
}
