import { ProjectView } from '@/components/projects/ProjectView';
import { parseProjectTab } from '@/lib/project-tab';

interface Props {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProjectPage({ params, searchParams }: Props) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  return <ProjectView projectId={projectId} initialTab={parseProjectTab(query)} />;
}
