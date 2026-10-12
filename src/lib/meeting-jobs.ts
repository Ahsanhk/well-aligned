import 'server-only';

interface MeetingJobState {
  active: Set<string>;
}

const STATE_KEY = Symbol.for('meeting-tasks.meeting-jobs');

function getState(): MeetingJobState {
  const holder = globalThis as typeof globalThis & { [STATE_KEY]?: MeetingJobState };
  holder[STATE_KEY] ??= { active: new Set() };
  return holder[STATE_KEY];
}

export function isMeetingJobActive(meetingId: string): boolean {
  return getState().active.has(meetingId);
}

export function startMeetingJob(meetingId: string): boolean {
  const { active } = getState();
  if (active.has(meetingId)) return false;
  active.add(meetingId);
  return true;
}

export function finishMeetingJob(meetingId: string): void {
  getState().active.delete(meetingId);
}
