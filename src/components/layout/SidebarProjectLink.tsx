'use client';

import Link from 'next/link';
import { RunPulseDot } from '@/components/claude/RunPulseDot';
import { ProjectActionsMenu } from '@/components/projects/ProjectActionsMenu';
import { ROUTES } from '@/constants/app';
import { PROJECT_COLOR_CLASSES } from '@/constants/project-colors';
import { useActiveRuns } from '@/hooks/useActiveRuns';
import { cn } from '@/lib/cn';
import type { ProjectSummary } from '@/types';
import { SidebarCounts } from './SidebarCounts';

interface Props {
  project: ProjectSummary;
  isActive: boolean;
  indented?: boolean;
  onNavigate: () => void;
}

export function SidebarProjectLink({ project, isActive, indented = false, onNavigate }: Props) {
  const colors = PROJECT_COLOR_CLASSES[project.color];
  const highPriority = project.highPriorityOpenCount ?? 0;
  const hasActiveRun = useActiveRuns().some((run) => run.projectId === project.id);

  return (
    <div
      className={cn(
        'group/link relative flex h-8 items-center rounded-lg transition-colors duration-150',
        isActive ? 'bg-elevated ring-1 ring-line' : 'hover:bg-elevated/60',
      )}
    >
      <Link
        href={ROUTES.project(project.id)}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex h-full min-w-0 flex-1 items-center gap-2.5 pr-1 text-sm',
          indented ? 'pl-6' : 'pl-2.5',
          isActive ? 'text-fg' : 'text-muted group-hover/link:text-fg',
        )}
      >
        <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot, isActive && colors.glow)} />
        <span className="min-w-0 flex-1 truncate">{project.name}</span>
        {hasActiveRun && <RunPulseDot />}
        <SidebarCounts open={project.openCount} backlog={project.backlogOpenCount ?? 0} urgent={highPriority > 0} />
      </Link>
      <ProjectActionsMenu
        project={project}
        portal
        triggerClassName="mr-0.5 h-6 w-6 opacity-0 group-hover/link:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100 pointer-coarse:opacity-100"
      />
    </div>
  );
}
