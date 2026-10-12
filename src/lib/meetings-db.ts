import 'server-only';
import { MEETING_ERRORS, STALE_PROCESSING_MS, SUGGESTION_QUOTE_PREFIX } from '@/constants/meeting';
import { MEETING_LIST_SELECT, TABLES, TODO_WITH_SCREENSHOTS_SELECT } from '@/constants/supabase';
import type {
  ItemOwner,
  Meeting,
  MeetingInsert,
  MeetingListItem,
  MeetingListRow,
  MeetingRow,
  MeetingStatus,
  SuggestedTodo,
  SuggestionEdit,
  Todo,
  TodoInsert,
} from '@/types';
import { orThrow, ownerColumn, ownerExists, rowOrThrow, touchOwner, type DbClient } from './db';
import { isUuid, newId, nowIso } from './ids';
import { copyFramesToTodos } from './meeting-frames';
import { isMeetingJobActive } from './meeting-jobs';
import { ownerInsertColumns, toMeeting, toMeetingListItem, toTodo } from './mappers';
import { groupOwner, meetingOwner, projectOwner } from './owner';

const ACTIVE_STATUSES: MeetingStatus[] = ['uploading', 'processing'];

function isStale(row: Pick<MeetingRow, 'id' | 'status' | 'updated_at'>): boolean {
  if (!ACTIVE_STATUSES.includes(row.status) || isMeetingJobActive(row.id)) return false;
  return Date.now() - new Date(row.updated_at).getTime() > STALE_PROCESSING_MS;
}

async function markInterrupted(client: DbClient, meetingId: string): Promise<void> {
  orThrow(
    await client
      .from(TABLES.meetings)
      .update({ status: 'failed', error: MEETING_ERRORS.interrupted })
      .eq('id', meetingId)
      .in('status', ACTIVE_STATUSES),
  );
}

async function resolveStale<T extends Pick<MeetingRow, 'id' | 'status' | 'updated_at' | 'error'>>(client: DbClient, row: T): Promise<T> {
  if (!isStale(row)) return row;
  await markInterrupted(client, row.id);
  return { ...row, status: 'failed', error: MEETING_ERRORS.interrupted };
}

