import { MeetingDetailView } from '@/components/meetings/MeetingDetailView';

export default async function GroupMeetingPage({ params }: { params: Promise<{ groupId: string; meetingId: string }> }) {
  const { groupId, meetingId } = await params;
  return <MeetingDetailView owner={{ kind: 'group', id: groupId }} meetingId={meetingId} />;
}
