import 'server-only';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ACTIVE_RUN_STATUSES } from '@/constants/claude';
import { RUN_COMPLETE_INSTRUCTION, RUN_NOTIFICATION_TEXT, RUN_PROMPT_FILE_PATTERN, RUNS_DIR_NAME } from '@/constants/claude-link';
import { DATA_DIR_NAME } from '@/constants/storage';
import { TABLES } from '@/constants/supabase';
import type { Project, Run, RunRow, RunStatus, RunTodoProgress, StartRunRequest, Todo } from '@/types';
import { getPromptTodos, orThrow, rowOrThrow, updateTodo, type DbClient } from './db';
import { expandHome, isDirectory } from './fs-checks';
import { collectFileChanges } from './git-diff';
import { isUuid, newId, nowIso } from './ids';
import { notifyDesktop } from './notifications';
import { listLiveSessions } from './terminal-client';

export function isActiveRunStatus(status: RunStatus): boolean {
  return ACTIVE_RUN_STATUSES.includes(status);
}

export function toRun(row: RunRow, liveSessions: Set<string>): Run {
  return {
    id: row.id,
    projectId: row.project_id,
    mode: row.mode,
    status: row.status,
    todoIds: row.todo_ids ?? [],
    progress: row.progress ?? [],
    summary: row.summary,
    filesChanged: row.files_changed ?? [],
    terminalAlive: liveSessions.has(row.id),
    startedAt: row.started_at,
    endedAt: row.ended_at,
    updatedAt: row.updated_at,
  };
}

export async function toRuns(rows: RunRow[]): Promise<Run[]> {
  const live = rows.some((row) => row.mode === 'terminal') ? await listLiveSessions() : new Set<string>();
  return rows.map((row) => toRun(row, live));
}

export function getRunsDir(): string {
  return path.join(process.cwd(), DATA_DIR_NAME, RUNS_DIR_NAME);
}

export function runPromptPath(runId: string): string {
  const fileName = `${runId}.md`;
  if (!RUN_PROMPT_FILE_PATTERN.test(fileName)) throw new Error('Unsafe run prompt path');
  return path.join(getRunsDir(), fileName);
}

export function decorateRunPrompt(prompt: string, todoIds: string[]): string {
  const lines = prompt
    .trim()
    .split('\n')
    .map((line) => {
      const match = /^##\s+(\d+)\.\s+(.*)$/.exec(line);
      const todoId = match ? todoIds[Number(match[1]) - 1] : undefined;
      return match && todoId ? `${line.trimEnd()} (todo: ${todoId})` : line;
    });
  return `${lines.join('\n')}\n\n${RUN_COMPLETE_INSTRUCTION}\n`;
}

async function writeRunPrompt(runId: string, text: string): Promise<void> {
  await mkdir(getRunsDir(), { recursive: true });
  const target = runPromptPath(runId);
  const temp = `${target}.${newId()}.tmp`;
  await writeFile(temp, text, { encoding: 'utf8', mode: 0o600 });
  await rename(temp, target);
}

export async function removeRunPrompt(runId: string): Promise<void> {
  await rm(runPromptPath(runId), { force: true }).catch(() => undefined);
}

export async function resolveRepoPath(project: Project): Promise<string | null> {
  if (!project.repoPath.trim()) return null;
  const resolved = expandHome(project.repoPath.trim());
  return path.isAbsolute(resolved) && (await isDirectory(resolved)) ? resolved : null;
}

export type StartRunResult = { run: Run } | { error: 'repoPathMissing' | 'todosNotInRun' };

