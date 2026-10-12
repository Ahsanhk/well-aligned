import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SidebarCounts } from '@/components/layout/SidebarCounts';
import { ROUTES } from '@/constants/app';
import { GROUP_COPY } from '@/constants/groups';
import { PROJECT_COLOR_CLASSES } from '@/constants/project-colors';
import { cn } from '@/lib/cn';
import { sectionBacklogCount, sectionHasHighPriority, sectionOpenCount } from '@/lib/sidebar-sections';
import type { ProjectSection } from '@/types';
import { ProjectGrid } from './ProjectGrid';

export function ProjectSectionBlock({ section }: { section: ProjectSection }) {
  const { group, projects } = section;
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center gap-2.5">
        {group ? (
          <Link href={ROUTES.group(group.id)} className="group inline-flex min-w-0 items-center gap-2 text-sm font-medium text-fg">
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-sm', PROJECT_COLOR_CLASSES[group.color].dot)} />
            <span className="truncate">{group.name}</span>
            <ArrowRight size={13} className="shrink-0 text-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        ) : (
          <h2 className="text-[11px] font-medium tracking-wider text-subtle uppercase">{GROUP_COPY.ungrouped}</h2>
        )}
        <SidebarCounts open={sectionOpenCount(section)} backlog={sectionBacklogCount(section)} urgent={sectionHasHighPriority(section)} />
        <span className="h-px flex-1 bg-line" />
      </header>
      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <p className="rounded-xl border border-dashed border-line px-4 py-4 text-sm text-subtle">{GROUP_COPY.noProjects}</p>
      )}
    </section>
  );
}
