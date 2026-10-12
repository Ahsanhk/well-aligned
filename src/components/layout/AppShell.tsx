'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { ClaudePanelHost } from '@/components/claude/ClaudePanelHost';
import { GroupFormHost } from '@/components/groups/GroupFormHost';
import { ProjectFormHost } from '@/components/projects/ProjectFormHost';
import { useActiveRunsPolling } from '@/hooks/useActiveRunsPolling';
import { useDockWidth } from '@/hooks/useDockWidth';
import { cn } from '@/lib/cn';
import { useGroupsStore } from '@/store/groups';
import { useProjectsStore } from '@/store/projects';
import { useRunsStore } from '@/store/runs';
import type { SessionUser } from '@/types';
import { MobileDrawer } from './MobileDrawer';
import { PageContainer } from './PageContainer';
import { SessionUserProvider } from './SessionUserProvider';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { Toaster } from './Toaster';

export function AppShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const ensureLoaded = useProjectsStore((state) => state.ensureLoaded);
  const ensureGroupsLoaded = useGroupsStore((state) => state.ensureLoaded);

  const dock = useDockWidth();
  const isDocked = useRunsStore((state) => state.isPanelOpen && Boolean(state.panelRunId && state.runs[state.panelRunId]));
  useActiveRunsPolling();

  useEffect(() => {
    ensureLoaded();
    ensureGroupsLoaded();
  }, [ensureLoaded, ensureGroupsLoaded]);

  return (
    <SessionUserProvider user={user}>
      <div
        style={{ '--dock-width': `${dock.width}px` } as CSSProperties}
        className={cn('min-h-dvh overflow-x-clip transition-[padding] duration-200 lg:pl-64', isDocked && 'lg:pr-[var(--dock-width)]')}
      >
        <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface/60 backdrop-blur-sm lg:block">
          <Sidebar user={user} />
        </aside>
        <MobileNav />
        <MobileDrawer user={user} />
        <PageContainer>{children}</PageContainer>
        <ProjectFormHost />
        <GroupFormHost />
        <ClaudePanelHost width={dock.width} onResizeStart={dock.startResize} />
        <Toaster />
      </div>
    </SessionUserProvider>
  );
}
