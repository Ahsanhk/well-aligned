import { ACTIVE_RUN_STATUSES } from '@/constants/claude';
import type { Run, RunTodoProgress, TodoRunState } from '@/types';

export function isRunActive(run: Pick<Run, 'status'>) {
  return ACTIVE_RUN_STATUSES.includes(run.status);
}

export function progressFor(run: Run, todoId: string): RunTodoProgress | null {
  return run.progress.find((item) => item.todoId === todoId) ?? null;
}

export function todoRunState(runs: Run[], todoId: string): TodoRunState {
  const run = runs.find((item) => isRunActive(item) && item.todoIds.includes(todoId));
  if (!run) return null;
  const progress = progressFor(run, todoId);
  if (progress?.status === 'done') return null;
  if (run.status === 'queued') return 'queued';
  if (run.mode === 'queue' && progress?.status !== 'working') return 'queued';
  return 'working';
}

export function latestNoteFor(runs: Run[], todoId: string) {
  return (
    runs
      .filter((run) => run.todoIds.includes(todoId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((run) => progressFor(run, todoId)?.note)
      .find((note): note is string => Boolean(note)) ?? null
  );
}

export function doneCount(run: Run) {
  return run.progress.filter((item) => item.status === 'done').length;
}
