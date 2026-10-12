import type { ProjectSummary } from '@/types';
import { ProjectCard } from './ProjectCard';
import { PROJECT_GRID_CLASS } from '@/constants/layout';

export function ProjectGrid({ projects }: { projects: ProjectSummary[] }) {
  return (
    <div className={PROJECT_GRID_CLASS}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
