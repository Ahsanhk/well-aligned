'use client';

import Link from 'next/link';
import { NotebookPen } from 'lucide-react';
import { CountPill } from '@/components/ui/CountPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ROUTES } from '@/constants/app';
import { BACKLOG_COPY } from '@/constants/backlog';
import { HIGH_PRIORITY_TITLE } from '@/constants/groups';
import { PROJECT_COLOR_CLASSES } from '@/constants/project-colors';
import { completionPercent } from '@/lib/project-stats';
import type { ProjectSummary } from '@/types';
import { ProjectActionsMenu } from './ProjectActionsMenu';
import { ProjectDot } from './ProjectDot';

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const percent = completionPercent(project);
  const backlog = project.backlogOpenCount ?? 0;
  const highPriority = project.highPriorityOpenCount ?? 0;
  return (
    <div className="group relative flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-elevated/40 hover:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)]">
      <Link href={ROUTES.project(project.id)} aria-label={`Open ${project.name}`} className="absolute inset-0 rounded-xl" />
      <div className="pointer-events-none relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <ProjectDot color={project.color} />
          <h2 className="truncate font-medium text-fg">{project.name}</h2>
        </div>
        <div className="pointer-events-auto -mt-1 -mr-1.5">
          <ProjectActionsMenu
            project={project}
            triggerClassName="opacity-60 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
          />
        </div>
      </div>
      <div className="pointer-events-none relative min-h-10">
        {project.techStack && <p className="truncate font-mono text-xs text-muted">{project.techStack}</p>}
        {project.description && <p className="mt-1 line-clamp-2 text-sm text-subtle">{project.description}</p>}
      </div>
      <div className="pointer-events-none relative mt-auto flex flex-col gap-2.5">
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl leading-none font-semibold text-accent tabular-nums">{project.openCount}</span>
            <span className="text-xs text-muted">open</span>
            <span className="ml-1 text-xs text-subtle tabular-nums">· {project.doneCount} done</span>
            {highPriority > 0 && (
              <CountPill count={highPriority} tone="urgent" title={HIGH_PRIORITY_TITLE(highPriority)} className="ml-1 self-center" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {backlog > 0 && (
              <CountPill count={backlog} tone="quiet" icon={<NotebookPen size={10} />} title={BACKLOG_COPY.inBacklog(backlog)} />
            )}
            <span className="text-xs text-subtle tabular-nums">{percent}%</span>
          </div>
        </div>
        <ProgressBar percent={percent} barClassName={PROJECT_COLOR_CLASSES[project.color].dot} />
      </div>
    </div>
  );
}
