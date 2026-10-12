import 'server-only';
import { ACTIVE_RUN_STATUSES } from '@/constants/claude';
import { TABLES, TODO_WITH_SCREENSHOTS_SELECT } from '@/constants/supabase';
import type { Meeting, Project, RunRow, Todo, TodoOrigin, TodoStatus } from '@/types';
import { getTodo, orThrow, updateTodo } from './db';
import { expandHome } from './fs-checks';
import { isUuid } from './ids';
import { toMeeting, toProject, toTodo } from './mappers';
import { getSupabaseAdmin } from './supabase-admin';

function admin() {
  return getSupabaseAdmin();
}

function normalizePath(value: string): string {
  const expanded = expandHome(value.trim());
  return expanded.length > 1 ? expanded.replace(/\/+$/, '') : expanded;
}

export async function scopedProjects(userId: string): Promise<Project[]> {
  return orThrow(await admin().from(TABLES.projects).select('*').eq('user_id', userId)).map(toProject);
}

export async function scopedProject(userId: string, projectId: string): Promise<Project | null> {
  if (!isUuid(projectId)) return null;
  const row = orThrow(await admin().from(TABLES.projects).select('*').eq('id', projectId).eq('user_id', userId).maybeSingle());
  return row ? toProject(row) : null;
}

export async function scopedGroupName(userId: string, groupId: string | null): Promise<string | null> {
  if (!groupId || !isUuid(groupId)) return null;
  const row = orThrow(await admin().from(TABLES.projectGroups).select('name').eq('id', groupId).eq('user_id', userId).maybeSingle());
  return row?.name ?? null;
}

export async function projectForCwd(userId: string, cwd: string): Promise<Project | null> {
  const target = normalizePath(cwd);
  if (!target.startsWith('/')) return null;
  const matches = (await scopedProjects(userId))
    .map((project) => ({ project, root: project.repoPath ? normalizePath(project.repoPath) : '' }))
    .filter(({ root }) => root.startsWith('/') && (target === root || target.startsWith(`${root}/`)))
    .sort((a, b) => b.root.length - a.root.length);
  return matches[0]?.project ?? null;
}

async function ownsTodo(userId: string, todo: Todo): Promise<boolean> {
  if (todo.projectId) return Boolean(await scopedProject(userId, todo.projectId));
  return Boolean(await scopedGroupName(userId, todo.groupId));
}

export async function scopedTodo(userId: string, todoId: string): Promise<Todo | null> {
  const todo = await getTodo(admin(), todoId);
  return todo && (await ownsTodo(userId, todo)) ? todo : null;
}

export async function setScopedTodoStatus(userId: string, todoId: string, status: TodoStatus): Promise<Todo | null> {
  const todo = await scopedTodo(userId, todoId);
  if (!todo) return null;
  if (todo.status === status) return todo;
  return updateTodo(admin(), todo.id, { status });
}

export interface TodoFilter {
  status: TodoStatus | 'all';
  origin: TodoOrigin | 'all';
  includeShared: boolean;
}

export async function scopedProjectTodos(userId: string, projectId: string, filter: TodoFilter): Promise<Todo[] | null> {
  const project = await scopedProject(userId, projectId);
  if (!project) return null;
  const groupOwned = filter.includeShared && project.groupId && (await scopedGroupName(userId, project.groupId)) !== null;
  const base = admin().from(TABLES.todos).select(TODO_WITH_SCREENSHOTS_SELECT);
  const owned = groupOwned ? base.or(`project_id.eq.${project.id},group_id.eq.${project.groupId}`) : base.eq('project_id', project.id);
  const byStatus = filter.status === 'all' ? owned : owned.eq('status', filter.status);
  const byOrigin = filter.origin === 'all' ? byStatus : byStatus.eq('origin', filter.origin);
  const rows = orThrow(await byOrigin.order('meeting_date', { ascending: false }).order('created_at', { ascending: false }));
  return rows.map(toTodo);
}

export async function scopedMeeting(userId: string, meetingId: string): Promise<Meeting | null> {
  if (!isUuid(meetingId)) return null;
  const row = orThrow(await admin().from(TABLES.meetings).select('*').eq('id', meetingId).eq('user_id', userId).maybeSingle());
  return row ? toMeeting(row) : null;
}

export async function scopedActiveRuns(userId: string, projectId: string): Promise<RunRow[]> {
  return orThrow(
    await admin()
      .from(TABLES.runs)
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .in('status', ACTIVE_RUN_STATUSES)
      .order('started_at', { ascending: true }),
  );
}

export async function scopedActiveRunsWithTodo(userId: string, todoId: string): Promise<RunRow[]> {
  if (!isUuid(todoId)) return [];
  return orThrow(
    await admin().from(TABLES.runs).select('*').eq('user_id', userId).in('status', ACTIVE_RUN_STATUSES).contains('todo_ids', [todoId]),
  );
}

export async function updateScopedRun(userId: string, runId: string, fields: Partial<Omit<RunRow, 'id' | 'user_id' | 'project_id'>>): Promise<RunRow | null> {
  return orThrow(await admin().from(TABLES.runs).update(fields).eq('id', runId).eq('user_id', userId).select('*').maybeSingle());
}
