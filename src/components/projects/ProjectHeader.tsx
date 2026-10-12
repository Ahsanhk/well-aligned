'use client';

import Link from 'next/link';
import { FolderGit2, FolderTree, Layers, Pencil } from 'lucide-react';
import { ActiveRunButton } from '@/components/claude/ActiveRunButton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/app';
import { useGroupsStore } from '@/store/groups';
import { useLayoutStore } from '@/store/layout';
import type { Project } from '@/types';
import { ProjectActionsMenu } from './ProjectActionsMenu';
import { ProjectDot } from './ProjectDot';

export function ProjectHeader({ project }: { project: Project }) {
  const openProjectForm = useLayoutStore((state) => state.openProjectForm);
  const group = useGroupsStore((state) => (project.groupId ? state.groups.find((item) => item.id === project.groupId) : undefined));

  return (
    <PageHeader
      leading={<ProjectDot color={project.color} size="lg" />}
      title={project.name}
      description={project.description || undefined}
      meta={
        <>
          {group && (
            <Link href={ROUTES.group(group.id)}>
              <Badge tone="indigo" icon={<FolderTree size={10} />}>
                {group.name}
              </Badge>
            </Link>
          )}
          {project.techStack && (
            <Badge icon={<Layers size={10} />} className="font-mono">
              {project.techStack}
            </Badge>
          )}
          {project.repoPath && (
            <Badge icon={<FolderGit2 size={10} />} className="max-w-full font-mono">
              <span className="truncate">{project.repoPath}</span>
            </Badge>
          )}
        </>
      }
      actions={
        <>
          <ActiveRunButton projectId={project.id} />
          <Button variant="secondary" onClick={() => openProjectForm(project)}>
            <Pencil size={14} />
            Edit
          </Button>
          <ProjectActionsMenu project={project} showEdit={false} size="md" triggerClassName="border border-line" />
        </>
      }
    />
  );
}
