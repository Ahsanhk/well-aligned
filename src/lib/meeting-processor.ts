import 'server-only';
import { MEETING_ERRORS, MEETING_ERROR_MAX_LENGTH, MEETING_TITLE_MAX_LENGTH } from '@/constants/meeting';
import type { Meeting, Project, ProjectGroup } from '@/types';
import { getProject } from './db';
import { getGroup, listGroupProjects } from './groups-db';
import { analyzeMeeting, MeetingAnalysisError, type MeetingAnalysis } from './meeting-analyzer';
import { finishMeetingJob, startMeetingJob } from './meeting-jobs';
import { captureSuggestionFrames, framePaths, removeMeetingFrames, withFrames } from './meeting-frames';
import { failMeeting, getMeeting, getMeetingRow, updateMeetingFields } from './meetings-db';
import { defaultMeetingTitle, deleteRecording, findRecording } from './recordings';
import { getSupabaseAdmin } from './supabase-admin';

function buildMeetingContext(project: Project | null, group: ProjectGroup | null, groupProjects: Project[], meeting: Meeting): string {
  const lines = [
    `Meeting date: ${meeting.meetingDate}`,
    `Meeting title given by the developer: ${meeting.title}`,
    `Recording file: ${meeting.videoName}`,
  ];
  if (project) {
    lines.push(`Project: ${project.name}`);
    if (project.techStack) lines.push(`Tech stack: ${project.techStack}`);
    if (project.description) lines.push(`Project description: ${project.description}`);
  }
  if (group) {
    lines.push(`Project group: ${group.name}`);
    if (group.description) lines.push(`Group description: ${group.description}`);
    lines.push('Projects in this group:');
    groupProjects.forEach((item) => {
      const details = [item.techStack && `tech stack: ${item.techStack}`, item.description].filter(Boolean).join('; ');
      lines.push(`- ${item.name}${details ? ` (${details})` : ''}`);
    });
  }
  return lines.join('\n');
}

function resolveTitle(meeting: Meeting, analysis: MeetingAnalysis): string {
  const userChoseTitle = meeting.title !== defaultMeetingTitle(meeting.videoName, meeting.meetingDate).slice(0, MEETING_TITLE_MAX_LENGTH);
  if (userChoseTitle || !analysis.title) return meeting.title;
  return analysis.title.slice(0, MEETING_TITLE_MAX_LENGTH);
}

function failureMessage(error: unknown): string {
  const message = error instanceof MeetingAnalysisError ? MEETING_ERRORS[error.code] : MEETING_ERRORS.failed;
  return message.slice(0, MEETING_ERROR_MAX_LENGTH);
}

async function runMeetingJob(meetingId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const meeting = await getMeeting(admin, meetingId);
  if (!meeting) return;
  const recording = await findRecording(meetingId);
  if (!recording) {
    await failMeeting(admin, meetingId, MEETING_ERRORS.recordingMissing);
    return;
  }
  const project = meeting.projectId ? await getProject(admin, meeting.projectId) : null;
  const group = meeting.groupId ? await getGroup(admin, meeting.groupId) : null;
  const groupProjects = group ? await listGroupProjects(admin, group.id) : [];
  const analysis = await analyzeMeeting({
    filePath: recording.filePath,
    mimeType: recording.mimeType,
    displayName: meeting.videoName,
    context: buildMeetingContext(project, group, groupProjects, meeting),
    groupProjects: groupProjects.map((item) => ({ id: item.id, name: item.name })),
  });
  const userId = (await getMeetingRow(admin, meetingId))?.user_id ?? null;
  const frames = userId
    ? await captureSuggestionFrames({ filePath: recording.filePath, userId, meetingId, frameTimestamps: analysis.frameTimestamps })
    : new Map();
  const saved = await updateMeetingFields(admin, meetingId, {
    status: 'ready',
    error: null,
    title: resolveTitle(meeting, analysis),
    summary: analysis.summary,
    transcript: analysis.transcript,
    suggestions: withFrames(analysis.suggestions, frames),
    model: analysis.model,
  });
  if (saved) await deleteRecording(meetingId);
  else await removeMeetingFrames(userId, meetingId, framePaths(frames));
}

export async function processMeeting(meetingId: string): Promise<void> {
  if (!startMeetingJob(meetingId)) return;
  try {
    await runMeetingJob(meetingId);
  } catch (error) {
    console.error(`Meeting ${meetingId} processing failed:`, error instanceof Error ? error.message : error);
    await failMeeting(getSupabaseAdmin(), meetingId, failureMessage(error)).catch((failError: unknown) =>
      console.error('Could not record meeting failure:', failError instanceof Error ? failError.message : failError),
    );
  } finally {
    finishMeetingJob(meetingId);
  }
}