export async function listOwnerMeetings(client: DbClient, owner: ItemOwner): Promise<MeetingListItem[] | null> {
  if (!isUuid(owner.id)) return null;
  const [exists, result] = await Promise.all([
    ownerExists(client, owner),
    client
      .from(TABLES.meetings)
      .select(MEETING_LIST_SELECT)
      .eq(ownerColumn(owner), owner.id)
      .order('meeting_date', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);
  if (!exists) return null;
  const rows: MeetingListRow[] = orThrow(result);
  const resolved = await Promise.all(rows.map((row) => resolveStale(client, row)));
  return resolved.map((row) => toMeetingListItem({ ...row, group_id: owner.kind === 'group' ? owner.id : null }));
}

export function listMeetings(client: DbClient, projectId: string): Promise<MeetingListItem[] | null> {
  return listOwnerMeetings(client, projectOwner(projectId));
}

export async function getMeetingRow(client: DbClient, meetingId: string): Promise<MeetingRow | null> {
  if (!isUuid(meetingId)) return null;
  return orThrow(await client.from(TABLES.meetings).select('*').eq('id', meetingId).maybeSingle());
}

export async function getMeeting(client: DbClient, meetingId: string): Promise<Meeting | null> {
  const row = await getMeetingRow(client, meetingId);
  return row ? toMeeting(await resolveStale(client, row)) : null;
}

export async function createMeeting(client: DbClient, insert: MeetingInsert): Promise<Meeting> {
  const meeting = toMeeting(rowOrThrow(await client.from(TABLES.meetings).insert(insert).select('*').single()));
  await touchOwner(client, meetingOwner(meeting));
  return meeting;
}

export async function updateMeetingFields(client: DbClient, meetingId: string, fields: Partial<Omit<MeetingInsert, 'id' | 'user_id'>>): Promise<Meeting | null> {
  if (!isUuid(meetingId)) return null;
  const row = orThrow(
    await client
      .from(TABLES.meetings)
      .update({ ...fields, updated_at: nowIso() })
      .eq('id', meetingId)
      .select('*')
      .maybeSingle(),
  );
  return row ? toMeeting(await resolveStale(client, row)) : null;
}

export async function restartFailedMeeting(client: DbClient, meetingId: string): Promise<Meeting | null> {
  if (!isUuid(meetingId)) return null;
  const row = orThrow(
    await client
      .from(TABLES.meetings)
      .update({ status: 'processing', error: null, updated_at: nowIso() })
      .eq('id', meetingId)
      .eq('status', 'failed')
      .select('*')
      .maybeSingle(),
  );
  return row ? toMeeting(row) : null;
}

export async function failMeeting(client: DbClient, meetingId: string, message: string): Promise<void> {
  orThrow(await client.from(TABLES.meetings).update({ status: 'failed', error: message }).eq('id', meetingId));
}

export async function deleteMeeting(client: DbClient, meetingId: string): Promise<MeetingRow | null> {
  const row = await getMeetingRow(client, meetingId);
  if (!row) return null;
  const deleted = orThrow(await client.from(TABLES.meetings).delete().eq('id', meetingId).select('id'));
  if (!deleted.length) return null;
  await touchOwner(client, row.project_id ? projectOwner(row.project_id) : groupOwner(row.group_id ?? ''));
  return row;
}

export type OwnedSuggestionEdit = SuggestionEdit & { owner: ItemOwner };

function singleLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function suggestionDetails(edit: SuggestionEdit, suggestion: SuggestedTodo): string {
  const quoteBlock = `> ${SUGGESTION_QUOTE_PREFIX} (${suggestion.timestamp}): "${singleLine(suggestion.quote)}"`;
  const details = edit.details.trim();
  return details ? `${details}\n\n${quoteBlock}` : quoteBlock;
}

async function attachFrameScreenshots(
  client: DbClient,
  userId: string,
  meeting: Meeting,
  pairs: { edit: OwnedSuggestionEdit; suggestion: SuggestedTodo; todoId: string }[],
): Promise<boolean> {
  const rows = await copyFramesToTodos(
    pairs.map(({ edit, suggestion, todoId }) => ({
      userId,
      owner: edit.owner,
      todoId,
      meetingId: meeting.id,
      frames: suggestion.frames.filter((frame) => edit.frameIds.includes(frame.id)),
    })),
  );
  if (!rows.length) return false;
  orThrow(await client.from(TABLES.screenshots).insert(rows));
  return true;
}

export async function insertSuggestionTodos(
  client: DbClient,
  userId: string,
  meeting: Meeting,
  edits: OwnedSuggestionEdit[],
): Promise<{ meeting: Meeting; todos: Todo[] }> {
  const pairs = edits.map((edit) => {
    const suggestion = meeting.suggestions.find((item) => item.id === edit.id);
    if (!suggestion) throw new Error(`Unknown suggestion ${edit.id}`);
    return { edit, suggestion, todoId: newId() };
  });
  const inserts: TodoInsert[] = pairs.map(({ edit, suggestion, todoId }) => ({
    id: todoId,
    ...ownerInsertColumns(edit.owner),
    meeting_id: meeting.id,
    title: edit.title,
    details: suggestionDetails(edit, suggestion),
    meeting_date: meeting.meetingDate,
    priority: edit.priority,
  }));
  const inserted = orThrow(await client.from(TABLES.todos).insert(inserts).select(TODO_WITH_SCREENSHOTS_SELECT));
  const attached = await attachFrameScreenshots(client, userId, meeting, pairs);
  const rows = attached
    ? orThrow(
        await client
          .from(TABLES.todos)
          .select(TODO_WITH_SCREENSHOTS_SELECT)
          .in(
            'id',
            pairs.map((pair) => pair.todoId),
          ),
      )
    : inserted;
  const todoIdBySuggestion = new Map(pairs.map(({ suggestion, todoId }) => [suggestion.id, todoId]));
  const suggestions = meeting.suggestions.map((suggestion) => {
    const todoId = todoIdBySuggestion.get(suggestion.id);
    return todoId ? { ...suggestion, acceptedTodoId: todoId, dismissed: false } : suggestion;
  });
  const updated = await updateMeetingFields(client, meeting.id, { suggestions });
  const owners = new Map([meetingOwner(meeting), ...edits.map((edit) => edit.owner)].map((owner) => [`${owner.kind}:${owner.id}`, owner]));
  await Promise.all([...owners.values()].map((owner) => touchOwner(client, owner)));
  const order = new Map(inserts.map((insert, index) => [insert.id, index]));
  const todos = rows.map(toTodo).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return { meeting: updated ?? { ...meeting, suggestions }, todos };
}
