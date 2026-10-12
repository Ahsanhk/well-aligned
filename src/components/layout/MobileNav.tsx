'use client';

import { Menu as MenuIcon } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useLayoutStore } from '@/store/layout';
import { WorkspaceBrand } from './WorkspaceBrand';

export function MobileNav() {
  const openDrawer = useLayoutStore((state) => state.openDrawer);
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-line bg-canvas/85 px-3 backdrop-blur-md lg:hidden">
      <IconButton label="Open navigation" onClick={openDrawer}>
        <MenuIcon size={18} />
      </IconButton>
      <WorkspaceBrand />
    </header>
  );
}
