'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Menu } from '@/components/ui/Menu';
import { MenuItem } from '@/components/ui/MenuItem';
import { Spinner } from '@/components/ui/Spinner';
import { AUTH_COPY } from '@/constants/auth';
import { useSignOut } from '@/hooks/useSignOut';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/session-user';
import type { SessionUser } from '@/types';

export function SidebarUserMenu({ user }: { user: SessionUser }) {
  const { signOut, isSigningOut } = useSignOut();

  return (
    <Menu
      placement="top-start"
      trigger={({ isOpen, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={AUTH_COPY.accountMenu}
          className={cn(
            'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors duration-150',
            isOpen ? 'bg-elevated ring-1 ring-line' : 'hover:bg-elevated/60',
          )}
        >
          <Avatar initials={initials(user.fullName)} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-fg">{user.fullName}</span>
            <span className="truncate text-xs text-subtle">{user.email}</span>
          </span>
          {isSigningOut ? <Spinner size={14} className="text-subtle" /> : <ChevronsUpDown size={14} className="shrink-0 text-subtle" />}
        </button>
      )}
    >
      {(close) => (
        <MenuItem
          icon={<LogOut size={14} />}
          label={AUTH_COPY.signOut}
          tone="danger"
          onSelect={() => {
            close();
            void signOut();
          }}
        />
      )}
    </Menu>
  );
}
