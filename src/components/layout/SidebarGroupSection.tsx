'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { ROUTES } from '@/constants/app';
import { GROUP_COPY } from '@/constants/groups';
import { PROJECT_COLOR_CLASSES } from '@/constants/project-colors';
import { cn } from '@/lib/cn';
import { sectionBacklogCount, sectionHasHighPriority, sectionOpenCount } from '@/lib/sidebar-sections';
import type { ProjectSection } from '@/types';
import { SidebarCounts } from './SidebarCounts';
import { SidebarProjectLink } from './SidebarProjectLink';

interface Props {
  section: ProjectSection;
  pathname: string;
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

export function SidebarGroupSection({ section, pathname, isCollapsed, onToggle, onNavigate }: Props) {
  const { group, projects } = section;
  const urgent = sectionHasHighPriority(section);
  const isActive = group ? pathname === ROUTES.group(group.id) : false;

  return (
    <div className="flex flex-col gap-0.5">
      <div
        className={cn(
          'group/section flex h-8 items-center gap-1 rounded-lg pr-1 transition-colors duration-150',
          isActive ? 'bg-elevated ring-1 ring-line' : 'hover:bg-elevated/40',
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-subtle hover:text-fg"
        >
          <ChevronDown size={13} className={cn('transition-transform duration-200', isCollapsed && '-rotate-90')} />
        </button>
        {group ? (
          <Link
            href={ROUTES.group(group.id)}
            onClick={onNavigate}
            className="flex min-w-0 flex-1 items-center gap-2 text-[13px] font-medium text-fg/90 hover:text-fg"
          >
            <span className={cn('h-2 w-2 shrink-0 rounded-sm', PROJECT_COLOR_CLASSES[group.color].dot)} />
            <span className="min-w-0 flex-1 truncate">{group.name}</span>
          </Link>
        ) : (
          <span className="flex-1 text-[11px] font-medium tracking-wider text-subtle uppercase">{GROUP_COPY.ungrouped}</span>
        )}
        <SidebarCounts open={sectionOpenCount(section)} backlog={sectionBacklogCount(section)} urgent={urgent} />
      </div>
      {!isCollapsed &&
        projects.map((project) => (
          <SidebarProjectLink
            key={project.id}
            project={project}
            indented
            isActive={pathname === ROUTES.project(project.id)}
            onNavigate={onNavigate}
          />
        ))}
    </div>
  );
}
