import 'server-only';
import { PROJECT_WITH_STATUSES_SELECT, STORAGE_PATH_LOOKUP_BATCH_SIZE, TABLES, TODO_WITH_SCREENSHOTS_SELECT } from '@/constants/supabase';
import type {
  ItemOwner,
  TodoOrigin,
  GeneratedPrompt,
  Project,
  ProjectInput,
  ProjectInsert,
  ProjectSummary,
  Screenshot,
  ScreenshotInsert,
  Todo,
  TodoInput,
  TodoInsert,
  TodoPatch,
} from '@/types';
import { isUuid, nowIso } from './ids';
import {
  normalizeSuggestions,
  ownerUpdateColumns,
  toProject,
  toProjectInsert,
  toProjectSummary,
  toProjectUpdate,
  toScreenshot,
  toTodo,
  toTodoInsert,
  toTodoUpdate,
} from './mappers';
import { removeMeetingFrames } from './meeting-frames';
import { projectOwner, todoOwner } from './owner';
import { DatabaseError, type SupabaseAdmin } from './supabase-admin';
import { moveScreenshotObject, removeCachedScreenshots, removeScreenshotObjects, todoStorageFolder } from './uploads';

type QueryResult = { data: unknown; error: { message: string; code?: string } | null };

type SuccessData<R extends QueryResult> = Extract<R, { error: null }>['data'];

export function orThrow<R extends QueryResult>(result: R): SuccessData<R> {
  if (result.error) throw new DatabaseError(result.error.message, result.error.code ?? null);
  return result.data as SuccessData<R>;
}

export function rowOrThrow<R extends QueryResult>(result: R): NonNullable<SuccessData<R>> {
  const row = orThrow(result);
  if (row === null || row === undefined) throw new Error('Expected a row but none was returned');
  return row;
}

export type DbClient = SupabaseAdmin;

async function removeScreenshotAssets(screenshots: Screenshot[]): Promise<void> {
  if (!screenshots.length) return;
  await removeScreenshotObjects(screenshots.map((shot) => shot.fileName));
  await removeCachedScreenshots(screenshots);
}

export async function touchProject(client: DbClient, projectId: string): Promise<void> {
  orThrow(await client.from(TABLES.projects).update({ updated_at: nowIso() }).eq('id', projectId));
}

export async function touchGroup(client: DbClient, groupId: string): Promise<void> {
  orThrow(await client.from(TABLES.projectGroups).update({ updated_at: nowIso() }).eq('id', groupId));
}

export async function touchOwner(client: DbClient, owner: ItemOwner): Promise<void> {
  if (owner.kind === 'project') await touchProject(client, owner.id);
  else await touchGroup(client, owner.id);
}

export async function ownerExists(client: DbClient, owner: ItemOwner): Promise<boolean> {
  if (!isUuid(owner.id)) return false;
  const table = owner.kind === 'project' ? TABLES.projects : TABLES.projectGroups;
  const row = orThrow(await client.from(table).select('id').eq('id', owner.id).maybeSingle());
  return Boolean(row);
}

export function ownerColumn(owner: ItemOwner): 'project_id' | 'group_id' {
  return owner.kind === 'project' ? 'project_id' : 'group_id';
}

async function touchTodo(client: DbClient, todoId: string): Promise<void> {
  orThrow(await client.from(TABLES.todos).update({ updated_at: nowIso() }).eq('id', todoId));
}

export async function listProjectSummaries(client: DbClient): Promise<ProjectSummary[]> {
  const rows = orThrow(
    await client.from(TABLES.projects).select(PROJECT_WITH_STATUSES_SELECT).order('updated_at', { ascending: false }),
  );
  return rows.map(toProjectSummary);
}

export async function getProject(client: DbClient, projectId: string): Promise<Project | null> {
  if (!isUuid(projectId)) return null;
  const row = orThrow(await client.from(TABLES.projects).select('*').eq('id', projectId).maybeSingle());
  return row ? toProject(row) : null;
}

export async function createProject(client: DbClient, userId: string, input: ProjectInput): Promise<Project> {
  return toProject(rowOrThrow(await client.from(TABLES.projects).insert(toProjectInsert(userId, input)).select('*').single()));
}

export async function updateProject(client: DbClient, projectId: string, patch: Partial<ProjectInput>): Promise<Project | null> {
  if (!isUuid(projectId)) return null;
  const row = orThrow(
    await client
      .from(TABLES.projects)
      .update({ ...toProjectUpdate(patch), updated_at: nowIso() })
      .eq('id', projectId)
      .select('*')
      .maybeSingle(),
  );
  return row ? toProject(row) : null;
}

