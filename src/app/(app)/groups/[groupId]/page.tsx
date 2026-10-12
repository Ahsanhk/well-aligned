import { GroupView } from '@/components/groups/GroupView';
import { parseProjectTab } from '@/lib/project-tab';

interface Props {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GroupPage({ params, searchParams }: Props) {
  const [{ groupId }, query] = await Promise.all([params, searchParams]);
  return <GroupView groupId={groupId} initialTab={parseProjectTab(query)} />;
}
