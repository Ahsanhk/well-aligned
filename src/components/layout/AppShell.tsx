'use client';

import { useEffect, type ReactNode } from 'react';
import { GroupFormHost } from '@/components/groups/GroupFormHost';
import { ProjectFormHost } from '@/components/projects/ProjectFormHost';
import { useGroupsStore } from '@/store/groups';
import { useProjectsStore } from '@/store/projects';
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

  useEffect(() => {
    ensureLoaded();
    ensureGroupsLoaded();
  }, [ensureLoaded, ensureGroupsLoaded]);

  return (
    <SessionUserProvider user={user}>
      <div className="min-h-dvh overflow-x-clip lg:pl-64">
        <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface/60 backdrop-blur-sm lg:block">
          <Sidebar user={user} />
        </aside>
        <MobileNav />
        <MobileDrawer user={user} />
        <PageContainer>{children}</PageContainer>
        <ProjectFormHost />
        <GroupFormHost />
        <Toaster />
      </div>
    </SessionUserProvider>
  );
}