export async function startRun(client: DbClient, userId: string, project: Project, request: StartRunRequest): Promise<StartRunResult> {
  if (!(await resolveRepoPath(project))) return { error: 'repoPathMissing' };
  const found = await getPromptTodos(client, project, request.todoIds);
  if (request.todoIds.some((id) => !found.some((todo) => todo.id === id))) return { error: 'todosNotInRun' };
  const runId = newId();
  const now = nowIso();
  await writeRunPrompt(runId, decorateRunPrompt(request.prompt, request.todoIds));
  const progress: RunTodoProgress[] = request.todoIds.map((todoId) => ({ todoId, status: 'pending', note: null, updatedAt: now }));
  let row: RunRow;
  try {
    row = rowOrThrow(
      await client
        .from(TABLES.runs)
        .insert({
          id: runId,
          user_id: userId,
          project_id: project.id,
          mode: request.mode,
          status: request.mode === 'queue' ? 'queued' : 'working',
          todo_ids: request.todoIds,
          progress,
        })
        .select('*')
        .single(),
    );
  } catch (error) {
    await removeRunPrompt(runId);
    throw error;
  }
  for (const todo of found) {
    if (todo.status === 'open') await updateTodo(client, todo.id, { status: 'in_progress' });
  }
  return { run: toRun(row, new Set()) };
}

export async function listRuns(client: DbClient, projectId: string | null, activeOnly: boolean): Promise<Run[] | null> {
  if (projectId !== null && !isUuid(projectId)) return null;
  const all = client.from(TABLES.runs).select('*');
  const base = projectId ? all.eq('project_id', projectId) : all;
  const filtered = activeOnly ? base.in('status', ACTIVE_RUN_STATUSES) : base;
  return toRuns(orThrow(await filtered.order('started_at', { ascending: false })));
}

export async function getRunRow(client: DbClient, runId: string): Promise<RunRow | null> {
  if (!isUuid(runId)) return null;
  return orThrow(await client.from(TABLES.runs).select('*').eq('id', runId).maybeSingle());
}

export function withTodoProgress(progress: RunTodoProgress[], todoId: string, status: RunTodoProgress['status'], note: string | null): RunTodoProgress[] {
  return progress.map((item) =>
    item.todoId === todoId ? { ...item, status, note: note ?? item.note, updatedAt: nowIso() } : item,
  );
}

export function isRunComplete(progress: RunTodoProgress[]): boolean {
  return progress.length > 0 && progress.every((item) => item.status === 'done');
}

export function joinedNotes(progress: RunTodoProgress[]): string | null {
  const notes = progress.map((item) => item.note?.trim()).filter((note): note is string => Boolean(note));
  return notes.length ? notes.join('\n') : null;
}

export async function finishedRunFields(progress: RunTodoProgress[], project: Project | null, summary: string | null) {
  const repoPath = project ? await resolveRepoPath(project) : null;
  return {
    status: 'done' as const,
    progress,
    summary: summary ?? joinedNotes(progress),
    files_changed: repoPath ? await collectFileChanges(repoPath) : [],
    ended_at: nowIso(),
  };
}

export async function notifyRunFinished(todos: Pick<Todo, 'title'>[], project: Project | null): Promise<void> {
  const [only] = todos;
  const title = todos.length === 1 && only ? only.title : `${project?.name ?? 'Run'}: ${todos.length} tasks`;
  await notifyDesktop(RUN_NOTIFICATION_TEXT(title));
}

export async function completeRun(client: DbClient, row: RunRow, project: Project | null, summary: string | null): Promise<RunRow | null> {
  const now = nowIso();
  const progress = row.progress.map((item) => (item.status === 'done' ? item : { ...item, status: 'done' as const, updatedAt: now }));
  const todos: Todo[] = [];
  for (const todoId of row.todo_ids) {
    const todo = await updateTodo(client, todoId, { status: 'done' });
    if (todo) todos.push(todo);
  }
  const fields = await finishedRunFields(progress, project, summary);
  const updated = orThrow(await client.from(TABLES.runs).update(fields).eq('id', row.id).select('*').maybeSingle());
  if (updated) await notifyRunFinished(todos, project);
  return updated;
}

export async function cancelRun(client: DbClient, row: RunRow): Promise<RunRow | null> {
  for (const item of row.progress) {
    if (item.status === 'pending') await updateTodo(client, item.todoId, { status: 'open' });
  }
  return orThrow(await client.from(TABLES.runs).update({ status: 'cancelled', ended_at: nowIso() }).eq('id', row.id).select('*').maybeSingle());
}
