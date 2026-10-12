'use client';

import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { COPY } from '@/constants/app';
import { useLayoutStore } from '@/store/layout';
import { ImportProjectButton } from './ImportProjectButton';

export function ProjectsEmptyState() {
  const openProjectForm = useLayoutStore((state) => state.openProjectForm);
  return (
    <EmptyState
      className="py-20"
      icon={<FolderPlus size={22} />}
      title={COPY.emptyProjectsTitle}
      description={COPY.emptyProjectsDescription}
      action={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="lg" onClick={() => openProjectForm()}>
            <FolderPlus size={16} />
            Create your first project
          </Button>
          <ImportProjectButton />
        </div>
      }
    />
  );
}
