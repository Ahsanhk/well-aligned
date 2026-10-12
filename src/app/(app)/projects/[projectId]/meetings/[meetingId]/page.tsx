import { MeetingDetailView } from '@/components/meetings/MeetingDetailView';

export default async function MeetingPage({ params }: { params: Promise<{ projectId: string; meetingId: string }> }) {
  const { projectId, meetingId } = await params;
  return <MeetingDetailView owner={{ kind: 'project', id: projectId }} meetingId={meetingId} />;
}
