'use client';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useLayoutStore } from '@/store/layout';
import type { SessionUser } from '@/types';
import { Sidebar } from './Sidebar';

export function MobileDrawer({ user }: { user: SessionUser }) {
  const isOpen = useLayoutStore((state) => state.isDrawerOpen);
  const closeDrawer = useLayoutStore((state) => state.closeDrawer);
  useEscapeKey(closeDrawer, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="animate-fade-in absolute inset-0 bg-overlay backdrop-blur-sm" onClick={closeDrawer} />
      <aside className="animate-slide-in-left absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface shadow-2xl shadow-black/60">
        <Sidebar user={user} />
      </aside>
    </div>
  );
}