async function listProjectScreenshots(client: DbClient, projectId: string): Promise<Screenshot[]> {
  const todos = orThrow(await client.from(TABLES.todos).select('id').eq('project_id', projectId));
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

export async function deleteProject(client: DbClient, projectId: string): Promise<boolean> {
  if (!isUuid(projectId)) return false;
  const screenshots = await listProjectScreenshots(client, projectId);
  const meetings = orThrow(await client.from(TABLES.meetings).select('id, user_id, suggestions').eq('project_id', projectId));
  const deleted = orThrow(await client.from(TABLES.projects).delete().eq('id', projectId).select('id'));
  if (!deleted.length) return false;
  await removeScreenshotAssets(screenshots);
  await Promise.all(
    meetings.map((meeting) =>
      removeMeetingFrames(
        meeting.user_id,
        meeting.id,
        normalizeSuggestions(meeting.suggestions).flatMap((suggestion) => suggestion.frames.map((frame) => frame.storagePath)),
      ),
    ),
  );
  return true;
}

export async function listOwnerTodos(client: DbClient, owner: ItemOwner, origin?: TodoOrigin): Promise<Todo[] | null> {
  if (!isUuid(owner.id)) return null;
  const base = client.from(TABLES.todos).select(TODO_WITH_SCREENSHOTS_SELECT).eq(ownerColumn(owner), owner.id);
  const filtered = origin ? base.eq('origin', origin) : base;
  const [exists, result] = await Promise.all([
    ownerExists(client, owner),
    filtered.order('meeting_date', { ascending: false }).order('created_at', { ascending: false }),
  ]);
  if (!exists) return null;
  return orThrow(result).map(toTodo);
}

export function listTodos(client: DbClient, projectId: string, origin?: TodoOrigin): Promise<Todo[] | null> {
  return listOwnerTodos(client, projectOwner(projectId), origin);
}

export async function getTodo(client: DbClient, todoId: string): Promise<Todo | null> {
  if (!isUuid(todoId)) return null;
  const row = orThrow(await client.from(TABLES.todos).select(TODO_WITH_SCREENSHOTS_SELECT).eq('id', todoId).maybeSingle());
  return row ? toTodo(row) : null;
}

export async function getPromptTodos(client: DbClient, project: Project, todoIds: string[]): Promise<Todo[]> {
  const ids = todoIds.filter(isUuid);
  if (!ids.length) return [];
  const base = client.from(TABLES.todos).select(TODO_WITH_SCREENSHOTS_SELECT).in('id', ids);
  const scoped = project.groupId ? base.or(`project_id.eq.${project.id},group_id.eq.${project.groupId}`) : base.eq('project_id', project.id);
  return orThrow(await scoped).map(toTodo);
}

export async function createOwnerTodo(client: DbClient, owner: ItemOwner, input: TodoInput): Promise<Todo | null> {
  if (!(await ownerExists(client, owner))) return null;
  const row = rowOrThrow(await client.from(TABLES.todos).insert(toTodoInsert(owner, input)).select(TODO_WITH_SCREENSHOTS_SELECT).single());
  await touchOwner(client, owner);
  return toTodo(row);
}

export function createTodo(client: DbClient, projectId: string, input: TodoInput): Promise<Todo | null> {
  return createOwnerTodo(client, projectOwner(projectId), input);
}

export class TodoRuleError extends Error {
  constructor(public readonly rule: 'categoryOnlySelf') {
    super(rule);
  }
}

export async function updateTodo(client: DbClient, todoId: string, patch: TodoPatch): Promise<Todo | null> {
  if (!isUuid(todoId)) return null;
  const current = orThrow(await client.from(TABLES.todos).select('*').eq('id', todoId).maybeSingle());
  if (!current) return null;
  if (patch.category !== undefined && current.origin !== 'self') throw new TodoRuleError('categoryOnlySelf');
  const now = nowIso();
  const nextStatus = patch.status ?? current.status;
  const completedAt = nextStatus !== 'done' ? null : current.status === 'done' && current.completed_at ? current.completed_at : now;
  const row = orThrow(
    await client
      .from(TABLES.todos)
      .update({ ...toTodoUpdate(patch), completed_at: completedAt, updated_at: now })
      .eq('id', todoId)
      .select(TODO_WITH_SCREENSHOTS_SELECT)
      .maybeSingle(),
  );
  if (!row) return null;
  const todo = toTodo(row);
  await touchOwner(client, todoOwner(todo));
  return todo;
}

export async function setTodoPrompt(client: DbClient, todoId: string, prompt: GeneratedPrompt): Promise<void> {
  if (!isUuid(todoId)) return;
  orThrow(await client.from(TABLES.todos).update({ prompt, updated_at: nowIso() }).eq('id', todoId));
}

export async function deleteTodo(client: DbClient, todoId: string): Promise<boolean> {
  const todo = await getTodo(client, todoId);
  if (!todo) return false;
  const deleted = orThrow(await client.from(TABLES.todos).delete().eq('id', todoId).select('id'));
  if (!deleted.length) return false;
  await removeScreenshotAssets(todo.screenshots);
  await touchOwner(client, todoOwner(todo));
  return true;
}

export async function addScreenshots(client: DbClient, todo: Todo, screenshots: ScreenshotInsert[]): Promise<Todo | null> {
  orThrow(await client.from(TABLES.screenshots).insert(screenshots));
  await touchTodo(client, todo.id);
  await touchOwner(client, todoOwner(todo));
  return getTodo(client, todo.id);
}

export async function findScreenshot(client: DbClient, screenshotId: string): Promise<Screenshot | null> {
  if (!isUuid(screenshotId)) return null;
  const row = orThrow(await client.from(TABLES.screenshots).select('*').eq('id', screenshotId).maybeSingle());
  return row ? toScreenshot(row) : null;
}

export async function findOwnedStoragePaths(client: DbClient, storagePaths: string[]): Promise<Set<string>> {
  const unique = [...new Set(storagePaths)];
  const owned = new Set<string>();
  for (let start = 0; start < unique.length; start += STORAGE_PATH_LOOKUP_BATCH_SIZE) {
    const batch = unique.slice(start, start + STORAGE_PATH_LOOKUP_BATCH_SIZE);
    const rows = orThrow(await client.from(TABLES.screenshots).select('storage_path').in('storage_path', batch));
    rows.forEach((row) => owned.add(row.storage_path));
  }
  return owned;
}

export async function deleteScreenshot(client: DbClient, screenshotId: string): Promise<Todo | null> {
  const screenshot = await findScreenshot(client, screenshotId);
  if (!screenshot) return null;
  const deleted = orThrow(await client.from(TABLES.screenshots).delete().eq('id', screenshotId).select('id'));
  if (!deleted.length) return null;
  await removeScreenshotAssets([screenshot]);
  await touchTodo(client, screenshot.todoId);
  const todo = await getTodo(client, screenshot.todoId);
  if (todo) await touchOwner(client, todoOwner(todo));
  return todo;
}

export async function insertImportedProject(
  client: DbClient,
  project: ProjectInsert & { id: string },
  todos: TodoInsert[],
  screenshots: ScreenshotInsert[],
): Promise<Project> {
  const created = rowOrThrow(await client.from(TABLES.projects).insert(project).select('*').single());
  try {
    if (todos.length) orThrow(await client.from(TABLES.todos).insert(todos));
    if (screenshots.length) orThrow(await client.from(TABLES.screenshots).insert(screenshots));
  } catch (error) {
    await client.from(TABLES.projects).delete().eq('id', project.id);
    throw error;
  }
  return toProject(created);
}

export class TodoMoveError extends Error {
  constructor(public readonly reason: 'sameOwner' | 'invalidTarget') {
    super(reason);
  }
}

function isAllowedMove(from: ItemOwner, fromProject: Project | null, to: ItemOwner, toProject: Project | null): boolean {
  if (from.kind === 'project' && to.kind === 'group') return fromProject?.groupId === to.id;
  if (from.kind === 'group' && to.kind === 'project') return toProject?.groupId === from.id;
  if (from.kind === 'project' && to.kind === 'project') return Boolean(fromProject?.groupId) && fromProject?.groupId === toProject?.groupId;
  return false;
}

async function relocateScreenshotObjects(userId: string, todo: Todo, target: ItemOwner): Promise<{ id: string; from: string; to: string }[]> {
  const folder = todoStorageFolder(userId, target, todo.id);
  const moved: { id: string; from: string; to: string }[] = [];
  for (const shot of todo.screenshots) {
    const to = `${folder}/${shot.fileName.split('/').pop()}`;
    if (!(await moveScreenshotObject(shot.fileName, to))) {
      await rollbackScreenshotObjects(moved);
      throw new Error(`Moving screenshot ${shot.id} failed`);
    }
    moved.push({ id: shot.id, from: shot.fileName, to });
  }
  return moved;
}

async function rollbackScreenshotObjects(moved: { from: string; to: string }[]): Promise<void> {
  for (const entry of moved) await moveScreenshotObject(entry.to, entry.from);
}

export async function moveTodo(client: DbClient, userId: string, todoId: string, target: ItemOwner): Promise<Todo | null> {
  const todo = await getTodo(client, todoId);
  if (!todo) return null;
  const from = todoOwner(todo);
  if (from.kind === target.kind && from.id === target.id) throw new TodoMoveError('sameOwner');
  if (!isUuid(target.id)) throw new TodoMoveError('invalidTarget');
  const [fromProject, toProject] = await Promise.all([
    from.kind === 'project' ? getProject(client, from.id) : null,
    target.kind === 'project' ? getProject(client, target.id) : null,
  ]);
  if (!isAllowedMove(from, fromProject, target, toProject)) throw new TodoMoveError('invalidTarget');
  const moved = await relocateScreenshotObjects(userId, todo, target);
  try {
    orThrow(await client.from(TABLES.todos).update({ ...ownerUpdateColumns(target), updated_at: nowIso() }).eq('id', todo.id));
    for (const entry of moved) {
      orThrow(await client.from(TABLES.screenshots).update({ storage_path: entry.to }).eq('id', entry.id));
    }
  } catch (error) {
    await rollbackScreenshotObjects(moved);
    throw error;
  }
  await Promise.all([touchOwner(client, from), touchOwner(client, target)]);
  return getTodo(client, todo.id);
}
