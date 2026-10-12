import 'server-only';
import { GROUP_SUMMARY_SELECT, TABLES } from '@/constants/supabase';
import type { Project, ProjectGroup, ProjectGroupInput, ProjectGroupSummary, Screenshot } from '@/types';
import { orThrow, rowOrThrow, type DbClient } from './db';
import { isUuid } from './ids';
import { normalizeSuggestions, toProject, toProjectGroup, toProjectGroupInsert, toProjectGroupSummary, toProjectGroupUpdate, toScreenshot } from './mappers';
import { removeMeetingFrames } from './meeting-frames';
import { removeCachedScreenshots, removeScreenshotObjects } from './uploads';

export async function listGroupSummaries(client: DbClient): Promise<ProjectGroupSummary[]> {
  const rows = orThrow(await client.from(TABLES.projectGroups).select(GROUP_SUMMARY_SELECT).order('name', { ascending: true }));
  return rows.map(toProjectGroupSummary);
}

export async function getGroup(client: DbClient, groupId: string): Promise<ProjectGroup | null> {
  if (!isUuid(groupId)) return null;
  const row = orThrow(await client.from(TABLES.projectGroups).select('*').eq('id', groupId).maybeSingle());
  return row ? toProjectGroup(row) : null;
}

export async function listGroupProjects(client: DbClient, groupId: string): Promise<Project[]> {
  if (!isUuid(groupId)) return [];
  const rows = orThrow(await client.from(TABLES.projects).select('*').eq('group_id', groupId).order('name', { ascending: true }));
  return rows.map(toProject);
}

export async function createGroup(client: DbClient, userId: string, input: ProjectGroupInput): Promise<ProjectGroup> {
  return toProjectGroup(rowOrThrow(await client.from(TABLES.projectGroups).insert(toProjectGroupInsert(userId, input)).select('*').single()));
}

export async function updateGroup(client: DbClient, groupId: string, patch: Partial<ProjectGroupInput>): Promise<ProjectGroup | null> {
  if (!isUuid(groupId)) return null;
  const row = orThrow(
    await client
      .from(TABLES.projectGroups)
      .update({ ...toProjectGroupUpdate(patch), updated_at: new Date().toISOString() })
      .eq('id', groupId)
      .select('*')
      .maybeSingle(),
  );
  return row ? toProjectGroup(row) : null;
}

async function listGroupScreenshots(client: DbClient, groupId: string): Promise<Screenshot[]> {
  const todos = orThrow(await client.from(TABLES.todos).select('id').eq('group_id', groupId));
  if (!todos.length) return [];
  const rows = orThrow(
    await client
      .from(TABLES.screenshots)
      .select('*')
      .in(
        'todo_id',
        todos.map((todo) => todo.id),
      ),
  );
  return rows.map(toScreenshot);
}

export async function deleteGroup(client: DbClient, groupId: string): Promise<boolean> {
  if (!isUuid(groupId)) return false;
  const [screenshots, meetings] = await Promise.all([
    listGroupScreenshots(client, groupId),
    client.from(TABLES.meetings).select('id, user_id, suggestions').eq('group_id', groupId),
  ]);
  const meetingRows = orThrow(meetings);
  const deleted = orThrow(await client.from(TABLES.projectGroups).delete().eq('id', groupId).select('id'));
  if (!deleted.length) return false;
  if (screenshots.length) {
    await removeScreenshotObjects(screenshots.map((shot) => shot.fileName));
    await removeCachedScreenshots(screenshots);
  }
  await Promise.all(
    meetingRows.map((meeting) =>
      removeMeetingFrames(
        meeting.user_id,
        meeting.id,
        normalizeSuggestions(meeting.suggestions).flatMap((suggestion) => suggestion.frames.map((frame) => frame.storagePath)),
      ),
    ),
  );
  return true;
}
