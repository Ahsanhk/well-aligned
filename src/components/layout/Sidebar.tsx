'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { FolderPlus, LayoutGrid, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/constants/app';
import { GROUP_COPY, UNGROUPED_KEY } from '@/constants/groups';
import { useCollapsedGroups } from '@/hooks/useCollapsedGroups';
import { buildProjectSections } from '@/lib/sidebar-sections';
import { cn } from '@/lib/cn';
import { useGroupsStore } from '@/store/groups';
import { useLayoutStore } from '@/store/layout';
import { useProjectsStore } from '@/store/projects';
import { WorkspaceBrand } from './WorkspaceBrand';
import { SidebarGroupSection } from './SidebarGroupSection';
import { SidebarProjectLink } from './SidebarProjectLink';
import { SidebarUserMenu } from './SidebarUserMenu';
import type { SessionUser } from '@/types';

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const projects = useProjectsStore((state) => state.projects);
  const status = useProjectsStore((state) => state.status);
  const openProjectForm = useLayoutStore((state) => state.openProjectForm);
  const openGroupForm = useLayoutStore((state) => state.openGroupForm);
  const groups = useGroupsStore((state) => state.groups);
  const sections = useMemo(() => buildProjectSections(projects, groups), [projects, groups]);
  const hasGroups = groups.length > 0;
  const collapse = useCollapsedGroups();
  const closeDrawer = useLayoutStore((state) => state.closeDrawer);
  const isHome = pathname === ROUTES.home;

  return (
    <nav aria-label="Projects" className="flex h-full flex-col gap-5 px-3 py-4">
      <div className="px-1.5">
        <WorkspaceBrand />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-1.5">
        <Button variant="secondary" className="justify-start" onClick={() => openProjectForm()}>
          <Plus size={15} className="text-accent" />
          New project
        </Button>
        <Button variant="secondary" onClick={() => openGroupForm()} title={GROUP_COPY.newGroup}>
          <FolderPlus size={15} className="text-indigo" />
          Group
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <Link
          href={ROUTES.home}
          onClick={closeDrawer}
          className={cn(
            'flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-150',
            isHome ? 'bg-elevated text-fg ring-1 ring-line' : 'text-muted hover:bg-elevated/60 hover:text-fg',
          )}
        >
          <LayoutGrid size={14} />
          All projects
        </Link>
        <p className="mt-4 mb-1 px-2.5 text-[11px] font-medium tracking-wider text-subtle uppercase">Projects</p>
        <div className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto', hasGroups ? 'gap-2' : 'gap-0.5')}>
          {status === 'loading' && projects.length === 0 &&
            [0, 1, 2].map((index) => <Skeleton key={index} className="mx-2.5 my-1.5 h-5" />)}
          {status === 'ready' && projects.length === 0 && (
            <p className="px-2.5 text-xs text-subtle">No projects yet</p>
          )}
          {sections.map((section) => {
            const key = section.group?.id ?? UNGROUPED_KEY;
            return hasGroups ? (
              <SidebarGroupSection
                key={key}
                section={section}
                pathname={pathname}
                isCollapsed={collapse.isCollapsed(key)}
                onToggle={() => collapse.toggle(key)}
                onNavigate={closeDrawer}
              />
            ) : (
              section.projects.map((project) => (
                <SidebarProjectLink
                  key={project.id}
                  project={project}
                  isActive={pathname === ROUTES.project(project.id)}
                  onNavigate={closeDrawer}
                />
              ))
            );
          })}
        </div>
      </div>
      <div className="border-t border-line pt-3">
        <SidebarUserMenu user={user} />
      </div>
    </nav>
  );
}
