'use client';

import { useLayoutStore } from '@/store/layout';
import { ProjectFormModal } from './ProjectFormModal';

export function ProjectFormHost() {
  const { isOpen, project } = useLayoutStore((state) => state.projectForm);
  const closeProjectForm = useLayoutStore((state) => state.closeProjectForm);

  if (!isOpen) return null;

  return <ProjectFormModal key={project?.id ?? 'new'} project={project} onClose={closeProjectForm} />;
}
