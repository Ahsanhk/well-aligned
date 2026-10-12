import { ACTIVE_MEETING_STATUSES } from '@/constants/meetings';
import type { Meeting, MeetingListItem, SuggestedTodo, TranscriptSegment } from '@/types';
import { timestampToSeconds } from './timestamp';

export function isPendingSuggestion(suggestion: SuggestedTodo) {
  return !suggestion.acceptedTodoId && !suggestion.dismissed;
}

export function pendingSuggestionCount(meeting: Pick<Meeting, 'suggestions'>) {
  return meeting.suggestions.filter(isPendingSuggestion).length;
}

export function meetingsNeedingReview(meetings: MeetingListItem[]) {
  return meetings.filter((meeting) => meeting.status === 'ready' && pendingSuggestionCount(meeting) > 0).length;
}

export function isMeetingActive(meeting: Pick<Meeting, 'status'>) {
  return ACTIVE_MEETING_STATUSES.includes(meeting.status);
}

export function transcriptDurationSeconds(transcript: TranscriptSegment[]) {
  return transcript.reduce((max, segment) => Math.max(max, timestampToSeconds(segment.start)), 0);
}

export function toMeetingListItem(meeting: Meeting): MeetingListItem {
  const { transcript, ...rest } = meeting;
  return { ...rest, segmentCount: transcript.length };
}

export function sortMeetings(meetings: MeetingListItem[]) {
  return [...meetings].sort(
    (a, b) => b.meetingDate.localeCompare(a.meetingDate) || b.createdAt.localeCompare(a.createdAt),
  );
}
